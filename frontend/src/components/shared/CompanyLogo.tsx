import React from 'react';

interface CompanyLogoProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showVerified?: boolean;
}

const colorPalettes = [
  { bg: 'bg-blue-600', text: 'text-white' },
  { bg: 'bg-indigo-600', text: 'text-white' },
  { bg: 'bg-emerald-600', text: 'text-white' },
  { bg: 'bg-purple-600', text: 'text-white' },
  { bg: 'bg-rose-600', text: 'text-white' },
  { bg: 'bg-sky-500', text: 'text-white' },
  { bg: 'bg-teal-600', text: 'text-white' },
  { bg: 'bg-amber-600', text: 'text-white' },
];

export function CompanyLogo({
  name,
  size = 'md',
  className = '',
  showVerified = true,
}: CompanyLogoProps) {
  // Deterministic color based on name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = colorPalettes[Math.abs(hash) % colorPalettes.length];

  // Get initials (up to 2 letters, skipping 'PT' if present for Indonesian company names)
  const cleanName = name.replace(/^PT\.?\s+/i, '').trim();
  const words = cleanName.split(/\s+/).filter(Boolean);
  const initials =
    words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : (cleanName.slice(0, 2) || 'IK').toUpperCase();

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs rounded-lg',
    md: 'w-11 h-11 text-sm font-bold rounded-xl',
    lg: 'w-14 h-14 text-base font-bold rounded-2xl',
    xl: 'w-18 h-18 text-xl font-bold rounded-2xl',
  };

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={`flex items-center justify-center font-bold tracking-tight shadow-xs select-none transition-transform ${sizeClasses[size]} ${palette.bg} ${palette.text} ${className}`}
      >
        {initials}
      </div>
      {showVerified && (
        <span
          className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white ring-2 ring-white shadow-xs"
          title="Verified Company"
        >
          <svg
            className="h-2.5 w-2.5 fill-current"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}
    </div>
  );
}
