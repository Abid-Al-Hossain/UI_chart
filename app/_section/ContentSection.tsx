"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import Select from "@/components/shared/input/Select";
import type { ChartState } from "../types";
import { CHART_TYPE_OPTIONS, VALUE_FORMAT_OPTIONS } from "../_utils/chartModel";

type Props = { state: ChartState; update: <K extends keyof ChartState>(key: K, value: ChartState[K]) => void };

export default function ContentSection({ state, update }: Props) {
  return <SectionCard title="Chart Content" subtitle="Choose an honestly rendered chart variant and value format."><Select label="Chart type" value={state.chartType} options={CHART_TYPE_OPTIONS} onChange={(value) => update("chartType", value)} />
<Select label="Value format" value={state.valueFormat} options={VALUE_FORMAT_OPTIONS} onChange={(value) => update("valueFormat", value)} /></SectionCard>;
}
