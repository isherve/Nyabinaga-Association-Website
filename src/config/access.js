// Access configuration for the site's soft-gated areas.
//
// IMPORTANT: This is a static site with no backend, so these passwords live in
// the client bundle. They act as a *deterrent / soft gate* — good enough to keep
// casual visitors out of sensitive financial details and the admin upload tools,
// but NOT real security. Anyone determined can read the bundle. When you are
// ready for true protection, move auth to a backend (e.g. a small API + login)
// and replace the checks in src/context/AuthContext.jsx.
//
// To change the passwords, just edit the values below.

export const ACCESS = {
  // Unlocks the financial "View details" breakdowns on the Our Groups page.
  detailsPassword: 'Director@123',

  // Grants administrator rights: view all details + upload gallery photos.
  adminPassword: 'Director@123',

  // Unlocks the Pastors Room page and allows pastors to publish announcements.
  pastorsPassword: 'Pastor@123',
}
