"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import Slider from "@/components/shared/input/Slider";
import Input from "@/components/shared/input/Input";
import { SegmentedControl } from "@/components/shared/input/SegmentedControl";
import type { ChartState } from "../types";

type Props = { state: ChartState; update: <K extends keyof ChartState>(key: K, value: ChartState[K]) => void };

export default function ItemsSection({ state, update }: Props) {
  return (
    <div className="space-y-4">
      <SectionCard title="Data Shape" subtitle="Control rendered data count and series count.">
      <div className="space-y-4">
        <Slider label="Data points" value={state.dataPoints} min={0} max={12} step={1} onChange={(value) => update("dataPoints", value)} />
        <Slider label="Series count" value={state.seriesCount} min={1} max={4} step={1} disabled={state.chartType === "donut"} onChange={(value) => update("seriesCount", value)} />
        <div className="rounded-2xl border p-4 text-sm" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>Donut charts render one categorical series; bar and line charts support up to four series.</div>
      </div>
    </SectionCard>
      <SectionCard title="Grid & legend" subtitle="Gridline style and legend placement.">
      <div className="space-y-4">
        <Slider label="Grid opacity" value={state.gridOpacity} min={0} max={1} step={0.02} onChange={(value) => update("gridOpacity", value)} />
        <SegmentedControl label="Grid style" value={state.gridStyle} options={[{ label: "Solid", value: "solid" }, { label: "Dashed", value: "dashed" }, { label: "Dotted", value: "dotted" }]} onChange={(value) => update("gridStyle", value as ChartState["gridStyle"])} />
        <SegmentedControl label="Legend position" value={state.legendPosition} options={[{ label: "Top", value: "top" }, { label: "Bottom", value: "bottom" }]} onChange={(value) => update("legendPosition", value as ChartState["legendPosition"])} />
        <Slider label="Label size" value={state.labelSize} min={8} max={20} step={1} onChange={(value) => update("labelSize", value)} />
        <Slider label="Tooltip radius" value={state.tooltipRadius} min={0} max={28} step={1} onChange={(value) => update("tooltipRadius", value)} />
      </div>
    </SectionCard>
      <SectionCard title="Series geometry" subtitle="Bar, line, and donut sizing + motion.">
      <div className="space-y-4">
        <Slider label="Bar radius" value={state.barRadius} min={0} max={28} step={1} onChange={(value) => update("barRadius", value)} />
        <Slider label="Bar gap" value={state.barGap} min={0} max={32} step={1} onChange={(value) => update("barGap", value)} />
        <Slider label="Line width" value={state.lineWidth} min={1} max={12} step={1} onChange={(value) => update("lineWidth", value)} />
        <Slider label="Point size" value={state.pointSize} min={2} max={14} step={1} onChange={(value) => update("pointSize", value)} />
        <Slider label="Donut thickness" value={state.donutThickness} min={10} max={80} step={1} onChange={(value) => update("donutThickness", value)} />
        <Slider label="Animation (ms)" value={state.animationDuration} min={0} max={1200} step={20} onChange={(value) => update("animationDuration", value)} />
      </div>
    </SectionCard>
      <SectionCard title="Axis & donut labels" subtitle="Axis titles and donut center text.">
      <div className="space-y-4">
        <Input label="X-axis label" value={state.xAxisLabel} onChange={(value: string) => update("xAxisLabel", value)} placeholder="e.g. Month" />
        <Input label="Y-axis label" value={state.yAxisLabel} onChange={(value: string) => update("yAxisLabel", value)} placeholder="e.g. Revenue" />
        <Input label="Donut center text" value={state.donutCenterText} onChange={(value: string) => update("donutCenterText", value)} placeholder="total" />
      </div>
    </SectionCard>
    </div>
  );
}
