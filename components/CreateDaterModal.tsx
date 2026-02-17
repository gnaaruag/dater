"use client";

import { useState } from "react";
import { X, Check, Sparkles } from "lucide-react";
import type { Dater } from "@/lib/types";
import { saveDater } from "@/lib/db";
import DatePicker from "./DatePicker";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (dater: Dater) => void;
}

const COLORS = [
  "#e84b8a", // hot pink
  "#f28a2e", // orange
  "#d63c2f", // red
  "#2d8f4e", // green
  "#4a9fd6", // blue
  "#f7c948", // yellow
  "#9b59b6", // purple
  "#1a1a1a", // black
];

const INTERVAL_UNITS = ["days", "weeks", "months", "years"] as const;



export default function CreateDaterModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [intervalValue, setIntervalValue] = useState(1);
  const [intervalUnit, setIntervalUnit] = useState<
    "days" | "weeks" | "months" | "years"
  >("months");
  const [anchorDay, setAnchorDay] = useState(false);
  const [anchorDayValue, setAnchorDayValue] = useState<number | string>(1);

  if (!open) return null;

  function reset() {
    setName("");
    setColor(COLORS[0]);
    setStartDate("");
    setEndDate("");
    setRecurring(false);
    setIntervalValue(1);
    setIntervalUnit("months");
    setAnchorDay(false);
    setAnchorDayValue(1);
  }

  async function handleSave() {
    if (!name.trim()) return;

    // For anchor day, if no dates specified, use sensible defaults
    let finalStartDate = startDate;
    let finalEndDate = endDate;

    if (anchorDay && (!startDate || !endDate)) {
      const currentYear = new Date().getFullYear();
      finalStartDate = startDate || `${currentYear}-01-01`;
      finalEndDate = endDate || `${currentYear + 10}-12-31`; // 10 years from now
    }

    // For non-anchor day, dates are required
    if (!anchorDay && (!finalStartDate || !finalEndDate)) return;

    const dater: Dater = {
      id: crypto.randomUUID(),
      name: name.trim(),
      startDate: finalStartDate,
      endDate: finalEndDate,
      color,
      recurring,
      ...(recurring ? { intervalValue, intervalUnit } : {}),
      anchorDay,
      ...(anchorDay ? { anchorDayValue: Number(anchorDayValue) || 1 } : {}),
      createdAt: new Date().toISOString(),
    };

    await saveDater(dater);
    onCreated(dater);
    reset();
    onClose();
  }

  const canSave = anchorDay
    ? name.trim() && (!startDate || !endDate || endDate >= startDate)
    : name.trim() && startDate && endDate && endDate >= startDate;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/30 animate-fade-in"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative bg-cream w-full max-w-lg rounded-t-2xl border-t-3 border-x-3 border-ink overflow-y-auto max-h-[90vh] animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-ink/20" />
        </div>

        <div className="px-6 pb-8 pt-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">new dater</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Name */}
          <div className="mb-5">
            <label className="block text-md font-semibold text-ink/50 mb-1.5">
              name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. summer break, subscription..."
            />
          </div>

          {/* Color */}
          <div className="mb-5">
            <label className="block text-md font-semibold text-ink/50 mb-1.5">
              color
            </label>
            <div className="flex gap-2.5 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-9 h-9 rounded-full border-2 transition-transform flex items-center justify-center"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "var(--ink)" : "transparent",
                    transform: color === c ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  {color === c && (
                    <Check size={16} strokeWidth={3} className="text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-md font-semibold text-ink/50">
                dates {anchorDay && <span className="text-ink/30 font-normal">(optional)</span>}
              </label>
              {anchorDay && (startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-xs font-medium text-ink/40 hover:text-ink transition-colors"
                >
                  clear both
                </button>
              )}
            </div>
            {anchorDay && (
              <p className="text-xs text-ink/40 mb-2">
                leave blank for recurring around anchor day indefinitely
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  color={color}
                  label="start"
                />
                {anchorDay && startDate && (
                  <button
                    type="button"
                    onClick={() => setStartDate("")}
                    className="absolute top-8 right-2 w-6 h-6 rounded-full flex items-center justify-center text-ink/30 hover:text-ink hover:bg-ink/5 transition-colors"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                )}
              </div>
              <div className="relative">
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  color={color}
                  label="end"
                />
                {anchorDay && endDate && (
                  <button
                    type="button"
                    onClick={() => setEndDate("")}
                    className="absolute top-8 right-2 w-6 h-6 rounded-full flex items-center justify-center text-ink/30 hover:text-ink hover:bg-ink/5 transition-colors"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recurring */}
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setRecurring(!recurring)}
              className="flex items-center gap-2.5 py-1"
            >
              <div
                className="w-5 h-5 rounded-md border-2 border-ink/40 flex items-center justify-center transition-all"
                style={{
                  backgroundColor: recurring ? color : "transparent",
                  borderColor: recurring ? color : undefined,
                }}
              >
                {recurring && (
                  <Check size={12} strokeWidth={3} className="text-white" />
                )}
              </div>
              <span className="text-base font-medium text-ink/60">recurring</span>
            </button>
          </div>

          {recurring && (
            <div className="mb-4 ml-7 flex items-center gap-2">
              <span className="text-sm font-medium text-ink/50">every</span>
              <button
                type="button"
                onClick={() => setIntervalValue(Math.max(1, intervalValue - 1))}
                className="w-7 h-7 rounded-full border-[2px] border-ink/20 flex items-center justify-center text-ink/40 text-base font-bold"
              >
                -
              </button>
              <span className="w-6 text-center text-lg font-bold">{intervalValue}</span>
              <button
                type="button"
                onClick={() => setIntervalValue(intervalValue + 1)}
                className="w-7 h-7 rounded-full border-[2px] border-ink/20 flex items-center justify-center text-ink/40 text-base font-bold"
              >
                +
              </button>
              <div className="flex gap-1.5 ml-1">
                {INTERVAL_UNITS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setIntervalUnit(u)}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold border-[2px] transition-colors"
                    style={{
                      backgroundColor: intervalUnit === u ? color : "transparent",
                      color: intervalUnit === u ? "white" : "var(--ink)",
                      borderColor: intervalUnit === u ? color : "rgba(26,26,26,0.15)",
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Anchor day */}
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setAnchorDay(!anchorDay)}
              className="flex items-center gap-2.5 py-1"
            >
              <div
                className="w-5 h-5 rounded-md border-2 border-ink/40 flex items-center justify-center transition-all"
                style={{
                  backgroundColor: anchorDay ? color : "transparent",
                  borderColor: anchorDay ? color : undefined,
                }}
              >
                {anchorDay && (
                  <Check size={12} strokeWidth={3} className="text-white" />
                )}
              </div>
              <span className="text-base font-medium text-ink/60">anchor day</span>

            </button>
          </div>

          {anchorDay && (
            <div className="mb-4 ml-7 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-ink/60">day:</span>
                <input
                  type="number"
                  value={anchorDayValue}
                  onChange={(e) => setAnchorDayValue(e.target.value)}
                  className="w-20 px-3 py-1.5 rounded-lg border-2 border-ink/15 text-sm font-semibold focus:border-ink/40 focus:outline-none transition-colors text-center"
                />
              </div>
              <p className="text-xs text-ink/40 ml-1">
                (negative numbers count from end of month, e.g. -1 is last day)
              </p>
            </div>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full mt-3 py-3.5 rounded-full border-[2.5px] border-ink text-lg font-bold transition-all disabled:opacity-30 disabled:cursor-default flex items-center justify-center gap-2"
            style={{
              backgroundColor: canSave ? color : "transparent",
              color: canSave ? "white" : "var(--ink)",
            }}
          >
            <Sparkles size={18} strokeWidth={2} />
            create dater
          </button>
        </div>
      </div>
    </div>
  );
}
