import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SessionDurationTracker } from './SessionDurationTracker';

type RangeOption = '1M' | '3M' | '6M' | 'ALL';

interface ExerciseArchive {
  id: string;
  name: string;
  code: string;
  est1rm: number;
  netDelta: string;
  setsLogged: number;
  trajectory: {
    points: { x: number; y: number; val: number; date: string; speed: string }[];
    path: string;
    areaPath: string;
    gridValues: number[];
    minY: number;
    maxY: number;
    timeline: [string, string, string];
  };
  distribution: { z1: number; z2: number; z3: number };
  recentSessions: {
    date: string;
    time: string;
    badge: string;
    badgeType: 'pr' | 'standard' | 'deload';
    prescription: string;
    rpe: string;
    volume: string;
  }[];
}

const EXERCISE_DATA: Record<string, ExerciseArchive> = {
  deadlift: {
    id: 'deadlift',
    name: 'Deadlift (Conventional)',
    code: 'L-04',
    est1rm: 242.5,
    netDelta: '+17.5 12W',
    setsLogged: 318,
    trajectory: {
      points: [
        { x: 12, y: 118, val: 225.0, date: 'JUL 22', speed: '0.38 m/s' },
        { x: 120, y: 92, val: 231.0, date: 'AUG 26', speed: '0.41 m/s' },
        { x: 240, y: 50, val: 238.0, date: 'SEP 30', speed: '0.39 m/s' },
        { x: 308, y: 18, val: 242.5, date: 'OCT 14', speed: '0.42 m/s' },
      ],
      path: 'M 12 118 C 50 114, 80 102, 120 92 C 160 82, 200 64, 240 50 C 275 38, 295 24, 308 18',
      areaPath:
        'M 12 118 C 50 114, 80 102, 120 92 C 160 82, 200 64, 240 50 C 275 38, 295 24, 308 18 L 308 160 L 12 160 Z',
      gridValues: [240.0, 230.0, 220.0],
      minY: 220.0,
      maxY: 245.0,
      timeline: ['W01 • JUL 22', 'W06 • AUG 26', 'W12 • OCT 14'],
    },
    distribution: { z1: 46, z2: 38, z3: 16 },
    recentSessions: [
      {
        date: 'OCT 14, 2024',
        time: '05:14 UTC',
        badge: 'Peak PR',
        badgeType: 'pr',
        prescription: '4 × 3 @ 210.0 KG',
        rpe: 'Peak RPE 8.5',
        volume: 'Vol: 2,520 KG',
      },
      {
        date: 'OCT 07, 2024',
        time: '05:22 UTC',
        badge: 'Standard',
        badgeType: 'standard',
        prescription: '4 × 3 @ 207.5 KG',
        rpe: 'Peak RPE 8.0',
        volume: 'Vol: 2,490 KG',
      },
      {
        date: 'SEP 30, 2024',
        time: '05:08 UTC',
        badge: 'Deload',
        badgeType: 'deload',
        prescription: '3 × 3 @ 205.0 KG',
        rpe: 'Peak RPE 8.0',
        volume: 'Vol: 1,845 KG',
      },
    ],
  },
  squat: {
    id: 'squat',
    name: 'Barbell Back Squat',
    code: 'L-01',
    est1rm: 215.0,
    netDelta: '+12.5 12W',
    setsLogged: 342,
    trajectory: {
      points: [
        { x: 12, y: 125, val: 202.5, date: 'JUL 22', speed: '0.44 m/s' },
        { x: 120, y: 100, val: 207.5, date: 'AUG 26', speed: '0.46 m/s' },
        { x: 240, y: 55, val: 212.0, date: 'SEP 30', speed: '0.45 m/s' },
        { x: 308, y: 22, val: 215.0, date: 'OCT 14', speed: '0.48 m/s' },
      ],
      path: 'M 12 125 C 50 120, 80 110, 120 100 C 160 90, 200 70, 240 55 C 275 42, 295 30, 308 22',
      areaPath:
        'M 12 125 C 50 120, 80 110, 120 100 C 160 90, 200 70, 240 55 C 275 42, 295 30, 308 22 L 308 160 L 12 160 Z',
      gridValues: [215.0, 210.0, 200.0],
      minY: 200.0,
      maxY: 220.0,
      timeline: ['W01 • JUL 22', 'W06 • AUG 26', 'W12 • OCT 14'],
    },
    distribution: { z1: 42, z2: 44, z3: 14 },
    recentSessions: [
      {
        date: 'OCT 12, 2024',
        time: '05:30 UTC',
        badge: 'Peak PR',
        badgeType: 'pr',
        prescription: '4 × 3 @ 185.0 KG',
        rpe: 'Peak RPE 8.5',
        volume: 'Vol: 2,220 KG',
      },
      {
        date: 'OCT 05, 2024',
        time: '05:15 UTC',
        badge: 'Standard',
        badgeType: 'standard',
        prescription: '4 × 3 @ 180.0 KG',
        rpe: 'Peak RPE 8.0',
        volume: 'Vol: 2,160 KG',
      },
    ],
  },
  press: {
    id: 'press',
    name: 'Strict Overhead Press',
    code: 'L-03',
    est1rm: 92.5,
    netDelta: '+5.0 12W',
    setsLogged: 288,
    trajectory: {
      points: [
        { x: 12, y: 110, val: 87.5, date: 'JUL 22', speed: '0.35 m/s' },
        { x: 120, y: 88, val: 89.0, date: 'AUG 26', speed: '0.36 m/s' },
        { x: 240, y: 55, val: 91.0, date: 'SEP 30', speed: '0.34 m/s' },
        { x: 308, y: 35, val: 92.5, date: 'OCT 14', speed: '0.37 m/s' },
      ],
      path: 'M 12 110 C 50 106, 80 96, 120 88 C 160 80, 200 66, 240 55 C 275 46, 295 40, 308 35',
      areaPath:
        'M 12 110 C 50 106, 80 96, 120 88 C 160 80, 200 66, 240 55 C 275 46, 295 40, 308 35 L 308 160 L 12 160 Z',
      gridValues: [92.5, 90.0, 87.5],
      minY: 85.0,
      maxY: 95.0,
      timeline: ['W01 • JUL 22', 'W06 • AUG 26', 'W12 • OCT 14'],
    },
    distribution: { z1: 52, z2: 36, z3: 12 },
    recentSessions: [
      {
        date: 'OCT 14, 2024',
        time: '05:45 UTC',
        badge: 'Standard',
        badgeType: 'standard',
        prescription: '5 × 5 @ 77.5 KG',
        rpe: 'Peak RPE 9.5',
        volume: 'Vol: 1,937 KG',
      },
    ],
  },
};

export const ProgressScreen: React.FC = () => {
  const [selectedExerciseKey, setSelectedExerciseKey] = useState<string>('deadlift');
  const [selectedRange, setSelectedRange] = useState<RangeOption>('3M');
  const [exerciseMenuOpen, setExerciseMenuOpen] = useState(false);
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number>(3); // Last point

  const exercise = EXERCISE_DATA[selectedExerciseKey] || EXERCISE_DATA.deadlift;
  const activePoint = exercise.trajectory.points[activeTooltipIndex] || exercise.trajectory.points[3];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col w-full space-y-5 pb-8"
    >
      {/* Exercise Selector Header */}
      <section className="flex flex-col space-y-1 pt-1 relative">
        <div className="flex items-center justify-between">
          <span className="font-['Cinzel'] text-[11px] uppercase tracking-[0.24em] text-[#d8c2b8] font-semibold">
            Historical Archive
          </span>
          <span className="font-['JetBrains_Mono'] text-[11px] text-[#c8c5ca]">
            IPF STANDARD DATABASE
          </span>
        </div>

        <button
          onClick={() => setExerciseMenuOpen(!exerciseMenuOpen)}
          className="group flex items-center justify-between py-1 text-left active:opacity-80 transition-opacity cursor-pointer w-full"
          type="button"
        >
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="font-['EB_Garamond'] text-[32px] sm:text-[36px] text-[#e5e2e3] tracking-tight truncate font-normal">
              {exercise.name}
            </h1>
            <span className="material-symbols-outlined text-[#ffb68e] text-[20px] transition-transform group-hover:translate-y-0.5">
              expand_more
            </span>
          </div>
          <span className="font-['JetBrains_Mono'] text-[12px] uppercase text-[#d8c2b8] tracking-wider font-bold">
            {exercise.code}
          </span>
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {exerciseMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-20 left-0 right-0 z-30 bg-[#1c1b1c] rounded-2xl border border-[#26262c] shadow-2xl p-1.5 space-y-1"
            >
              {Object.values(EXERCISE_DATA).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedExerciseKey(item.id);
                    setExerciseMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                    item.id === selectedExerciseKey
                      ? 'bg-[#2a2a2b] text-[#ffb68e]'
                      : 'text-[#e5e2e3] hover:bg-[#201f20]'
                  }`}
                >
                  <span className="font-['EB_Garamond'] text-[19px]">{item.name}</span>
                  <span className="font-['JetBrains_Mono'] text-[11px] text-[#d8c2b8]">
                    {item.code}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Lifetime Summary Stat Row */}
      <section className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="bg-[#1c1b1c] rounded-xl p-3 flex flex-col justify-between border border-[#26262c]">
          <span className="font-['Inter'] text-[10px] font-semibold uppercase text-[#d8c2b8] tracking-wider">
            Est. 1RM
          </span>
          <span className="font-['JetBrains_Mono'] text-[20px] sm:text-[22px] font-bold text-[#e5e2e3] mt-1 tabular-nums">
            {exercise.est1rm}
            <span className="font-['JetBrains_Mono'] text-[12px] font-normal text-[#c8c5ca] ml-0.5">
              KG
            </span>
          </span>
        </div>

        <div className="bg-[#1c1b1c] rounded-xl p-3 flex flex-col justify-between border border-[#26262c]">
          <span className="font-['Inter'] text-[10px] font-semibold uppercase text-[#d8c2b8] tracking-wider">
            Net Delta
          </span>
          <span className="font-['JetBrains_Mono'] text-[20px] sm:text-[22px] font-bold text-[#e5e2e3] mt-1 tabular-nums">
            {exercise.netDelta.split(' ')[0]}
            <span className="font-['JetBrains_Mono'] text-[12px] font-normal text-[#d8c2b8] ml-0.5">
              {exercise.netDelta.split(' ')[1]}
            </span>
          </span>
        </div>

        <div className="bg-[#1c1b1c] rounded-xl p-3 flex flex-col justify-between border border-[#26262c]">
          <span className="font-['Inter'] text-[10px] font-semibold uppercase text-[#d8c2b8] tracking-wider">
            Sets Logged
          </span>
          <span className="font-['JetBrains_Mono'] text-[20px] sm:text-[22px] font-bold text-[#e5e2e3] mt-1 tabular-nums">
            {exercise.setsLogged}
            <span className="font-['JetBrains_Mono'] text-[12px] font-normal text-[#c8c5ca] ml-0.5">
              VOL
            </span>
          </span>
        </div>
      </section>

      {/* Widescreen Responsive 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Interactive Trajectory SVG Chart & Range Controls */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <section className="bg-[#1c1b1c] rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col space-y-3 border border-[#26262c]">
            {/* Chart Sub-Header & Segmented Range Filter */}
            <div className="flex items-center justify-between">
              <span className="font-['Cinzel'] text-[11px] uppercase tracking-[0.2em] text-[#d8c2b8] font-semibold">
                Trajectory Analysis
              </span>

              {/* Range Filters */}
              <div className="flex items-center bg-[#0e0e0f] rounded-lg p-0.5 border border-[#201f20]">
                {(['1M', '3M', '6M', 'ALL'] as RangeOption[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedRange(range)}
                    className={`px-2.5 py-1 text-[10px] font-['JetBrains_Mono'] font-bold rounded transition-colors cursor-pointer ${
                      selectedRange === range
                        ? 'bg-[#975a36] text-[#ffe5d8]'
                        : 'text-[#c8c5ca] hover:text-[#e5e2e3]'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Data Point Inspection Badge */}
            <div className="p-3 bg-[#0e0e0f] rounded-xl border border-[#201f20] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#975a36]"></span>
                <span className="font-['Inter'] text-[12px] text-[#d8c2b8]">
                  Point {activeTooltipIndex + 1} ({activePoint.date}):
                </span>
                <span className="font-['JetBrains_Mono'] text-[14px] font-bold text-[#e5e2e3]">
                  {activePoint.val} KG
                </span>
              </div>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#7EA583]">
                {activePoint.speed}
              </span>
            </div>

            {/* Horological SVG Chart */}
            <div className="relative w-full h-48 sm:h-56 bg-[#0e0e0f] rounded-xl p-2 border border-[#201f20] overflow-hidden">
              <svg
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 320 160"
              >
                <defs>
                  <linearGradient id="curveGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#975a36" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#975a36" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line stroke="#26262c" strokeDasharray="2 3" strokeWidth="0.75" x1="0" x2="320" y1="20" y2="20" />
                <line stroke="#26262c" strokeDasharray="2 3" strokeWidth="0.75" x1="0" x2="320" y1="84" y2="84" />
                <line stroke="#26262c" strokeDasharray="2 3" strokeWidth="0.75" x1="0" x2="320" y1="148" y2="148" />

                {/* Area Fill */}
                <path d={exercise.trajectory.areaPath} fill="url(#curveGradient)" />

                {/* Trajectory Curve */}
                <path
                  d={exercise.trajectory.path}
                  fill="none"
                  stroke="#975a36"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  className="drop-shadow-[0_0_8px_rgba(151,90,54,0.4)]"
                />

                {/* Points */}
                {exercise.trajectory.points.map((pt, idx) => (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onClick={() => setActiveTooltipIndex(idx)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      fill={activeTooltipIndex === idx ? '#ffb68e' : '#201f20'}
                      r={activeTooltipIndex === idx ? '6' : '4'}
                      stroke="#975a36"
                      strokeWidth="2"
                    />
                  </g>
                ))}
              </svg>
            </div>

            {/* Timeline Coordinates */}
            <div className="flex items-center justify-between pt-1">
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#d8c2b8]">
                {exercise.trajectory.timeline[0]}
              </span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#d8c2b8]">
                {exercise.trajectory.timeline[1]}
              </span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#d8c2b8]">
                {exercise.trajectory.timeline[2]}
              </span>
            </div>
          </section>
        </div>

        {/* Right Column: Zone Distribution & Recent Sessions */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Intensity Zone Distribution */}
          <section className="bg-[#1c1b1c] rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col space-y-3 border border-[#26262c]">
            <div className="flex items-center justify-between">
              <span className="font-['Cinzel'] text-[11px] uppercase tracking-[0.2em] text-[#d8c2b8] font-semibold">
                Load Distribution
              </span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#c8c5ca]">
                3-MONTH ACCUMULATION
              </span>
            </div>

            {/* Monolithic Segmented Bar Gauge */}
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#0e0e0f] border border-[#201f20]">
              <div style={{ width: `${exercise.distribution.z1}%` }} className="h-full bg-[#353436]" title="Sub-maximal (Z1)" />
              <div style={{ width: `${exercise.distribution.z2}%` }} className="h-full bg-[#71717a]" title="Working Threshold (Z2)" />
              <div style={{ width: `${exercise.distribution.z3}%` }} className="h-full bg-[#975a36]" title="Peak PR Strain (Z3)" />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="flex flex-col">
                <span className="text-[#c8c5ca] font-mono">Z1 (&lt;75%)</span>
                <span className="font-bold text-[#e5e2e3] font-mono">{exercise.distribution.z1}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#c8c5ca] font-mono">Z2 (75-85%)</span>
                <span className="font-bold text-[#e5e2e3] font-mono">{exercise.distribution.z2}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#ffb68e] font-mono">Z3 (&gt;85%)</span>
                <span className="font-bold text-[#ffe5d8] font-mono">{exercise.distribution.z3}%</span>
              </div>
            </div>
          </section>

          {/* Recent Session Logs */}
          <section className="bg-[#1c1b1c] rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col space-y-3 border border-[#26262c]">
            <div className="flex items-center justify-between">
              <span className="font-['Cinzel'] text-[11px] uppercase tracking-[0.2em] text-[#d8c2b8] font-semibold">
                Recent Calibrations
              </span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#c8c5ca]">
                3 SESSIONS
              </span>
            </div>

            <div className="space-y-2.5">
              {exercise.recentSessions.map((sess, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#0e0e0f] border border-[#201f20] flex flex-col space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-['JetBrains_Mono'] text-[12px] text-[#e5e2e3] font-bold">
                        {sess.date}
                      </span>
                      <span className="text-[10px] text-[#c8c5ca]">{sess.time}</span>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        sess.badgeType === 'pr'
                          ? 'bg-[#975a36] text-[#ffe5d8]'
                          : 'bg-[#201f20] text-[#d8c2b8]'
                      }`}
                    >
                      {sess.badge}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] text-[#d8c2b8]">
                    <span>{sess.prescription}</span>
                    <span className="font-mono text-[11px]">{sess.volume}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Visual Progress Tracker: Session Durations Over Time (D3 Line Chart) */}
      <SessionDurationTracker />
    </motion.div>
  );
};
