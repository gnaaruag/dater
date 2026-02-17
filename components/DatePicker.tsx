"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  value: string; // YYYY-MM-DD or ""
  onChange: (date: string) => void;
  color: string;
  label: string;
}

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const DAY_LABELS = ["mo", "tu", "we", "th", "fr", "sa", "su"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Mon=0
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatDisplay(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toLowerCase();
}

export default function DatePicker({ value, onChange, color, label }: Props) {
  const [open, setOpen] = useState(false);

  // Calendar view state
  const today = new Date();
  const initialDate = value ? new Date(value + "T00:00:00") : today;
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Sync view when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value + "T00:00:00");
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  const prevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const prevYear = useCallback(() => {
    setViewYear((y) => y - 1);
  }, []);

  const nextYear = useCallback(() => {
    setViewYear((y) => y + 1);
  }, []);

  function selectDay(day: number) {
    const dateStr = toDateStr(viewYear, viewMonth, day);
    onChange(dateStr);
    setOpen(false);
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div>
      <label className="block text-sm font-semibold text-ink/50 mb-1.5">
        {label}
      </label>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-left px-4 py-2.5 rounded-xl border-[2.5px] border-ink bg-white text-base font-medium transition-all hover:border-ink/60"
        style={value ? { borderColor: color } : {}}
      >
        {value ? formatDisplay(value) : (
          <span className="text-ink/30">pick a date</span>
        )}
      </button>

      {/* Calendar modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-ink/20 animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-cream rounded-2xl border-[2.5px] border-ink p-5 max-w-xs w-full mx-4 animate-slide-up">
            {/* Month/year nav */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={prevMonth}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
              <span className="text-base font-bold text-ink">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Year navigation */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <button
                type="button"
                onClick={prevYear}
                className="px-3 py-1 rounded-full text-xs font-semibold text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors"
              >
                prev year
              </button>
              <button
                type="button"
                onClick={nextYear}
                className="px-3 py-1 rounded-full text-xs font-semibold text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors"
              >
                next year
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_LABELS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-ink/30 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7">
              {cells.map((day, i) => {
                if (day === null) {
                  return <div key={i} className="aspect-square" />;
                }

                const dateStr = toDateStr(viewYear, viewMonth, day);
                const isSelected = dateStr === value;
                const isToday = dateStr === todayStr;

                return (
                  <div key={i} className="aspect-square flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => selectDay(day)}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all"
                      style={{
                        backgroundColor: isSelected ? color : "transparent",
                        color: isSelected ? "white" : "var(--ink)",
                        border: isToday && !isSelected ? `2px solid ${color}` : "2px solid transparent",
                        fontWeight: isSelected || isToday ? 700 : 500,
                        opacity: 1,
                      }}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Today shortcut */}
            <button
              type="button"
              onClick={() => {
                onChange(todayStr);
                setOpen(false);
              }}
              className="mt-3 w-full text-center text-sm font-semibold py-2 rounded-full transition-colors"
              style={{ color }}
            >
              today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
