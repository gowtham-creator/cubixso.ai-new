"use client";

// AIInferenceVis — the "watch one decompose" panel in KineticStack's right half.
//
// Rebuilt (user: the neural-net console "looks very AI slop"). The old panel
// was a generic neural net with invented numbers (92.4%, 0.91 recall, 12ms, a
// fictional model name), which also broke the site's real-claims-only rule.
// It now shows the actual job the section describes, the one Logic Gen does in
// production: a policy paragraph becomes a decision table. Each sentence is
// highlighted, then its rule lands in the table tagged with the sentence it
// came from. The policy text is an illustrative example, not a client's.
//
// No canvas and no RAF: a single interval steps the sequence, and it stops
// while `paused` (off-screen). Reduced motion shows the finished table.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const CLAUSES = [
  {
    text: "Applicants under 25 with less than two years' driving history are referred for manual review.",
    when: "age < 25  AND  history < 2 yrs",
    then: "Refer to manual review",
  },
  {
    text: "Claims above ₹5,00,000 need a second approver.",
    when: "claim > ₹5,00,000",
    then: "Require second approver",
  },
  {
    text: "Policies lapsed for more than 90 days cannot be reinstated online.",
    when: "lapsed > 90 days",
    then: "Block online reinstatement",
  },
];

// Sequence: for each clause, a "reading" beat (sentence highlighted) then a
// "written" beat (its row lands). Then a hold on the finished table, then reset.
const STEP_MS = 1100;
const TOTAL_STEPS = CLAUSES.length * 2 + 3; // + hold

interface AIInferenceVisProps {
  /** Hosted inside a LiquidGlass lens — drop own card chrome. */
  bare?: boolean;
  /** Stop the sequence while the lens is off-screen. */
  paused?: boolean;
  /** Fires each time a rule lands in the table (lens ripples). */
  onPulse?: () => void;
  /** Kept for API compatibility with KineticStack's pin; no longer drawn. */
  confidence?: number | null;
}

export function AIInferenceVis({ bare = false, paused = false, onPulse }: AIInferenceVisProps = {}) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);

  // onPulse lives in a ref so a new callback identity from the parent never
  // restarts the interval, and it is called outside the state updater.
  const pulseRef = useRef(onPulse);
  pulseRef.current = onPulse;
  const stepRef = useRef(0);

  useEffect(() => {
    if (paused || reduced) return;
    const id = window.setInterval(() => {
      const next = (stepRef.current + 1) % TOTAL_STEPS;
      stepRef.current = next;
      setStep(next);
      // Odd steps within the clause range are the moments a row lands.
      if (next % 2 === 1 && next < CLAUSES.length * 2) pulseRef.current?.();
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [paused, reduced]);

  const done = reduced ? CLAUSES.length * 2 : step;
  const reading = !reduced && step < CLAUSES.length * 2 && step % 2 === 0 ? step / 2 : -1;
  const rowsShown = Math.min(CLAUSES.length, Math.floor((done + 1) / 2));
  const finished = rowsShown === CLAUSES.length;

  return (
    <div className={bare ? "" : "rounded-2xl border border-(--color-line) bg-(--color-bg) p-6"}>
      {/* Header: what you are looking at, in plain words. */}
      <div className="flex items-center justify-between gap-4 border-b border-(--color-line) pb-4">
        <p className="text-[13px] font-semibold text-(--color-fg)">Policy → decision table</p>
        <p className="mono text-[11px] text-(--color-muted)">example</p>
      </div>

      {/* Source document. */}
      <div className="mt-5">
        <p className="mono text-[11px] text-(--color-muted)">underwriting-policy.pdf · §4</p>
        <div className="mt-3 space-y-2.5 text-[14px] leading-relaxed">
          {CLAUSES.map((c, i) => {
            const active = reading === i;
            const extracted = i < rowsShown;
            return (
              <p
                key={i}
                className={`relative rounded-md px-2 py-1 transition-colors duration-500 ${
                  active
                    ? "bg-[color-mix(in_oklab,var(--color-accent)_16%,transparent)] text-(--color-fg)"
                    : extracted
                      ? "text-(--color-fg-2)"
                      : "text-(--color-muted)"
                }`}
              >
                <span className="mono mr-2 text-[11px] text-(--color-accent-2)">{i + 1}</span>
                {c.text}
              </p>
            );
          })}
        </div>
      </div>

      {/* Output: the decision table, one row per sentence. */}
      <div className="mt-6 overflow-hidden rounded-xl border border-(--color-line-2)">
        <div className="grid grid-cols-[1.6rem_1fr_1fr] gap-3 border-b border-(--color-line) bg-(--color-surface) px-3 py-2 mono text-[10.5px] text-(--color-muted)">
          <span>#</span>
          <span>WHEN</span>
          <span>THEN</span>
        </div>
        <div className="min-h-[132px]">
          <AnimatePresence initial={false}>
            {CLAUSES.slice(0, rowsShown).map((c, i) => (
              <motion.div
                key={i}
                initial={reduced ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-[1.6rem_1fr_1fr] items-baseline gap-3 border-b border-(--color-line) px-3 py-2.5 last:border-b-0"
              >
                <span className="mono text-[11px] text-(--color-accent-2)">{i + 1}</span>
                <span className="mono text-[12px] text-(--color-fg)">{c.when}</span>
                <span className="text-[13px] text-(--color-fg)">
                  {c.then}
                  <span className="ml-2 mono text-[10px] text-(--color-muted)">← §4.{i + 1}</span>
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 text-[12px]">
        <p className={`transition-opacity duration-500 ${finished ? "text-(--color-fg-2) opacity-100" : "opacity-0"}`}>
          Every rule traced to the sentence it came from.
        </p>
        <p className="mono shrink-0 text-[11px] text-(--color-muted)">DMN · Python</p>
      </div>
    </div>
  );
}
