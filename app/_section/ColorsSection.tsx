"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import ColorControl from "@/components/shared/color/ColorControl";
import type { ChartState } from "../types";

type Props = { state: ChartState; update: <K extends keyof ChartState>(key: K, value: ChartState[K]) => void };

export default function ColorsSection({ state, update }: Props) {
  return (
    <div className="space-y-4">
      <SectionCard title="Colors" subtitle="Colors controls for native chart generation.">
      <div className="space-y-4">
        <ColorControl label="Accent" value={state.accent} onChange={(value) => update("accent", value)} />
        <ColorControl label="Background" value={state.background} onChange={(value) => update("background", value)} />
        <ColorControl label="Foreground" value={state.foreground} onChange={(value) => update("foreground", value)} />
        <ColorControl label="Muted text" value={state.muted} onChange={(value) => update("muted", value)} />
        <ColorControl label="Chart area" value={state.chartBg} onChange={(value) => update("chartBg", value)} />
      </div>
    </SectionCard>
      <SectionCard title="Grid & labels" subtitle="Gridlines, data labels, and points.">
      <div className="space-y-4">
        <ColorControl label="Grid color" value={state.gridColor} onChange={(value) => update("gridColor", value)} />
        <ColorControl label="Label color" value={state.labelColor} onChange={(value) => update("labelColor", value)} />
        <ColorControl label="Point color" value={state.pointColor} onChange={(value) => update("pointColor", value)} />
      </div>
    </SectionCard>
      <SectionCard title="Legend & tooltip" subtitle="Legend chips and hover tooltip.">
      <div className="space-y-4">
        <ColorControl label="Legend background" value={state.legendBg} onChange={(value) => update("legendBg", value)} />
        <ColorControl label="Legend border" value={state.legendBorder} onChange={(value) => update("legendBorder", value)} />
        <ColorControl label="Legend text" value={state.legendText} onChange={(value) => update("legendText", value)} />
        <ColorControl label="Tooltip background" value={state.tooltipBg} onChange={(value) => update("tooltipBg", value)} />
        <ColorControl label="Tooltip text" value={state.tooltipText} onChange={(value) => update("tooltipText", value)} />
        <ColorControl label="Tooltip border" value={state.tooltipBorder} onChange={(value) => update("tooltipBorder", value)} />
      </div>
    </SectionCard>
    </div>
  );
}
