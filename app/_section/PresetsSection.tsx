"use client";

import { useMemo, useState } from "react";
import Input from "@/components/shared/input/Input";
import Select from "@/components/shared/input/Select";
import { SectionCard } from "@/components/shared/layout/SectionCard";
import { CHART_PRESETS } from "../_data/ChartPresets";
import type { StudioPreset } from "../types";

const PAGE_SIZE = 6;

export default function PresetsSection({ activePresetId, onApply, onReset }: { activePresetId: string | null; onApply: (preset: StudioPreset) => void; onReset: () => void }) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const [size, setSize] = useState("all");
  const [page, setPage] = useState(0);
  const [surpriseIndex, setSurpriseIndex] = useState(0);
  const families = useMemo(() => ["all", ...Array.from(new Set(CHART_PRESETS.map((preset) => preset.family)))], []);
  const sizes = useMemo(() => ["all", ...Array.from(new Set(CHART_PRESETS.map((preset) => preset.size)))], []);
  const filtered = CHART_PRESETS.filter((preset) => [preset.family, preset.archetype, preset.variant, preset.size, ...preset.tags].join(" ").toLowerCase().includes(query.toLowerCase()) && (family === "all" || preset.family === family) && (size === "all" || preset.size === size));
  const source = filtered.length ? filtered : CHART_PRESETS;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const setFilter = (setter: (value: string) => void) => (value: string) => { setter(value); setPage(0); };
  const handleSurprise = () => {
    const nextIndex = (surpriseIndex + 5) % source.length;
    setSurpriseIndex(nextIndex);
    onApply(source[nextIndex]);
  };

  return <SectionCard title="Presets" subtitle={`${CHART_PRESETS.length} chart-native full-state presets.`}><div className="grid gap-3 sm:grid-cols-3"><Input label="Search presets" value={query} onChange={setFilter(setQuery)} /><Select label="Family" value={family} options={families} onChange={setFilter(setFamily)} /><Select label="Size" value={size} options={sizes} onChange={setFilter(setSize)} /></div><div className="flex flex-wrap gap-2"><button type="button" onClick={handleSurprise} className="rounded-xl border px-4 py-3 text-sm font-semibold" style={{ borderColor: "var(--border)", color: "var(--text)" }}>Surprise me</button><button type="button" onClick={onReset} className="rounded-xl border px-4 py-3 text-sm font-semibold" style={{ borderColor: "var(--border)", color: "var(--text)" }}>Reset default</button></div><div className="grid gap-3">{visible.map((preset) => <button key={preset.id} type="button" onClick={() => onApply(preset)} className="rounded-2xl border p-4 text-left" style={{ borderColor: activePresetId === preset.id ? "var(--primary)" : "var(--border)", background: activePresetId === preset.id ? "color-mix(in oklab, var(--primary) 20%, transparent)" : "color-mix(in oklab, var(--card) 65%, transparent)", color: "var(--text)" }}><strong>{preset.archetype}</strong><span className="ml-2 text-xs uppercase tracking-[0.16em]" style={{ color: "var(--muted)" }}>{preset.variant} / {preset.size}</span><p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{preset.tags.join(", ")}</p></button>)}</div><div className="flex items-center justify-between gap-3 text-sm" style={{ color: "var(--muted)" }}><button type="button" disabled={safePage === 0} onClick={() => setPage((value) => Math.max(0, value - 1))} className="rounded-xl border px-3 py-2 disabled:opacity-50" style={{ borderColor: "var(--border)", color: "var(--text)" }}>Previous</button><span>Page {safePage + 1} of {pageCount}</span><button type="button" disabled={safePage >= pageCount - 1} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))} className="rounded-xl border px-3 py-2 disabled:opacity-50" style={{ borderColor: "var(--border)", color: "var(--text)" }}>Next</button></div></SectionCard>;
}
