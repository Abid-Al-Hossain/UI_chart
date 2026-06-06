import type { ChartState } from "../types";

export type ChartDatum = {
  label: string;
  shortLabel: string;
  value: number;
  series: string;
  color: string;
};

export const CHART_TYPE_OPTIONS: ChartState["chartType"][] = ["bar", "line", "donut"];
export const VALUE_FORMAT_OPTIONS: ChartState["valueFormat"][] = ["number", "compact", "percent"];
export const CHART_PREVIEW_STATES: ChartState["previewState"][] = ["default", "hover", "focus", "loading", "empty", "error", "success"];

export function clampCount(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function chartPalette(accent: string) {
  return [accent, "#f97316", "#22c55e", "#eab308", "#a855f7", "#14b8a6", "#ec4899", "#64748b"];
}

export function buildChartData(state: ChartState): ChartDatum[] {
  const dataPoints = state.previewState === "empty" ? 0 : clampCount(state.dataPoints, 0, 12);
  const seriesCount = state.chartType === "donut" ? 1 : clampCount(state.seriesCount, 1, 4);
  const palette = chartPalette(state.accent);
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return Array.from({ length: dataPoints }, (_, index) => {
    const seriesIndex = index % seriesCount;
    const trend = 38 + ((index * 17 + seriesIndex * 23) % 64);
    const value = state.valueFormat === "percent" ? Math.min(98, trend) : trend * (seriesIndex + 1);

    return {
      label: `${labels[index % labels.length]} ${state.label}`,
      shortLabel: labels[index % labels.length],
      value,
      series: seriesCount > 1 ? `Series ${seriesIndex + 1}` : state.label,
      color: palette[seriesIndex % palette.length],
    };
  });
}

export function formatChartValue(value: number, format: ChartState["valueFormat"]) {
  if (format === "percent") return `${Math.round(value)}%`;
  if (format === "compact") return value >= 100 ? `${Math.round(value / 10) / 10}k` : `${Math.round(value)}`;
  return new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(value);
}

export function chartSummary(state: ChartState, data = buildChartData(state)) {
  if (state.previewState === "loading") return "Chart data is loading.";
  if (state.previewState === "error") return "Chart data could not be loaded.";
  if (data.length === 0) return "No data points are available.";

  const values = data.map((datum) => datum.value);
  const total = values.reduce((sum, value) => sum + value, 0);
  const max = Math.max(...values);
  const min = Math.min(...values);

  return `${state.chartType} chart with ${data.length} data points across ${state.chartType === "donut" ? 1 : clampCount(state.seriesCount, 1, 4)} series. Values range from ${formatChartValue(min, state.valueFormat)} to ${formatChartValue(max, state.valueFormat)} with total ${formatChartValue(total, state.valueFormat)}.`;
}

