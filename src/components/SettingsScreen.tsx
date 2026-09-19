import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlateCalculatorModal } from './PlateCalculatorModal';

export const SettingsScreen: React.FC = () => {
  const [strictAutoregulation, setStrictAutoregulation] = useState(true);
  const [rpePrecision, setRpePrecision] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [purgeModalOpen, setPurgeModalOpen] = useState(false);
  const [plateCalcOpen, setPlateCalcOpen] = useState(false);
  const [purged, setPurged] = useState(false);
  const [weightUnit, setWeightUnit] = useState<'KG' | 'LBS'>('KG');

  // Web Audio Tone Generator for Testing Acoustic Chime
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const testAcousticChime = () => {
    setIsPlayingAudio(true);
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);

      setTimeout(() => setIsPlayingAudio(false), 600);
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const handleExport = () => {
    const data = {
      athlete: 'K. Vynkær',
      sanctionedId: 'VK-8804-X',
      division: '93 KG OPEN DIVISION',
      massTodayKg: 92.4,
      regime: 'ACCUMULATION III',
      exportTimestamp: new Date().toISOString(),
      apparatus: {
        barbell: 'Eleiko 20.0 KG IPB',
        minIncrementKg: 0.5,
        restChronometerSec: 180,
      },
      telemetrySessionsCount: 318,
      status: 'VERIFIED_CALIBRATED',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vynkaer-telemetry-ledger.json';
    a.click();
    URL.revokeObjectURL(url);

    setExportNotice('Ledger downloaded (2.8 MB simulated)');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handlePurgeConfirm = () => {
    setPurged(true);
    setPurgeModalOpen(false);
    setTimeout(() => setPurged(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col w-full pb-10 space-y-6"
    >
      {/* Responsive 2-Column Grid on Tablet & Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Athlete Profile & Apparatus Settings */}
        <div className="lg:col-span-6 flex flex-col space-y-5">
          {/* Athlete Profile Card */}
          <section className="relative bg-[#1c1b1c] rounded-2xl p-5 shadow-2xl overflow-hidden border border-[#26262c]">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full bg-[#2a2a2b] flex items-center justify-center shrink-0 border border-[#353436]">
                <span className="font-['Cinzel'] text-[#c8c5ca] text-[20px] tracking-widest font-semibold">
                  KV
                </span>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#1c1b1c] flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-[#ffb68e]"></span>
                </span>
              </div>

              <div className="flex flex-col min-w-0">
                <span className="font-['Inter'] text-[10px] text-[#d8c2b8]/80 uppercase tracking-[0.24em] font-semibold">
                  CLASS I • 93 KG OPEN DIVISION
                </span>
                <h1 className="font-['EB_Garamond'] text-[24px] leading-tight text-[#e5e2e3] font-normal tracking-wide truncate mt-0.5">
                  K. Vynkær
                </h1>
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#c8c5ca] tracking-wider mt-1">
                  SANCTIONED ID: <span className="text-[#e5e2e3]/90 font-bold">VK-8804-X</span>
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 grid grid-cols-2 gap-3 bg-[#0e0e0f] -mx-5 -mb-5 px-5 py-4 border-t border-[#201f20]">
              <div className="flex flex-col">
                <span className="font-['Inter'] text-[9px] uppercase tracking-[0.2em] text-[#d8c2b8] font-semibold">
                  Mass Today
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-['JetBrains_Mono'] text-[18px] text-[#e5e2e3] font-bold">
                    92.4
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[11px] text-[#c8c5ca]">{weightUnit}</span>
                </div>
              </div>

              <div className="flex flex-col border-l border-[#353436] pl-3">
                <span className="font-['Inter'] text-[9px] uppercase tracking-[0.2em] text-[#d8c2b8] font-semibold">
                  Regime Block
                </span>
                <span className="font-['JetBrains_Mono'] text-[12px] leading-tight text-[#e5e2e3] font-medium truncate mt-1">
                  ACCUMULATION III
                </span>
              </div>
            </div>
          </section>

          {/* Apparatus & Calibrated Plates */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="font-['Inter'] text-[11px] uppercase text-[#d8c2b8] tracking-[0.22em] font-semibold">
                Apparatus & Calibrated Plates
              </span>
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#c8c5ca] uppercase">
                SPEC: IPF
              </span>
            </div>

            <div className="bg-[#1c1b1c] rounded-xl overflow-hidden border border-[#26262c]">
              <div
                onClick={() => setPlateCalcOpen(true)}
                className="p-4 flex items-center justify-between hover:bg-[#2a2a2b]/60 transition-colors cursor-pointer group"
              >
                <div className="flex flex-col pr-2">
                  <span className="font-['Inter'] text-[13px] text-[#e5e2e3]">
                    Barbell Calibrated Standard
                  </span>
                  <span className="font-['Inter'] text-[10px] text-[#d8c2b8]/60 tracking-wider mt-0.5 uppercase font-semibold">
                    SHAFT SLEEVE RATING
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-['JetBrains_Mono'] text-[13px] text-[#ffb68e] group-hover:underline">
                    Eleiko 20.0 KG IPB
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-[#d8c2b8]/50">
                    calculate
                  </span>
                </div>
              </div>

              <div className="h-px w-full bg-[#26262c]"></div>

              <div
                onClick={() => setWeightUnit((prev) => (prev === 'KG' ? 'LBS' : 'KG'))}
                className="p-4 flex items-center justify-between hover:bg-[#2a2a2b]/60 transition-colors cursor-pointer group"
              >
                <div className="flex flex-col pr-2">
                  <span className="font-['Inter'] text-[13px] text-[#e5e2e3]">Standard Measurement Unit</span>
                  <span className="font-['Inter'] text-[10px] text-[#d8c2b8]/60 tracking-wider mt-0.5 uppercase font-semibold">
                    MASS CALIBRATION
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-['JetBrains_Mono'] text-[13px] text-[#e5e2e3] font-bold">
                    {weightUnit === 'KG' ? 'KG (Metric IPF)' : 'LBS (Collegiate)'}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-[#d8c2b8]/50">
                    swap_horiz
                  </span>
                </div>
              </div>

              <div className="h-px w-full bg-[#26262c]"></div>

              {/* Acoustic Cue Preview */}
              <div
                onClick={testAcousticChime}
                className="p-4 flex items-center justify-between hover:bg-[#2a2a2b]/60 transition-colors cursor-pointer group"
              >
                <div className="flex flex-col pr-2">
                  <span className="font-['Inter'] text-[13px] text-[#e5e2e3]">
                    Acoustic Cue Signal (Pure Sine Tone)
                  </span>
                  <span className="font-['Inter'] text-[10px] text-[#d8c2b8]/60 tracking-wider mt-0.5 uppercase font-semibold">
                    REST COMPLETION BELL
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-['JetBrains_Mono'] text-[12px] text-[#d8c2b8]">
                    {isPlayingAudio ? 'PLAYING CHIME...' : 'TEST BELL'}
                  </span>
                  <span className={`material-symbols-outlined text-[16px] ${isPlayingAudio ? 'text-[#ffb68e] animate-bounce' : 'text-[#975a36]'}`}>
                    volume_up
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Algorithmic Protocol & Data Ledger */}
        <div className="lg:col-span-6 flex flex-col space-y-5">
          {/* Algorithmic Protocol */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="font-['Inter'] text-[11px] uppercase text-[#d8c2b8] tracking-[0.22em] font-semibold">
                Algorithmic Protocol
              </span>
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#c8c5ca] uppercase">
                VBT KINEMATICS
              </span>
            </div>

            <div className="bg-[#1c1b1c] rounded-xl overflow-hidden border border-[#26262c]">
              <div className="p-4 flex items-center justify-between bg-[#2a2a2b]/30">
                <div className="flex flex-col max-w-[72%]">
                  <div className="flex items-center gap-2">
                    <span className="font-['Inter'] text-[14px] text-[#e5e2e3] font-medium">
                      Strict Autoregulation
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#975a36] animate-pulse"></span>
                  </div>
                  <span className="font-['Inter'] text-[11px] text-[#d8c2b8] mt-1 leading-snug">
                    Modulates working threshold immediately upon bar velocity degradation exceeding
                    10%.
                  </span>
                </div>

                <button
                  onClick={() => setStrictAutoregulation(!strictAutoregulation)}
                  aria-pressed={strictAutoregulation}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                    strictAutoregulation ? 'bg-[#975a36]' : 'bg-[#353436]'
                  }`}
                  id="focal-toggle"
                  type="button"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#e5e2e3] shadow ring-0 transition duration-200 ease-in-out ${
                      strictAutoregulation ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="h-px w-full bg-[#26262c]"></div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex flex-col max-w-[72%]">
                  <span className="font-['Inter'] text-[13px] text-[#e5e2e3]">
                    RPE Precision Decimal
                  </span>
                  <span className="font-['Inter'] text-[11px] text-[#c8c5ca] mt-0.5">
                    Fractional exertion logging (e.g. @7.5 vs discrete @8.0).
                  </span>
                </div>

                <button
                  onClick={() => setRpePrecision(!rpePrecision)}
                  aria-pressed={rpePrecision}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                    rpePrecision ? 'bg-[#47464a]' : 'bg-[#353436]'
                  }`}
                  id="neutral-toggle"
                  type="button"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#c8c5ca] shadow ring-0 transition duration-200 ease-in-out ${
                      rpePrecision ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Data Ledger Actions */}
          <section className="space-y-2.5">
            <span className="font-['Inter'] text-[11px] uppercase text-[#d8c2b8] tracking-[0.22em] font-semibold px-1">
              Data Ledger Actions
            </span>

            <div className="flex flex-col gap-3">
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={handleExport}
                className="w-full h-12 rounded-xl bg-[#201f20] hover:bg-[#2a2a2b] text-[#e5e2e3] font-['Inter'] text-[14px] font-semibold flex items-center justify-center gap-2 border border-[#26262c] shadow transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Export Telemetry Ledger (JSON)</span>
              </motion.button>

              <AnimatePresence>
                {exportNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="p-3 rounded-xl bg-[#182420] text-[#7EA583] text-[12px] font-mono border border-[#24362E] text-center"
                  >
                    {exportNotice}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setPurgeModalOpen(true)}
                className="w-full h-11 rounded-xl bg-transparent hover:bg-[#201f20]/50 text-[#ffb4ab]/80 hover:text-[#ffb4ab] font-['Inter'] text-[12px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                <span>Purge Local Device Cache</span>
              </button>

              {purged && (
                <div className="p-3 rounded-xl bg-[#2a1b1b] text-[#ffb4ab] text-[12px] font-mono border border-[#4a2b2b] text-center">
                  Local cache cleared and telemetry re-indexed.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Plate Loading Calculator Modal */}
      <PlateCalculatorModal
        isOpen={plateCalcOpen}
        initialWeight={210.0}
        onClose={() => setPlateCalcOpen(false)}
      />

      {/* Purge Modal */}
      {purgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-[#1c1b1c] rounded-2xl p-5 border border-[#26262c] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#26262c] pb-3">
              <div className="flex flex-col">
                <span className="font-['Cinzel'] text-[10px] tracking-[0.2em] text-[#ffb4ab] uppercase font-semibold">
                  IRREVERSIBLE ACTION
                </span>
                <h3 className="font-['EB_Garamond'] text-[20px] text-[#e5e2e3]">
                  Purge Local Session Cache?
                </h3>
              </div>
              <button
                onClick={() => setPurgeModalOpen(false)}
                type="button"
                className="w-8 h-8 rounded-lg bg-[#201f20] hover:bg-[#353436] flex items-center justify-center text-[#d8c2b8]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="font-['Inter'] text-[13px] text-[#c8c5ca] leading-relaxed">
              This will reset uncommitted local rest chronometer intervals and draft load calculations.
              Sanctioned athlete telemetry remains archived in the cloud repository.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setPurgeModalOpen(false)}
                type="button"
                className="flex-1 h-10 rounded-xl bg-[#201f20] hover:bg-[#2a2a2b] text-[#d8c2b8] text-[13px]"
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeConfirm}
                type="button"
                className="flex-1 h-10 rounded-xl bg-[#4a2020] hover:bg-[#6b2525] text-[#ffb4ab] text-[13px] font-semibold"
              >
                Confirm Purge
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
