# Recession Ready — Product Brief & Distribution Playbook

## What This Is

**Recession Ready** is a browser-based life audit tool that helps people understand how financially resilient they'd be in a Great Depression-scale economic event. It combines:

1. **Historical education** — a concise comparison of what destroyed people in the 1930s versus what structural differences and new vulnerabilities exist today
2. **An 8-question life audit** — covering liquid runway, debt load, income structure, industry resilience, skill portability, geographic flexibility, dependents, and housing
3. **A scored readout (0–100)** — with a grade tier, category breakdown, and a personalized 90-day action playbook generated from their specific answers

No data is collected. No login required. Everything runs client-side. The full experience takes under 3 minutes.

---

## Origin & Voice

This tool emerged from a real conversation about recession preparedness — not a thought exercise, but a serious scenario-planning session grounded in historical data. The tone reflects that: honest, direct, no hedging, no generic financial-advice disclaimers. It tells people what their numbers actually mean.

The scoring is based on documented patterns from Depression-era research:
- **Liquid cash > retirement accounts** (401k is trapped capital with a 10% penalty exit)
- **Zero fixed debt** was the single greatest survival advantage
- **Geographic mobility and skill portability** determined long-term outcomes more than assets did
- **Industry resilience** (essential vs. discretionary) governed the initial shock window

---

## Scoring System

| Category | Max Points | Rationale |
|---|---|---|
| Liquid runway | 22 | Highest weight — the actual survival clock |
| Debt load | 20 | Fixed obligations in a deflationary environment |
| Income structure | 15 | Single source = single point of failure |
| Dependents | 10 | Compresses flexibility and raises the buffer bar |
| Industry resilience | 10 | Essential vs. discretionary determines shock timing |
| Skill portability | 10 | Geographic and economic mobility of human capital |
| Geographic flexibility | 10 | The arbitrage that saved thousands in the 1930s |
| Housing situation | 3 | Lowest weight — flexibility matters more than ownership |
| **Total** | **100** | |

**Grade tiers:**
- 80–100: Recession Ready — *Bunker Built*
- 60–79: Cautiously Positioned — *Storm Shelter*
- 40–59: Moderate Exposure — *Open Field*
- 20–39: Vulnerable — *Thin Ice*
- 0–19: Critical Risk — *Exposed*

---

## Technical Spec (for Claude Code handoff)

### Current state
- Single self-contained `.html` file
- Vanilla JS, no framework, no build step
- Google Fonts via CDN (Playfair Display, DM Sans, DM Mono)
- All scoring, recs, and UI logic in ~200 lines of JS
- Share via Web Share API with clipboard fallback
- URL hash stores score for sharing (basic implementation)

### Recommended stack for production
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS v4
- **Hosting**: Vercel
- **Domain**: `recession.mish.one` or standalone `recession-ready.fyi`

### Component breakdown (for Claude Code)
```
app/
  page.tsx              → shell with screen state management
  components/
    Hero.tsx            → landing screen with CTAs
    History.tsx         → 1930s vs. today education section
    Quiz.tsx            → step-by-step question flow
    Results.tsx         → score, breakdown, and playbook
    ProgressBar.tsx     → top progress indicator
  lib/
    questions.ts        → questions array with scores
    scoring.ts          → scoring logic, grade tiers
    recommendations.ts  → rec generation from answer map
```

### Enhancement roadmap (priority order)
1. **Claude API integration** — replace rule-based recs with a live API call to Claude Sonnet that generates a fully personalized playbook from all 8 answers. Huge quality jump.
2. **Score sharing** — generate a shareable card (OG image) with score and grade tier. Essential for virality.
3. **Score history** — localStorage to track multiple takes over time
4. **Deep dive mode** — expandable sections per category with historical case studies
5. **Comparison mode** — enter a partner's answers and see where the household stands together

---

## Distribution Strategy

### Tier 1 — Immediate, high signal-to-noise

**LinkedIn (your primary channel)**
Post format: Share your own score with context. Don't explain the tool — demonstrate it.

> "I built a recession readiness audit based on what actually saved (and destroyed) people in the 1930s. 8 questions, honest score, no fluff.
>
> Scored myself a 67/100. My two biggest gaps: liquid runway relative to my cost of living, and income concentration in consulting — which historically gets cut in the first wave.
>
> Took 3 minutes. [link]"

- Post on a Thursday or Friday (highest professional content engagement)
- Tag 2–3 people you think would score interestingly and ask them to share theirs
- Follow-up post 3 days later with aggregate anonymous data if you get enough responses

**X / Twitter**
The test-and-share mechanic works well here. Short thread:
> Tweet 1: "Built a recession readiness quiz based on 1930s Great Depression data. 8 questions, honest score."
> Tweet 2: "The single biggest survival factor wasn't gold or stocks. It was zero fixed debt + skill mobility."
> Tweet 3: Screenshot of your results + link

---

### Tier 2 — Community seeding (choose 3–4)

**Reddit — highest potential for organic spread**

| Subreddit | Subscribers | Approach |
|---|---|---|
| r/personalfinance | 17M | Post as "I built a recession readiness quiz based on Depression-era data — curious what the community scores" |
| r/financialindependence | 2M | FIRE community is obsessed with resilience metrics. Post your score and analysis. |
| r/frugal | 2.3M | Angle: "How prepared are you if your income stops for 12 months?" |
| r/leanfire | 300K | Tight fit — lean FI is exactly about essential expenses + resilience |
| r/preppers | 700K | Not your usual demo but they'll love the historical grounding |
| r/digitalnomad | 500K | Geographic flexibility angle — "the skill that saved people in the 1930s" |
| r/consulting | 150K | Direct to your audience: "consulting is cut first in a downturn, here's how prepared you actually are" |

**Reddit post rules that work:**
- Don't post the link first. Describe the thing, say you built it, then add link in comments or at bottom
- Engage with every early comment — Reddit rewards velocity in the first 2 hours
- Best time: Tuesday–Thursday, 9–11am EST

**Hacker News (Show HN)**
> "Show HN: A recession readiness quiz built on 1930s Great Depression survival data"

HN crowd will engage with the historical methodology and push back on the scoring weights — that's good signal. Be ready to defend the 22-point liquid runway weighting.

**Product Hunt**
Launch when you have the Next.js version with Claude API integration. Better story: "An AI-powered recession readiness audit." Get 5 friends to upvote in the first hour.

---

### Tier 3 — Earned media / newsletter placement

**Target newsletters:**
- *The Hustle* — finance + entrepreneurship, 2M+ subscribers, love interactive tools
- *Morning Brew* — if you have a connection
- *Money with Katie* — personal finance, large female-skewing audience (underserved angle: women and recession preparedness)
- *The Profile* (Polina Marinova) — profiles interesting people and tools
- *Lenny's Newsletter* — product community, frame it as "I built this tool over a weekend" product story

**Cold outreach template:**
> Subject: A recession readiness quiz your readers would actually use
>
> Built a 3-minute interactive quiz based on what historically separated people who survived the Great Depression from those who didn't. No sign-up, no data collection, no affiliate links. Just an honest score and a personalized 90-day action plan.
>
> [Score yourself first, then share yours + link to the tool]
>
> Happy to share aggregate anonymized data from responses if that makes it a better story.

---

### Tier 4 — SEO & evergreen traffic

Target keywords (low-competition, high-intent):
- "recession readiness quiz"
- "how prepared am I for a recession"
- "great depression lessons for today"
- "recession survival checklist"

Write one long-form companion piece (1,500–2,000 words) covering the 1930s history + modern translation. Publish on the same domain. Internal link to the quiz.

---

## Positioning Statement

> Recession Ready is the only financial resilience tool built on documented patterns from the 1930s Great Depression — not generic financial advice. It tells you where you actually stand, and what to do about it in the next 90 days.

---

## Metrics to track

| Metric | Target (30 days) | How |
|---|---|---|
| Quiz completions | 2,000 | Plausible Analytics or Fathom (privacy-respecting) |
| Score distribution | Track by grade tier | Client-side event ping |
| Drop-off point | Which question loses people | Step-level events |
| Share rate | % who click share after results | Click event |
| Referral sources | Which channels convert | UTM params per post |

---

## What to say when people ask what you built it for

> "I was thinking through my own recession scenario — I'm a consultant, most of my savings are in a 401k, I'm in SF. I wanted a real framework for thinking about it, not generic advice. The 1930s data is genuinely useful because it was a stress test that actually happened. Built it as a tool I'd want to use, then figured other people might too."

That's the true answer, and it's a better pitch than any polished positioning statement.