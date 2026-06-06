"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import Select from "@/components/shared/input/Select";
import type { ChartState } from "../types";
import { CHART_PREVIEW_STATES } from "../_utils/chartModel";

type Props = { state: ChartState; update: <K extends keyof ChartState>(key: K, value: ChartState[K]) => void };

export default function StatesSection({ state, update }: Props) {
  return <SectionCard title="State Preview" subtitle="Only chart-rendered states are selectable."><Select label="Preview state" value={state.previewState} options={CHART_PREVIEW_STATES} onChange={(value) => update("previewState", value)} /></SectionCard>;
}
