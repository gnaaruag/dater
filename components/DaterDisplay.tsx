"use client";

import { PartyPopper, Hourglass, Flame } from "lucide-react";
import type { Dater } from "@/lib/types";

interface Props {
  dater: Dater;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getAnchorDayDate(year: number, month: number, anchorDayValue: number) {
  const daysInMonth = getDaysInMonth(year, month);
  let day: number;

  if (anchorDayValue > 0) {
    day = Math.min(anchorDayValue, daysInMonth);
  } else {
    // Negative: count from end (-1 = last day)
    day = daysInMonth + anchorDayValue + 1;
    day = Math.max(1, day);
  }

  return new Date(year, month, day);
}

export default function DaterDisplay({ dater }: Props) {
  const start = new Date(dater.startDate + "T00:00:00");
  const end = new Date(dater.endDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let totalDays: number;
  let daysLeft: number;
  let elapsed: number;
  let progress: number;

  // Special calculation for anchor day daters
  if (dater.anchorDay && dater.anchorDayValue !== undefined) {
    const anchorValue = dater.anchorDayValue;
    const todayY = today.getFullYear();
    const todayM = today.getMonth();

    // Find next anchor day
    let nextAnchor = getAnchorDayDate(todayY, todayM, anchorValue);

    // If this month's anchor has passed, go to next month
    if (nextAnchor < today) {
      const nextM = todayM === 11 ? 0 : todayM + 1;
      const nextY = todayM === 11 ? todayY + 1 : todayY;
      nextAnchor = getAnchorDayDate(nextY, nextM, anchorValue);
    }

    // Find previous anchor day for this cycle
    const prevM = todayM === 0 ? 11 : todayM - 1;
    const prevY = todayM === 0 ? todayY - 1 : todayY;
    const prevAnchor = getAnchorDayDate(prevY, prevM, anchorValue);

    // Calculate days in this month's cycle
    totalDays = Math.round((nextAnchor.getTime() - prevAnchor.getTime()) / (1000 * 60 * 60 * 24));
    daysLeft = Math.round((nextAnchor.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    elapsed = Math.round((today.getTime() - prevAnchor.getTime()) / (1000 * 60 * 60 * 24));
    progress = totalDays > 0 ? Math.min(1, Math.max(0, elapsed / totalDays)) : 0;
  } else {
    // Normal calculation for non-anchor daters
    totalDays = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    daysLeft = Math.max(
      0,
      Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    );

    elapsed = totalDays - daysLeft;
    progress = totalDays > 0 ? Math.min(1, Math.max(0, elapsed / totalDays)) : 1;
  }

  const isOver = today > end;
  const hasntStarted = today < start;

  return (
    <div className="text-center px-6 py-8">
      {isOver ? (
        <>
          <PartyPopper
            size={36}
            className="mx-auto mb-3"
            style={{ color: dater.color }}
            strokeWidth={1.8}
          />
          <p
            className="text-7xl font-bold leading-none"
            style={{ color: dater.color }}
          >
            done
          </p>
          <p className="text-xl text-ink/50 mt-3">
            {totalDays} days completed
          </p>
        </>
      ) : hasntStarted ? (
        <>
          <Hourglass
            size={32}
            className="mx-auto mb-3"
            style={{ color: dater.color }}
            strokeWidth={1.8}
          />
          <p
            className="text-7xl font-bold leading-none"
            style={{ color: dater.color }}
          >
            {Math.round(
              (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            )}
          </p>
          <p className="text-xl text-ink/50 mt-3">
            days until it begins
          </p>
        </>
      ) : (
        <>
          <Flame
            size={32}
            className="mx-auto mb-2"
            style={{ color: dater.color }}
            strokeWidth={1.8}
          />
          <p
            className="text-8xl font-bold leading-none tracking-tight"
            style={{ color: dater.color }}
          >
            {daysLeft}
          </p>
          <p className="text-xl text-ink/50 mt-3">
            {dater.anchorDay ? "days until anchor" : `days left of ${totalDays}`}
          </p>
        </>
      )}

      {/* Progress bar */}
      {!hasntStarted && (
        <div className="mt-6 mx-auto max-w-xs">
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ backgroundColor: dater.color + "25" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress * 100}%`,
                backgroundColor: dater.color,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
