# SHOAM — Student Helping Organization of Malawi

A complete, multi-page website for **SHOAM (Student Helping Organization of Malawi)**, built with plain HTML, CSS and JavaScript. No build step, no framework, no monthly bill.

> **Education is for all.**

This project is deliberately separate from the SYLI website. It has its own folder, its own content, its own branding and its own Supabase project. Nothing here points at the SYLI database.

The content is centred on **Malawian students, their families and schools** — fees, books, uniforms, transport, distance, honest information and practical help. Younger-student photos are kept because that is where the journey begins; college and university remain one possible path, not the whole identity.

## Current status

| What | Status |
| --- | --- |
| Public website | Built locally in this folder |
| Live deployment | **Not deployed yet** |
| Supabase backend | **Prepared but disconnected** — waiting for a SHOAM Supabase project |
| Team content studio | Works in “local-only” mode; hosted login is prepared and starts once Supabase is connected |

Preview locally with:

```powershell
cd "C:\Users\R6-S8\Documents\Default Project\ngo-sites\shoam-student-helping-organization-of-malawi"
python -m http.server 8146
```

Then open <http://127.0.0.1:8146/>. Port `8146` is used so the SYLI preview on `8145` is not disturbed.

---

## What is in the box

| Page | File | What it does |
| --- | --- | --- |
| Home | `index.html` | Student hero, quick facts, mission, featured projects, team and stories |
| About | `about.html` | Story, mission, vision, values, challenge, approach, logo meaning |
| Projects | `projects.html` | All projects, filters, search, project reader, project studio |
| Team | `team.html` | Founder, volunteers, filters, full directory and profiles |
| Stories | `articles.html` | Featured story, categories, article grid, story studio |
| Single story | `article.html` | Reading page with four layouts, progress and sharing |
| Get involved | `get-involved.html` | Volunteer, mentor, partner and support pathways |
| Contact | `contact.html` | Message form, Messenger fallback, FAQ |
| Not found | `404.html` | Friendly error page |
| Content studio | `admin.html` | Hosted sign-in page for the team once Supabase is connected |

```
shoam-student-helping-organization-of-malawi/
├─ index.html · about.html · projects.html · team.html
├─ articles.html · article.html · get-involved.html · contact.html · 404.html
├─ admin.html                 ← team content studio (needs Supabase)
├─ css/
│  ├─ style.css
│  └─ admin.css
├─ js/
│  ├─ config.js               ← Supabase URL + anon key (currently empty)
│  ├─ backend.js              ← Supabase adapter, login, uploads, public reads
│  ├─ data.js                 ← SHOAM content, fallback + seed
│  ├─ local-content.js
│  ├─ site.js
│  ├─ projects.js
│  ├─ team.js
│  ├─ articles.js
│  └─ admin.js
├─ supabase/
│  ├─ schema.sql              ← tables, RLS, media bucket
│  └─ seed.sql                ← SHOAM projects, team and stories
├─ assets/photos/             ← student photos + the real SHOAM Facebook post image
├─ assets/icons/              ← SHOAM emblem, favicon and social preview
└─ README.md · SUPABASE.md · HOSTING.md
```

---

## Content model

`js/data.js` is the single source of truth for the bundled content:

- `org` — name, tagline, location, Facebook and Messenger links. Email/phone/WhatsApp are empty until SHOAM publishes them.
- `mission`, `vision`, `values`, `challenges`, `approach`
- `team` — founder and student volunteers. No invented named members.
- `projects` — SHOAM's five current/planned projects.
- `articles` — four SHOAM stories, including the real “Do you know SHOAM?” post.
- `partners` — student groups, schools, universities, families and supporters.

Every list is a normal JavaScript array. Copy an item, paste it at the top, give it a unique `slug`, and save. No build step.

**Photos:** files live in `assets/photos/`. The site uses Unsplash photos of African students plus one real image from SHOAM's public Facebook post. No personal photos from Frank's profile were copied.

**Logo:** `assets/icons/emblem.svg` uses the heart from the downloaded `SHOAM.jpg` logo in place of a star, with the SHOAM wordmark inside it. The heart maps to the organisation's "education is for all" promise.

---

## Contact details

Only Facebook and Messenger are published on the founder's public profile, so the site hides empty email/phone/WhatsApp fields rather than inventing them:

```js
email: "",
phone: "",
whatsapp: "",
facebook: "https://web.facebook.com/profile.php?id=61554677085022",
messenger: "https://m.me/61554677085022"
```

Fill in any of the empty values in `js/data.js` and they appear automatically in the footer and contact page.

---

## Editing content

### Without Supabase (current mode)

Because `js/config.js` is empty, the site runs from `js/data.js` plus the browser studios:

- **Projects page:** “Add a project”
- **Stories page:** “Write a story”
- **Floating action buttons:** same studios, available anywhere on those pages

Studio content is saved in the browser under `shoam.content.v1`. Use **Download all site content** in the studio, then paste the arrays into `js/local-content.js` to publish them for everyone.

### With Supabase (connected)

See **[SUPABASE.md](SUPABASE.md)**. The SHOAM-only project is created, seeded and wired into `js/config.js`:

1. The schema and starter content have been applied.
2. The site uses Supabase's browser-safe **publishable key** through the `supabaseAnonKey` config field.
3. The SHOAM auth URLs are saved in Supabase Authentication.
4. The editor user has been created in Supabase Authentication using the real editor email.
5. Open `https://mw-ngo.github.io/shoam-website/admin.html` (or `http://127.0.0.1:8146/admin.html` locally) and sign in.

Public visitors only ever read rows where `published = true`. The `service_role` key must never be placed in the website.

---

## Hosting

See **[HOSTING.md](HOSTING.md)**. The site is deployed from a separate repository, `MW-NGO/shoam-website`, at `https://mw-ngo.github.io/shoam-website/` with the admin page at `https://mw-ngo.github.io/shoam-website/admin.html`. This keeps the live SYLI site at `https://mw-ngo.github.io/` untouched.
