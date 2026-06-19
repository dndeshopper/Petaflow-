export function NavIconToday({ active }: { active?: boolean }) {
  const stroke = active ? "#1c1b1a" : "#6f6d69";
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.7">
      <path d="M12 4c2.5 1.5 2.5 5 0 6.5C9.5 9 9.5 5.5 12 4Z" />
      <path d="M5.5 9c2.8.4 4 3.5 2.5 5.8C5.2 14.4 4 11.3 5.5 9Z" />
      <path d="M18.5 9c-2.8.4-4 3.5-2.5 5.8C18.8 14.4 20 11.3 18.5 9Z" />
      <path d="M12 13v7" strokeLinecap="round" />
    </svg>
  );
}

export function NavIconTimeline({ active }: { active?: boolean }) {
  const stroke = active ? "#1c1b1a" : "#6f6d69";
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round">
      <path d="M4 7h10M4 17h10" />
      <path d="M4 12h16" />
      <circle cx="17" cy="7" r="2" fill="#fff" />
      <circle cx="9" cy="17" r="2" fill="#fff" />
    </svg>
  );
}

export function NavIconGarden({ active }: { active?: boolean }) {
  const stroke = active ? "#1c1b1a" : "#6f6d69";
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinejoin="round">
      <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
      <path d="m3 12 9 4.5L21 12" />
    </svg>
  );
}

export function NavIconSearch({ active }: { active?: boolean }) {
  const stroke = active ? "#1c1b1a" : "#6f6d69";
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

export function NavIconCollections({ active }: { active?: boolean }) {
  const stroke = active ? "#1c1b1a" : "#6f6d69";
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="12" rx="2" />
      <path d="M4 9h16M9 4v5" />
    </svg>
  );
}

export function NavIconInbox({ active }: { active?: boolean }) {
  const stroke = active ? "#1c1b1a" : "#6f6d69";
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function NoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4c2be" strokeWidth="1.8" className="shrink-0">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  );
}

export function StemTopFlower() {
  return (
    <svg width="22" height="26" viewBox="0 0 22 26">
      <path d="M11 26V11" stroke="#c5c1f0" strokeWidth="1.4" />
      <ellipse cx="11" cy="6" rx="5" ry="6.5" fill="#6c5ce7" />
      <path d="M11 11c-2-1-3.5-3-3.5-5" stroke="#c5c1f0" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

export function StemBottomLeaf() {
  return (
    <svg width="26" height="22" viewBox="0 0 26 22">
      <path d="M13 0v14" stroke="#8b7ff0" strokeWidth="1.4" />
      <path d="M13 14c-6 0-9-4-9-9 5 0 9 4 9 9Z" fill="#8b7ff0" />
      <path d="M13 11c5 0 8-3.5 8-8-4.5 0-8 3.5-8 8Z" fill="#a99cf0" />
    </svg>
  );
}

export function ArrowRightIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function QuoteFlowerArt() {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" className="absolute -bottom-1.5 -right-1.5 opacity-50">
      <g fill="none" stroke="#d9d4f7" strokeWidth="1.3">
        <ellipse cx="55" cy="40" rx="7" ry="14" transform="rotate(30 55 40)" />
        <ellipse cx="62" cy="48" rx="7" ry="14" transform="rotate(70 62 48)" />
        <ellipse cx="60" cy="58" rx="7" ry="14" transform="rotate(110 60 58)" />
        <ellipse cx="50" cy="55" rx="7" ry="14" transform="rotate(150 50 55)" />
        <path d="M48 60 Q40 75 30 82" />
      </g>
    </svg>
  );
}
