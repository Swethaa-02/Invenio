"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

// ==========================================
// 1. AREA CHART
// ==========================================
interface AreaChartData {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: AreaChartData[];
  height?: number;
  color?: string;
  glowColor?: string;
}

export function AreaChart({
  data,
  height = 200,
  color = "#00f2fe",
  glowColor = "rgba(0, 242, 254, 0.3)",
}: AreaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [width, setWidth] = useState(500);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    resizeObserver.observe(containerRef.current);
    setWidth(containerRef.current.clientWidth);
    return () => resizeObserver.disconnect();
  }, []);

  const maxValue = Math.max(...data.map((d) => d.value), 10) * 1.15;
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Generate SVG coordinates
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - (d.value / maxValue) * chartHeight;
    return { x, y, ...d };
  });

  // Create path strings
  const pathD = points.reduce(
    (acc, p, i) =>
      i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`,
    ""
  );

  const fillD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - padding;
    const percent = Math.max(0, Math.min(1, x / chartWidth));
    const idx = Math.round(percent * (data.length - 1));
    
    if (idx >= 0 && idx < data.length) {
      setHoveredIndex(idx);
      setTooltipPos({
        x: points[idx].x,
        y: points[idx].y - 10,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#9b5de5" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const y = padding + chartHeight * r;
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1"
            />
          );
        })}

        {/* Filled Path */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          d={fillD}
          fill="url(#areaGradient)"
        />

        {/* Stroke Path */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          d={pathD}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2.5"
        />

        {/* Interaction Tracker Line */}
        {hoveredIndex !== null && (
          <line
            x1={points[hoveredIndex].x}
            y1={padding}
            x2={points[hoveredIndex].x}
            y2={height - padding}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
        )}

        {/* Active Node Dot */}
        {hoveredIndex !== null && (
          <g>
            <circle
              cx={points[hoveredIndex].x}
              cy={points[hoveredIndex].y}
              r="7"
              fill={color}
              className="animate-ping opacity-35"
            />
            <circle
              cx={points[hoveredIndex].x}
              cy={points[hoveredIndex].y}
              r="4.5"
              fill="#ffffff"
              stroke={color}
              strokeWidth="2.5"
            />
          </g>
        )}
      </svg>

      {/* Glassmorphic Tooltip */}
      {hoveredIndex !== null && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full flex flex-col gap-1 rounded-lg border border-white/10 bg-slate-950/85 backdrop-blur-md px-3 py-2 text-[11px] shadow-lg text-slate-200"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <span className="text-slate-400 font-medium">{data[hoveredIndex].label}</span>
          <span className="font-bold text-white text-xs">
            {data[hoveredIndex].value.toLocaleString()} units
          </span>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. BAR CHART
// ==========================================
interface BarChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  color?: string;
}

export function BarChart({
  data,
  height = 200,
  color = "#9b5de5",
}: BarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [width, setWidth] = useState(500);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    resizeObserver.observe(containerRef.current);
    setWidth(containerRef.current.clientWidth);
    return () => resizeObserver.disconnect();
  }, []);

  const maxValue = Math.max(...data.map((d) => d.value), 10) * 1.1;
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const barGap = 16;
  const totalGaps = (data.length - 1) * barGap;
  const barWidth = Math.max(8, (chartWidth - totalGaps) / data.length);

  return (
    <div ref={containerRef} className="relative w-full select-none" onMouseLeave={() => setHoveredIndex(null)}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        {[0, 0.5, 1].map((r, i) => {
          const y = padding + chartHeight * r;
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1"
            />
          );
        })}

        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * chartHeight;
          const x = padding + i * (barWidth + barGap);
          const y = padding + chartHeight - barHeight;

          const isHovered = hoveredIndex === i;

          return (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
            >
              <defs>
                <linearGradient id={`barGlow-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isHovered ? "#00f2fe" : color} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.2} />
                </linearGradient>
              </defs>

              {/* Background slot */}
              <rect
                x={x}
                y={padding}
                width={barWidth}
                height={chartHeight}
                fill="rgba(255,255,255,0.01)"
                rx="3"
              />

              {/* Foreground animated bar */}
              <motion.rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={`url(#barGlow-${i})`}
                rx="4"
                initial={{ height: 0, y: padding + chartHeight }}
                animate={{ height: barHeight, y }}
                transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
              />

              {/* Bar Label below */}
              {barWidth > 20 && (
                <text
                  x={x + barWidth / 2}
                  y={height - 2}
                  fill="rgba(255,255,255,0.3)"
                  fontSize="9"
                  textAnchor="middle"
                  className="font-mono"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full flex flex-col gap-1 rounded-lg border border-white/10 bg-slate-950/85 backdrop-blur-md px-3 py-2 text-[11px] shadow-lg text-slate-200"
          style={{
            left: padding + hoveredIndex * (barWidth + barGap) + barWidth / 2,
            top: padding + chartHeight - (data[hoveredIndex].value / maxValue) * chartHeight - 10,
          }}
        >
          <span className="text-slate-400 font-medium">{data[hoveredIndex].label}</span>
          <span className="font-bold text-white text-xs">
            {data[hoveredIndex].value.toLocaleString()} items
          </span>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. DONUT CHART
// ==========================================
interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  size?: number;
}

export function DonutChart({ data, size = 180 }: DonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = data.reduce((acc, d) => acc + d.value, 0);
  const radius = size * 0.35;
  const strokeWidth = size * 0.12;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = 0;

  return (
    <div className="flex items-center justify-between gap-6 select-none" style={{ height: size }}>
      {/* SVG Donut */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {data.map((item, i) => {
            const percentage = item.value / total;
            const strokeLength = percentage * circumference;
            const strokeOffset = circumference - strokeLength + accumulatedAngle;
            accumulatedAngle -= strokeLength;

            const isHovered = activeIndex === i;

            return (
              <motion.circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-300"
                style={{
                  filter: isHovered ? `drop-shadow(0 0 6px ${item.color})` : "none",
                  opacity: activeIndex === null || isHovered ? 1 : 0.45,
                }}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: strokeOffset }}
                transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
              />
            );
          })}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
            {activeIndex !== null ? data[activeIndex].name : "Total"}
          </span>
          <span className="text-lg font-bold text-white font-mono">
            {activeIndex !== null
              ? `${Math.round((data[activeIndex].value / total) * 100)}%`
              : total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 flex flex-col gap-2.5">
        {data.map((item, i) => {
          const isSelected = activeIndex === i;
          return (
            <div
              key={i}
              className={`flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors cursor-pointer ${
                isSelected ? "bg-white/5" : "hover:bg-white/3"
              }`}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-medium text-slate-300">{item.name}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400 font-mono">
                {item.value} ({Math.round((item.value / total) * 100)}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
