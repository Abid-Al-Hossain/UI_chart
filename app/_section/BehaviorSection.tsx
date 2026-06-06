"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import Switch from "@/components/shared/input/Switch";
import type { ChartState } from "../types";

type Props = { state: ChartState; update: <K extends keyof ChartState>(key: K, value: ChartState[K]) => void };

export default function BehaviorSection({ state, update }: Props) {
  return <SectionCard title="Chart Anatomy" subtitle="Toggle only features that preview and export both render."><Switch label="Show legend" checked={state.showLegend} onChange={(value) => update("showLegend", value)} />
<Switch label="Show grid" checked={state.showGrid} onChange={(value) => update("showGrid", value)} />
<Switch label="Show tooltip preview" checked={state.showTooltip} onChange={(value) => update("showTooltip", value)} />
<Switch label="Disabled appearance" checked={state.disabled} onChange={(value) => update("disabled", value)} /></SectionCard>;
}
