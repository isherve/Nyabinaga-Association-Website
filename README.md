# RW0164 EMLR Nyabinaga — Community Association Website

A modern, warm, and responsive website for **RW0164 EMLR Nyabinaga**, a community-development
project in Karambi Village, Karengera Cell, Kirimbi Sector, Nyamasheke District, Western Province,
Rwanda. The site tells the association's story, profiles its 13 livelihood groups ("amatsinda"),
and showcases its youth and children's programs, impact numbers, and photo gallery.

## Tech stack

- **React 18** + **Vite** — fast, modern build tooling
- **Tailwind CSS** — utility-first styling with a custom earthy palette
- **React Router** — client-side navigation
- **Recharts** — the group-assets bar chart on the Impact page

## Getting started

```bash
npm install     # install dependencies
npm run dev     # start the dev server (http://localhost:5173)
npm run build   # production build into /dist
npm run preview # preview the production build locally
```

## Project structure

```
public/images/          All 87 photos (image1..image87), served statically
src/
  components/            Reusable UI: Navbar, Footer, GroupCard, Icons, Reveal, etc.
  content/               All editable site content (kept out of components)
    site.js              Nav items, org info, "What We Do", featured/gallery images
    groups.js            The 13 livelihood groups + registered-group names
    stats.js             Impact metrics and highlight numbers
    staff.js             Staff, volunteers, committees, facilities
    youth.js             Youth program content
  pages/                 One file per route (Home, About, Groups, Youth, ...)
  App.jsx                Routes + layout
  main.jsx               App entry
  index.css              Tailwind layers + shared component classes
```

## Editing content

All copy and data live in `src/content/`. Update those files to change text, numbers, group
details, or which photos appear — no need to touch the page components. Strings are centralized
so a **Kinyarwanda language toggle** can be added later without refactoring.

## Images

The 87 photos live in `public/images/` (`image1.jpeg` … `image87.png`). The **Gallery** page shows
the full set with a click-to-enlarge lightbox. A hand-picked subset is used for the hero, section
headers, and group cards — edit `featuredImages` in `src/content/site.js` or each group's `image`
field in `src/content/groups.js` to reassign specific photos.

## Theme & languages

The site supports **light and dark mode** and three languages:

| Code | Language |
| --- | --- |
| EN | English |
| FR | French (Français) |
| RW | Kinyarwanda |

- **Theme toggle** — sun/moon icon in the navigation bar (saved in `localStorage`).
- **Language selector** — globe dropdown in the navigation bar (saved in `localStorage`).
- **Translations** — all UI strings live in `src/content/translations.js`. Add or edit keys there for each language.

Group financial line-items in `src/content/groups.js` remain in English for now (numbers and detailed breakdowns); page chrome, navigation, and section copy are fully translated.

## Access control & admin features

The site has two soft-gated areas, configured in **`src/config/access.js`**:

| Feature | Where | Default password |
| --- | --- | --- |
| **View group financial details** | The "View details" button on each group card (Our Groups page) | `nyabinaga2011` |
| **Administrator login** | The lock icon in the top navigation | `admin-nyabinaga` |

- **Restricted details:** clicking "View details" on a group shows a lock and asks for the details
  password before revealing the financial breakdown. Once entered, all group details stay unlocked
  for the rest of the browser session.
- **Administrator uploads:** logging in as an admin (lock icon → password) unlocks a photo-upload
  panel at the top of the **Gallery** page. Admins can drag & drop or browse for images; photos are
  automatically resized/compressed and saved in the browser. Admins can also delete their uploads.
  Admins can view all group details without the separate details password.

> **Security note:** because this is a static site with no server, these passwords live in the
> client bundle and act as a *soft gate / deterrent* — not real security. Uploaded photos are stored
> in the visitor's own browser (`localStorage`), not on a shared server, so they are only visible on
> the device that uploaded them. For true access control and shared uploads, add a backend (a small
> login API + file storage) and update `src/context/AuthContext.jsx` and
> `src/hooks/useGalleryUploads.js`. To change the passwords now, edit `src/config/access.js`.

## Contact, WhatsApp, socials & donation

All of these are configured in one place — **`src/content/site.js`** — so you never have to touch
components:

- **`contact`** — project emails, phone/WhatsApp number, and the optional Formspree form ID.
- **`socials`** — Facebook / Instagram / YouTube URLs (leave a value `''` to hide that icon).
- **`donation`** — Mobile Money name/number and (optional) bank-transfer details shown on the
  Donate page. Any blank field is hidden automatically.

### Contact form (delivering emails online)

By default the contact form opens the visitor's email app via `mailto:` (addressed to both project
emails). To have messages delivered **directly to your inbox** without relying on the visitor's
email client:

1. Go to [formspree.io](https://formspree.io) and create a free account.
2. Create a new form and choose which email should receive submissions (you can forward to both
   `rw164projdirector@gmail.com` and `jeromemunyansanga@gmail.com`).
3. Copy the form ID from the endpoint `https://formspree.io/f/XXXXXXXX` — the `XXXXXXXX` part.
4. Paste it into `contact.formspreeId` in `src/content/site.js`.

Once set, the form submits in-page and shows a success message; if left blank it falls back to the
`mailto:` behaviour.

### WhatsApp button

A floating WhatsApp button (bottom-right) opens a chat with `contact.whatsapp`. Change the number
in `src/content/site.js` (digits only, with country code, e.g. `250783060232`).

## Team page

The **Our Team** page (`/team`) shows the staff/committee structure from `src/content/staff.js`.
To feature named leaders with photos, fill in the `leadership` array in that file (set a `name`,
optional `role`, and optional `photo` path under `/public/images`). Cards with an empty `name` are
hidden, and a colored initials avatar is shown when no photo is provided.

## Deploying live

The project is a static site, so any static host works. SPA-routing configs are already included:

- **Vercel** (`vercel.json`) — import the GitHub repo at [vercel.com](https://vercel.com); it
  auto-detects Vite. No settings needed.
- **Netlify** (`netlify.toml` + `public/_redirects`) — import the repo at
  [netlify.com](https://netlify.com); build command `npm run build`, publish directory `dist`.

Both serve the app at the domain root and redirect all routes to `index.html` so React Router works.
After the first deploy you can connect a custom domain (e.g. `nyabinaga.org`) in the host's settings.

---

_RW0164 EMLR Nyabinaga — Murakoze (Thank you)._
