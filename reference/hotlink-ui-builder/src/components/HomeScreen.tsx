import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ApparatusCarousel } from './ApparatusCarousel';
import { ImageLightboxModal } from './ImageLightboxModal';
import { APPARATUS_GALLERY } from './ApparatusCarousel';
import { PlateCalculatorModal } from './PlateCalculatorModal';

interface HomeScreenProps {
  onBeginSession: () => void;
  sessionStarted?: boolean;
  onNavigateToTrain?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onBeginSession, sessionStarted, onNavigateToTrain }) => {
  const [btnState, setBtnState] = useState<'idle' | 'initializing' | 'active'>('idle');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [plateCalcOpen, setPlateCalcOpen] = useState(false);
  const [readinessModalOpen, setReadinessModalOpen] = useState(false);
  const [selectedQueueIndex, setSelectedQueueIndex] = useState<number | null>(null);

  const handleBeginClick = () => {
    if (btnState === 'idle') {
      setBtnState('initializing');
      setTimeout(() => {
        setBtnState('active');
        onBeginSession();
      }, 400);
    } else {
      onBeginSession();
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const queueMovements = [
    {
      id: '02',
      name: 'Strict Overhead Press',
      detail: '5 × 5 @ 77.5 KG',
      tag: 'DELOAD',
      rpe: 'RPE 8.0',
      note: 'Focus on vertical bar path and deliberate glute squeeze at lockout.',
    },
    {
      id: '03',
      name: 'Pendlay Barbell Row',
      detail: '3 × 8 @ 105.0 KG',
      tag: 'RPE 8.0',
      rpe: 'RPE 8.0',
      note: 'Reset completely on platform between reps. Dynamic lats tension.',
    },
    {
      id: '04',
      name: 'Close-Grip Triceps Press',
      detail: '3 × 10 @ 90.0 KG',
      tag: 'HYPERTROPHY',
      rpe: 'RPE 7.5',
      note: 'Elbow tuck angle ~30 degrees. 2-second eccentric cadence.',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col w-full pb-8 space-y-6"
    >
      {/* Responsive 2-Column Bento Grid for Tablet & Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column on Desktop: Session Details, Metrics, and Primary Compound */}
        <div className="lg:col-span-7 flex flex-col space-y-5">
          {/* Session Header */}
          <section className="flex flex-col space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="font-['Cinzel'] text-[10px] tracking-[0.2em] uppercase text-[#a08d84] font-semibold">
                SCHEDULED CADENCE • BLOCK III
              </span>
              <span className="font-['JetBrains_Mono'] text-[12px] text-[#c8c5ca] tabular-nums">
                PHASE 02 // DAY 19
              </span>
            </div>
            <h1 className="font-['EB_Garamond'] text-[32px] sm:text-[38px] text-[#e5e2e3] leading-tight tracking-normal font-normal">
              Deadlift & Overhead Press
            </h1>
            <div className="flex items-center gap-2 text-[#d8c2b8]/80 font-['Inter'] text-[13px] flex-wrap">
              <span>Target strain: RPE 8.5</span>
              <span className="w-1 h-1 rounded-full bg-[#353436]"></span>
              <span>5 working movements</span>
              <span className="w-1 h-1 rounded-full bg-[#353436]"></span>
              <span className="font-['JetBrains_Mono'] text-[12px] text-[#c8c5ca]">~68 MIN</span>
            </div>
          </section>

          {/* Horological Metric Tiles with Interactive Details */}
          <section className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#1c1b1c] rounded-xl p-3 sm:p-4 flex flex-col justify-between shadow-sm border border-[#26262c] cursor-pointer group"
              title="Click to view weekly volume progression"
            >
              <span className="font-['Inter'] text-[9px] uppercase tracking-[0.14em] text-[#c8c5ca] truncate font-semibold group-hover:text-[#e5e2e3] transition-colors">
                WEEKLY LOAD
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-['JetBrains_Mono'] text-[17px] sm:text-[22px] font-bold text-[#e5e2e3] tabular-nums">
                  42,850
                </span>
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#c8c5ca]">KG</span>
              </div>
              <div className="mt-2 w-full h-[3px] bg-[#201f20] rounded-full overflow-hidden">
                <div className="h-full bg-[#ffb68e]/80 w-[78%] transition-all duration-700"></div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setReadinessModalOpen(true)}
              className="bg-[#1c1b1c] rounded-xl p-3 sm:p-4 flex flex-col justify-between shadow-sm border border-[#26262c] cursor-pointer group"
              title="Click to inspect CNS & HRV Readiness breakdown"
            >
              <div className="flex items-center justify-between">
                <span className="font-['Inter'] text-[9px] uppercase tracking-[0.14em] text-[#c8c5ca] truncate font-semibold group-hover:text-[#ffb68e] transition-colors">
                  READINESS
                </span>
                <span className="material-symbols-outlined text-[13px] text-[#975a36] opacity-0 group-hover:opacity-100 transition-opacity">
                  insights
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-['JetBrains_Mono'] text-[17px] sm:text-[22px] font-bold text-[#e5e2e3] tabular-nums">
                  94
                </span>
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#c8c5ca]">%</span>
              </div>
              <div className="mt-2 w-full h-[3px] bg-[#201f20] rounded-full overflow-hidden">
                <div className="h-full bg-[#7EA583] w-[94%] transition-all duration-700"></div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#1c1b1c] rounded-xl p-3 sm:p-4 flex flex-col justify-between shadow-sm border border-[#26262c] cursor-pointer group"
              title="Rest Debt: Zero accumulated recovery lag"
            >
              <span className="font-['Inter'] text-[9px] uppercase tracking-[0.14em] text-[#c8c5ca] truncate font-semibold group-hover:text-[#e5e2e3] transition-colors">
                REST DEBT
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-['JetBrains_Mono'] text-[17px] sm:text-[22px] font-bold text-[#e5e2e3] tabular-nums">
                  0.0
                </span>
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#c8c5ca]">H</span>
              </div>
              <div className="mt-2 w-full h-[3px] bg-[#201f20] rounded-full overflow-hidden">
                <div className="h-full bg-[#975a36] w-[12%] transition-all duration-700"></div>
              </div>
            </motion.div>
          </section>

          {/* Training Prescription Card */}
          <section className="bg-[#1c1b1c] rounded-2xl p-4 sm:p-5 shadow-md flex flex-col space-y-4 border border-[#26262c]">
            {/* Header of Card */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#975a36]"></span>
                <span className="font-['Cinzel'] text-[10px] tracking-[0.2em] uppercase text-[#d8c2b8] font-semibold">
                  PRIMARY COMPOUND
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Plate Math Button */}
                <button
                  onClick={() => setPlateCalcOpen(true)}
                  type="button"
                  className="flex items-center gap-1 font-['Inter'] text-[10px] font-semibold uppercase text-[#ffb68e] bg-[#2a2a2b] hover:bg-[#353436] px-2 py-1 rounded transition-colors"
                  title="Open Barbell Plate Loading Calculator"
                >
                  <span className="material-symbols-outlined text-[13px]">calculate</span>
                  <span>PLATE MATH</span>
                </button>
                <span className="font-['Inter'] text-[10px] font-semibold uppercase text-[#c8c5ca] bg-[#201f20] px-2 py-1 rounded tracking-wider">
                  PLATE 1 OF 5
                </span>
              </div>
            </div>

            {/* Movement Focus */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-baseline justify-between">
                <h2 className="font-['EB_Garamond'] text-[24px] sm:text-[26px] text-[#e5e2e3] font-medium tracking-tight">
                  Conventional Deadlift
                </h2>
                <span className="font-['JetBrains_Mono'] text-[12px] text-[#c8c5ca] tracking-wider uppercase">
                  INDEX 01
                </span>
              </div>

              <div className="bg-[#0e0e0f] rounded-xl p-3.5 flex items-center justify-between border border-[#201f20]">
                <div className="flex flex-col">
                  <span className="font-['JetBrains_Mono'] text-[20px] sm:text-[22px] text-[#e5e2e3] tracking-tight font-bold">
                    4 × 3 <span className="text-[#c8c5ca]/70 font-normal">@</span> 210.0{' '}
                    <span className="text-[12px] text-[#c8c5ca] font-normal">KG</span>
                  </span>
                  <span className="font-['Inter'] text-[10px] text-[#c8c5ca] tracking-widest mt-0.5 uppercase font-semibold">
                    TARGET LOAD • WARMED TO SPEC
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-['JetBrains_Mono'] text-[15px] font-bold text-[#e5e2e3] tabular-nums">
                    RPE 8.5
                  </span>
                  <div className="text-[10px] font-['Inter'] text-[#c8c5ca] uppercase tracking-wider font-semibold">
                    3M REST
                  </div>
                </div>
              </div>
            </div>

            {/* Set Progress Indicators */}
            <div className="flex items-center justify-between px-1">
              <span className="font-['Inter'] text-[9px] uppercase tracking-[0.16em] text-[#c8c5ca] font-semibold">
                PRESCRIBED SETS
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#975a36] flex items-center justify-center text-[9px] text-[#ffe5d8] font-['JetBrains_Mono'] font-bold">
                    1
                  </span>
                  <span className="w-4 h-4 rounded-full bg-[#201f20] flex items-center justify-center text-[9px] text-[#c8c5ca] font-['JetBrains_Mono']">
                    2
                  </span>
                  <span className="w-4 h-4 rounded-full bg-[#201f20] flex items-center justify-center text-[9px] text-[#c8c5ca] font-['JetBrains_Mono']">
                    3
                  </span>
                  <span className="w-4 h-4 rounded-full bg-[#201f20] flex items-center justify-center text-[9px] text-[#c8c5ca] font-['JetBrains_Mono']">
                    4
                  </span>
                </div>
                <span className="text-[#c8c5ca]/40 text-xs">/</span>
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#c8c5ca] tabular-nums">
                  12 REPS TOTAL
                </span>
              </div>
            </div>

            {/* Upcoming Movements Queue with Interactive Expansion */}
            <div className="bg-[#0e0e0f]/50 rounded-xl p-3.5 space-y-2.5 border border-[#201f20]">
              <div className="flex items-center justify-between text-[#c8c5ca]">
                <span className="font-['Inter'] text-[9px] uppercase tracking-[0.18em] text-[#d8c2b8] font-semibold">
                  SECONDARY ROTATION QUEUE
                </span>
                <span className="font-['Inter'] text-[9px] text-[#c8c5ca] uppercase">
                  TAP TO INSPECT
                </span>
              </div>

              {queueMovements.map((mov, idx) => {
                const isExpanded = selectedQueueIndex === idx;
                return (
                  <motion.div
                    key={mov.id}
                    onClick={() => setSelectedQueueIndex(isExpanded ? null : idx)}
                    className="flex flex-col p-2 rounded-lg hover:bg-[#1c1b1c] transition-colors cursor-pointer border border-transparent hover:border-[#26262c]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-['JetBrains_Mono'] text-[12px] text-[#c8c5ca] tabular-nums font-bold">
                          {mov.id}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-['Inter'] text-[13px] text-[#e5e2e3] truncate font-medium">
                            {mov.name}
                          </span>
                          <span className="font-['JetBrains_Mono'] text-[11px] text-[#c8c5ca]">
                            {mov.detail}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-['Inter'] text-[9px] font-semibold text-[#c8c5ca] px-1.5 py-0.5 rounded bg-[#201f20] tracking-wider">
                          {mov.tag}
                        </span>
                        <span className="material-symbols-outlined text-[16px] text-[#c8c5ca] transition-transform">
                          {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Movement Note */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-2 mt-1 border-t border-[#26262c] text-[12px] text-[#d8c2b8] font-['Inter'] pl-6"
                        >
                          <p className="italic">{mov.note}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Primary Begin Session Action Deck */}
          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={handleBeginClick}
              className={`w-full h-13 rounded-2xl font-['Inter'] text-[14px] tracking-[0.1em] uppercase flex items-center justify-center gap-2 shadow-[0_12px_28px_rgba(0,0,0,0.85)] transition-all cursor-pointer select-none font-semibold ${
                btnState === 'active'
                  ? 'bg-[#353436] text-[#e5e2e3]'
                  : 'bg-[#975A36] hover:bg-[#B97140] text-[#ffe5d8]'
              }`}
              id="begin-session-btn"
              type="button"
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {btnState === 'active' ? 'timer' : 'play_arrow'}
              </span>
              <span>
                {btnState === 'initializing'
                  ? 'INITIALIZING CHRONOMETER...'
                  : btnState === 'active'
                  ? 'SESSION IN PROGRESS'
                  : 'BEGIN SESSION'}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Right Column on Desktop: Interactive Carousel Gallery & Doctrine */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          {/* Interactive Chamber Apparatus Carousel Gallery */}
          <ApparatusCarousel onSelectImage={openLightbox} />

          {/* Quick Tools Deck */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPlateCalcOpen(true)}
              type="button"
              className="p-3.5 rounded-xl bg-[#1c1b1c] hover:bg-[#222122] text-left border border-[#26262c] shadow-sm flex items-center gap-3 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-[#2a2a2b] flex items-center justify-center text-[#ffb68e]">
                <span className="material-symbols-outlined text-[20px]">fitness_center</span>
              </div>
              <div className="flex flex-col">
                <span className="font-['Inter'] text-[12px] font-semibold text-[#e5e2e3]">
                  Plate Math
                </span>
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#c8c5ca]">
                  IPF DISC CALIBRATOR
                </span>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openLightbox(0)}
              type="button"
              className="p-3.5 rounded-xl bg-[#1c1b1c] hover:bg-[#222122] text-left border border-[#26262c] shadow-sm flex items-center gap-3 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-[#2a2a2b] flex items-center justify-center text-[#d8c2b8]">
                <span className="material-symbols-outlined text-[20px]">photo_library</span>
              </div>
              <div className="flex flex-col">
                <span className="font-['Inter'] text-[12px] font-semibold text-[#e5e2e3]">
                  Zoom Archive
                </span>
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#c8c5ca]">
                  5 SPECIMENS
                </span>
              </div>
            </motion.button>
          </div>

          {/* Discipline Doctrine Card */}
          <section className="bg-[#1c1b1c] rounded-2xl p-5 shadow-sm flex flex-col space-y-2.5 border border-[#26262c]">
            <div className="flex items-center gap-2 text-[#c8c5ca]">
              <span className="material-symbols-outlined text-[16px] text-[#975a36]">
                history_edu
              </span>
              <span className="font-['Cinzel'] text-[10px] tracking-[0.2em] uppercase text-[#d8c2b8] font-semibold">
                THE DISCIPLINE
              </span>
            </div>
            <p className="font-['EB_Garamond'] text-[20px] italic text-[#e5e2e3] leading-snug font-normal">
              “Train what comes next.”
            </p>
            <p className="font-['Inter'] text-[13px] text-[#c8c5ca] leading-relaxed">
              Rest is not earned by exhaustion; it is built into the architecture. The barbell never lies,
              and the chronometer measures without remorse.
            </p>
            <div className="pt-2 flex items-center justify-between text-[#c8c5ca] border-t border-[#26262c]/70 text-[11px] font-['JetBrains_Mono']">
              <span>IPF SANCTION CODE</span>
              <span className="text-[#e5e2e3]">VK-8804-X</span>
            </div>
          </section>
        </div>
      </div>

      {/* Lightbox Modal for Full Zoom on Apparatus Images */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        images={APPARATUS_GALLERY}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(idx) => setLightboxIndex(idx)}
      />

      {/* Plate Loading Calculator Modal */}
      <PlateCalculatorModal
        isOpen={plateCalcOpen}
        initialWeight={210.0}
        onClose={() => setPlateCalcOpen(false)}
      />

      {/* Readiness Telemetry Detail Modal */}
      {readinessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-[#1c1b1c] rounded-2xl p-5 border border-[#26262c] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#26262c] pb-3">
              <div className="flex flex-col">
                <span className="font-['Cinzel'] text-[10px] tracking-[0.2em] text-[#d8c2b8] uppercase font-semibold">
                  AUTONOMIC TELEMETRY
                </span>
                <h3 className="font-['EB_Garamond'] text-[22px] text-[#e5e2e3]">
                  Readiness Score: 94%
                </h3>
              </div>
              <button
                onClick={() => setReadinessModalOpen(false)}
                type="button"
                className="w-8 h-8 rounded-lg bg-[#201f20] hover:bg-[#353436] flex items-center justify-center text-[#d8c2b8]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0e0e0f] border border-[#201f20]">
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-[#e5e2e3]">HRV Score (rMSSD)</span>
                  <span className="text-[10px] text-[#c8c5ca]">Parasympathetic baseline</span>
                </div>
                <span className="font-mono text-[14px] font-bold text-[#7EA583]">78 ms (+8%)</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0e0e0f] border border-[#201f20]">
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-[#e5e2e3]">Rest Duration</span>
                  <span className="text-[10px] text-[#c8c5ca]">Deep restorative sleep</span>
                </div>
                <span className="font-mono text-[14px] font-bold text-[#e5e2e3]">8h 14m</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0e0e0f] border border-[#201f20]">
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-[#e5e2e3]">Central Nervous State</span>
                  <span className="text-[10px] text-[#c8c5ca]">Tap test motor velocity</span>
                </div>
                <span className="font-mono text-[14px] font-bold text-[#7EA583]">OPTIMAL</span>
              </div>
            </div>

            <button
              onClick={() => setReadinessModalOpen(false)}
              className="w-full h-11 rounded-xl bg-[#2a2a2b] hover:bg-[#353436] text-[#e5e2e3] font-['Inter'] text-[13px] font-semibold tracking-wide"
            >
              Acknowledge
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
