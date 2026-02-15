import { useMemo } from 'react';
import { TrendingDown } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import EmptyState from '../ui/EmptyState';

const PADDING = { top: 24, right: 20, bottom: 40, left: 44 };
const VIEW_WIDTH = 600;
const VIEW_HEIGHT = 300;
const CHART_W = VIEW_WIDTH - PADDING.left - PADDING.right;
const CHART_H = VIEW_HEIGHT - PADDING.top - PADDING.bottom;

export default function BurndownChart({ data = [] }) {
  const chart = useMemo(() => {
    if (data.length === 0) return null;

    const maxY = Math.max(
      ...data.map((d) => Math.max(d.ideal ?? 0, d.actual ?? 0)),
      1
    );

    const xStep = data.length > 1 ? CHART_W / (data.length - 1) : 0;
    const yScale = CHART_H / maxY;

    // Build path data
    const idealPoints = data
      .map((d, i) => {
        const x = PADDING.left + i * xStep;
        const y = PADDING.top + CHART_H - (d.ideal ?? 0) * yScale;
        return `${x},${y}`;
      })
      .join(' L ');

    const actualPoints = data
      .map((d, i) => {
        const x = PADDING.left + i * xStep;
        const y = PADDING.top + CHART_H - (d.actual ?? 0) * yScale;
        return `${x},${y}`;
      })
      .join(' L ');

    // Grid lines
    const gridLineCount = 5;
    const gridLines = [];
    for (let i = 0; i <= gridLineCount; i++) {
      const y = PADDING.top + (CHART_H / gridLineCount) * i;
      const label = Math.round(maxY - (maxY / gridLineCount) * i);
      gridLines.push({ y, label });
    }

    // X labels
    const xLabels = data.map((d, i) => ({
      x: PADDING.left + i * xStep,
      label: d.date || `Day ${i + 1}`,
    }));

    // Limit x labels so they don't overlap
    const maxLabels = 8;
    const labelStep =
      xLabels.length > maxLabels
        ? Math.ceil(xLabels.length / maxLabels)
        : 1;

    return {
      idealPath: `M ${idealPoints}`,
      actualPath: `M ${actualPoints}`,
      gridLines,
      xLabels,
      labelStep,
      actualDots: data.map((d, i) => ({
        cx: PADDING.left + i * xStep,
        cy: PADDING.top + CHART_H - (d.actual ?? 0) * yScale,
      })),
    };
  }, [data]);

  if (!chart) {
    return (
      <GlassCard>
        <div className="mb-3 flex items-center gap-2">
          <TrendingDown size={16} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-[var(--color-fg-muted)]">
            Burndown Chart
          </h3>
        </div>
        <EmptyState
          icon={TrendingDown}
          title="No burndown data"
          description="Start a sprint and track progress to see the burndown chart."
        />
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="mb-3 flex items-center gap-2">
        <TrendingDown size={16} className="text-blue-400" />
        <h3 className="text-sm font-semibold text-[var(--color-fg-muted)]">
          Burndown Chart
        </h3>
      </div>

      {/* Legend */}
      <div className="mb-2 flex items-center gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 rounded bg-[var(--color-fg-muted)]" style={{ strokeDasharray: '4 2' }} />
          <span className="text-[10px] text-[var(--color-fg-muted)]">Ideal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 rounded bg-gradient-to-r from-blue-400 to-cyan-400" />
          <span className="text-[10px] text-[var(--color-fg-muted)]">Actual</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
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

        {/* X-axis labels */}
        {chart.xLabels.map(
          (xl, i) =>
            i % chart.labelStep === 0 && (
              <text
                key={i}
                x={xl.x}
                y={VIEW_HEIGHT - 8}
                textAnchor="middle"
                style={{ fill: 'var(--th-text-muted)' }}
                fontSize={9}
                fontFamily="Inter, system-ui, sans-serif"
              >
                {xl.label}
              </text>
            )
        )}

        {/* Ideal line (dashed) */}
        <path
          d={chart.idealPath}
          fill="none"
          style={{ stroke: 'var(--th-text-faint)' }}
          strokeWidth={1.5}
          strokeDasharray="6 3"
        />

        {/* Actual line with gradient */}
        <defs>
          <linearGradient id="burndown-line-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="burndown-fill-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(59,130,246,0.15)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0)" />
          </linearGradient>
        </defs>

        {/* Fill area under actual line */}
        <path
          d={`${chart.actualPath} L ${PADDING.left + (data.length - 1) * (CHART_W / Math.max(data.length - 1, 1))},${PADDING.top + CHART_H} L ${PADDING.left},${PADDING.top + CHART_H} Z`}
          fill="url(#burndown-fill-grad)"
        />

        {/* Actual line */}
        <path
          d={chart.actualPath}
          fill="none"
          stroke="url(#burndown-line-grad)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots on actual line */}
        {chart.actualDots.map((dot, i) => (
          <circle
            key={i}
            cx={dot.cx}
            cy={dot.cy}
            r={3}
            style={{ fill: 'var(--th-bg)' }}
            stroke="url(#burndown-line-grad)"
            strokeWidth={1.5}
          />
        ))}

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
