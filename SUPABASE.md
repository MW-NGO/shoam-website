# SHOAM Supabase backend

SHOAM is now connected to its **own** Supabase project in the `MW-NGO` organisation. It is separate from the SYLI project, database, keys and site address.

## Live project details

| Setting | Value |
| --- | --- |
| Project name | `shoam-website` |
| Project reference | `wslsowzqhuvvmiypgqkv` |
| Project URL | `https://wslsowzqhuvvmiypgqkv.supabase.co` |
| Browser key | `sb_publishable_2F_HfxV693tOvWh7CkokSQ_nWr91abu` |
| Region | `eu-west-1` |
| Public site | `https://mw-ngo.github.io/shoam-website/` |
| Admin page | `https://mw-ngo.github.io/shoam-website/admin.html` |
| Local preview admin | `http://127.0.0.1:8146/admin.html` |

The browser key above is Supabase's current **publishable key**. It replaces the older `anon public` key for new projects and is safe to use in browser code when row-level security is enabled. The configuration field is still called `supabaseAnonKey` because that is the internal name used by `js/backend.js`; it contains the publishable key.

**Never** place a `service_role`, secret, database or access-token value in this repo or in `js/config.js`.

## What is already done

- [x] SHOAM-only Supabase project created under `MW-NGO`
- [x] `supabase/schema.sql` run successfully
- [x] Explicit table grants added to the schema and applied
- [x] `supabase/seed.sql` run successfully
- [x] Public REST reads verified with the publishable key
- [x] Site URL and redirect URLs saved in Supabase Authentication
- [x] Public sign-up disabled; only manually created editor accounts can sign in
- [x] Editor account created and auto-confirmed for `alumtech9@gmail.com`
- [x] Local admin sign-in tested successfully with that account
- [x] `js/config.js` wired to the SHOAM project

Verified REST content:

- `projects`: 5 rows, all published
- `members`: 2 rows, all published
- `articles`: 4 rows, all published

The public site requests each table with `published = eq.true`; drafts are hidden until an editor publishes them.

## Auth URL configuration

Saved in **Authentication → URL Configuration**:

| Setting | Value |
| --- | --- |
| Site URL | `https://mw-ngo.github.io/shoam-website/` |
| Redirect URL 1 | `https://mw-ngo.github.io/shoam-website/admin.html` |
| Redirect URL 2 | `https://mw-ngo.github.io/shoam-website/**` |
| Redirect URL 3 | `http://127.0.0.1:8146/admin.html` |

## Editor login

The editor account has been created and auto-confirmed for **`alumtech9@gmail.com`**. The generated password is held outside this folder; do not add it to any file in the repo.

Sign in at:

- Local preview: `http://127.0.0.1:8146/admin.html`
- After deployment: `https://mw-ngo.github.io/shoam-website/admin.html`

Public sign-up is off, so any additional editor must also be created manually in **Authentication → Users → Add user**.

Editors can manage projects, team members, stories and photos in the `media` Storage bucket. Public visitors can only read published rows.

## If the schema needs to be reinstalled

1. Open **SQL Editor → New query**.
2. Paste all of `supabase/schema.sql`, then run it.
3. Paste all of `supabase/seed.sql`, then run it.

Both files are safe to run more than once; the seed does not duplicate existing slugs or names.

## Final checks after the editor exists

- Public pages show the seeded SHOAM content.
- Public “Add a project” / “Write a story” buttons stay hidden.
- Admin sign-in works at the local preview URL and, after deployment, at the hosted URL.
- An uploaded test photo appears in Storage → `media`.
- The SYLI preview and live site remain untouched.
