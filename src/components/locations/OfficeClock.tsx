"use client";

// OfficeClock — live local time for one office, ticking every second via the
// IANA time zone. Client-only (renders a placeholder on the server, then
// hydrates) so the real-time clock never causes a hydration mismatch.

import { useEffect, useState } from "react";

export function OfficeClock({
  timeZone,
  className = "",
}: {
  timeZone: string;
  className?: string;
}) {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    if (!timeZone) return;
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [timeZone]);

  return (
    <span
      suppressHydrationWarning
      className={`mono tabular-nums text-[13px] text-(--color-fg) ${className}`}
    >
      {time}
    </span>
  );
}
