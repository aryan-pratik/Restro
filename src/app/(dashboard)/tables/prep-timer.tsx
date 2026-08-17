"use client";

import { useEffect, useState } from "react";
import { Clock, AlarmClock, UtensilsCrossed } from "lucide-react";

export interface KitchenProgress {
  status: "ACCEPTED" | "PREPARING" | "READY";
  estimatedReadyAt: Date | string | null;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(Math.abs(ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PrepTimer({ progress }: { progress: KitchenProgress }) {
  const target = progress.estimatedReadyAt ? new Date(progress.estimatedReadyAt).getTime() : null;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (progress.status === "READY") return; // nothing to tick once food is ready
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [progress.status]);

  if (progress.status === "READY") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border bg-green-100 text-green-800 border-green-300">
        <UtensilsCrossed className="w-3 h-3" />
        Ready to Serve
      </span>
    );
  }

  if (target === null) return null;

  const remaining = target - now;
  const isOverdue = remaining <= 0;
  const label = progress.status === "PREPARING" ? "Preparing" : "Accepted";

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
        isOverdue
          ? "bg-red-100 text-red-800 border-red-300"
          : "bg-sky-100 text-sky-800 border-sky-300"
      }`}
    >
      {isOverdue ? <AlarmClock className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {isOverdue ? `Overdue ${formatDuration(remaining)}` : `${label} · Ready in ${formatDuration(remaining)}`}
    </span>
  );
}
