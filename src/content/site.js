// Site-wide strings and configuration.
// Strings are kept centralized here so a Kinyarwanda toggle can be added later.

export const site = {
  name: 'RW0164 EMLR Nyabinaga',
  tagline: 'Building Self-Reliance, One Family at a Time',
  location: {
    village: 'Karambi Village',
    cell: 'Karengera Cell',
    sector: 'Kirimbi Sector',
    district: 'Nyamasheke District',
    province: 'Western Province',
    country: 'Rwanda',
  },
  locationLine:
    'Karambi Village, Karengera Cell, Kirimbi Sector, Nyamasheke District, Western Province, Rwanda',
  thankYou: 'Murakoze (Thank you)', // legacy — no longer shown in footer
}

// ── Contact, social & donation configuration ────────────────────────────
// Edit these values in one place; they feed the WhatsApp button, footer
// social links, the Contact page, and the Donate page.

export const contact = {
  emails: ['rw164projdirector@gmail.com', 'jeromemunyansanga@gmail.com'],
  // Phone shown on the site (human-friendly).
  phoneDisplay: '+250 783 060 232',
  // Same number, digits only, for tel: and WhatsApp (wa.me) links.
  phoneRaw: '250783060232',
  whatsapp: '250783060232',
  // Paste your Formspree form ID here (looks like 'xayzabcd'). Leave empty to
  // fall back to opening the visitor's email app via mailto:.
  // Get one free at https://formspree.io  (see README → Contact form).
  formspreeId: '',
}

// Social links. Set a URL to show the icon; leave '' to hide it.
export const socials = {
  facebook: '',
  instagram: '',
  youtube: '',
}

// Ways to give shown on the Donate / Support Us page.
// Any entry left blank is hidden automatically.
export const donation = {
  mobileMoney: {
    // Defaults to the project phone; change the name/number if needed.
    name: 'RW0164 EMLR Nyabinaga',
    number: '+250 783 060 232',
  },
  bank: {
    bankName: '', // e.g. 'Bank of Kigali'
    accountName: '', // e.g. 'RW0164 EMLR Nyabinaga'
    accountNumber: '', // e.g. '000012345678900'
    swift: '', // optional, for international transfers
  },
}

export const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Our Groups', to: '/groups' },
  { label: 'Youth Programs', to: '/youth' },
  { label: "Children's Program", to: '/children' },
  { label: 'Impact', to: '/impact' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
]

export const whatWeDo = [
  {
    icon: 'sprout',
    title: 'Livelihood Groups',
    text: 'Families are organized into savings and income-generating groups \u2014 farming, livestock, trade, and crafts.',
  },
  {
    icon: 'book',
    title: "Children's Education Support",
    text: 'A primary school with 18 classrooms plus a Saturday learning and feeding program for children.',
  },
  {
    icon: 'users',
    title: 'Youth Empowerment',
    text: 'Vocational training, small business support, and talent development for young people.',
  },
  {
    icon: 'coins',
    title: 'Savings & Credit',
    text: 'Every group practices weekly or monthly group savings and internal lending.',
  },
]

// Curated hero / section-header images (hand-picked from the full set).
export const featuredImages = {
  hero: '/images/image22.jpeg',
  about: '/images/image35.jpeg',
  groups: '/images/image15.jpeg',
  youth: '/images/image45.jpeg',
  children: '/images/image25.jpeg',
  impact: '/images/image50.jpeg',
  contact: '/images/image8.jpeg',
  ctaBanner: '/images/image12.jpeg',
}

// Background photos for the Home hero slideshow (slide left -> right).
export const heroSlideshow = [
  '/images/image22.jpeg',
  '/images/image30.jpeg',
  '/images/image12.jpeg',
]

// The full image set for the Gallery page (image1 .. image192).
// image1 (woven pattern) and image87 (placeholder) are excluded.
const excludedGalleryImages = [1, 87]

// Images numbered 88+ were added in the most recent photo batches.
const RECENT_FROM = 88

export const galleryImages = Array.from({ length: 192 }, (_, i) => i + 1)
  .filter((n) => !excludedGalleryImages.includes(n))
  .map((n) => {
    // Most files are .jpeg; a few are .jpg (23, 24) and one is .png (87).
    let ext = 'jpeg'
    if (n === 23 || n === 24) ext = 'jpg'
    if (n === 87) ext = 'png'
    return {
      src: `/images/image${n}.${ext}`,
      alt: `RW0164 EMLR Nyabinaga community photo ${n}`,
      recent: n >= RECENT_FROM,
    }
  })
  // Show the most recent photos first.
  .sort((a, b) => Number(b.recent) - Number(a.recent))
