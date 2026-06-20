"use client";

import type { CSSProperties } from "react";
import type { ChartState } from "../types";
import { SYSTEM_FONTS } from "@/components/shared/typography/fontConstants";
import { ensureReadable, solidBg } from "@/components/shared/color/wcag";
import { buildChartData, chartPalette, chartSummary, clampCount, formatChartValue } from "../_utils/chartModel";

function resolveFont(state: { fontBucket: "system" | "google"; googleFontFamily: string; systemFontIdx: number }): string {
  return state.fontBucket === "google"
    ? `"${state.googleFontFamily}", sans-serif`
    : (SYSTEM_FONTS[state.systemFontIdx]?.css ?? "inherit");
}

function buildShadow(state: { shadowEnabled: boolean; shadowX: number; shadowY: number; shadowBlur: number; shadowSpread: number; shadowColor: string; shadowOpacity: number }): string {
  if (!state.shadowEnabled) return "none";
  const hex = Math.round(state.shadowOpacity * 255).toString(16).padStart(2, "0");
  return `${state.shadowX}px ${state.shadowY}px ${state.shadowBlur}px ${state.shadowSpread}px ${state.shadowColor}${hex}`;
}

function buildRadius(state: { radiusLinked: boolean; radius: number; radiusTL: number; radiusTR: number; radiusBR: number; radiusBL: number }): string {
  return state.radiusLinked
    ? `${state.radius}px`
    : `${state.radiusTL}px ${state.radiusTR}px ${state.radiusBR}px ${state.radiusBL}px`;
}

function hexAlpha(hex: string, alpha: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  return hex + Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, "0");
}

function gridBackground(state: ChartState): string {
  if (!state.showGrid) return "transparent";
  return `linear-gradient(to top, ${hexAlpha(state.gridColor, state.gridOpacity)} 1px, transparent 1px) 0 0 / 100% 25%`;
}

function dashArray(style: ChartState["gridStyle"]): string | undefined {
  if (style === "dashed") return "6 4";
  if (style === "dotted") return "1 4";
  return undefined;
}

function shell(state: ChartState): CSSProperties {
  return { width: state.width, minHeight: state.height, padding: state.padding, gap: state.gap, borderRadius: buildRadius(state), border: `${state.borderWidth}px ${state.borderStyle} ${state.disabled && state.disabledUseCustomColors ? state.disabledBorder : state.border}`, boxShadow: buildShadow(state), background: state.disabled && state.disabledUseCustomColors ? state.disabledBg : state.background, color: state.foreground, fontFamily: resolveFont(state),
    fontStyle: state.fontStyle,
    textTransform: state.textTransform,
    textDecoration: state.textDecoration,
    letterSpacing: `${state.letterSpacing}${state.letterSpacingUnit}`,
    lineHeight: state.lineHeight, opacity: state.disabled ? 0.55 : 1 };
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
      {state.showLegend && state.legendPosition === "top" ? <Legend state={state} /> : null}
      {state.chartType === "bar" ? <BarChart state={state} data={data} /> : null}
      {state.chartType === "line" ? <LineChart state={state} data={data} /> : null}
      {state.chartType === "donut" ? <DonutChart state={state} data={data} /> : null}
      {state.showLegend && state.legendPosition === "bottom" ? <Legend state={state} /> : null}
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
        <span key={index} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs" style={{ background: state.legendBg, borderColor: state.legendBorder, color: ensureReadable(state.legendText, solidBg(state.legendBg, state.background)) }}>
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
      {state.yAxisLabel ? <span className="text-[11px] uppercase tracking-[0.12em]" style={{ color: state.labelColor }}>{state.yAxisLabel}</span> : null}
      <div className="flex min-h-48 items-end rounded-3xl border p-4" style={{ gap: state.barGap, borderColor: state.border, background: state.chartBg !== "transparent" ? state.chartBg : gridBackground(state) }}>
        {data.map((datum) => (
          <div key={`${datum.label}-${datum.series}`} className="grid flex-1 content-end gap-2 text-center">
            <span className="font-semibold" style={{ color: state.labelColor, fontSize: state.labelSize }}>{formatChartValue(datum.value, state.valueFormat)}</span>
            <div className="mx-auto w-full max-w-12" style={{ height: `${Math.max(16, (datum.value / max) * 150)}px`, borderTopLeftRadius: state.barRadius, borderTopRightRadius: state.barRadius, background: datum.color, transition: state.transitionDuration > 0 ? `height ${state.animationDuration}ms ease, width ${state.animationDuration}ms ease` : "none" }} />
          </div>
        ))}
      </div>
      <AxisLabels state={state} labels={data.map((datum) => datum.shortLabel)} />
      {state.xAxisLabel ? <span className="text-center text-[11px] uppercase tracking-[0.12em]" style={{ color: state.labelColor }}>{state.xAxisLabel}</span> : null}
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

  const gridLine = hexAlpha(state.gridColor, state.gridOpacity);
  return (
    <div className="grid gap-3">
      {state.yAxisLabel ? <span className="text-[11px] uppercase tracking-[0.12em]" style={{ color: state.labelColor }}>{state.yAxisLabel}</span> : null}
      <svg viewBox={`0 0 ${width} ${height + 34}`} className="min-h-48 w-full rounded-3xl border p-3" style={{ borderColor: state.border, background: state.chartBg !== "transparent" ? state.chartBg : "transparent" }} aria-hidden="true">
        {state.showGrid ? [0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <line key={frac} x1={0} x2={width} y1={height * frac + 10} y2={height * frac + 10} stroke={gridLine} strokeWidth={1} strokeDasharray={dashArray(state.gridStyle)} />
        )) : null}
        <polyline fill="none" stroke={state.accent} strokeWidth={state.lineWidth} strokeLinecap="round" strokeLinejoin="round" points={points.map((point) => `${point.x},${point.y}`).join(" ")} />
        {points.map((point) => (
          <g key={`${point.label}-${point.series}`}>
            <circle cx={point.x} cy={point.y} r={state.pointSize} fill={point.color} stroke={state.pointColor} strokeWidth="3" />
            <text x={point.x} y={Math.max(12, point.y - 12)} textAnchor="middle" fontSize={state.labelSize + 8} fill={state.labelColor}>{formatChartValue(point.value, state.valueFormat)}</text>
            <text x={point.x} y={height + 28} textAnchor="middle" fontSize="18" fill={state.muted}>{point.shortLabel}</text>
          </g>
        ))}
      </svg>
      {state.xAxisLabel ? <span className="text-center text-[11px] uppercase tracking-[0.12em]" style={{ color: state.labelColor }}>{state.xAxisLabel}</span> : null}
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
        <div className="absolute grid place-items-center rounded-full text-center" style={{ inset: state.donutThickness, background: state.chartBg !== "transparent" ? state.chartBg : state.background }}>
          <strong style={{ fontSize: state.titleSize }}>{formatChartValue(total, state.valueFormat)}</strong>
          <span className="text-xs" style={{ color: state.muted }}>{state.donutCenterText}</span>
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
  return <div className="w-fit border px-4 py-3 text-sm" style={{ borderRadius: state.tooltipRadius, borderColor: state.tooltipBorder, background: state.tooltipBg, color: state.tooltipText }}><strong>{datum.label}</strong><p style={{ color: state.tooltipText, opacity: 0.75 }}>{datum.series}: {formatChartValue(datum.value, state.valueFormat)}</p></div>;
}

function StateOverlay({ state }: { state: ChartState }) {
  if (state.previewState !== "success") return null;
  return <div className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: state.accent, color: state.background }}>Live data</div>;
}
