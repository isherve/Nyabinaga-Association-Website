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

## Contact form

The contact form on the Contact page opens the visitor's email client via a `mailto:` link (no
backend in v1). To accept submissions online later, wire the form to a service such as Formspree
and update `src/pages/Contact.jsx`.

---

_RW0164 EMLR Nyabinaga — Murakoze (Thank you)._
