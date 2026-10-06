# Circles

**Build community through shared goals.**

### ▶ Open the live prototype: **https://nweinberg97.github.io/Circles/**

No install needed — it runs in any browser, on desktop or phone.

Circles is a social habit-building platform: small groups of 5–7 people working toward the same health goal, with a weekly rhythm, a shared challenge, and experts in their corner. This repository is a working, clickable prototype of the whole product — the member experience, the Circle leader's tools, and the organization (B2B) admin.

## Run it locally

It's a static app with no build step and no dependencies.

```bash
python3 -m http.server 4173
# or: npx serve .
```

Then open http://localhost:4173. (Opening `index.html` straight from disk won't work, because browsers block ES modules on `file://`.)

It deploys as-is to any static host. A GitHub Pages workflow is included in `.github/workflows/pages.yml`: enable Pages → "GitHub Actions" in the repo settings and every push to `main` publishes the site.

## Demo it

The landing page has four doors, and a demo bar at the top of the app switches views at any time:

| View | Who | What to try |
|---|---|---|
| **New member** | Alex, accepting Maya's invite | Onboarding: goal → why → rhythm → matched Circle → meet the members → first habits → into the Circle |
| **Member** | Alex, three weeks in | Morning check-in, tick off habits (the challenge habit updates the group challenge), post "Struggling today", cheer and reply, RSVP, mark a commitment as kept, browse goal-specific support, try Plus |
| **Circle leader** | Maya | "Needs you" list (write to Taylor, who's gone quiet — Taylor replies), member health table, move the meeting using the availability grid, edit the agenda, run a meeting and share a recap, queue the next challenge, start a sister Circle from the waitlist |
| **Organization** | Harbourline (employer) | Aggregate participation, assign a volunteer leader, form Circles from sign-ups grouped by availability, launch a new program |

Everything persists in `localStorage`. **Restart** in the demo bar resets the data or starts onboarding over.

Switching goal in onboarding (e.g. First 5K) puts you in a running Circle, and the whole app — check-in, habits, support, experts, recommendations — becomes a running experience. Support also has a "Support for…" switch to preview any goal.

## Product decisions

- **The Circle is the product.** The signature visual is the Circle drawn as a circle: members sit on the ring with their own week's progress, and the centre shows the group's shared total.
- **Shared goal vs. personal habits.** Every Circle has one measurable shared goal. Each member picks their own habits toward it. The goal page shows both side by side.
- **Intimate, not a feed.** No likes, follower counts or infinite scroll. Posts have intent ("I did it", "Struggling today", "Who's in?"), reactions are *Cheer* and *Same here*, and the conversation ends with "You're all caught up."
- **Structure over chat.** Meetings have a real agenda, RSVPs, notes and commitments; leaders can run the meeting step by step and share a recap.
- **Free Circle, paid support.** The Circle (people, meetings, challenges, starter guides) is free. Plus — $5/month or $50/year — adds live workshops, the full program library, Ask an expert, monthly coaching and partner perks. Organizations sponsor Plus per seat.
- **Trustworthy recommendations.** Every partner is labelled with how Circles earns from it, there's an "Independent only" filter, and the order comes from expert review and member ratings, never payment.
- **Privacy for organizations.** Admins see participation totals only, never goals, check-ins or conversations.
- **Brand.** Navy and lagoon teal, the four values (Kindness, Intention, Energy, Openness) as each Circle's agreements, and the four-ring mark redrawn as precise geometry (`src/ui/logo.js`) for the favicon and app icons.

## Structure

```
index.html              entry point, fonts, favicon links
site.webmanifest        installable app metadata
assets/icons/           favicon.svg/.ico, apple-touch-icon, PWA icons (generated)
styles/                 tokens.css, base.css, app.css (shell + components), views.css
src/main.js             router, render loop, event delegation
src/store.js            state, persistence, selectors
src/data/               seed data, goals, support content
src/ui/                 html templating, icons, logo, shared components
src/views/              one module per area (today, circle, goal, support, discover, lead, org…)
tools/build-icons.mjs   regenerates icons from the logo geometry (uses Playwright)
```

All names, people, brands and organizations in the demo are fictional.
