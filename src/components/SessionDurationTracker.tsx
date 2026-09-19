import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';

export interface SessionDurationRecord {
  id: string;
  date: Date;
  dateStr: string;
  displayDate: string;
  durationMinutes: number;
  regime: string;
  rpe: number;
  efficiency: number;
}

const INITIAL_DURATION_DATA: SessionDurationRecord[] = [
  {
    id: 'dur-1',
    date: new Date('2024-07-22T05:00:00Z'),
    dateStr: '2024-07-22',
    displayDate: 'JUL 22',
    durationMinutes: 62,
    regime: 'L-01 Squat Intro',
    rpe: 7.5,
    efficiency: 88,
  },
  {
    id: 'dur-2',
    date: new Date('2024-07-29T05:00:00Z'),
    dateStr: '2024-07-29',
    displayDate: 'JUL 29',
    durationMinutes: 68,
    regime: 'L-04 Deadlift Prep',
    rpe: 8.0,
    efficiency: 89,
  },
  {
    id: 'dur-3',
    date: new Date('2024-08-05T05:00:00Z'),
    dateStr: '2024-08-05',
    displayDate: 'AUG 05',
    durationMinutes: 74,
    regime: 'L-01 Squat Volume',
    rpe: 8.0,
    efficiency: 91,
  },
  {
    id: 'dur-4',
    date: new Date('2024-08-12T05:00:00Z'),
    dateStr: '2024-08-12',
    displayDate: 'AUG 12',
    durationMinutes: 71,
    regime: 'L-03 Overhead Press',
    rpe: 8.5,
    efficiency: 92,
  },
  {
    id: 'dur-5',
    date: new Date('2024-08-19T05:00:00Z'),
    dateStr: '2024-08-19',
    displayDate: 'AUG 19',
    durationMinutes: 55,
    regime: 'Deload Week Pivot',
    rpe: 6.5,
    efficiency: 95,
  },
  {
    id: 'dur-6',
    date: new Date('2024-08-26T05:00:00Z'),
    dateStr: '2024-08-26',
    displayDate: 'AUG 26',
    durationMinutes: 79,
    regime: 'L-04 Deadlift Intensity',
    rpe: 8.5,
    efficiency: 90,
  },
  {
    id: 'dur-7',
    date: new Date('2024-09-02T05:00:00Z'),
    dateStr: '2024-09-02',
    displayDate: 'SEP 02',
    durationMinutes: 82,
    regime: 'L-01 Squat Overload',
    rpe: 8.5,
    efficiency: 87,
  },
  {
    id: 'dur-8',
    date: new Date('2024-09-09T05:00:00Z'),
    dateStr: '2024-09-09',
    displayDate: 'SEP 09',
    durationMinutes: 76,
    regime: 'L-03 Strict Press Peak',
    rpe: 9.0,
    efficiency: 93,
  },
  {
    id: 'dur-9',
    date: new Date('2024-09-16T05:00:00Z'),
    dateStr: '2024-09-16',
    displayDate: 'SEP 16',
    durationMinutes: 85,
    regime: 'L-04 Deadlift Clusters',
    rpe: 8.5,
    efficiency: 91,
  },
  {
    id: 'dur-10',
    date: new Date('2024-09-23T05:00:00Z'),
    dateStr: '2024-09-23',
    displayDate: 'SEP 23',
    durationMinutes: 88,
    regime: 'L-01 Squat Accumulation',
    rpe: 9.0,
    efficiency: 89,
  },
  {
    id: 'dur-11',
    date: new Date('2024-09-30T05:00:00Z'),
    dateStr: '2024-09-30',
    displayDate: 'SEP 30',
    durationMinutes: 58,
    regime: 'Mini-Deload Reset',
    rpe: 7.0,
    efficiency: 96,
  },
  {
    id: 'dur-12',
    date: new Date('2024-10-07T05:00:00Z'),
    dateStr: '2024-10-07',
    displayDate: 'OCT 07',
    durationMinutes: 84,
    regime: 'L-04 Heavy Singles',
    rpe: 8.5,
    efficiency: 92,
  },
  {
    id: 'dur-13',
    date: new Date('2024-10-14T05:00:00Z'),
    dateStr: '2024-10-14',
    displayDate: 'OCT 14',
    durationMinutes: 91,
    regime: 'Competition Peak Test',
    rpe: 9.5,
    efficiency: 94,
  },
];

export const SessionDurationTracker: React.FC = () => {
  const [sessions, setSessions] = useState<SessionDurationRecord[]>(INITIAL_DURATION_DATA);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LAST_10' | 'LAST_5'>('ALL');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // New session logging form state
  const [newDuration, setNewDuration] = useState<number>(75);
  const [newRegime, setNewRegime] = useState<string>('L-04 Deadlift Overload');
  const [newRpe, setNewRpe] = useState<number>(8.5);
  const [newEfficiency, setNewEfficiency] = useState<number>(92);
  const [loggedNotice, setLoggedNotice] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 260 });

  // Filtered dataset
  const filteredData = useMemo(() => {
    if (activeFilter === 'LAST_5') {
      return sessions.slice(-5);
    }
    if (activeFilter === 'LAST_10') {
      return sessions.slice(-10);
    }
    return sessions;
  }, [sessions, activeFilter]);

  // Aggregate statistics
  const stats = useMemo(() => {
    if (filteredData.length === 0) {
      return { avg: 0, totalHours: 0, minDur: 0, maxDur: 0, trend: 0 };
    }
    const durations = filteredData.map((d) => d.durationMinutes);
    const sum = durations.reduce((acc, v) => acc + v, 0);
    const avg = Math.round((sum / durations.length) * 10) / 10;
    const totalHours = Math.round((sum / 60) * 10) / 10;
    const minDur = Math.min(...durations);
    const maxDur = Math.max(...durations);

    // Trend: difference between average of last 3 and first 3
    const firstSlice = durations.slice(0, Math.min(3, durations.length));
    const lastSlice = durations.slice(-Math.min(3, durations.length));
    const firstAvg = firstSlice.reduce((a, b) => a + b, 0) / firstSlice.length;
    const lastAvg = lastSlice.reduce((a, b) => a + b, 0) / lastSlice.length;
    const trend = Math.round((lastAvg - firstAvg) * 10) / 10;

    return { avg, totalHours, minDur, maxDur, trend };
  }, [filteredData]);

  // Active selected or hovered record for inspection
  const activeRecord = useMemo(() => {
    if (hoveredIndex !== null && filteredData[hoveredIndex]) {
      return filteredData[hoveredIndex];
    }
    return filteredData[filteredData.length - 1] || null;
  }, [hoveredIndex, filteredData]);

  // ResizeObserver to ensure precision responsiveness
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        // Keep proportional height between 220 and 300px
        const height = Math.min(300, Math.max(220, Math.floor(width * 0.42)));
        setDimensions({ width, height });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Render D3 chart with precise horological design
  useEffect(() => {
    if (!svgRef.current || filteredData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 24, right: 28, bottom: 42, left: 46 };
    const innerWidth = Math.max(10, width - margin.left - margin.right);
    const innerHeight = Math.max(10, height - margin.top - margin.bottom);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale (point or time scale based on chronological index)
    const xScale = d3
      .scalePoint<number>()
      .domain(filteredData.map((_, i) => i))
      .range([0, innerWidth])
      .padding(0.2);

    // Y Scale with headroom for duration values (min ~ 45, max ~ 110)
    const minVal = Math.min(...filteredData.map((d) => d.durationMinutes));
    const maxVal = Math.max(...filteredData.map((d) => d.durationMinutes));
    const yMin = Math.max(30, Math.floor((minVal - 10) / 10) * 10);
    const yMax = Math.ceil((maxVal + 10) / 10) * 10;

    const yScale = d3
      .scaleLinear()
      .domain([yMin, yMax])
      .nice()
      .range([innerHeight, 0]);

    // Gradient definition for area fill
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'durationAreaGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#ffb68e')
      .attr('stop-opacity', 0.35);

    gradient
      .append('stop')
      .attr('offset', '60%')
      .attr('stop-color', '#975a36')
      .attr('stop-opacity', 0.12);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#131314')
      .attr('stop-opacity', 0.0);

    // Glow filter for line
    const filter = defs.append('filter').attr('id', 'glow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Horizontal gridlines
    const yTicks = yScale.ticks(4);
    g.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#26262c')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,4');

    // 75-Min Benchmark Standard Reference Line
    const targetBenchmark = 75;
    if (targetBenchmark >= yMin && targetBenchmark <= yMax) {
      const benchmarkY = yScale(targetBenchmark);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', benchmarkY)
        .attr('y2', benchmarkY)
        .attr('stroke', '#975a36')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.6)
        .attr('stroke-dasharray', '4,3');

      g.append('text')
        .attr('x', innerWidth - 4)
        .attr('y', benchmarkY - 5)
        .attr('text-anchor', 'end')
        .attr('fill', '#ffb68e')
        .attr('font-size', '9px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('opacity', 0.8)
        .text('STD 75 MIN BENCHMARK');
    }

    // Area Generator
    const areaGenerator = d3
      .area<SessionDurationRecord>()
      .x((_, i) => xScale(i) ?? 0)
      .y0(innerHeight)
      .y1((d) => yScale(d.durationMinutes))
      .curve(d3.curveMonotoneX);

    // Line Generator
    const lineGenerator = d3
      .line<SessionDurationRecord>()
      .x((_, i) => xScale(i) ?? 0)
      .y((d) => yScale(d.durationMinutes))
      .curve(d3.curveMonotoneX);

    // Render Area
    g.append('path')
      .datum(filteredData)
      .attr('fill', 'url(#durationAreaGradient)')
      .attr('d', areaGenerator);

    // Render Line Path
    const path = g
      .append('path')
      .datum(filteredData)
      .attr('fill', 'none')
      .attr('stroke', '#ffb68e')
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('filter', 'url(#glow)')
      .attr('d', lineGenerator);

    // Animate line stroke
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(750)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // X Axis Labels (Dates)
    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0, ${innerHeight + 14})`);

    // Determine how frequently to print labels on small screens
    const step = filteredData.length > 8 ? Math.ceil(filteredData.length / 5) : 1;

    filteredData.forEach((d, i) => {
      if (i % step === 0 || i === filteredData.length - 1) {
        xAxisGroup
          .append('text')
          .attr('x', xScale(i) ?? 0)
          .attr('y', 10)
          .attr('text-anchor', 'middle')
          .attr('fill', '#c8c5ca')
          .attr('font-size', '10px')
          .attr('font-family', 'JetBrains Mono, monospace')
          .text(d.displayDate);
      }
    });

    // Y Axis Labels (Minutes)
    const yAxisGroup = g.append('g');
    yTicks.forEach((tick) => {
      yAxisGroup
        .append('text')
        .attr('x', -10)
        .attr('y', yScale(tick) + 3.5)
        .attr('text-anchor', 'end')
        .attr('fill', '#d8c2b8')
        .attr('font-size', '10px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(`${tick}m`);
    });

    // Data Points
    const pointsGroup = g.append('g').attr('class', 'data-points');

    filteredData.forEach((d, i) => {
      const cx = xScale(i) ?? 0;
      const cy = yScale(d.durationMinutes);
      const isHovered = hoveredIndex === i;
      const isLast = i === filteredData.length - 1;

      const pointG = pointsGroup
        .append('g')
        .attr('cursor', 'pointer')
        .on('mouseenter', () => setHoveredIndex(i))
        .on('click', () => setHoveredIndex(i));

      // Invisible larger hit area for touch/mouse
      pointG
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 16)
        .attr('fill', 'transparent');

      // Outer ripple ring for the latest session
      if (isLast) {
        pointG
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 9)
          .attr('fill', 'none')
          .attr('stroke', '#ffb68e')
          .attr('stroke-width', 1)
          .attr('opacity', 0.7);
      }

      // Main Point Circle
      pointG
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', isHovered ? 6.5 : isLast ? 5 : 4)
        .attr('fill', isHovered ? '#ffe5d8' : isLast ? '#ffb68e' : '#1c1b1c')
        .attr('stroke', isHovered ? '#ffb68e' : '#975a36')
        .attr('stroke-width', isHovered ? 2.5 : 2)
        .attr('transition', 'all 0.2s');
    });

    // Active crosshair if hovered
    if (hoveredIndex !== null && filteredData[hoveredIndex]) {
      const activeX = xScale(hoveredIndex) ?? 0;
      const activeY = yScale(filteredData[hoveredIndex].durationMinutes);

      // Vertical guideline
      g.append('line')
        .attr('x1', activeX)
        .attr('x2', activeX)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#ffb68e')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0.5);

      // Target value badge on Y-axis
      g.append('rect')
        .attr('x', -44)
        .attr('y', activeY - 9)
        .attr('width', 34)
        .attr('height', 18)
        .attr('rx', 4)
        .attr('fill', '#975a36');

      g.append('text')
        .attr('x', -27)
        .attr('y', activeY + 3.5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffe5d8')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(`${filteredData[hoveredIndex].durationMinutes}m`);
    }
  }, [filteredData, dimensions, hoveredIndex]);

  // Handle logging a new duration
  const handleCommitSession = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const display = `${months[now.getUTCMonth()]} ${String(now.getUTCDate()).padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];

    const newRecord: SessionDurationRecord = {
      id: `dur-${Date.now()}`,
      date: now,
      dateStr,
      displayDate: display,
      durationMinutes: Number(newDuration),
      regime: newRegime.trim() || 'General Strength Training',
      rpe: Number(newRpe),
      efficiency: Number(newEfficiency),
    };

    setSessions((prev) => [...prev, newRecord]);
    setIsLogModalOpen(false);
    setHoveredIndex(sessions.length); // focus newly logged point
    setLoggedNotice(`Logged ${newRecord.durationMinutes} min session to ledger`);
    setTimeout(() => setLoggedNotice(null), 3500);
  };

  return (
    <section className="bg-[#1c1b1c] rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col space-y-4 border border-[#26262c]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-['Cinzel'] text-[11px] uppercase tracking-[0.2em] text-[#d8c2b8] font-semibold">
              Session Duration Chronometer
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#7EA583] animate-pulse"></span>
          </div>
          <h2 className="font-['EB_Garamond'] text-[22px] sm:text-[24px] text-[#e5e2e3] font-normal leading-tight mt-0.5">
            D3 Duration Trajectory
          </h2>
        </div>

        {/* Action Controls: Filter & Add Duration Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Segmented Filter */}
          <div className="flex items-center bg-[#0e0e0f] rounded-lg p-0.5 border border-[#201f20]">
            {(
              [
                { id: 'ALL', label: 'ALL' },
                { id: 'LAST_10', label: '10 SESS' },
                { id: 'LAST_5', label: '5 SESS' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => {
                  setActiveFilter(filter.id);
                  setHoveredIndex(null);
                }}
                className={`px-2.5 py-1 text-[10px] font-['JetBrains_Mono'] font-bold rounded transition-colors cursor-pointer ${
                  activeFilter === filter.id
                    ? 'bg-[#975a36] text-[#ffe5d8]'
                    : 'text-[#c8c5ca] hover:text-[#e5e2e3]'
                }`}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Quick Log Button */}
          <button
            onClick={() => setIsLogModalOpen(true)}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#975a36] hover:bg-[#b97140] text-[#ffe5d8] text-[11px] font-['Inter'] font-semibold transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">add_circle</span>
            <span>Log Duration</span>
          </button>
        </div>
      </div>

      {/* Aggregate Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#0e0e0f] rounded-xl p-2.5 border border-[#201f20] flex flex-col">
          <span className="font-['Inter'] text-[9px] uppercase tracking-[0.18em] text-[#d8c2b8] font-semibold">
            Average Time
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-['JetBrains_Mono'] text-[18px] sm:text-[20px] font-bold text-[#e5e2e3]">
              {stats.avg}
            </span>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#c8c5ca]">MIN</span>
          </div>
        </div>

        <div className="bg-[#0e0e0f] rounded-xl p-2.5 border border-[#201f20] flex flex-col">
          <span className="font-['Inter'] text-[9px] uppercase tracking-[0.18em] text-[#d8c2b8] font-semibold">
            Total Telemetry
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-['JetBrains_Mono'] text-[18px] sm:text-[20px] font-bold text-[#e5e2e3]">
              {stats.totalHours}
            </span>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#c8c5ca]">HRS</span>
          </div>
        </div>

        <div className="bg-[#0e0e0f] rounded-xl p-2.5 border border-[#201f20] flex flex-col">
          <span className="font-['Inter'] text-[9px] uppercase tracking-[0.18em] text-[#d8c2b8] font-semibold">
            Chronometer Range
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-['JetBrains_Mono'] text-[15px] sm:text-[17px] font-bold text-[#e5e2e3]">
              {stats.minDur}–{stats.maxDur}
            </span>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#c8c5ca]">MIN</span>
          </div>
        </div>

        <div className="bg-[#0e0e0f] rounded-xl p-2.5 border border-[#201f20] flex flex-col">
          <span className="font-['Inter'] text-[9px] uppercase tracking-[0.18em] text-[#d8c2b8] font-semibold">
            Period Trajectory
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`font-['JetBrains_Mono'] text-[18px] sm:text-[20px] font-bold ${
                stats.trend >= 0 ? 'text-[#ffb68e]' : 'text-[#7EA583]'
              }`}
            >
              {stats.trend >= 0 ? `+${stats.trend}` : stats.trend}
            </span>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#c8c5ca]">MIN</span>
          </div>
        </div>
      </div>

      {/* Interactive Active Point Card / Inspector */}
      {activeRecord && (
        <div className="p-3 bg-[#0e0e0f] rounded-xl border border-[#201f20] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1c1b1c] flex items-center justify-center border border-[#26262c] shrink-0">
              <span className="material-symbols-outlined text-[18px] text-[#ffb68e]">
                schedule
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-['JetBrains_Mono'] text-[13px] font-bold text-[#e5e2e3]">
                  {activeRecord.displayDate}
                </span>
                <span className="text-[#353436]">•</span>
                <span className="font-['Inter'] text-[12px] text-[#d8c2b8]">
                  {activeRecord.regime}
                </span>
              </div>
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#c8c5ca]">
                Rest Efficiency: {activeRecord.efficiency}% • Strain: @RPE {activeRecord.rpe}
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-1 self-end sm:self-auto shrink-0">
            <span className="font-['Cinzel'] text-[11px] uppercase tracking-wider text-[#d8c2b8] mr-1">
              DURATION:
            </span>
            <span className="font-['JetBrains_Mono'] text-[20px] font-bold text-[#ffb68e]">
              {activeRecord.durationMinutes}
            </span>
            <span className="font-['JetBrains_Mono'] text-[12px] text-[#c8c5ca]">MINUTES</span>
          </div>
        </div>
      )}

      {/* D3 SVG Chart Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full bg-[#0e0e0f] rounded-xl border border-[#201f20] p-1 overflow-hidden"
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-auto overflow-visible select-none"
        />
      </div>

      {/* Chart Legend / Telemetry footnotes */}
      <div className="flex flex-col xs:flex-row items-center justify-between text-[10px] text-[#c8c5ca] font-mono gap-2 pt-1 border-t border-[#201f20]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#ffb68e] inline-block rounded-full"></span>
            <span>Duration Curve</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#975a36] inline-block border-t border-dashed border-[#ffb68e]"></span>
            <span>75m Benchmark</span>
          </div>
        </div>
        <span className="text-[#d8c2b8]/70">Interactive: Click or hover data nodes</span>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {loggedNotice && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-2.5 rounded-xl bg-[#182420] text-[#7EA583] text-[12px] font-mono border border-[#24362E] text-center"
          >
            {loggedNotice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal to Log a New Session Duration */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#1c1b1c] rounded-2xl p-5 border border-[#26262c] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#26262c] pb-3">
              <div className="flex flex-col">
                <span className="font-['Cinzel'] text-[10px] tracking-[0.2em] text-[#ffb68e] uppercase font-semibold">
                  CHRONOMETER LOGGING
                </span>
                <h3 className="font-['EB_Garamond'] text-[22px] text-[#e5e2e3]">
                  Record Session Duration
                </h3>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                type="button"
                className="w-8 h-8 rounded-lg bg-[#201f20] hover:bg-[#353436] flex items-center justify-center text-[#d8c2b8] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCommitSession} className="space-y-4">
              {/* Duration Stepper & Presets */}
              <div className="space-y-2">
                <label className="font-['Inter'] text-[11px] uppercase tracking-wider text-[#d8c2b8] font-semibold">
                  Session Duration (Minutes)
                </label>

                <div className="flex items-center justify-between p-3 bg-[#0e0e0f] rounded-xl border border-[#201f20]">
                  <button
                    type="button"
                    onClick={() => setNewDuration((prev) => Math.max(20, prev - 5))}
                    className="w-9 h-9 rounded-lg bg-[#201f20] hover:bg-[#2a2a2b] text-[#e5e2e3] font-bold text-[18px] flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <div className="flex items-baseline gap-1">
                    <span className="font-['JetBrains_Mono'] text-[28px] font-bold text-[#ffb68e]">
                      {newDuration}
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[12px] text-[#c8c5ca]">MIN</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewDuration((prev) => Math.min(180, prev + 5))}
                    className="w-9 h-9 rounded-lg bg-[#201f20] hover:bg-[#2a2a2b] text-[#e5e2e3] font-bold text-[18px] flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[50, 65, 75, 90].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewDuration(preset)}
                      className={`py-1 rounded text-[11px] font-['JetBrains_Mono'] transition-colors cursor-pointer border ${
                        newDuration === preset
                          ? 'bg-[#975a36] text-[#ffe5d8] border-[#ffb68e]/50'
                          : 'bg-[#201f20] text-[#c8c5ca] border-transparent hover:text-[#e5e2e3]'
                      }`}
                    >
                      {preset}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Regime Discipline / Workout Tag */}
              <div className="space-y-1.5">
                <label className="font-['Inter'] text-[11px] uppercase tracking-wider text-[#d8c2b8] font-semibold">
                  Discipline / Prescribed Focus
                </label>
                <select
                  value={newRegime}
                  onChange={(e) => setNewRegime(e.target.value)}
                  className="w-full bg-[#0e0e0f] text-[#e5e2e3] rounded-xl px-3.5 py-2.5 text-[13px] border border-[#201f20] focus:border-[#ffb68e] focus:outline-none"
                >
                  <option value="L-01 Barbell Back Squat">L-01 Barbell Back Squat</option>
                  <option value="L-04 Conventional Deadlift">L-04 Conventional Deadlift</option>
                  <option value="L-03 Strict Overhead Press">L-03 Strict Overhead Press</option>
                  <option value="Competition Peak Test">Competition Peak Test</option>
                  <option value="Hypertrophy & Assistance">Hypertrophy & Assistance</option>
                  <option value="Recovery Deload Protocol">Recovery Deload Protocol</option>
                </select>
              </div>

              {/* Dual Sliders: RPE and Rest Efficiency */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1 bg-[#0e0e0f] p-3 rounded-xl border border-[#201f20]">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-[#d8c2b8]">Peak Strain</span>
                    <span className="text-[#ffb68e] font-bold">@{newRpe}</span>
                  </div>
                  <input
                    type="range"
                    min="6.0"
                    max="10.0"
                    step="0.5"
                    value={newRpe}
                    onChange={(e) => setNewRpe(parseFloat(e.target.value))}
                    className="w-full accent-[#975a36] cursor-pointer"
                  />
                </div>

                <div className="space-y-1 bg-[#0e0e0f] p-3 rounded-xl border border-[#201f20]">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-[#d8c2b8]">Rest Ratio</span>
                    <span className="text-[#7EA583] font-bold">{newEfficiency}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="99"
                    step="1"
                    value={newEfficiency}
                    onChange={(e) => setNewEfficiency(parseInt(e.target.value, 10))}
                    className="w-full accent-[#7EA583] cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setIsLogModalOpen(false)}
                  type="button"
                  className="flex-1 h-11 rounded-xl bg-[#201f20] hover:bg-[#2a2a2b] text-[#d8c2b8] text-[13px] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#975a36] hover:bg-[#b97140] text-[#ffe5d8] text-[13px] font-semibold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[17px]">done</span>
                  <span>Commit to Ledger</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </section>
  );
};
