# Hosting the SHOAM website

The SHOAM site is deployed with GitHub Pages from its own repository. The live SYLI site at `https://mw-ngo.github.io/` remains untouched.

## Live address

SHOAM uses its **own repository** under the MW-NGO account so the two websites cannot clash:

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

## Deployment settings used

1. A public repository named `shoam-website` was created under the `MW-NGO` account.
2. The **contents of this folder** were uploaded to the repository root — not a nested `shoam-student-helping-organization-of-malawi/` folder.
3. In **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: `main`
   - Folder: `/ (root)`
4. GitHub Pages built successfully; the live homepage and admin page were checked.
5. No `CNAME` file was added. The `MW-NGO.github.io` repository used by SYLI was not changed.

## Supabase redirect URLs

These are saved in **Authentication → URL Configuration** so login and recovery links land on the right site:

```text
Site URL:
https://mw-ngo.github.io/shoam-website/

Redirect URLs:
https://mw-ngo.github.io/shoam-website/admin.html
https://mw-ngo.github.io/shoam-website/**
http://127.0.0.1:8146/admin.html
```

Password sign-in does not itself redirect, but these values keep email confirmation and password recovery on the SHOAM admin page. See **SUPABASE.md** for the full setup.

## Launch checklist

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
