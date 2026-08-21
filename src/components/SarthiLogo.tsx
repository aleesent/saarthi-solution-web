import React from 'react';

interface SarthiLogoProps {
  className?: string;
  onClick?: () => void;
  variant?: 'light' | 'dark' | 'footer' | 'compact';
  heightDesktop?: number;
  heightMobile?: number;
  showSubtitle?: boolean;
}

export const SarthiLogo: React.FC<SarthiLogoProps> = ({
  className = '',
  onClick,
  variant = 'light',
  heightDesktop = 54,
  heightMobile = 42,
  showSubtitle = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <img
        src="/sarthi-logo.svg"
        alt="Sarthi Solutions - Recruitment & Advisory • Since 2018"
        className={`w-auto transition-transform duration-300 ease-out group-hover:scale-[1.02] object-contain ${
          variant === 'dark' ? 'brightness-0 invert' : ''
        }`}
        style={{
          height: `${heightDesktop}px`,
          maxHeight: `${heightDesktop}px`,
        }}
        loading="eager"
      />
      {showSubtitle && (
        <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-black tracking-widest text-[#0A3D91] uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D9A21B]" />
          <span>Since 2018</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D9A21B]" />
        </div>
      )}
    </div>
  );
};
