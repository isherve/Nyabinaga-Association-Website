// Lightweight inline SVG icons (stroke-based) to avoid an icon dependency.

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function Sprout(props) {
  return (
    <svg {...base} {...props}>
      <path d="M7 20h10" />
      <path d="M12 20v-8" />
      <path d="M12 12C12 8 9 6 4 6c0 4 3 6 8 6Z" />
      <path d="M12 12c0-3 2-5 6-5 0 3-2 5-6 5Z" />
    </svg>
  )
}

export function Book(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5Z" />
      <path d="M4 19a2 2 0 0 0 2 2h12" />
      <path d="M9 7h6M9 11h6" />
    </svg>
  )
}

export function Users(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 6a3 3 0 0 1 0 6" />
      <path d="M17 14a6 6 0 0 1 4 6" />
    </svg>
  )
}

export function Coins(props) {
  return (
    <svg {...base} {...props}>
      <ellipse cx="9" cy="7" rx="6" ry="3" />
      <path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7" />
      <path d="M3 12v5c0 1.7 2.7 3 6 3 1 0 2-.1 3-.4" />
      <circle cx="17" cy="15" r="4" />
    </svg>
  )
}

export function MapPin(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

export function ArrowRight(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}

export function ChevronDown(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function Check(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function Close(props) {
  return (
    <svg {...base} {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export function Menu(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}

export function Mail(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

export function Heart(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9Z" />
    </svg>
  )
}

export function Tools(props) {
  return (
    <svg {...base} {...props}>
      <path d="M14.5 5.5a3.5 3.5 0 0 0-4.8 4.3L3 16.5 5.5 19l6.7-6.7a3.5 3.5 0 0 0 4.3-4.8l-2.2 2.2-2-2 2.2-2.2Z" />
    </svg>
  )
}

export function Spark(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v4M12 17v4M5 12H1M23 12h-4" />
      <path d="M12 8a4 4 0 0 0 0 8 4 4 0 0 0 0-8Z" />
    </svg>
  )
}

export function Sun(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

export function Moon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" />
    </svg>
  )
}

export function Globe(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  )
}

export function Lock(props) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15" r="1" />
    </svg>
  )
}

export function Unlock(props) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 7.4-2" />
      <circle cx="12" cy="15" r="1" />
    </svg>
  )
}

export function Upload(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}

export function Trash(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    </svg>
  )
}

export function Phone(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  )
}

// Brand icons use fill (not stroke) so they render as solid glyphs.
export function WhatsApp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} {...props}>
      <path d="M17.5 14.4c-.3-.15-1.7-.85-2-.94-.26-.1-.45-.15-.64.15s-.74.93-.9 1.12c-.17.2-.33.22-.62.08a8.2 8.2 0 0 1-2.4-1.48 9 9 0 0 1-1.67-2.07c-.17-.3 0-.46.13-.6.13-.14.3-.34.44-.5.14-.18.19-.3.29-.5.1-.2.05-.37-.02-.52-.08-.15-.64-1.55-.88-2.12-.23-.55-.47-.48-.64-.48h-.55c-.19 0-.5.07-.76.36-.26.3-1 .98-1 2.38s1.02 2.76 1.17 2.95c.14.2 2.02 3.08 4.9 4.32.68.3 1.22.47 1.63.6.69.22 1.31.19 1.8.11.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34ZM12 2a10 10 0 0 0-8.6 15.06L2 22l5.06-1.33A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3 .79.8-2.93-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
    </svg>
  )
}

export function Facebook(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} {...props}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  )
}

export function Instagram(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={24} height={24} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function YouTube(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} {...props}>
      <path d="M23 12s0-3.4-.43-5.03a2.62 2.62 0 0 0-1.84-1.85C19.1 4.7 12 4.7 12 4.7s-7.1 0-8.73.42A2.62 2.62 0 0 0 1.43 6.97C1 8.6 1 12 1 12s0 3.4.43 5.03c.24.9.94 1.6 1.84 1.85 1.63.42 8.73.42 8.73.42s7.1 0 8.73-.42a2.62 2.62 0 0 0 1.84-1.85C23 15.4 23 12 23 12ZM9.75 15.5v-7l6 3.5-6 3.5Z" />
    </svg>
  )
}

export function Gift(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8" />
      <path d="M12 8v13" />
      <path d="M12 8S10.5 3 8 4.5 9.5 8 12 8Zm0 0s1.5-5 4-3.5S14.5 8 12 8Z" />
    </svg>
  )
}

export const iconMap = {
  sprout: Sprout,
  book: Book,
  users: Users,
  coins: Coins,
}
