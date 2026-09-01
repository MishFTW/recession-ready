/**
 * Builds the static zip-code prefill dataset for the rent vs. buy calculator.
 *
 * Downloads Zillow Research CSVs (free for public use with attribution):
 *   - ZHVI zip-level home values
 *   - ZORI zip-level rents, with metro-level rents as a fallback
 * and emits sharded JSON to public/data/zip/{first-two-digits}.json:
 *   { "80202": [homePrice, monthlyRent | null, "Denver, CO"] }
 * plus meta.json with the data month.
 *
 * Usage:
 *   node scripts/build-zip-data.mjs            # downloads fresh CSVs
 *   node scripts/build-zip-data.mjs --from DIR # uses DIR/{zhvi_zip,zori_zip,zori_metro}.csv
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCES = {
  zhvi_zip:
    "https://files.zillowstatic.com/research/public_csvs/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv",
  zori_zip:
    "https://files.zillowstatic.com/research/public_csvs/zori/Zip_zori_uc_sfrcondomfr_sm_sa_month.csv",
  zori_metro:
    "https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfrcondomfr_sm_sa_month.csv",
};

const outDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "data",
  "zip",
);

async function loadCsv(key) {
  const fromIndex = process.argv.indexOf("--from");
  if (fromIndex !== -1) {
    return readFile(join(process.argv[fromIndex + 1], `${key}.csv`), "utf8");
  }
  const response = await fetch(SOURCES[key]);
  if (!response.ok) {
    throw new Error(`Failed to download ${key}: HTTP ${response.status}`);
  }
  return response.text();
}

function parseCsvLine(line) {
  const fields = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(field);
      field = "";
    } else {
      field += char;
    }
  }
  fields.push(field);
  return fields;
}

/** Latest non-empty numeric value in the month columns, plus its month header. */
function latestValue(fields, header, firstMonthColumn) {
  for (let i = fields.length - 1; i >= firstMonthColumn; i -= 1) {
    const value = Number(fields[i]);
    if (fields[i] !== "" && Number.isFinite(value)) {
      return { value, month: header[i] };
    }
  }
  return null;
}

function parseTable(csv) {
  const lines = csv.split("\n").filter((line) => line.trim() !== "");
  const header = parseCsvLine(lines[0]);
  const firstMonthColumn = header.findIndex((name) => /^\d{4}-\d{2}/.test(name));
  return { header, firstMonthColumn, rows: lines.slice(1).map(parseCsvLine) };
}

function roundTo(value, step) {
  return Math.round(value / step) * step;
}

const [zhviCsv, zoriCsv, zoriMetroCsv] = await Promise.all([
  loadCsv("zhvi_zip"),
  loadCsv("zori_zip"),
  loadCsv("zori_metro"),
]);

const metroRent = new Map();
{
  const { header, firstMonthColumn, rows } = parseTable(zoriMetroCsv);
  for (const row of rows) {
    const latest = latestValue(row, header, firstMonthColumn);
    if (latest) metroRent.set(row[2], latest.value); // RegionName, e.g. "Denver, CO"
  }
}

const zipRent = new Map();
{
  const { header, firstMonthColumn, rows } = parseTable(zoriCsv);
  for (const row of rows) {
    const latest = latestValue(row, header, firstMonthColumn);
    if (latest) zipRent.set(row[2].padStart(5, "0"), latest.value);
  }
}

const shards = new Map();
let dataMonth = "";
let zipCount = 0;
let zipLevelRentCount = 0;
let metroLevelRentCount = 0;
{
  const { header, firstMonthColumn, rows } = parseTable(zhviCsv);
  for (const row of rows) {
    const latest = latestValue(row, header, firstMonthColumn);
    if (!latest) continue;
    if (latest.month > dataMonth) dataMonth = latest.month;

    const zip = row[2].padStart(5, "0");
    const [state, city, metro, county] = [row[5], row[6], row[7], row[8]];
    const place = city
      ? `${city}, ${state}`
      : `${county.replace(/ County$/, "")} County, ${state}`;

    let rent = zipRent.get(zip) ?? null;
    if (rent !== null) {
      zipLevelRentCount += 1;
    } else if (metro && metroRent.has(metro)) {
      rent = metroRent.get(metro);
      metroLevelRentCount += 1;
    }

    const shardKey = zip.slice(0, 2);
    if (!shards.has(shardKey)) shards.set(shardKey, {});
    shards.get(shardKey)[zip] = [
      roundTo(latest.value, 1000),
      rent === null ? null : roundTo(rent, 25),
      place,
    ];
    zipCount += 1;
  }
}

await mkdir(outDir, { recursive: true });
for (const [shardKey, entries] of shards) {
  await writeFile(join(outDir, `${shardKey}.json`), JSON.stringify(entries));
}
await writeFile(
  join(outDir, "meta.json"),
  JSON.stringify({ asOf: dataMonth.slice(0, 7), source: "Zillow ZHVI / ZORI" }),
);

console.log(
  `Wrote ${shards.size} shards covering ${zipCount} zips (rent: ${zipLevelRentCount} zip-level, ${metroLevelRentCount} metro-level) as of ${dataMonth.slice(0, 7)}`,
);
