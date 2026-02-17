"use client";

import { ChevronDown } from "lucide-react";
import type { Dater } from "@/lib/types";

interface Props {
  daters: Dater[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function DaterSelector({ daters, selectedId, onSelect }: Props) {
  if (daters.length === 0) {
    return (
      <div className="text-center py-6 px-4">
        <p className="text-xl text-ink/40 italic">
          no daters yet — tap + to create one
        </p>
      </div>
    );
  }

  const selected = daters.find((d) => d.id === selectedId);

  return (
    <div className="relative px-6 py-4">
      <div className="relative">
        <select
          value={selectedId || ""}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full appearance-none text-center text-xl font-semibold pr-10"
          style={{
            borderColor: selected?.color || "var(--ink)",
          }}
        >
          {daters.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown size={18} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}
