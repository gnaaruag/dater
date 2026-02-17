"use client";

import { useMemo } from "react";
import type { Dater } from "@/lib/types";

interface Props {
  dater: Dater;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  // 0=Sun, convert to Mon=0
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function formatMonthYear(year: number, month: number) {
  return new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const DAY_LABELS = ["mo", "tu", "we", "th", "fr", "sa", "su"];

export default function CalendarView({ dater }: Props) {
  const startDate = new Date(dater.startDate + "T00:00:00");
  const endDate = new Date(dater.endDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayStr = toDateStr(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  // Compute list of months to render
  const months = useMemo(() => {
    const result: { year: number; month: number }[] = [];

    // For monthly recurring daters OR anchor day daters, show only current month context (prev, current, next 2)
    const isMonthlyRecurring = dater.recurring && dater.intervalUnit === "months";
    const isAnchorDay = dater.anchorDay;

    if (isMonthlyRecurring || isAnchorDay) {
      const todayY = today.getFullYear();
      const todayM = today.getMonth();

      // Current month
      result.push({ year: todayY, month: todayM });

      // Next month
      let next1Y = todayY;
      let next1M = todayM + 1;
      if (next1M > 11) {
        next1M = 0;
        next1Y++;
      }
      result.push({ year: next1Y, month: next1M });

      // Next month + 1
      let next2Y = next1Y;
      let next2M = next1M + 1;
      if (next2M > 11) {
        next2M = 0;
        next2Y++;
      }
      result.push({ year: next2Y, month: next2M });

      // Previous month (shown last)
      let prevY = todayY;
      let prevM = todayM - 1;
      if (prevM < 0) {
        prevM = 11;
        prevY--;
      }
      result.push({ year: prevY, month: prevM });

      return result;
    }

    // For other daters, show all months in range
    let y = startDate.getFullYear();
    let m = startDate.getMonth();
    const endY = endDate.getFullYear();
    const endM = endDate.getMonth();

    while (y < endY || (y === endY && m <= endM)) {
      result.push({ year: y, month: m });
      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
    }
    return result;
  }, [dater.recurring, dater.intervalUnit, dater.anchorDay, startDate.getTime(), endDate.getTime(), today.getTime()]);

  return (
    <div className="px-4 pb-4">
      {months.map(({ year, month }) => (
        <MonthGrid
          key={`${year}-${month}`}
          year={year}
          month={month}
          startDate={dater.startDate}
          endDate={dater.endDate}
          todayStr={todayStr}
          color={dater.color}
          anchorDay={dater.anchorDay}
          anchorDayValue={dater.anchorDayValue}
        />
      ))}
    </div>
  );
}

function MonthGrid({
  year,
  month,
  startDate,
  endDate,
  todayStr,
  color,
  anchorDay,
  anchorDayValue,
}: {
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  todayStr: string;
  color: string;
  anchorDay: boolean;
  anchorDayValue?: number;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Calculate which day is the anchor day for this month
  let anchorDayNum: number | null = null;
  if (anchorDay && anchorDayValue !== undefined) {
    if (anchorDayValue > 0) {
      anchorDayNum = Math.min(anchorDayValue, daysInMonth);
    } else {
      // Negative: count from end (-1 = last day)
      anchorDayNum = daysInMonth + anchorDayValue + 1;
      anchorDayNum = Math.max(1, anchorDayNum);
    }
  }

  // Build grid cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad to complete the last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="mb-6">
      <p className="text-center text-lg font-semibold mb-2 text-ink/70">
        {formatMonthYear(year, month)}
      </p>
      {/* Day labels */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-medium text-ink/35 py-1"
          >
            {label}
          </div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={i} className="aspect-square" />;
          }

          const dateStr = toDateStr(year, month, day);
          const isStart = dateStr === startDate;
          const isEnd = dateStr === endDate;
          const isToday = dateStr === todayStr;
          const isAnchorDay = anchorDayNum !== null && day === anchorDayNum;
          const inRange = dateStr >= startDate && dateStr <= endDate;

          let bgStyle: React.CSSProperties = {};
          let textClass = "text-ink/30";
          let ring = "";

          // Anchor day styling takes priority
          if (isAnchorDay) {
            bgStyle = { backgroundColor: color };
            textClass = "text-white font-bold";
          } else if (isStart || isEnd) {
            bgStyle = { backgroundColor: color };
            textClass = "text-white font-bold";
          } else if (inRange) {
            bgStyle = { backgroundColor: color + "20" };
            textClass = "text-ink/70 font-medium";
          }

          if (isToday) {
            ring = `2.5px solid ${color}`;
            if (!isStart && !isEnd && !isAnchorDay) {
              textClass = "text-ink font-bold";
            }
          }

          return (
            <div
              key={i}
              className="aspect-square flex items-center justify-center relative"
            >
              <div
                className="w-9 h-9 flex items-center justify-center rounded-full text-sm"
                style={{
                  ...bgStyle,
                  border: ring || undefined,
                }}
              >
                <span className={textClass}>{day}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
