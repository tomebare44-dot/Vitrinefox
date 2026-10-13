import React, { useState, useRef, useEffect } from 'react';

interface FoxLogoProps {
  onSecretTrigger?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const FoxLogo: React.FC<FoxLogoProps> = ({
  onSecretTrigger,
  size = 'md',
  showTagline = true,
  className = '',
}) => {
  const [clickCount, setClickCount] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!onSecretTrigger) return;

    // Reset inactivity timer (3 seconds)
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (nextCount >= 15) {
      setClickCount(0);
      if (timerRef.current) clearTimeout(timerRef.current);
      onSecretTrigger();
      return;
    }

    // Auto reset after 3 seconds of inactivity
    timerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const sizeClasses = {
    sm: {
      svg: 'w-7 h-7',
      text: 'text-lg',
      sub: 'text-[10px]',
    },
    md: {
      svg: 'w-9 h-9',
      text: 'text-2xl',
      sub: 'text-xs',
    },
    lg: {
      svg: 'w-12 h-12',
      text: 'text-3xl',
      sub: 'text-sm',
    },
  }[size];

  return (
    <div
      onClick={handleClick}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group transition-transform active:scale-95 ${className}`}
      title="VitrineFox — Ofertas e Achadinhos"
      role="banner"
    >
      {/* Geometric Fox Mascot SVG */}
      <div className={`relative flex items-center justify-center ${sizeClasses.svg}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm transition-transform group-hover:rotate-1"
        >
          {/* Fox Ears */}
          <path
            d="M8 8L20 22L10 26L8 8Z"
            fill="url(#fox-orange-grad)"
          />
          <path
            d="M40 8L38 26L28 22L40 8Z"
            fill="url(#fox-orange-grad)"
          />
          {/* Inner Ears */}
          <path
            d="M11 12L18 21L13 23L11 12Z"
            fill="#FED7AA"
          />
          <path
            d="M37 12L35 23L30 21L37 12Z"
            fill="#FED7AA"
          />
          {/* Main Face Contour */}
          <path
            d="M24 16L12 24L17 38L24 44L31 38L36 24L24 16Z"
            fill="url(#fox-orange-grad)"
          />
          {/* White Cheeks */}
          <path
            d="M17 38L24 44L24 34L14 27L17 38Z"
            fill="#FFFFFF"
          />
          <path
            d="M31 38L24 44L24 34L34 27L31 38Z"
            fill="#F8FAFC"
          />
          {/* Fox Eyes */}
          <polygon
            points="18,29 22,31 18,33"
            fill="#0F172A"
          />
          <polygon
            points="30,29 26,31 30,33"
            fill="#0F172A"
          />
          {/* Fox Nose */}
          <path
            d="M22 41L24 44L26 41H22Z"
            fill="#0F172A"
          />

          <defs>
            <linearGradient id="fox-orange-grad" x1="8" y1="8" x2="40" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FB923C" />
              <stop offset="0.5" stopColor="#F97316" />
              <stop offset="1" stopColor="#EA580C" />
            </linearGradient>
          </defs>
        </svg>

        {/* Discreet click indicator when approaching 15 clicks for the owner */}
        {clickCount >= 10 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 animate-ping opacity-75" />
        )}
      </div>

      <div className="flex flex-col leading-none">
        <div className="flex items-center tracking-tight">
          <span className={`${sizeClasses.text} font-black text-slate-900 tracking-tight`}>
            Vitrine
          </span>
          <span className={`${sizeClasses.text} font-black text-orange-600 tracking-tight`}>
            Fox
          </span>
        </div>
        {showTagline && (
          <span className={`${sizeClasses.sub} text-slate-500 font-medium tracking-normal mt-0.5`}>
            Achadinhos Shopee
          </span>
        )}
      </div>
    </div>
  );
};
