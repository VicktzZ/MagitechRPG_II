<div align="center">
  <img src="public/magitech_logo.png" alt="MagitechRPG logo" width="160" />
  <h1>MagitechRPG II</h1>
  <p>
    A virtual tabletop for running RPG campaigns: character sheets, real-time
    sessions, combat tracking and a builder for custom rule systems.
  </p>
  <p><a href="https://magitechrpg.vercel.app">Live app</a></p>
</div>

## About

MagitechRPG II started as the companion app for MagitechRPG, an original
tabletop system that mixes fantasy and technology, and grew into a platform
where game masters can define their own systems. It has been in development
since December 2023.

The codebase is about 94,000 lines of TypeScript, with nearly 60 API routes.

## Features

**For players**

- Character sheets with attributes, skills, inventory, spells and level
  progression, autosaved as you edit
- Dice roller with custom dice and attribute-based skill tests
- Spell grimoire with PDF export
- Installable as a PWA

**For game masters**

- Campaigns joined by invite code, with separate player and GM dashboards
- Session chat, shared notes, and test requests sent to players
- Combat tracker with turn-based status effects (damage over time, buffs,
  debuffs)
- Custom creatures, items and effects per campaign
- In-campaign shop and item donation between players

**Roguelite mode**

- Perk cards offered on level-up, drawn with weighted rarity
- Perks apply effects to weapons, armor, spells and attributes

**System builder**

- Define a rule system from scratch: attributes, skills, classes, races,
  initial fields and derived stats
- Derived values are written as formulas such as `VIG * 2 + 10`, evaluated by
  a restricted evaluator (variable substitution, character whitelist, safe
  fallback)
- Systems can be duplicated, exported and imported

**Platform**

- Sign-in with Google or Discord
- Subscription plans (free, Premium, Premium Plus) billed through Stripe, with
  plan-based feature gating
- Admin panel for systems, subscriptions and scheduled jobs

## Architecture

| Concern | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| UI | Material UI v5, Framer Motion |
| Server state | TanStack Query with persisted cache |
| Forms and validation | React Hook Form, Zod, class-validator |
| Database | Cloud Firestore, accessed through FireORM repositories |
| Real time | Firestore listeners for document sync, Pusher channels for session events |
| Auth | NextAuth (Google, Discord) |
| Payments | Stripe Checkout, customer portal and webhooks |
| Background work | node-cron jobs with run logging |

A few decisions worth calling out:

- **Two real-time channels.** Persistent state (sheets, campaigns) syncs
  through Firestore snapshot listeners. Session events (a player joining, a
  dice test request, perks being offered) are pushed through Pusher channels.
- **Effect pipeline.** Combat effects are plain functions over a context
  object, composed with `effectPipe(...effects)(context)`. Adding an effect
  type does not touch the combat loop.
- **Data-driven rules.** Character sheets read their shape from an
  `RPGSystem` document rather than from hardcoded MagitechRPG rules, which is
  what makes the system builder possible.
- **Moved from MongoDB to Firestore** to get real-time listeners without
  running a separate socket server.

```
app/            Next.js routes: pages, API handlers, admin panel
components/     UI, grouped by domain (campaign, charsheet, admin, subscription)
features/       Self-contained modules: effect pipeline, roguelite mode
services/       Client-side API access, one service per resource
models/         Entities (FireORM), DTOs and shared types
hooks/          Firestore real-time, Pusher, autosave, subscription
utils/          Dice and combat math, formula evaluator, permissions
jobs/           Scheduled jobs
```

## Running locally

Requires Node.js 20.9 and a Firebase project. Pusher, Stripe and the OAuth
providers are needed only for the features that use them.

```bash
git clone https://github.com/VicktzZ/MagitechRPG_II.git
cd MagitechRPG_II
npm install
npm run dev
```

Create `.env.local` with:

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Firestore (client and admin SDK) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | Sign-in |
| `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`, `NEXT_PUBLIC_PUSHER_KEY` | Session events |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PREMIUM`, `STRIPE_PRICE_PREMIUM_PLUS`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Subscriptions |
| `NEXT_PUBLIC_APP_URL` | Redirect URLs |

Scripts: `npm run dev`, `npm run build`, `npm run lint`, `npm test`.

## Status

Actively developed. The interface is in Portuguese. Automated test coverage is
thin: Jest is configured, but most verification so far has been manual.

## Author

Vitor Santos · [GitHub](https://github.com/VicktzZ) ·
[LinkedIn](https://www.linkedin.com/in/vitor-hugo-rodrigues-dos-santos-469571210/)
