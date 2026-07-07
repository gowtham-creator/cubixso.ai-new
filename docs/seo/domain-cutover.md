# Domain cutover — make cubixso.com the real site (retire the launch splash)

**Goal:** `cubixso.com` serves the real Next.js site; `app.cubixso.com` redirects to it.
**Why:** you own `cubixso.com` and have verified it in Google + Bing — so it's your one clean, monitored SEO home. One authoritative domain = strongest rankings.
**No GoDaddy changes needed** — `cubixso.com` DNS already points to Vercel; this is a Vercel-only reassignment. Fully reversible.

## Current state (found via Vercel)
| Vercel project | Domain | Role |
|---|---|---|
| `cubixso-ai-new` | `app.cubixso.com` | the REAL site (this repo) |
| `cubixso-ai-loading` | `cubixso.com`, `www.cubixso.com` | the launch splash (retire this) |

---

## Path A — I do it for you (Vercel CLI). Just say "go".
On your go, I run (roughly):
1. Remove `cubixso.com` + `www.cubixso.com` from the `cubixso-ai-loading` project.
2. Add them to `cubixso-ai-new`; set `cubixso.com` primary, `www` → 308 redirect to apex.
3. Set `app.cubixso.com` → 308 redirect to `cubixso.com`.
4. Flip the code canonical: `SITE_URL` → `https://cubixso.com` in `src/lib/seo.ts`, update `public/llms.txt`, commit + redeploy.
5. Verify live: cubixso.com loads the site, app.cubixso.com redirects, canonical = cubixso.com, robots/sitemap/OG all 200.

## Path B — you click it in the Vercel dashboard (then I flip the code)
1. **Vercel → project `cubixso-ai-loading` → Settings → Domains** → remove `cubixso.com` and `www.cubixso.com`.
2. **Vercel → project `cubixso-ai-new` → Settings → Domains** → **Add** `cubixso.com` (make it the primary), then **Add** `www.cubixso.com` and set it to **Redirect → cubixso.com**.
3. Same Domains screen → click `app.cubixso.com` → **Edit → Redirect to `cubixso.com`** (permanent / 308).
4. Tell me it's done — I flip `SITE_URL` → cubixso.com in code, redeploy, and verify.

---

## After cutover (SEO housekeeping — I'll guide)
- In **Google Search Console** (cubixso.com already verified): submit `https://cubixso.com/sitemap.xml`.
- In **Bing Webmaster** (cubixso.com verified): submit the same sitemap.
- Re-scrape the LinkedIn share in the [Post Inspector](https://www.linkedin.com/post-inspector/) so it picks up the cubixso.com URL + working preview.
- Add **GA4** (or Vercel Analytics).

## Rollback (if ever needed)
Move `cubixso.com` + `www` back to `cubixso-ai-loading` in Vercel Domains — seconds, no DNS change.
