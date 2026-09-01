/**
 * Returns the visitor's approximate US zip code from Vercel's geo-IP
 * headers, for prefilling the rent vs. buy calculator. Off Vercel (local
 * dev) the headers are absent and this returns { zip: null }.
 */
export function GET(request: Request) {
  const country = request.headers.get("x-vercel-ip-country");
  const postal = request.headers.get("x-vercel-ip-postal-code");
  const zip =
    country === "US" && postal && /^\d{5}$/.test(postal) ? postal : null;

  return Response.json(
    { zip },
    { headers: { "cache-control": "private, no-store" } },
  );
}
