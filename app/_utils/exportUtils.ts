import type { ChartState } from "../types";

export type ExportPayload = { fileName: string; mimeType: "text/plain;charset=utf-8"; content: string };

export function buildExportPayload(state: ChartState, fileName = "chart") : ExportPayload {
  return { fileName: `${fileName || "chart"}.jsx`, mimeType: "text/plain;charset=utf-8", content: buildReactCode(state) };
}

export function buildReactCode(state: ChartState) {
  return `import * as React from "react";

const state = ${JSON.stringify(state, null, 2)};

function clampCount(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function chartPalette(accent) {
  return [accent, "#f97316", "#22c55e", "#eab308", "#a855f7", "#14b8a6", "#ec4899", "#64748b"];
}

function buildChartData(config) {
  const dataPoints = config.previewState === "empty" ? 0 : clampCount(config.dataPoints, 0, 12);
  const seriesCount = config.chartType === "donut" ? 1 : clampCount(config.seriesCount, 1, 4);
  const palette = chartPalette(config.accent);
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return Array.from({ length: dataPoints }, (_, index) => {
    const seriesIndex = index % seriesCount;
    const trend = 38 + ((index * 17 + seriesIndex * 23) % 64);
    const value = config.valueFormat === "percent" ? Math.min(98, trend) : trend * (seriesIndex + 1);

    return {
      label: \`\${labels[index % labels.length]} \${config.label}\`,
      shortLabel: labels[index % labels.length],
      value,
      series: seriesCount > 1 ? \`Series \${seriesIndex + 1}\` : config.label,
      color: palette[seriesIndex % palette.length],
    };
  });
}

function formatChartValue(value, format) {
  if (format === "percent") return \`\${Math.round(value)}%\`;
  if (format === "compact") return value >= 100 ? \`\${Math.round(value / 10) / 10}k\` : \`\${Math.round(value)}\`;
  return new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(value);
}

function chartSummary(config, data) {
  if (config.previewState === "loading") return "Chart data is loading.";
  if (config.previewState === "error") return "Chart data could not be loaded.";
  if (data.length === 0) return "No data points are available.";

  const values = data.map((datum) => datum.value);
  const total = values.reduce((sum, value) => sum + value, 0);
  const max = Math.max(...values);
  const min = Math.min(...values);

  return \`\${config.chartType} chart with \${data.length} data points across \${config.chartType === "donut" ? 1 : clampCount(config.seriesCount, 1, 4)} series. Values range from \${formatChartValue(min, config.valueFormat)} to \${formatChartValue(max, config.valueFormat)} with total \${formatChartValue(total, config.valueFormat)}.\`;
}

function Legend({ config }) {
  const palette = chartPalette(config.accent);
  const count = config.chartType === "donut" ? 1 : clampCount(config.seriesCount, 1, 4);
  const items = Array.from({ length: count }, (_, index) => count > 1 ? \`Series \${index + 1}\` : config.label);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map((item, index) => (
        <span key={item} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: \`1px solid \${config.border}\`, borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: palette[index % palette.length] }} />
          {item}
        </span>
      ))}
    </div>
  );
}

function BarChart({ config, data }) {
  const max = Math.max(...data.map((datum) => datum.value));

  return (
    <div>
      <div style={{ minHeight: 192, display: "flex", alignItems: "end", gap: 12, border: \`1px solid \${config.border}\`, borderRadius: 24, padding: 16, background: config.showGrid ? "linear-gradient(to top, rgba(148,163,184,.14) 1px, transparent 1px) 0 0 / 100% 25%" : "transparent" }}>
        {data.map((datum) => (
          <div key={\`\${datum.label}-\${datum.series}\`} style={{ flex: 1, display: "grid", alignContent: "end", gap: 8, textAlign: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700 }}>{formatChartValue(datum.value, config.valueFormat)}</span>
            <div style={{ height: Math.max(16, (datum.value / max) * 150), borderRadius: "14px 14px 0 0", background: datum.color, transition: config.motion ? "height 0.4s ease, width 0.4s ease" : "none" }} />
          </div>
        ))}
      </div>
      <AxisLabels config={config} labels={data.map((datum) => datum.shortLabel)} />
    </div>
  );
}

function LineChart({ config, data }) {
  const max = Math.max(...data.map((datum) => datum.value));
  const width = 560;
  const height = 180;
  const points = data.map((datum, index) => {
    const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
    const y = height - (datum.value / max) * (height - 20) + 10;
    return { ...datum, x, y };
  });

  return (
    <svg viewBox={\`0 0 \${width} \${height + 34}\`} style={{ minHeight: 192, width: "100%", border: \`1px solid \${config.border}\`, borderRadius: 24, padding: 12, background: config.showGrid ? "linear-gradient(to top, rgba(148,163,184,.14) 1px, transparent 1px) 0 0 / 100% 25%" : "transparent" }} aria-hidden="true">
      <polyline fill="none" stroke={config.accent} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" points={points.map((point) => \`\${point.x},\${point.y}\`).join(" ")} />
      {points.map((point) => (
        <g key={\`\${point.label}-\${point.series}\`}>
          <circle cx={point.x} cy={point.y} r="6" fill={point.color} stroke={config.background} strokeWidth="3" />
          <text x={point.x} y={Math.max(12, point.y - 12)} textAnchor="middle" fontSize="20" fill={config.foreground}>{formatChartValue(point.value, config.valueFormat)}</text>
          <text x={point.x} y={height + 28} textAnchor="middle" fontSize="18" fill={config.muted}>{point.shortLabel}</text>
        </g>
      ))}
    </svg>
  );
}

function DonutChart({ config, data }) {
  const total = data.reduce((sum, datum) => sum + datum.value, 0);
  let offset = 25;
  const segments = data.map((datum) => {
    const start = offset;
    const size = (datum.value / total) * 100;
    offset += size;
    return \`\${datum.color} \${start}% \${offset}%\`;
  }).join(", ");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(180px, 220px) 1fr", alignItems: "center", gap: 24 }}>
      <div style={{ position: "relative", width: 208, height: 208, borderRadius: 999, background: \`conic-gradient(\${segments})\` }}>
        <div style={{ position: "absolute", inset: 40, display: "grid", placeItems: "center", textAlign: "center", borderRadius: 999, background: config.background }}>
          <strong style={{ fontSize: config.titleSize }}>{formatChartValue(total, config.valueFormat)}</strong>
          <span style={{ fontSize: 12, color: config.muted }}>total</span>
        </div>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {data.map((datum) => (
          <div key={datum.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, border: \`1px solid \${config.border}\`, borderRadius: 16, padding: "8px 12px", fontSize: 14 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: 999, background: datum.color }} />{datum.shortLabel}</span>
            <strong>{formatChartValue(datum.value, config.valueFormat)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function AxisLabels({ config, labels }) {
  return <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 10, color: config.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>{labels.map((label, index) => <span key={\`\${label}-\${index}\`}>{label}</span>)}</div>;
}

function TooltipPreview({ config, datum }) {
  return <div style={{ width: "fit-content", border: \`1px solid \${config.border}\`, borderRadius: 16, padding: "10px 14px", background: config.background, color: config.foreground, fontSize: 14 }}><strong>{datum.label}</strong><p style={{ margin: "4px 0 0", color: config.muted }}>{datum.series}: {formatChartValue(datum.value, config.valueFormat)}</p></div>;
}

function ChartBody({ config, data }) {
  if (config.previewState === "loading") return <div style={{ minHeight: 192, display: "grid", placeItems: "center", border: \`1px solid \${config.border}\`, borderRadius: 24, color: config.muted }}>Loading chart data...</div>;
  if (config.previewState === "error") return <div style={{ minHeight: 192, display: "grid", placeItems: "center", border: \`1px solid \${config.border}\`, borderRadius: 24, color: "#fca5a5" }}>Unable to load chart data.</div>;
  if (data.length === 0) return <div style={{ minHeight: 192, display: "grid", placeItems: "center", border: \`1px dashed \${config.border}\`, borderRadius: 24, color: config.muted }}>No data points to display.</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {config.showLegend ? <Legend config={config} /> : null}
      {config.chartType === "bar" ? <BarChart config={config} data={data} /> : null}
      {config.chartType === "line" ? <LineChart config={config} data={data} /> : null}
      {config.chartType === "donut" ? <DonutChart config={config} data={data} /> : null}
      {config.showTooltip && ["hover", "focus", "active"].includes(config.previewState) ? <TooltipPreview config={config} datum={data[0]} /> : null}
    </div>
  );
}

export default function ChartComponent() {
  const data = buildChartData(state);
  const summary = chartSummary(state, data);
  const describedBy = \`\${state.id}-description\`;

  return (
    <section
      id={state.id}
      role="img"
      aria-label={state.ariaLabel}
      aria-describedby={describedBy}
      tabIndex={state.tabIndex}
      style={{
        position: "relative",
        display: "grid",
        gap: state.gap,
        width: state.width,
        minHeight: state.height,
        padding: state.padding,
        borderRadius: state.radius,
        border: \`\${state.borderWidth}px solid \${state.border}\`,
        boxShadow: \`0 \${Math.round(state.shadow / 3)}px \${state.shadow}px rgba(0,0,0,.28)\`,
        background: state.background,
        color: state.foreground,
        fontFamily: state.fontFamily,
        opacity: state.disabled ? 0.55 : 1,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: state.titleSize, fontWeight: state.fontWeight }}>{state.title}</h3>
          <p style={{ margin: "6px 0 0", color: state.muted, fontSize: state.bodySize }}>{state.description}</p>
        </div>
        <span style={{ border: \`1px solid \${state.border}\`, borderRadius: 999, padding: "4px 10px", color: state.accent, fontSize: 12, textTransform: "uppercase", letterSpacing: ".14em" }}>{state.chartType}</span>
      </div>
      <p id={describedBy} style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>{state.ariaDescription || summary}</p>
      <ChartBody config={state} data={data} />
      <p style={{ margin: 0, color: state.muted, fontSize: 12 }}>{state.helper} {summary}</p>
      {state.previewState === "success" ? <div style={{ position: "absolute", right: 16, top: 16, borderRadius: 999, padding: "4px 10px", background: state.accent, color: state.background, fontSize: 12, fontWeight: 700 }}>Live data</div> : null}
    </section>
  );
}
`;
}
