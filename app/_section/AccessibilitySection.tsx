"use client";

import { SectionCard } from "@/components/shared/layout/SectionCard";
import Input from "@/components/shared/input/Input";
import type { ChartState } from "../types";

type Props = { state: ChartState; update: <K extends keyof ChartState>(key: K, value: ChartState[K]) => void };

export default function AccessibilitySection({ state, update }: Props) {
  return <SectionCard title="Accessibility" subtitle="Accessible name and long description for role img output.">
      <div className="space-y-4"><Input label="Accessible label" value={state.ariaLabel} onChange={(value) => update("ariaLabel", value)} />
<Input label="Accessible description" value={state.ariaDescription} onChange={(value) => update("ariaDescription", value)} /></div>
    </SectionCard>;
}
