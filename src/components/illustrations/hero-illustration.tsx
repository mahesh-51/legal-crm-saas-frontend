export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 600 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full max-w-xl mx-auto"
      aria-hidden
    >
      <defs>
        <linearGradient id="heroGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4338ca" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="heroGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4338ca" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="heroGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {/* Background blob */}
      <ellipse cx="450" cy="250" rx="180" ry="140" fill="url(#heroGrad1)" />
      <ellipse cx="150" cy="350" rx="120" ry="80" fill="url(#heroGrad1)" />
      {/* Document stack */}
      <g transform="translate(200, 80)">
        <rect x="0" y="40" width="160" height="200" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="2" />
        <rect x="10" y="30" width="160" height="200" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="2" opacity="0.9" />
        <rect x="20" y="20" width="160" height="200" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="2" opacity="0.95" />
        <line x1="40" y1="60" x2="140" y2="60" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="40" y1="85" x2="120" y2="85" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="40" y1="110" x2="150" y2="110" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="40" y="140" width="80" height="60" rx="4" fill="url(#heroGrad2)" opacity="0.9" />
      </g>
      {/* Scale of justice */}
      <g transform="translate(320, 120)">
        <path d="M80 0 L80 120" stroke="url(#heroGrad2)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="80" cy="130" r="20" fill="url(#heroGrad2)" />
        <line x1="80" y1="40" x2="40" y2="90" stroke="url(#heroGrad2)" strokeWidth="3" strokeLinecap="round" />
        <line x1="80" y1="40" x2="120" y2="90" stroke="url(#heroGrad2)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="40" cy="95" r="12" fill="url(#heroGrad3)" />
        <circle cx="120" cy="95" r="12" fill="url(#heroGrad3)" />
      </g>
      {/* Calendar icon */}
      <g transform="translate(420, 200)">
        <rect x="0" y="20" width="80" height="70" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="2" />
        <rect x="0" y="0" width="80" height="30" rx="8" fill="url(#heroGrad2)" />
        <line x1="20" y1="50" x2="60" y2="50" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="20" y1="65" x2="45" y2="65" stroke="#cbd5e1" strokeWidth="2" />
      </g>
    </svg>
  );
}
