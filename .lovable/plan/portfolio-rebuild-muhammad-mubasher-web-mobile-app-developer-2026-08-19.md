# Portfolio Rebuild: Muhammad Mubasher — Web & Mobile App Developer

Poori site ka content off-page SEO agency se hata kar ek developer portfolio me convert karenge. Design language (cream + red accent, Archivo Black display type, magnetic cursor, scroll animations, pinned horizontal projects) waisa hi rahega — sirf content, sections aur icons badlenge.

## Sections (top to bottom)

1. **Hero** — "Muhammad Mubasher", rotating word animation: `Web` / `Mobile` / `Full-Stack`, subline: React, Next.js, React Native & Node developer. CTAs: View work / Let's talk. Same animated red gradient + blobs.
2. **Marquee** — tech names: React · Next.js · TypeScript · React Native · Flutter · Node · Postgres · Supabase · AWS · Tailwind.
3. **Recent Projects** (pinned horizontal scroll, existing component reused) — 5 placeholder projects: SaaS dashboard (Next.js), fintech mobile app (React Native), e-commerce storefront, delivery driver app (Flutter), realtime analytics API.
4. **Services / What I Do** (dark) — 6 cards: Frontend Development, Web App Development, Mobile App Development, Backend & APIs, DevOps & Deployment, Performance & Maintenance.
5. **Skills / Stack** (light) — grouped chips: Frontend (React, Next.js, TypeScript, Tailwind, HTML/CSS, animations), Mobile (React Native, Flutter, Expo, app store release), Backend (Node, REST/GraphQL, Postgres, Supabase, auth), DevOps (Docker, CI/CD, AWS/Vercel, monitoring). Optional proficiency bars.
6. **Stats** — projects delivered, apps on stores, years of experience, uptime/perf score (placeholders).
7. **Process / How I Work** (light, existing timeline) — Discovery & scope → Design & architecture → Build & iterate → Launch & support.
8. **Case Studies** — 2 detailed placeholder builds with problem / approach / result metrics (load time, conversion, crash-free rate) + client quote.
9. **Testimonials** — 3 placeholder client quotes (startup founder, product manager, agency owner).
10. **Contact** — existing working form (name, email, message) with backend save; left column: email, availability, response time, location.

Removed: pricing/packages, FAQ, SEO-specific case studies, blog guide route, off-page SEO copy.

## Content, SEO & agent tools

- Realistic placeholder project names/metrics so site never looks empty; aap baad me swap kar sakte ho.
- Titles/meta/OG: home route ko "Muhammad Mubasher — Web & Mobile App Developer" par update; Person JSON-LD (Organization ki jagah). FAQ JSON-LD hata denge kyunki FAQ section nahi rahega.
- `robots.txt`, `sitemap.xml`, `llms.txt` update: blog guide URL remove.
- MCP tools rename: `list_services` → developer services list; `submit_contact` waise hi kaam karega.

## Technical notes

- `src/routes/index.tsx` ka data arrays + section markup rewrite; animation helpers (`RotatingWord`, `RevealHeading`, `Reveal`, `HorizontalWork`) reuse.
- Nav links naye sections ke hisaab se: Work, Services, Skills, Process, Testimonials, Contact.
- `src/routes/blog.b2b-link-building-strategy.tsx` delete.
- `src/lib/mcp/tools/list-services.ts` content update; contact server function aur `contact_submissions` table unchanged.
- Colors/tokens `src/styles.css` se hi; koi hardcoded color nahi.
