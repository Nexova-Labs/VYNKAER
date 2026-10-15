import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExerciseSet } from '../types';
import { PlateCalculatorModal } from './PlateCalculatorModal';

interface TrainScreenProps {
  onOpenHistory?: () => void;
}

export const TrainScreen: React.FC<TrainScreenProps> = () => {
  // Timer state
  const totalCycle = 180; // 3:00 STD
  const [remainingSeconds, setRemainingSeconds] = useState(99); // 01:39
  const [elapsedSeconds, setElapsedSeconds] = useState(81); // 01:21
  const [timerRunning, setTimerRunning] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Exercise selection state
  const [selectedExercise, setSelectedExercise] = useState('Barbell Back Squat (Low Bar)');
  const [plateCalcOpen, setPlateCalcOpen] = useState(false);
  const [calcLoadTarget, setCalcLoadTarget] = useState(185.0);

  // Sets state
  const [sets, setSets] = useState<ExerciseSet[]>([
    {
      id: 1,
      setNumber: '01',
      tag: 'DONE',
      prevLoad: 180.0,
      prevReps: 3,
      load: 185.0,
      reps: 3,
      completed: true,
      locked: true,
      isCurrent: false,
    },
    {
      id: 2,
      setNumber: '02',
      tag: 'DONE',
      prevLoad: 180.0,
      prevReps: 3,
      load: 185.0,
      reps: 3,
      completed: true,
      locked: true,
      isCurrent: false,
    },
    {
      id: 3,
      setNumber: '03',
      tag: 'NOW',
      prevLoad: 180.0,
      prevReps: 3,
      load: 185.0,
      reps: 3,
      completed: false,
      locked: false,
      isCurrent: true,
    },
    {
      id: 4,
      setNumber: '04',
      tag: 'W',
      prevLoad: 180.0,
      prevReps: 3,
      load: 185.0,
      reps: 3,
      completed: false,
      locked: true,
      isCurrent: false,
    },
  ]);

  const [activeSetIndex, setActiveSetIndex] = useState(2); // set 3
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Web Audio chime for horological acoustic signal
  const audioContextRef = useRef<AudioContext | null>(null);

  const playChime = () => {
    if (!soundEnabled) return;
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
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 pure tone
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Timer interval
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          playChime();
          return 0;
        }
        return prev - 1;
      });
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, soundEnabled]);

  const formatMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSub30 = () => {
    setRemainingSeconds((prev) => Math.max(prev - 30, 0));
  };

  const handleAdd30 = () => {
    setRemainingSeconds((prev) => Math.min(prev + 30, 360));
  };

  const handleResetStd = () => {
    setRemainingSeconds(180);
    setElapsedSeconds(0);
    setTimerRunning(true);
    playChime();
  };

  const handleLoadChange = (id: number, val: string) => {
    const num = parseFloat(val) || 0;
    setSets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, load: num } : s))
    );
  };

  const handleAdjustLoad = (id: number, delta: number) => {
    setSets((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, load: Math.max(20, Math.round((s.load + delta) * 10) / 10) } : s
      )
    );
  };

  const handleAdjustReps = (id: number, delta: number) => {
    setSets((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, reps: Math.max(1, s.reps + delta) } : s
      )
    );
  };

  const handleRepsChange = (id: number, val: string) => {
    const num = parseInt(val, 10) || 0;
    setSets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, reps: num } : s))
    );
  };

  const logCurrentSet = () => {
    playChime();
    const nextIndex = activeSetIndex + 1;
    setSets((prev) =>
      prev.map((s, idx) => {
        if (idx === activeSetIndex) {
          return { ...s, completed: true, locked: true, isCurrent: false, tag: 'DONE' };
        }
        if (idx === nextIndex) {
          return { ...s, isCurrent: true, locked: false, tag: 'NOW' };
        }
        return s;
      })
    );
    if (nextIndex < sets.length) {
      setActiveSetIndex(nextIndex);
    }
    handleResetStd();
  };

  const addWorkingSet = () => {
    const newId = sets.length + 1;
    const numStr = String(newId).padStart(2, '0');
    const lastSet = sets[sets.length - 1];
    setSets((prev) => [
      ...prev,
      {
        id: newId,
        setNumber: numStr,
        tag: 'W',
        prevLoad: lastSet?.prevLoad ?? 180.0,
        prevReps: lastSet?.prevReps ?? 3,
        load: lastSet?.load ?? 185.0,
        reps: lastSet?.reps ?? 3,
        completed: false,
        locked: true,
        isCurrent: false,
      },
    ]);
  };

  // Horological Gauge calculations
  const circumference = 439.8; // 2 * pi * 70
  const fraction = Math.max(0, Math.min(1, remainingSeconds / totalCycle));
  const strokeDashoffset = circumference * (1 - fraction);

  const currentSetDisplay = activeSetIndex < sets.length ? sets[activeSetIndex].id : sets.length;
  const currentSetObj = sets[activeSetIndex] || sets[sets.length - 1];

  const handleOpenPlateCalc = (load: number) => {
    setCalcLoadTarget(load);
    setPlateCalcOpen(true);
  };

  const handleApplyPlateWeight = (newWeight: number) => {
    if (activeSetIndex < sets.length) {
      setSets((prev) =>
        prev.map((s, idx) => (idx === activeSetIndex ? { ...s, load: newWeight } : s))
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col w-full pb-8 space-y-5"
    >
      {/* Top Exercise Metadata Header with Exercise Switcher */}
      <section className="flex flex-col gap-2 pt-1 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-['Inter'] text-[11px] font-semibold uppercase text-[#d8c2b8] tracking-[0.2em]">
              EXERCISE 1 OF 5 • HEAVY COMPOUND
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#201f20] text-[#d8c2b8] border border-[#26262c]">
            <span className="w-2 h-2 rounded-full bg-[#975a36] animate-pulse"></span>
            <span className="font-['JetBrains_Mono'] text-[10px] tracking-wider uppercase font-semibold">
              TELEMETRY RUNNING
            </span>
          </div>
        </div>

        {/* Exercise Switcher Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="font-['EB_Garamond'] text-[30px] sm:text-[36px] text-[#e5e2e3] font-normal tracking-tight leading-tight">
            {selectedExercise}
          </h1>

          {/* Quick Switch Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['Squat', 'Press', 'Deadlift'].map((exName) => (
              <button
                key={exName}
                onClick={() => {
                  if (exName === 'Squat') setSelectedExercise('Barbell Back Squat (Low Bar)');
                  if (exName === 'Press') setSelectedExercise('Strict Overhead Press');
                  if (exName === 'Deadlift') setSelectedExercise('Conventional Deadlift');
                }}
                type="button"
                className={`px-2.5 py-1 rounded-lg text-[11px] font-['Inter'] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedExercise.includes(exName)
                    ? 'bg-[#975a36] text-[#ffe5d8]'
                    : 'bg-[#1c1b1c] text-[#c8c5ca] hover:bg-[#2a2a2b]'
                }`}
              >
                {exName}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[#d8c2b8] font-['Inter'] text-[13px] flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#975a36]">tune</span>
            <span>Prescription: 4 sets • 185.0 kg • 3 reps • 3m rest</span>
          </div>

          <button
            onClick={() => handleOpenPlateCalc(currentSetObj.load)}
            type="button"
            className="flex items-center gap-1 text-[11px] font-['JetBrains_Mono'] uppercase font-bold text-[#ffb68e] bg-[#2a2a2b] hover:bg-[#353436] px-2.5 py-1 rounded-lg transition-colors border border-[#353436]"
          >
            <span className="material-symbols-outlined text-[14px]">calculate</span>
            <span>CALCULATE PLATES ({currentSetObj.load} KG)</span>
          </button>
        </div>
      </section>

      {/* Widescreen Responsive Bento Grid: Left Instrument, Right Set Ledger on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column on Desktop: Rest Chronometer Instrument */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <section className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#1c1b1c] shadow-2xl relative overflow-hidden border border-[#26262c]">
            {/* Top Toolbar in Instrument */}
            <div className="w-full flex items-center justify-between mb-2">
              <span className="font-['Cinzel'] text-[9px] tracking-[0.22em] uppercase text-[#d8c2b8] font-semibold">
                CHRONOMETER SPEC-01
              </span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                type="button"
                className={`p-1.5 rounded-lg border text-[12px] transition-colors ${
                  soundEnabled
                    ? 'bg-[#2a2a2b] text-[#e5e2e3] border-[#353436]'
                    : 'bg-[#141415] text-[#c8c5ca]/50 border-transparent'
                }`}
                title={soundEnabled ? 'Acoustic Signal On' : 'Acoustic Signal Muted'}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {soundEnabled ? 'volume_up' : 'volume_off'}
                </span>
              </button>
            </div>

            {/* Circular Gauge Instrument */}
            <div className="relative w-52 h-52 sm:w-56 sm:h-56 flex items-center justify-center select-none my-1">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                {/* Track Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke="#201f20"
                  strokeWidth="3"
                />
                {/* Active Copper Progress Arc */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke="#975a36"
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear drop-shadow-[0_0_10px_rgba(217,165,120,0.5)]"
                />
              </svg>

              {/* Center Countdown Readout with Click-to-Toggle */}
              <div
                onClick={() => setTimerRunning(!timerRunning)}
                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
                title={timerRunning ? 'Click to Pause' : 'Click to Resume'}
              >
                <span className="font-['Inter'] text-[10px] font-semibold uppercase text-[#d8c2b8] tracking-[0.25em] mb-1">
                  RECOVERY INTERVAL
                </span>
                <span className="font-['JetBrains_Mono'] text-[40px] sm:text-[44px] font-bold text-[#e5e2e3] tracking-tighter tabular-nums group-hover:text-[#ffb68e] transition-colors">
                  {formatMinSec(remainingSeconds)}
                </span>
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#c8c5ca] tracking-widest uppercase mt-0.5 tabular-nums flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${timerRunning ? 'bg-[#7EA583]' : 'bg-[#c8c5ca]'}`}></span>
                  <span>{timerRunning ? 'COUNTING' : 'PAUSED'} • ELAPSED {formatMinSec(elapsedSeconds)}</span>
                </span>
              </div>
            </div>

            {/* Quick Rest Cadence Adjusters */}
            <div className="flex items-center gap-2.5 mt-4 w-full justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSub30}
                type="button"
                className="flex items-center justify-center h-10 px-4 rounded-xl bg-[#2a2a2b] hover:bg-[#353436] text-[#d8c2b8] active:text-[#e5e2e3] transition-colors shadow-sm cursor-pointer border border-[#353436]"
              >
                <span className="font-['JetBrains_Mono'] text-[13px] font-bold">-30s</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetStd}
                type="button"
                className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-[#0e0e0f] hover:bg-[#1a1a1c] text-[#d8c2b8] hover:text-[#e5e2e3] transition-colors border border-[#26262c] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#975a36]">
                  hourglass_bottom
                </span>
                <span className="font-['JetBrains_Mono'] text-[12px] uppercase tracking-widest font-bold">
                  3:00 STD
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd30}
                type="button"
                className="flex items-center justify-center h-10 px-4 rounded-xl bg-[#2a2a2b] hover:bg-[#353436] text-[#d8c2b8] active:text-[#e5e2e3] transition-colors shadow-sm cursor-pointer border border-[#353436]"
              >
                <span className="font-['JetBrains_Mono'] text-[13px] font-bold">+30s</span>
              </motion.button>
            </div>
          </section>

          {/* Effort & Kinematic Target Readout Card */}
          <div className="p-4 rounded-xl bg-[#1c1b1c] border border-[#26262c] flex flex-col space-y-2">
            <div className="flex items-center justify-between text-[#c8c5ca]">
              <span className="font-['Inter'] text-[10px] font-semibold uppercase tracking-wider">
                TARGET EFFORT SPEC
              </span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#ffb68e]">
                RPE 8.5
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px] text-[#e5e2e3]">
              <span>Velocity Threshold:</span>
              <span className="font-mono font-bold">≥ 0.45 m/s</span>
            </div>
            <div className="flex items-center justify-between text-[13px] text-[#e5e2e3]">
              <span>Reps in Reserve (RIR):</span>
              <span className="font-mono font-bold">1-2 Reps</span>
            </div>
          </div>
        </div>

        {/* Right Column on Desktop: Set Logging Ledger Card */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <section className="flex flex-col rounded-2xl bg-[#1c1b1c] p-4 sm:p-5 shadow-2xl border border-[#26262c]">
            <div className="flex items-center justify-between pb-3 border-b border-[#26262c]">
              <div className="flex items-center gap-2">
                <h2 className="font-['EB_Garamond'] text-[24px] text-[#e5e2e3] tracking-tight font-medium">
                  Set {currentSetDisplay} of {sets.length}
                </h2>
                <span className="font-['Inter'] text-[10px] uppercase font-semibold bg-[#201f20] px-2 py-0.5 rounded text-[#d8c2b8]">
                  WORKING SET
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenPlateCalc(currentSetObj.load)}
                  className="font-['JetBrains_Mono'] text-[11px] text-[#ffb68e] hover:underline cursor-pointer"
                >
                  Plate Math ↗
                </button>
              </div>
            </div>

            {/* Table Header Row */}
            <div className="grid grid-cols-12 gap-2 py-2.5 px-2 text-[#d8c2b8] font-['Inter'] text-[11px] font-semibold uppercase tracking-[0.14em]">
              <div className="col-span-2 text-left">SET</div>
              <div className="col-span-3 text-left">PREV</div>
              <div className="col-span-4 text-center">LOAD (KG)</div>
              <div className="col-span-3 text-center">REPS</div>
            </div>

            {/* Set Rows Container */}
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {sets.map((s) => {
                  if (s.completed) {
                    // Completed Row
                    return (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.65 }}
                        className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-[#201f20]/60 border border-[#26262c]/40"
                      >
                        <div className="col-span-2 flex items-center gap-1.5">
                          <span className="font-['JetBrains_Mono'] text-[15px] text-[#d8c2b8] font-bold">
                            {s.setNumber}
                          </span>
                          <span className="font-['Inter'] text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#353436] text-[#d8c2b8]">
                            DONE
                          </span>
                        </div>
                        <div className="col-span-3 font-['JetBrains_Mono'] text-[12px] text-[#d8c2b8]">
                          {s.prevLoad.toFixed(1)} × {s.prevReps}
                        </div>
                        <div className="col-span-4 text-center font-['JetBrains_Mono'] text-[16px] text-[#e5e2e3] font-bold">
                          {s.load.toFixed(1)}
                        </div>
                        <div className="col-span-3 flex items-center justify-center gap-2">
                          <span className="font-['JetBrains_Mono'] text-[16px] text-[#e5e2e3] font-bold">
                            {s.reps}
                          </span>
                          <div className="w-6 h-6 rounded-md bg-[#182420] flex items-center justify-center text-[#7EA583] border border-[#24362e]">
                            <span className="material-symbols-outlined text-[15px]">check</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }

                  if (s.isCurrent) {
                    // Current Working Row with Steppers & Accent
                    return (
                      <motion.div
                        key={s.id}
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl bg-[#2a2a2b] shadow-xl relative border border-[#975a36]"
                      >
                        <div className="absolute left-0 top-2 bottom-2 w-[4px] bg-[#975a36] rounded-r"></div>
                        <div className="col-span-2 pl-2 flex items-center gap-1.5">
                          <span className="font-['JetBrains_Mono'] text-[17px] text-[#e5e2e3] font-bold">
                            {s.setNumber}
                          </span>
                          <span className="font-['Inter'] text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#975a36] text-[#ffe5d8] font-bold">
                            NOW
                          </span>
                        </div>
                        <div className="col-span-3 font-['JetBrains_Mono'] text-[12px] text-[#d8c2b8]">
                          {s.prevLoad.toFixed(1)} × {s.prevReps}
                        </div>
                        {/* Interactive Load Input with Steppers */}
                        <div className="col-span-4">
                          <div className="flex items-center gap-1 bg-[#0e0e0f] rounded-lg p-1 border border-[#353436]">
                            <button
                              onClick={() => handleAdjustLoad(s.id, -2.5)}
                              type="button"
                              className="w-6 h-7 rounded bg-[#201f20] hover:bg-[#353436] text-[#d8c2b8] text-[11px] font-bold flex items-center justify-center cursor-pointer"
                              title="-2.5 KG"
                            >
                              -
                            </button>
                            <input
                              className="w-full bg-transparent text-center font-['JetBrains_Mono'] text-[16px] text-[#e5e2e3] focus:outline-none font-bold"
                              inputMode="decimal"
                              type="number"
                              step="0.5"
                              value={s.load}
                              onChange={(e) => handleLoadChange(s.id, e.target.value)}
                            />
                            <button
                              onClick={() => handleAdjustLoad(s.id, 2.5)}
                              type="button"
                              className="w-6 h-7 rounded bg-[#201f20] hover:bg-[#353436] text-[#d8c2b8] text-[11px] font-bold flex items-center justify-center cursor-pointer"
                              title="+2.5 KG"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Interactive Reps Input with Steppers */}
                        <div className="col-span-3">
                          <div className="flex items-center gap-1 bg-[#0e0e0f] rounded-lg p-1 border border-[#353436]">
                            <button
                              onClick={() => handleAdjustReps(s.id, -1)}
                              type="button"
                              className="w-6 h-7 rounded bg-[#201f20] hover:bg-[#353436] text-[#d8c2b8] text-[11px] font-bold flex items-center justify-center cursor-pointer"
                              title="-1 Rep"
                            >
                              -
                            </button>
                            <input
                              className="w-full bg-transparent text-center font-['JetBrains_Mono'] text-[16px] text-[#e5e2e3] focus:outline-none font-bold"
                              inputMode="numeric"
                              type="number"
                              step="1"
                              value={s.reps}
                              onChange={(e) => handleRepsChange(s.id, e.target.value)}
                            />
                            <button
                              onClick={() => handleAdjustReps(s.id, 1)}
                              type="button"
                              className="w-6 h-7 rounded bg-[#201f20] hover:bg-[#353436] text-[#d8c2b8] text-[11px] font-bold flex items-center justify-center cursor-pointer"
                              title="+1 Rep"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }

                  // Queued Row
                  return (
                    <div
                      key={s.id}
                      className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-[#1c1b1c] opacity-45 border border-transparent"
                    >
                      <div className="col-span-2 flex items-center gap-1.5">
                        <span className="font-['JetBrains_Mono'] text-[15px] text-[#d8c2b8]">
                          {s.setNumber}
                        </span>
                        <span className="font-['Inter'] text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#201f20] text-[#d8c2b8]/70">
                          QUEUE
                        </span>
                      </div>
                      <div className="col-span-3 font-['JetBrains_Mono'] text-[12px] text-[#d8c2b8]/80">
                        {s.prevLoad.toFixed(1)} × {s.prevReps}
                      </div>
                      <div className="col-span-4 text-center font-['JetBrains_Mono'] text-[15px] text-[#d8c2b8]">
                        {s.load.toFixed(1)}
                      </div>
                      <div className="col-span-3 text-center font-['JetBrains_Mono'] text-[15px] text-[#d8c2b8]">
                        {s.reps}
                      </div>
                    </div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Set Actions & Primary Log Button */}
            <div className="flex flex-col gap-3 mt-5 pt-3 border-t border-[#26262c]">
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={logCurrentSet}
                className="w-full h-13 rounded-2xl bg-[#975a36] hover:bg-[#b97140] text-[#ffe5d8] flex items-center justify-center gap-2 shadow-[0_12px_28px_rgba(0,0,0,0.85)] transition-all cursor-pointer font-semibold"
                id="btn-log-set"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span className="font-['Inter'] text-[15px] tracking-wide">
                  Log Set {currentSetDisplay} & Restart Rest Interval
                </span>
              </motion.button>

              <div className="flex items-center justify-between px-1">
                <button
                  onClick={addWorkingSet}
                  className="font-['Inter'] text-[13px] text-[#d8c2b8] hover:text-[#e5e2e3] flex items-center gap-1.5 transition-colors py-1 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Add Working Set</span>
                </button>

                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="font-['Inter'] text-[13px] text-[#d8c2b8] hover:text-[#e5e2e3] flex items-center gap-1.5 transition-colors py-1 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  <span>Exercise History</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* History Dialog Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#1c1b1c] rounded-2xl p-5 border border-[#26262c] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#26262c] pb-3">
              <div className="flex flex-col">
                <span className="font-['Cinzel'] text-[10px] tracking-[0.2em] text-[#d8c2b8] uppercase font-semibold">
                  CHAMBER ARCHIVE
                </span>
                <h3 className="font-['EB_Garamond'] text-[20px] text-[#e5e2e3]">
                  {selectedExercise} History
                </h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                type="button"
                className="w-8 h-8 rounded-lg bg-[#201f20] hover:bg-[#353436] flex items-center justify-center text-[#d8c2b8]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-[#0e0e0f] border border-[#201f20] flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-bold text-[#e5e2e3]">OCT 12, 2024</div>
                  <div className="text-[11px] font-mono text-[#d8c2b8]">
                    4 × 3 @ 182.5 KG • Peak RPE 8.0
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#201f20] text-[#7EA583]">
                  +2.5 KG
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0e0e0f] border border-[#201f20] flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-bold text-[#e5e2e3]">OCT 05, 2024</div>
                  <div className="text-[11px] font-mono text-[#d8c2b8]">
                    4 × 3 @ 180.0 KG • Peak RPE 8.0
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#201f20] text-[#d8c2b8]">
                  MATCH
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0e0e0f] border border-[#201f20] flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-bold text-[#e5e2e3]">SEP 28, 2024</div>
                  <div className="text-[11px] font-mono text-[#d8c2b8]">
                    3 × 3 @ 175.0 KG • Peak RPE 7.5
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#201f20] text-[#c8c5ca]">
                  DELOAD
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full h-11 rounded-xl bg-[#2a2a2b] hover:bg-[#353436] text-[#e5e2e3] font-['Inter'] text-[13px] uppercase tracking-wider font-semibold"
            >
              Dismiss
            </button>
          </motion.div>
        </div>
      )}

      {/* Plate Loading Calculator Modal */}
      <PlateCalculatorModal
        isOpen={plateCalcOpen}
        initialWeight={calcLoadTarget}
        onClose={() => setPlateCalcOpen(false)}
        onApplyWeight={handleApplyPlateWeight}
      />
    </motion.div>
  );
};
