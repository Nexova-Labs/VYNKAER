import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const CoachScreen: React.FC = () => {
  const [adaptationStatus, setAdaptationStatus] = useState<'idle' | 'applied' | 'retained'>('idle');
  const [simulatedDrop, setSimulatedDrop] = useState<number>(14); // 14% drop default

  const handleApply = () => {
    setAdaptationStatus('applied');
  };

  const handleRetain = () => {
    setAdaptationStatus('retained');
  };

  const isSevere = simulatedDrop >= 20;
  const isModerate = simulatedDrop >= 10 && simulatedDrop < 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col w-full pb-8 space-y-5"
    >
      {/* Top Header */}
      <section className="flex flex-col gap-1 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#975a36] animate-pulse"></span>
            <span className="font-['Cinzel'] text-[10px] tracking-[0.24em] text-[#d8c2b8] uppercase font-semibold">
              AUTOREGULATION ENGINE
            </span>
          </div>
          <span className="font-['JetBrains_Mono'] text-[11px] text-[#c8c5ca]">
            ALGORITHM V4.2
          </span>
        </div>
        <h1 className="font-['EB_Garamond'] text-[32px] sm:text-[36px] text-[#e5e2e3] font-normal tracking-tight leading-tight">
          Microcycle Adjustments
        </h1>
        <div className="flex items-center gap-2 mt-0.5 text-[#c8c5ca]">
          <span className="material-symbols-outlined text-[14px] text-[#975a36]">tune</span>
          <span className="font-['JetBrains_Mono'] text-[12px] tracking-wide uppercase">
            Analyzed 12 sessions across Block III
          </span>
        </div>
      </section>

      {/* Responsive 2-Column Grid on Tablet & Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column on Desktop: Diagnostic Synthesis & Kinematic Simulator */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          {/* Diagnostic Synthesis Card */}
          <article className="bg-[#1c1b1c] rounded-2xl p-5 shadow-2xl relative overflow-hidden border border-[#26262c]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#26262c]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#ffb68e]">memory</span>
                <span className="font-['Inter'] text-[10px] font-semibold uppercase tracking-wider text-[#d8c2b8]">
                  Diagnostic Synthesis
                </span>
              </div>
              <span className="font-['JetBrains_Mono'] text-[12px] text-[#c8c5ca]">
                TODAY • 06:15 UTC
              </span>
            </div>

            <blockquote className="font-['EB_Garamond'] text-[19px] leading-[28px] text-[#e5e2e3] italic mb-5 pl-3 border-l-2 border-[#975a36]">
              “Overhead press bar speed deteriorated by {simulatedDrop}% on set 4 while squat recovery index remained
              optimal (+6%). Recommended protocol: Deload overhead pressing volume by 1 working set and
              shift accessory emphasis to triceps lockout stability.”
            </blockquote>

            <div className="flex flex-col gap-2.5 pt-1">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0e0e0f] border border-[#201f20]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#975a36]">speed</span>
                  <span className="font-['Inter'] text-[13px] text-[#d8c2b8]">
                    Observed Velocity Drop
                  </span>
                </div>
                <span className="font-['JetBrains_Mono'] text-[13px] text-[#e5e2e3] font-bold tracking-tight">
                  {(0.22 - (simulatedDrop * 0.005)).toFixed(2)} m/s ({simulatedDrop}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0e0e0f] border border-[#201f20]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#975a36]">
                    stacked_line_chart
                  </span>
                  <span className="font-['Inter'] text-[13px] text-[#d8c2b8]">RPE Drift</span>
                </div>
                <span className="font-['JetBrains_Mono'] text-[13px] text-[#e5e2e3] font-bold tracking-tight">
                  8.0 → {isSevere ? '10.0 MAX' : isModerate ? '9.5' : '8.5'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0e0e0f] border border-[#201f20]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#7EA583]">
                    battery_horiz_075
                  </span>
                  <span className="font-['Inter'] text-[13px] text-[#d8c2b8]">Systemic Fatigue</span>
                </div>
                <span className="font-['JetBrains_Mono'] text-[13px] text-[#7EA583] font-bold tracking-tight">
                  {isSevere ? 'ELEVATED' : 'OPTIMAL (Rest debt 0.0h)'}
                </span>
              </div>
            </div>
          </article>

          {/* Interactive Velocity Simulator Tool */}
          <div className="p-4 rounded-2xl bg-[#1c1b1c] border border-[#26262c] shadow-lg flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-['Cinzel'] text-[10px] tracking-[0.2em] uppercase text-[#d8c2b8] font-semibold">
                KINEMATIC SENSITIVITY TESTER
              </span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#ffb68e] font-bold">
                {simulatedDrop}% DROP
              </span>
            </div>

            <p className="font-['Inter'] text-[12px] text-[#c8c5ca]">
              Slide to test how the algorithm calculates fatigue compensation deltas based on concentric velocity degradation:
            </p>

            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={simulatedDrop}
              onChange={(e) => setSimulatedDrop(Number(e.target.value))}
              className="w-full accent-[#975a36] cursor-pointer"
            />

            <div className="flex items-center justify-between text-[11px] font-mono text-[#c8c5ca]">
              <span>5% (Negligible)</span>
              <span>15% (Threshold)</span>
              <span>30% (Severe)</span>
            </div>
          </div>
        </div>

        {/* Right Column on Desktop: Systematic Delta Proposal & Decision Deck */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          {/* Systematic Delta Proposal */}
          <section className="bg-[#1c1b1c] rounded-2xl p-5 border border-[#26262c] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#26262c]">
              <span className="font-['Inter'] text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d8c2b8]">
                Systematic Delta Proposal
              </span>
              <span className="font-['Inter'] text-[9px] font-semibold uppercase px-2 py-0.5 rounded bg-[#2a2a2b] text-[#ffb68e] tracking-wider">
                Active Block III
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {/* Proposal Item 1 */}
              <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-[#0e0e0f] border border-[#201f20]">
                <div className="flex items-center justify-between">
                  <span className="font-['Inter'] text-[14px] font-medium text-[#e5e2e3]">
                    Strict Press (Volume)
                  </span>
                  <span className="font-['Inter'] text-[10px] font-semibold uppercase text-[#c8c5ca] tracking-wider">
                    Primary Compound
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#201f20]">
                  <div className="flex flex-col">
                    <span className="font-['Inter'] text-[9px] text-[#c8c5ca] uppercase tracking-widest mb-1 font-semibold">
                      Current
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[13px] text-[#c8c5ca]/70 line-through">
                      5 × 5 @ 77.5 KG
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-['Inter'] text-[9px] text-[#ffb68e] uppercase tracking-widest mb-1 font-semibold">
                      Proposed
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[13px] text-[#e5e2e3] font-bold">
                      {isSevere ? '3 × 5 @ 72.5 KG' : '4 × 5 @ 75.0 KG'}
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[10px] text-[#c8c5ca] mt-0.5">
                      {isSevere ? '(-2 sets, -5.0 kg)' : '(-1 set, -2.5 kg)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Proposal Item 2 */}
              <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-[#0e0e0f] border border-[#201f20]">
                <div className="flex items-center justify-between">
                  <span className="font-['Inter'] text-[14px] font-medium text-[#e5e2e3]">
                    Accessory Swap
                  </span>
                  <span className="font-['Inter'] text-[10px] font-semibold uppercase text-[#c8c5ca] tracking-wider">
                    Kinematic Shift
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#201f20]">
                  <div className="flex flex-col">
                    <span className="font-['Inter'] text-[9px] text-[#c8c5ca] uppercase tracking-widest mb-1 font-semibold">
                      Current
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[13px] text-[#c8c5ca]/70 line-through">
                      Lateral Raise 3 × 12
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-['Inter'] text-[9px] text-[#ffb68e] uppercase tracking-widest mb-1 font-semibold">
                      Proposed
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[13px] text-[#e5e2e3] font-bold">
                      Pin Press 3 × 6
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[10px] text-[#c8c5ca] mt-0.5">
                      @ 65.0 KG (Lockout)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={handleApply}
                disabled={adaptationStatus !== 'idle'}
                type="button"
                className={`w-full h-12 rounded-xl font-['Inter'] text-[14px] font-semibold tracking-wide flex items-center justify-center gap-2 shadow-[0_12px_28px_rgba(0,0,0,0.85)] transition-all cursor-pointer ${
                  adaptationStatus === 'applied'
                    ? 'bg-[#182420] text-[#7EA583] border border-[#24362E]'
                    : 'bg-[#975a36] hover:bg-[#B97140] text-[#ffe5d8]'
                }`}
                id="apply-adaptation-btn"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {adaptationStatus === 'applied' ? 'task_alt' : 'verified'}
                </span>
                <span>
                  {adaptationStatus === 'applied'
                    ? 'Adaptation Committed to Block III'
                    : 'Apply Adaptation to Next Microcycle'}
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={handleRetain}
                disabled={adaptationStatus !== 'idle'}
                type="button"
                className={`w-full h-12 rounded-xl bg-[#201f20] hover:bg-[#2a2a2b] text-[#d8c2b8] active:text-[#e5e2e3] font-['Inter'] text-[14px] flex items-center justify-center gap-2 border border-[#26262c] transition-colors cursor-pointer ${
                  adaptationStatus === 'retained' ? 'opacity-60 text-[#c8c5ca]' : ''
                }`}
                id="retain-btn"
              >
                <span className="material-symbols-outlined text-[18px]">history</span>
                <span>
                  {adaptationStatus === 'retained'
                    ? 'Prescription Retained'
                    : 'Retain Current Prescription'}
                </span>
              </motion.button>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};
