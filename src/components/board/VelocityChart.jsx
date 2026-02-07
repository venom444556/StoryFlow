import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import EmptyState from '../ui/EmptyState';

const PADDING = { top: 24, right: 20, bottom: 40, left: 44 };
const VIEW_WIDTH = 600;
const VIEW_HEIGHT = 300;
const CHART_W = VIEW_WIDTH - PADDING.left - PADDING.right;
const CHART_H = VIEW_HEIGHT - PADDING.top - PADDING.bottom;
const BAR_GAP_RATIO = 0.35; // gap as fraction of slot width

export default function VelocityChart({ sprints = [] }) {
  const chart = useMemo(() => {
    if (sprints.length === 0) return null;

    const maxPoints = Math.max(...sprints.map((s) => s.points ?? 0), 1);
    const avg =
      sprints.reduce((sum, s) => sum + (s.points ?? 0), 0) / sprints.length;

    const slotWidth = CHART_W / sprints.length;
    const gap = slotWidth * BAR_GAP_RATIO;
    const barWidth = slotWidth - gap;

    const bars = sprints.map((sprint, i) => {
      const x = PADDING.left + i * slotWidth + gap / 2;
      const barHeight = ((sprint.points ?? 0) / maxPoints) * CHART_H;
      const y = PADDING.top + CHART_H - barHeight;
      return {
        x,
        y,
        width: barWidth,
        height: barHeight,
        points: sprint.points ?? 0,
        name: sprint.name || `Sprint ${i + 1}`,
      };
    });

    // Grid lines
    const gridLineCount = 5;
    const gridLines = [];
    for (let i = 0; i <= gridLineCount; i++) {
      const y = PADDING.top + (CHART_H / gridLineCount) * i;
      const label = Math.round(maxPoints - (maxPoints / gridLineCount) * i);
      gridLines.push({ y, label });
    }

    // Average line
    const avgY = PADDING.top + CHART_H - (avg / maxPoints) * CHART_H;

    return { bars, gridLines, avgY, avg: Math.round(avg * 10) / 10 };
  }, [sprints]);

  if (!chart) {
    return (
      <GlassCard>
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 size={16} className="text-green-400" />
          <h3 className="text-sm font-semibold text-slate-300">
            Velocity Chart
          </h3>
        </div>
        <EmptyState
          icon={BarChart3}
          title="No velocity data"
          description="Complete sprints to track team velocity over time."
        />
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-green-400" />
          <h3 className="text-sm font-semibold text-slate-300">
            Velocity Chart
          </h3>
        </div>
        <span className="text-xs text-slate-500">
          Avg: <span className="font-medium text-slate-400">{chart.avg} pts</span>
        </span>
      </div>

      {/* Legend */}
      <div className="mb-2 flex items-center gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm" style={{ backgroundImage: 'linear-gradient(to top, var(--accent-active, #7c3aed), #3b82f6)' }} />
          <span className="text-[10px] text-slate-500">Points Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 rounded bg-green-400" style={{ opacity: 0.6 }} />
          <span className="text-[10px] text-slate-500">Average</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="vel-bar-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="vel-bar-hover" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {chart.gridLines.map((gl, i) => (
          <g key={i}>
            <line
              x1={PADDING.left}
              y1={gl.y}
              x2={VIEW_WIDTH - PADDING.right}
              y2={gl.y}
              style={{ stroke: 'var(--th-border)' }}
              strokeWidth={1}
            />
            <text
              x={PADDING.left - 8}
              y={gl.y + 3}
              textAnchor="end"
              style={{ fill: 'var(--th-text-muted)' }}
              fontSize={9}
              fontFamily="Inter, system-ui, sans-serif"
            >
              {gl.label}
            </text>
          </g>
        ))}

        {/* Bars */}
        {chart.bars.map((bar, i) => (
          <g key={i}>
            {/* Bar */}
            <rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              rx={4}
              ry={4}
              fill="url(#vel-bar-grad)"
              opacity={0.85}
            >
              <animate
                attributeName="height"
                from="0"
                to={bar.height}
                dur="0.5s"
                begin={`${i * 0.08}s`}
                fill="freeze"
              />
              <animate
                attributeName="y"
                from={PADDING.top + CHART_H}
                to={bar.y}
                dur="0.5s"
                begin={`${i * 0.08}s`}
                fill="freeze"
              />
            </rect>

            {/* Value label above bar */}
            <text
              x={bar.x + bar.width / 2}
              y={bar.y - 6}
              textAnchor="middle"
              style={{ fill: 'var(--th-text-secondary)' }}
              fontSize={10}
              fontWeight={600}
              fontFamily="Inter, system-ui, sans-serif"
            >
              {bar.points}
            </text>

            {/* Sprint name below */}
            <text
              x={bar.x + bar.width / 2}
              y={VIEW_HEIGHT - 8}
              textAnchor="middle"
              style={{ fill: 'var(--th-text-muted)' }}
              fontSize={9}
              fontFamily="Inter, system-ui, sans-serif"
            >
              {bar.name}
            </text>
          </g>
        ))}

        {/* Average line */}
        <line
          x1={PADDING.left}
          y1={chart.avgY}
          x2={VIEW_WIDTH - PADDING.right}
          y2={chart.avgY}
          stroke="rgba(52,211,153,0.5)"
          strokeWidth={1.5}
          strokeDasharray="6 4"
        />
        <text
          x={VIEW_WIDTH - PADDING.right + 4}
          y={chart.avgY + 3}
          fill="rgba(52,211,153,0.7)"
          fontSize={9}
          fontFamily="Inter, system-ui, sans-serif"
        >
          {chart.avg}
        </text>

        {/* Axes */}
        <line
          x1={PADDING.left}
          y1={PADDING.top}
          x2={PADDING.left}
          y2={PADDING.top + CHART_H}
          style={{ stroke: 'var(--th-border-hover)' }}
          strokeWidth={1}
        />
        <line
          x1={PADDING.left}
          y1={PADDING.top + CHART_H}
          x2={VIEW_WIDTH - PADDING.right}
          y2={PADDING.top + CHART_H}
          style={{ stroke: 'var(--th-border-hover)' }}
          strokeWidth={1}
        />
      </svg>
    </GlassCard>
  );
}
