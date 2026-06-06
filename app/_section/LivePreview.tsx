"use client";

import type { CSSProperties } from "react";
import type { ChartState } from "../types";
import { buildChartData, chartPalette, chartSummary, clampCount, formatChartValue } from "../_utils/chartModel";

function shell(state: ChartState): CSSProperties {
  return { width: state.width, minHeight: state.height, padding: state.padding, gap: state.gap, borderRadius: state.radius, border: `${state.borderWidth}px solid ${state.border}`, boxShadow: `0 ${Math.round(state.shadow / 3)}px ${state.shadow}px rgba(0,0,0,.28)`, background: state.background, color: state.foreground, fontFamily: state.fontFamily, opacity: state.disabled ? 0.55 : 1 };
}

export default function LivePreview({ state }: { state: ChartState }) {
  const data = buildChartData(state);
  const summary = chartSummary(state, data);
  const describedBy = `${state.id}-description`;
  const panel = shell(state);

  return (
    <section id={state.id} role="img" aria-label={state.ariaLabel} aria-describedby={describedBy} tabIndex={state.tabIndex} style={panel} className="relative grid overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 style={{ fontSize: state.titleSize, fontWeight: state.fontWeight }}>{state.title}</h3>
          <p className="mt-1" style={{ color: state.muted, fontSize: state.bodySize }}>{state.description}</p>
        </div>
        <span className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em]" style={{ borderColor: state.border, color: state.accent }}>{state.chartType}</span>
      </div>
      <p id={describedBy} className="sr-only">{state.ariaDescription || summary}</p>
      <ChartBody state={state} data={data} />
      <p className="text-xs" style={{ color: state.muted }}>{state.helper} {summary}</p>
      <StateOverlay state={state} />
    </section>
  );
}

function ChartBody({ state, data }: { state: ChartState; data: ReturnType<typeof buildChartData> }) {
  if (state.previewState === "loading") return <div className="grid min-h-48 place-items-center rounded-3xl border" style={{ borderColor: state.border, color: state.muted }}>Loading chart data...</div>;
  if (state.previewState === "error") return <div className="grid min-h-48 place-items-center rounded-3xl border" style={{ borderColor: state.border, color: "#fca5a5" }}>Unable to load chart data.</div>;
  if (data.length === 0) return <div className="grid min-h-48 place-items-center rounded-3xl border border-dashed" style={{ borderColor: state.border, color: state.muted }}>No data points to display.</div>;

  return (
    <div className="grid gap-4">
      {state.showLegend ? <Legend state={state} /> : null}
      {state.chartType === "bar" ? <BarChart state={state} data={data} /> : null}
      {state.chartType === "line" ? <LineChart state={state} data={data} /> : null}
      {state.chartType === "donut" ? <DonutChart state={state} data={data} /> : null}
      {state.showTooltip && ["hover", "focus", "active"].includes(state.previewState) ? <TooltipPreview state={state} datum={data[0]} /> : null}
    </div>
  );
}

function Legend({ state }: { state: ChartState }) {
  const palette = chartPalette(state.accent);
  const count = state.chartType === "donut" ? 1 : clampCount(state.seriesCount, 1, 4);

  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }, (_, index) => (
        <span key={index} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs" style={{ borderColor: state.border, color: state.foreground }}>
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: palette[index % palette.length] }} />
          {count > 1 ? `Series ${index + 1}` : state.label}
        </span>
      ))}
    </div>
  );
}

function BarChart({ state, data }: { state: ChartState; data: ReturnType<typeof buildChartData> }) {
  const max = Math.max(...data.map((datum) => datum.value));

  return (
    <div className="grid gap-3">
      <div className="flex min-h-48 items-end gap-3 rounded-3xl border p-4" style={{ borderColor: state.border, background: state.showGrid ? "linear-gradient(to top, rgba(148,163,184,.14) 1px, transparent 1px) 0 0 / 100% 25%" : "transparent" }}>
        {data.map((datum) => (
          <div key={`${datum.label}-${datum.series}`} className="grid flex-1 content-end gap-2 text-center">
            <span className="text-[11px] font-semibold" style={{ color: state.foreground }}>{formatChartValue(datum.value, state.valueFormat)}</span>
            <div className="mx-auto w-full max-w-12 rounded-t-2xl" style={{ height: `${Math.max(16, (datum.value / max) * 150)}px`, background: datum.color }} />
          </div>
        ))}
      </div>
      <AxisLabels state={state} labels={data.map((datum) => datum.shortLabel)} />
    </div>
  );
}

function LineChart({ state, data }: { state: ChartState; data: ReturnType<typeof buildChartData> }) {
  const max = Math.max(...data.map((datum) => datum.value));
  const width = 560;
  const height = 180;
  const points = data.map((datum, index) => {
    const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
    const y = height - (datum.value / max) * (height - 20) + 10;
    return { ...datum, x, y };
  });

  return (
    <div className="grid gap-3">
      <svg viewBox={`0 0 ${width} ${height + 34}`} className="min-h-48 w-full rounded-3xl border p-3" style={{ borderColor: state.border, background: state.showGrid ? "linear-gradient(to top, rgba(148,163,184,.14) 1px, transparent 1px) 0 0 / 100% 25%" : "transparent" }} aria-hidden="true">
        <polyline fill="none" stroke={state.accent} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" points={points.map((point) => `${point.x},${point.y}`).join(" ")} />
        {points.map((point) => (
          <g key={`${point.label}-${point.series}`}>
            <circle cx={point.x} cy={point.y} r="6" fill={point.color} stroke={state.background} strokeWidth="3" />
            <text x={point.x} y={Math.max(12, point.y - 12)} textAnchor="middle" fontSize="20" fill={state.foreground}>{formatChartValue(point.value, state.valueFormat)}</text>
            <text x={point.x} y={height + 28} textAnchor="middle" fontSize="18" fill={state.muted}>{point.shortLabel}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function DonutChart({ state, data }: { state: ChartState; data: ReturnType<typeof buildChartData> }) {
  const total = data.reduce((sum, datum) => sum + datum.value, 0);
  const segments = data.map((datum, index) => {
    const start = 25 + data.slice(0, index).reduce((sum, item) => sum + (item.value / total) * 100, 0);
    const end = start + (datum.value / total) * 100;
    return `${datum.color} ${start}% ${end}%`;
  }).join(", ");

  return (
    <div className="grid gap-4 sm:grid-cols-[220px_1fr] sm:items-center">
      <div className="relative mx-auto h-52 w-52 rounded-full" style={{ background: `conic-gradient(${segments})` }}>
        <div className="absolute inset-10 grid place-items-center rounded-full text-center" style={{ background: state.background }}>
          <strong style={{ fontSize: state.titleSize }}>{formatChartValue(total, state.valueFormat)}</strong>
          <span className="text-xs" style={{ color: state.muted }}>total</span>
        </div>
      </div>
      <div className="grid gap-2">
        {data.map((datum) => (
          <div key={datum.label} className="flex items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-sm" style={{ borderColor: state.border }}>
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: datum.color }} />{datum.shortLabel}</span>
            <strong>{formatChartValue(datum.value, state.valueFormat)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function AxisLabels({ state, labels }: { state: ChartState; labels: string[] }) {
  return <div className="flex justify-between gap-2 text-[11px] uppercase tracking-[0.12em]" style={{ color: state.muted }}>{labels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}</div>;
}

function TooltipPreview({ state, datum }: { state: ChartState; datum: ReturnType<typeof buildChartData>[number] }) {
  return <div className="w-fit rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: state.border, background: state.background, color: state.foreground }}><strong>{datum.label}</strong><p style={{ color: state.muted }}>{datum.series}: {formatChartValue(datum.value, state.valueFormat)}</p></div>;
}

function StateOverlay({ state }: { state: ChartState }) {
  if (state.previewState !== "success") return null;
  return <div className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: state.accent, color: state.background }}>Live data</div>;
}
