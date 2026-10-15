/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TabType } from './types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomeScreen } from './components/HomeScreen';
import { TrainScreen } from './components/TrainScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { CoachScreen } from './components/CoachScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { MonogramLogo } from './components/MonogramLogo';
import { ImageLightboxModal } from './components/ImageLightboxModal';
import { APPARATUS_GALLERY } from './components/ApparatusCarousel';
import { PlateCalculatorModal } from './components/PlateCalculatorModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [liveUtcTime, setLiveUtcTime] = useState('05:00 UTC');
  const [isWidescreenStudio, setIsWidescreenStudio] = useState(true);

  // Global Lightbox & Plate Calculator state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [plateCalcOpen, setPlateCalcOpen] = useState(false);

  // Keep live UTC time formatted in horological precision
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, '0');
      const m = String(now.getUTCMinutes()).padStart(2, '0');
      const s = String(now.getUTCSeconds()).padStart(2, '0');
      setLiveUtcTime(`${h}:${m}:${s} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleBeginSession = () => {
    setSessionStarted(true);
    setCurrentTab('train');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const desktopNavItems: { id: TabType; label: string; icon: string; shortcut: string }[] = [
    { id: 'home', label: 'Overview', icon: 'home', shortcut: '1' },
    { id: 'train', label: 'Train & Rest', icon: 'fitness_center', shortcut: '2' },
    { id: 'progress', label: 'Progress Archive', icon: 'trending_up', shortcut: '3' },
    { id: 'coach', label: 'Autoregulation', icon: 'shield', shortcut: '4' },
    { id: 'settings', label: 'Settings & Units', icon: 'tune', shortcut: '5' },
  ];

  return (
    <div className="bg-[#131314] min-h-screen text-[#e5e2e3] flex flex-col items-center selection:bg-[#975a36] selection:text-[#ffe5d8]">
      {/* Sticky Applet Header across all viewports */}
      <Header
        currentTab={currentTab}
        liveUtcTime={liveUtcTime}
        onAvatarClick={() => handleTabChange('settings')}
        onOpenPlateCalc={() => setPlateCalcOpen(true)}
        onOpenGallery={() => {
          setGalleryIndex(0);
          setGalleryOpen(true);
        }}
        isWidescreenLocked={!isWidescreenStudio}
        onToggleWidescreen={() => setIsWidescreenStudio(!isWidescreenStudio)}
      />

      {/* Main Container: Adapts from focused Mobile Rig to Desktop Command Station */}
      <div
        className={`w-full transition-all duration-300 ${
          isWidescreenStudio
            ? 'max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6'
            : 'max-w-md sm:max-w-lg md:max-w-xl min-h-screen shadow-[0_0_50px_rgba(0,0,0,0.8)] border-x border-[#1c1b1c]/60 px-4 pt-3 pb-24'
        }`}
      >
        <div className={`w-full ${isWidescreenStudio ? 'lg:flex lg:gap-8 items-start' : ''}`}>
          {/* Desktop Left Command Sidebar (Visible only in Widescreen Studio mode on lg+ screens) */}
          {isWidescreenStudio && (
            <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 sticky top-24 space-y-5">
              {/* Horological Brand Badge */}
              <div className="bg-[#1c1b1c] rounded-2xl p-4 border border-[#26262c] shadow-xl flex flex-col space-y-3">
                <div className="flex items-center gap-3">
                  <MonogramLogo size={36} />
                  <div>
                    <h2 className="font-['Cinzel'] text-[15px] font-bold tracking-[0.2em] text-[#e5e2e3]">
                      VYNKÆR
                    </h2>
                    <span className="font-['Inter'] text-[10px] text-[#ffb68e] font-semibold uppercase tracking-wider block">
                      CHRONOMETER SPEC-01
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#26262c] flex items-center justify-between text-[11px] font-mono text-[#c8c5ca]">
                  <span>TIME STANDARD</span>
                  <span className="text-[#e5e2e3] font-bold">{liveUtcTime}</span>
                </div>
              </div>

              {/* Desktop Navigation Links */}
              <nav className="bg-[#1c1b1c] rounded-2xl p-2.5 border border-[#26262c] shadow-xl flex flex-col space-y-1">
                <span className="font-['Cinzel'] text-[9px] tracking-[0.22em] text-[#d8c2b8] uppercase font-semibold px-3 pt-2 pb-1">
                  DISCIPLINES
                </span>
                {desktopNavItems.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      type="button"
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#975a36] text-[#ffe5d8] shadow-md'
                          : 'text-[#d8c2b8] hover:bg-[#2a2a2b] hover:text-[#e5e2e3]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="material-symbols-outlined text-[19px]"
                          style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          {item.icon}
                        </span>
                        <span className="font-['Inter'] text-[13px] font-medium tracking-wide">
                          {item.label}
                        </span>
                      </div>
                      <span
                        className={`font-['JetBrains_Mono'] text-[10px] px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-black/25 text-[#ffe5d8]'
                            : 'bg-[#201f20] text-[#c8c5ca]'
                        }`}
                      >
                        [{item.shortcut}]
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Apparatus Calibrator Tools */}
              <div className="bg-[#1c1b1c] rounded-2xl p-3.5 border border-[#26262c] shadow-xl flex flex-col space-y-2">
                <span className="font-['Cinzel'] text-[9px] tracking-[0.22em] text-[#d8c2b8] uppercase font-semibold px-1">
                  CALIBRATED APPARATUS
                </span>

                <button
                  onClick={() => setPlateCalcOpen(true)}
                  type="button"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0e0e0f] hover:bg-[#201f20] text-left transition-colors border border-[#201f20] group cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#ffb68e]">
                    calculate
                  </span>
                  <div className="flex flex-col">
                    <span className="font-['Inter'] text-[12px] text-[#e5e2e3] font-semibold group-hover:text-[#ffb68e] transition-colors">
                      IPF Plate Loading
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[10px] text-[#c8c5ca]">
                      20KG BAR + 2.5KG COLLARS
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setGalleryIndex(0);
                    setGalleryOpen(true);
                  }}
                  type="button"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0e0e0f] hover:bg-[#201f20] text-left transition-colors border border-[#201f20] group cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#d8c2b8]">
                    zoom_in
                  </span>
                  <div className="flex flex-col">
                    <span className="font-['Inter'] text-[12px] text-[#e5e2e3] font-semibold group-hover:text-[#ffb68e] transition-colors">
                      Zoom Apparatus Archive
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[10px] text-[#c8c5ca]">
                      5 HIGH-RES SPECIMENS
                    </span>
                  </div>
                </button>
              </div>

              {/* Sanctioned Athlete Snapshot Card */}
              <div className="bg-[#1c1b1c] rounded-2xl p-3.5 border border-[#26262c] shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#2a2a2b] flex items-center justify-center font-['Cinzel'] text-[#d8c2b8] text-[12px] font-bold border border-[#353436]">
                    KV
                  </div>
                  <div className="flex flex-col">
                    <span className="font-['EB_Garamond'] text-[15px] text-[#e5e2e3] font-medium leading-none">
                      K. Vynkær
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[10px] text-[#c8c5ca] mt-0.5">
                      92.4 KG • READINESS 94%
                    </span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#7EA583]" title="Autoregulation Active"></span>
              </div>
            </aside>
          )}

          {/* Primary Screen Body with Smooth Motion Transitions */}
          <main className={`flex-1 w-full ${isWidescreenStudio ? 'pb-20 lg:pb-12' : 'pb-20'}`}>
            <AnimatePresence mode="wait">
              {currentTab === 'home' && (
                <HomeScreen
                  key="home"
                  onBeginSession={handleBeginSession}
                  sessionStarted={sessionStarted}
                  onNavigateToTrain={() => handleTabChange('train')}
                />
              )}
              {currentTab === 'train' && <TrainScreen key="train" />}
              {currentTab === 'progress' && <ProgressScreen key="progress" />}
              {currentTab === 'coach' && <CoachScreen key="coach" />}
              {currentTab === 'settings' && <SettingsScreen key="settings" />}
            </AnimatePresence>
          </main>
        </div>

        {/* Persistent Bottom Horological Navigation Bar on Mobile / Compact */}
        <Navigation
          currentTab={currentTab}
          onTabChange={handleTabChange}
          className={isWidescreenStudio ? 'lg:hidden' : ''}
        />
      </div>

      {/* Global Image Lightbox Modal for Chamber Apparatus Inspection */}
      <ImageLightboxModal
        isOpen={galleryOpen}
        images={APPARATUS_GALLERY}
        currentIndex={galleryIndex}
        onClose={() => setGalleryOpen(false)}
        onNavigate={(idx) => setGalleryIndex(idx)}
      />

      {/* Global IPF Plate Loading Calculator */}
      <PlateCalculatorModal
        isOpen={plateCalcOpen}
        initialWeight={185.0}
        onClose={() => setPlateCalcOpen(false)}
      />
    </div>
  );
}
