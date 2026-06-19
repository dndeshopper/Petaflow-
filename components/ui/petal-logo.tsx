export function PetalLogo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="14" cy="8" r="4" fill="#6B9B7A" opacity="0.85" />
      <circle cx="8" cy="14" r="4" fill="#6B9B7A" opacity="0.7" />
      <circle cx="20" cy="14" r="4" fill="#6B9B7A" opacity="0.7" />
      <circle cx="10" cy="20" r="4" fill="#6B9B7A" opacity="0.55" />
      <circle cx="18" cy="20" r="4" fill="#6B9B7A" opacity="0.55" />
      <circle cx="14" cy="14" r="2.5" fill="#5A8A69" />
    </svg>
  );
}

export function StemFlower({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="2.5" fill="#B8C9BB" opacity="0.8" />
      <circle cx="5" cy="8" r="2" fill="#B8C9BB" opacity="0.6" />
      <circle cx="11" cy="8" r="2" fill="#B8C9BB" opacity="0.6" />
      <circle cx="8" cy="8" r="1.5" fill="#9BB0A0" />
    </svg>
  );
}

export function StemLeaf({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <ellipse cx="8" cy="8" rx="3" ry="5" fill="#B8C9BB" opacity="0.5" transform="rotate(-20 8 8)" />
      <ellipse cx="8" cy="8" rx="3" ry="5" fill="#B8C9BB" opacity="0.5" transform="rotate(20 8 8)" />
    </svg>
  );
}
