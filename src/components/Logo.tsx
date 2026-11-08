import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  showSubtitle = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { img: 'w-7 h-7', text: 'text-sm', sub: 'text-[9px]' },
    md: { img: 'w-9 h-9', text: 'text-base', sub: 'text-[10px]' },
    lg: { img: 'w-12 h-12', text: 'text-xl', sub: 'text-xs' },
    xl: { img: 'w-16 h-16', text: 'text-2xl', sub: 'text-xs' },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Emblem */}
      <div className={`relative ${current.img} rounded-xl overflow-hidden border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] shrink-0 bg-slate-950 flex items-center justify-center`}>
        <img
          src="/src/assets/images/isaiasco_logo_emblem_1794086403489.jpg"
          alt="ISAIASCO Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-tight text-white ${current.text} font-sans`}>
              ISAIASCO
            </span>
            <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-1.5 py-0.2 rounded">
              E2EE
            </span>
          </div>
          {showSubtitle && (
            <span className={`text-slate-400 font-mono tracking-wide ${current.sub}`}>
              Enterprise Communications
            </span>
          )}
        </div>
      )}
    </div>
  );
};
