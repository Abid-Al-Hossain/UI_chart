"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import Slider from "@/components/shared/input/Slider";
import type { ChartState } from "../types";

type Props = { state: ChartState; update: <K extends keyof ChartState>(key: K, value: ChartState[K]) => void };

export default function ItemsSection({ state, update }: Props) {
  return <SectionCard title="Data Shape" subtitle="Control rendered data count and series count."><Slider label="Data points" value={state.dataPoints} min={0} max={12} step={1} onChange={(value) => update("dataPoints", value)} />
<Slider label="Series count" value={state.seriesCount} min={1} max={4} step={1} disabled={state.chartType === "donut"} onChange={(value) => update("seriesCount", value)} />
<div className="rounded-2xl border p-4 text-sm" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>Donut charts render one categorical series; bar and line charts support up to four series.</div></SectionCard>;
}
