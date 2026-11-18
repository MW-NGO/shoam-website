# Hosting the SHOAM website

**Nothing has been deployed yet.** This site is still a local project in its own folder. The live SYLI site at `https://mw-ngo.github.io/` must stay untouched.

## Chosen address

SHOAM will use its **own repository** under the MW-NGO account so the two websites cannot clash:

| Item | Value |
| --- | --- |
| Repository | `MW-NGO/shoam-website` (public) |
| Public site | `https://mw-ngo.github.io/shoam-website/` |
| Content studio | `https://mw-ngo.github.io/shoam-website/admin.html` |
| SYLI site | `https://mw-ngo.github.io/` — unchanged |

All links in the site are relative, so the pages, images and styles work correctly from the `/shoam-website/` subpath. No `CNAME` is needed for this address.

## Local preview

Use a separate port so the SYLI preview on `8145` is not disturbed:

```powershell
cd "C:\Users\R6-S8\Documents\Default Project\ngo-sites\shoam-student-helping-organization-of-malawi"
python -m http.server 8146
```

Open <http://127.0.0.1:8146/>. The local admin page is <http://127.0.0.1:8146/admin.html>.

## Deploying later (not done yet)

1. Create a new public repository named `shoam-website` under the `MW-NGO` account.
2. Upload the **contents of this folder** to the repository root — not a nested `shoam-student-helping-organization-of-malawi/` folder.
3. In **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: `main`
   - Folder: `/ (root)`
4. Wait for GitHub Pages to build, then check `https://mw-ngo.github.io/shoam-website/`.
5. Do **not** add a `CNAME` file. Do **not** change the `MW-NGO.github.io` repository used by SYLI.

## Supabase redirect URLs

When the SHOAM Supabase project exists, set these in **Authentication → URL Configuration** so login and recovery links land on the right site:

```text
Site URL:
https://mw-ngo.github.io/shoam-website/

Redirect URLs:
https://mw-ngo.github.io/shoam-website/admin.html
https://mw-ngo.github.io/shoam-website/**
http://127.0.0.1:8146/admin.html
```

Password sign-in does not itself redirect, but these values keep email confirmation and password recovery on the SHOAM admin page. See **SUPABASE.md** for the full setup.

## Before going live

- [x] Confirm `https://mw-ngo.github.io/shoam-website/` is the agreed address.
- [ ] Fill in any real SHOAM email/phone/WhatsApp details in `js/data.js`.
- [x] Create the SHOAM Supabase project and run `supabase/schema.sql` + `supabase/seed.sql`.
- [x] Paste only the SHOAM URL and browser-safe publishable key into `js/config.js`.
- [x] Add the SHOAM auth URLs above in Supabase.
- [x] Create at least one editor account using the real editor email.
- [x] Test `https://mw-ngo.github.io/shoam-website/admin.html`.
- [x] Check all photos load and the mobile menu works.
- [x] Confirm `https://mw-ngo.github.io/` still serves SYLI, unchanged.

## Notes

- This is a static site: no server-side code, no build step, no npm install.
- `404.html` is used automatically by GitHub Pages.
- The emblem, favicon and social preview live in `assets/icons/`.
- The Facebook/Messenger links point to the public profile `id=61554677085022`.
- The heart emblem must match `C:\Users\R6-S8\Downloads\SHOAM.jpg`; do not replace it with a star.
