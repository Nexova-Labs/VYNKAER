import React, { useState } from 'react';
import { motion } from 'motion/react';

interface PlateCalculatorModalProps {
  isOpen: boolean;
  initialWeight?: number;
  onClose: () => void;
  onApplyWeight?: (weight: number) => void;
}

interface PlateSpec {
  weight: number;
  color: string;
  borderColor: string;
  textColor: string;
  width: string;
  height: string;
}

const AVAILABLE_PLATES: PlateSpec[] = [
  { weight: 25, color: '#991B1B', borderColor: '#DC2626', textColor: '#FEE2E2', width: 'w-4', height: 'h-24' },
  { weight: 20, color: '#1E40AF', borderColor: '#3B82F6', textColor: '#DBEAFE', width: 'w-4', height: 'h-22' },
  { weight: 15, color: '#B45309', borderColor: '#F59E0B', textColor: '#FEF3C7', width: 'w-3.5', height: 'h-20' },
  { weight: 10, color: '#166534', borderColor: '#22C55E', textColor: '#DCFCE7', width: 'w-3', height: 'h-18' },
  { weight: 5, color: '#E2E8F0', borderColor: '#FFFFFF', textColor: '#0F172A', width: 'w-2.5', height: 'h-14' },
  { weight: 2.5, color: '#27272A', borderColor: '#71717A', textColor: '#FAFAFA', width: 'w-2', height: 'h-12' },
  { weight: 1.25, color: '#52525B', borderColor: '#A1A1AA', textColor: '#FAFAFA', width: 'w-2', height: 'h-10' },
  { weight: 0.5, color: '#3F3F46', borderColor: '#71717A', textColor: '#FAFAFA', width: 'w-1.5', height: 'h-8' },
];

export const PlateCalculatorModal: React.FC<PlateCalculatorModalProps> = ({
  isOpen,
  initialWeight = 185.0,
  onClose,
  onApplyWeight,
}) => {
  const [targetWeight, setTargetWeight] = useState(initialWeight);
  const [barWeight, setBarWeight] = useState(20.0);
  const [includeCollars, setIncludeCollars] = useState(true);

  if (!isOpen) return null;

  const collarWeight = includeCollars ? 5.0 : 0.0; // 2.5kg per collar × 2
  const weightToPlate = Math.max(0, targetWeight - barWeight - collarWeight);
  const oneSideWeight = weightToPlate / 2;

  // Calculate plate distribution for one side
  const calculatedPlates: { spec: PlateSpec; count: number }[] = [];
  let remaining = oneSideWeight;

  AVAILABLE_PLATES.forEach((plate) => {
    if (remaining >= plate.weight) {
      const count = Math.floor(remaining / plate.weight);
      calculatedPlates.push({ spec: plate, count });
      remaining = Math.round((remaining - count * plate.weight) * 100) / 100;
    }
  });

  const handleAdjust = (delta: number) => {
    setTargetWeight((prev) => Math.max(barWeight + collarWeight, Math.round((prev + delta) * 10) / 10));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#181819] rounded-2xl p-5 border border-[#26262c] shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#26262c] pb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#975a36]"></span>
              <span className="font-['Cinzel'] text-[10px] tracking-[0.2em] text-[#d8c2b8] uppercase font-semibold">
                APPARATUS CALIBRATOR
              </span>
            </div>
            <h3 className="font-['EB_Garamond'] text-[22px] text-[#e5e2e3] font-medium leading-snug">
              IPF Calibrated Plate Loading
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-lg bg-[#201f20] hover:bg-[#353436] flex items-center justify-center text-[#d8c2b8] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Target Weight Readout & Adjusters */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#0e0e0f] border border-[#201f20]">
          <span className="font-['Inter'] text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c8c5ca]">
            TARGET LOAD (PER BARBELL)
          </span>
          <div className="flex items-baseline gap-2 my-1">
            <span className="font-['JetBrains_Mono'] text-[38px] font-bold text-[#e5e2e3] tracking-tighter">
              {targetWeight.toFixed(1)}
            </span>
            <span className="font-['JetBrains_Mono'] text-[16px] text-[#ffb68e] font-bold">KG</span>
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
            <button
              onClick={() => handleAdjust(-10)}
              className="px-2.5 py-1 rounded-md bg-[#201f20] hover:bg-[#353436] text-[#d8c2b8] font-mono text-[12px] font-semibold"
            >
              -10
            </button>
            <button
              onClick={() => handleAdjust(-2.5)}
              className="px-2.5 py-1 rounded-md bg-[#201f20] hover:bg-[#353436] text-[#d8c2b8] font-mono text-[12px] font-semibold"
            >
              -2.5
            </button>
            <button
              onClick={() => handleAdjust(-0.5)}
              className="px-2.5 py-1 rounded-md bg-[#201f20] hover:bg-[#353436] text-[#d8c2b8] font-mono text-[12px] font-semibold"
            >
              -0.5
            </button>
            <button
              onClick={() => handleAdjust(0.5)}
              className="px-2.5 py-1 rounded-md bg-[#201f20] hover:bg-[#353436] text-[#d8c2b8] font-mono text-[12px] font-semibold"
            >
              +0.5
            </button>
            <button
              onClick={() => handleAdjust(2.5)}
              className="px-2.5 py-1 rounded-md bg-[#201f20] hover:bg-[#353436] text-[#d8c2b8] font-mono text-[12px] font-semibold"
            >
              +2.5
            </button>
            <button
              onClick={() => handleAdjust(10)}
              className="px-2.5 py-1 rounded-md bg-[#201f20] hover:bg-[#353436] text-[#d8c2b8] font-mono text-[12px] font-semibold"
            >
              +10
            </button>
          </div>
        </div>

        {/* Barbell Sleeve Visual Simulation */}
        <div className="flex flex-col p-4 rounded-xl bg-[#0e0e0f] border border-[#201f20] space-y-2">
          <div className="flex items-center justify-between text-[#c8c5ca] text-[11px] font-mono uppercase">
            <span>SLEEVE PROFILE (ONE SIDE)</span>
            <span>{oneSideWeight.toFixed(2)} KG PER SIDE</span>
          </div>

          <div className="relative h-28 w-full bg-[#141415] rounded-lg border border-[#26262c] flex items-center px-4 overflow-x-auto">
            {/* Shaft & Collar Base */}
            <div className="h-6 w-8 bg-[#353436] border-r-2 border-[#47464a] shrink-0 rounded-l flex items-center justify-center text-[8px] font-mono text-zinc-400">
              SHAFT
            </div>
            {/* Sleeve bar */}
            <div className="relative h-4 flex-1 bg-[#2a2a2b] flex items-center">
              {/* Plates Rendered on Sleeve */}
              <div className="flex items-center gap-1 pl-1">
                {calculatedPlates.flatMap(({ spec, count }) =>
                  Array.from({ length: count }).map((_, i) => (
                    <div
                      key={`${spec.weight}-${i}`}
                      style={{
                        backgroundColor: spec.color,
                        borderColor: spec.borderColor,
                      }}
                      className={`${spec.width} ${spec.height} rounded-sm border shadow-md flex items-center justify-center shrink-0`}
                      title={`${spec.weight} KG`}
                    >
                      <span
                        style={{ color: spec.textColor }}
                        className="font-['JetBrains_Mono'] text-[9px] font-black -rotate-90 select-none whitespace-nowrap"
                      >
                        {spec.weight}
                      </span>
                    </div>
                  ))
                )}
                {/* Competition Collar */}
                {includeCollars && (
                  <div
                    className="w-3 h-10 bg-[#52525b] border border-[#71717a] rounded-sm flex items-center justify-center shadow"
                    title="2.5 KG Competition Collar"
                  >
                    <span className="text-[7px] text-white font-mono -rotate-90">COL</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {remaining > 0 && (
            <span className="text-[11px] font-mono text-[#ffb4ab]">
              Note: Unresolved fractional disc: {remaining} KG
            </span>
          )}
        </div>

        {/* Plate Breakdown Summary List */}
        <div className="p-3 bg-[#1c1b1c] rounded-xl border border-[#26262c] space-y-2">
          <span className="font-['Inter'] text-[10px] uppercase font-semibold text-[#d8c2b8] tracking-wider block">
            Load Per Sleeve:
          </span>
          <div className="flex flex-wrap gap-2">
            {calculatedPlates.map(({ spec, count }) => (
              <span
                key={spec.weight}
                className="px-2.5 py-1 rounded-md bg-[#0e0e0f] border border-[#26262c] font-mono text-[12px] text-[#e5e2e3] flex items-center gap-1.5"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: spec.borderColor }}
                ></span>
                <span className="font-bold">{count}×</span> {spec.weight} KG
              </span>
            ))}
            {includeCollars && (
              <span className="px-2.5 py-1 rounded-md bg-[#0e0e0f] border border-[#26262c] font-mono text-[12px] text-[#d8c2b8] flex items-center gap-1">
                <span>1× Collar (2.5 KG)</span>
              </span>
            )}
          </div>
        </div>

        {/* Configuration Toggles */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => setBarWeight((prev) => (prev === 20.0 ? 15.0 : 20.0))}
            type="button"
            className="p-3 rounded-xl bg-[#201f20] hover:bg-[#2a2a2b] text-left border border-[#26262c] transition-colors"
          >
            <span className="text-[9px] uppercase font-mono text-[#c8c5ca] block">BARBELL RATING</span>
            <span className="font-mono text-[13px] font-bold text-[#e5e2e3]">{barWeight.toFixed(1)} KG Men's IPB</span>
          </button>

          <button
            onClick={() => setIncludeCollars((prev) => !prev)}
            type="button"
            className="p-3 rounded-xl bg-[#201f20] hover:bg-[#2a2a2b] text-left border border-[#26262c] transition-colors"
          >
            <span className="text-[9px] uppercase font-mono text-[#c8c5ca] block">COLLARS INCLUDED</span>
            <span className="font-mono text-[13px] font-bold text-[#e5e2e3]">
              {includeCollars ? '2.5 KG IPB Spec' : 'None (Clips)'}
            </span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            type="button"
            className="flex-1 h-11 rounded-xl bg-[#201f20] hover:bg-[#2a2a2b] text-[#d8c2b8] font-['Inter'] text-[13px]"
          >
            Close
          </button>
          {onApplyWeight && (
            <button
              onClick={() => {
                onApplyWeight(targetWeight);
                onClose();
              }}
              type="button"
              className="flex-1 h-11 rounded-xl bg-[#975a36] hover:bg-[#b97140] text-[#ffe5d8] font-['Inter'] text-[13px] font-semibold shadow"
            >
              Apply to Working Set
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
