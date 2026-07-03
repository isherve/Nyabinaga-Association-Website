// Seed announcements for the Pastors Room. These ship with the site so every
// visitor sees them on every device. Pastors/admins can publish more from the
// page itself (those are saved in the browser — see src/lib/announcementsStore.js).
//
// Each item: { id, title, body, author, date (YYYY-MM-DD), pinned }.

export const announcementsSeed = [
  {
    id: 'seed-welcome',
    title: 'Welcome to the Pastors Room',
    body: 'This space is for pastors to share announcements, encouragements, and important information with staff members and the wider community. Check back regularly for updates.',
    author: 'Nyabinaga Pastoral Team',
    date: '2026-07-03',
    pinned: true,
  },
]
