import React from 'react';
import { TabType } from '../types';

interface NavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange, className = '' }) => {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'train', label: 'Train', icon: 'fitness_center' },
    { id: 'progress', label: 'Progress', icon: 'trending_up' },
    { id: 'coach', label: 'Coach', icon: 'shield' },
    { id: 'settings', label: 'Settings', icon: 'tune' },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 pb-safe bg-[#0e0e0f]/90 backdrop-blur-xl border-t border-[#201f20] shadow-[0_-4px_24px_rgba(0,0,0,0.6)] ${className}`}
    >
      <div className="flex justify-around items-center h-16 max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-3">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              type="button"
              className={`flex flex-col items-center justify-center min-w-[56px] h-12 gap-0.5 transition-all select-none cursor-pointer group ${
                isActive
                  ? 'text-[#ffb68e]'
                  : 'text-[#d8c2b8]/70 hover:text-[#e5e2e3]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={`material-symbols-outlined text-[20px] transition-transform group-hover:scale-110 ${
                  isActive ? 'scale-110 text-[#ffb68e]' : ''
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {tab.icon}
              </span>
              <span className="font-['Inter'] text-[10px] font-semibold uppercase tracking-wider leading-none mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
