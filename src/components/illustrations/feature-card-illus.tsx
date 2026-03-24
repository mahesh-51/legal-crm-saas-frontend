interface FeatureCardIllusProps {
  variant: "users" | "briefcase" | "calendar" | "file" | "shield" | "scale";
  className?: string;
}

const icons: Record<string, React.ReactNode> = {
  users: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
    </g>
  ),
  briefcase: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M12 12v4" />
      <path d="M8 14h8" />
    </g>
  ),
  calendar: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </g>
  ),
  file: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </g>
  ),
  shield: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </g>
  ),
  scale: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="m16 16 3-8 3 8" />
      <path d="m2 16 3-8 3 8" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </g>
  ),
};

export function FeatureCardIllus({ variant, className = "" }: FeatureCardIllusProps) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-4 ${className}`}>
      <svg
        viewBox="0 0 24 24"
        className="h-10 w-10 text-primary"
        aria-hidden
      >
        {icons[variant]}
      </svg>
    </div>
  );
}
