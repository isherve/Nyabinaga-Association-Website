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

export const galleryImages = Array.from({ length: 192 }, (_, i) => i + 1)
  .filter((n) => !excludedGalleryImages.includes(n))
  .map((n) => {
    // Most files are .jpeg; a few are .jpg (23, 24) and one is .png (87).
    let ext = 'jpeg'
    if (n === 23 || n === 24) ext = 'jpg'
    if (n === 87) ext = 'png'
    return { src: `/images/image${n}.${ext}`, alt: `RW0164 EMLR Nyabinaga community photo ${n}` }
  })
