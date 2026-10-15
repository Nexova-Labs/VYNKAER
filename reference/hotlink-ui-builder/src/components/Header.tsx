import React from 'react';
import { MonogramLogo } from './MonogramLogo';
import { TabType } from '../types';

interface HeaderProps {
  currentTab: TabType;
  onAvatarClick?: () => void;
  onOpenPlateCalc?: () => void;
  onOpenGallery?: () => void;
  liveUtcTime?: string;
  isWidescreenLocked?: boolean;
  onToggleWidescreen?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onAvatarClick,
  onOpenPlateCalc,
  onOpenGallery,
  liveUtcTime = '05:00 UTC',
  isWidescreenLocked = false,
  onToggleWidescreen,
}) => {
  const getTabTitle = (tab: TabType) => {
    switch (tab) {
      case 'home':
        return 'Overview';
      case 'train':
        return 'Train';
      case 'progress':
        return 'Progress';
      case 'coach':
        return 'Coach';
      case 'settings':
        return 'Settings';
    }
  };

  return (
    <header className="sticky top-0 w-full z-40 pt-safe bg-[#0e0e0f]/90 backdrop-blur-xl border-b border-[#201f20] shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Brand & Active Tab Indicator */}
        <div className="flex items-center gap-2.5">
          <MonogramLogo size={32} />
          <span className="font-['Cinzel'] tracking-[0.22em] text-[13px] sm:text-[14px] font-semibold text-[#e5e2e3] uppercase select-none">
            VYNKÆR
          </span>
          <span className="h-3 w-px bg-[#353436] mx-1"></span>
          <span className="font-['Inter'] text-[11px] font-semibold uppercase text-[#ffb68e] tracking-widest">
            {getTabTitle(currentTab)}
          </span>
        </div>

        {/* Right Actions & Telemetry */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Tools on Desktop / Tablet */}
          {onOpenPlateCalc && (
            <button
              onClick={onOpenPlateCalc}
              type="button"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#201f20] hover:bg-[#2a2a2b] text-[#d8c2b8] text-[11px] font-['JetBrains_Mono'] uppercase tracking-wider transition-colors border border-[#26262c] cursor-pointer"
              title="Quick IPF Plate Calculator"
            >
              <span className="material-symbols-outlined text-[15px] text-[#ffb68e]">calculate</span>
              <span>Plate Math</span>
            </button>
          )}

          {onOpenGallery && (
            <button
              onClick={onOpenGallery}
              type="button"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#201f20] hover:bg-[#2a2a2b] text-[#d8c2b8] text-[11px] font-['Inter'] uppercase tracking-wider transition-colors border border-[#26262c] cursor-pointer"
              title="Open Apparatus Gallery Lightbox"
            >
              <span className="material-symbols-outlined text-[15px] text-[#ffb68e]">photo_library</span>
              <span>Apparatus</span>
            </button>
          )}

          {/* Live UTC Chronometer Readout */}
          <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141415] border border-[#26262c]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7EA583] animate-pulse"></span>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#d8c2b8] tracking-wider uppercase tabular-nums">
              {liveUtcTime}
            </span>
          </div>

          {/* Viewport Width Toggle (Mobile Rig vs Widescreen Studio) */}
          {onToggleWidescreen && (
            <button
              onClick={onToggleWidescreen}
              type="button"
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#201f20] hover:bg-[#2a2a2b] text-[#c8c5ca] hover:text-[#e5e2e3] text-[11px] font-['Inter'] transition-colors border border-[#26262c] cursor-pointer"
              title={isWidescreenLocked ? 'Switch to Compact Mobile View' : 'Switch to Widescreen Studio'}
            >
              <span className="material-symbols-outlined text-[15px]">
                {isWidescreenLocked ? 'smartphone' : 'desktop_windows'}
              </span>
              <span>{isWidescreenLocked ? 'Compact' : 'Studio'}</span>
            </button>
          )}

          {/* Athlete Profile Avatar */}
          <button
            onClick={onAvatarClick}
            type="button"
            className="w-8 h-8 rounded-full bg-[#975a36] hover:bg-[#b97140] flex items-center justify-center text-[#ffe5d8] active:scale-95 transition-all shadow-sm cursor-pointer border border-[#b97140]"
            title="Athlete Profile"
            aria-label="Athlete Profile"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </button>
        </div>
      </div>
    </header>
  );
};
