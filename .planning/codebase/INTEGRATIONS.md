# External Integrations

**Analysis Date:** 2026-05-23

## APIs & External Services

**Email & Contact Management:**
- **Resend** - Email delivery (planned)
  - SDK/Client: Not yet installed (`resend` package pending)
  - Auth: Environment variable `RESEND_API_KEY` (stubbed in `src/app/api/notify/route.ts`)
  - Status: TODO (commented implementation ready in route handler)
  - Endpoint: `POST /api/notify`
  - Plan: Send contact form submissions as email to `contact@cubixso.com`; optionally add subscriber to Resend audience

**Content Delivery & Analytics (planned but not implemented):**
- No tracking services (Segment, Mixpanel, etc.) currently integrated
- No third-party analytics (Google Analytics 4, Plausible, etc.) currently integrated

## Data Storage

**Databases:**
- **None implemented yet** - This is a marketing site with no persistent data backend
- Contact form submissions currently logged to server console (visible via `vercel logs`)

**File Storage:**
- **Local filesystem only** - Static assets served from `public/` directory
- No cloud storage (S3, Cloudinary, etc.)

**Caching:**
- **None configured** - Relying on Next.js built-in caching
- No Redis, Memcached, or edge caching layer

## Authentication & Identity

**Auth Provider:**
- **None implemented** - Public marketing site, no user accounts

**Planned Authentication (future):**
- No comments or TODOs indicate planned auth integration
- If needed, would fit in `/api/auth/*` routes (Next.js convention)

## Monitoring & Observability

**Error Tracking:**
- **None detected** - No Sentry, Datadog, or similar integration
- Errors logged to Node.js `console.error()` (visible via `vercel logs`)

**Logs:**
- **Console logging** - `src/app/api/notify/route.ts` logs contact submissions to server console
- Deployments to Vercel can inspect logs via `vercel logs` CLI
- No structured logging service (LogRocket, ELK, etc.)

**Performance Monitoring:**
- **Next.js built-in** - Web Vitals tracked by Next.js App Router
- No third-party APM (Application Performance Monitoring)

## CI/CD & Deployment

**Hosting:**
- **Vercel** - Planned deployment target (not yet wired)
- Supports Next.js 16 natively with Turbopack
- Environment variables can be set in Vercel project settings

**CI Pipeline:**
- **None detected** - No GitHub Actions, GitLab CI, or similar
- Vercel auto-deploys on git push (when configured)

**Build System:**
- Turbopack (Next.js 16 default)
- Build command: `next build`
- Start command: `next start`

## Environment Configuration

**Required Environment Variables (when Resend is wired):**
- `RESEND_API_KEY` - Secret key from Resend dashboard

**Vercel Environment Variables (planned):**
- Would be set in Vercel project dashboard under Settings → Environment Variables
- Not yet configured (no .env file committed to repo per security policy)

**Local Development:**
- Use `.env.local` (in .gitignore) for local testing
- API routes currently work without env vars (stub implementation)

## Webhooks & Callbacks

**Incoming:**
- **Contact Form Endpoint:** `POST /api/notify`
  - Location: `src/app/api/notify/route.ts`
  - Accepts: JSON payload with `name`, `email`, `message` (email required)
  - Returns: `{ ok: true }` on success, `{ error: "..." }` on failure
  - Currently: Logs to console; ready for Resend integration

**Outgoing:**
- **None implemented** - No outbound webhooks to third parties
- Resend integration (when wired) will be one-way API call (no webhook return expected)

## Content Management

**Static Content:**
- Hardcoded in React components (`src/components/sections/`, `src/app/`)
- No Headless CMS (Contentful, Sanity, Strapi, etc.)
- No content API integration

## Third-Party Components & Subscriptions

**Design System:**
- **shadcn/ui** - Uses Base Nova theme (no cloud dependency)
- **@base-ui/react** - Self-hosted headless UI primitives

**Icons:**
- **Lucide React** - Client-side icon library (included in npm)

**Animation Libraries:**
- All included via npm (GSAP, Framer Motion, Lenis, react-spring, Rapier)
- No cloud-hosted animation or motion capture services

## Security & Secrets Management

**Current:**
- No database credentials needed
- No API keys actively used (Resend key is TODO)

**Planned (for Resend):**
- Store `RESEND_API_KEY` in Vercel environment variables (encrypted at rest)
- Never commit `.env` or `.env.local` files (already in .gitignore)

---

## Integration Checklist (From TODOs)

- [ ] Install `resend` npm package
- [ ] Set `RESEND_API_KEY` in Vercel environment variables
- [ ] Replace stub implementation in `src/app/api/notify/route.ts` with actual `resend.emails.send()` call
- [ ] Configure Resend audience ID for contact list
- [ ] Test contact form end-to-end in staging

---

*Integration audit: 2026-05-23*
