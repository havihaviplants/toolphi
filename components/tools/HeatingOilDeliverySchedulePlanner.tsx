"use client";

import { useMemo, useState } from "react";

function toNumberOrZero(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function addDaysISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  // Use ISO date (YYYY-MM-DD) for locale-neutral display
  return d.toISOString().slice(0, 10);
}

type BufferMode = "days" | "gallons";

export default function HeatingOilDeliverySchedulePlanner() {
  const [tankCapacity, setTankCapacity] = useState<number>(275);
  const [currentFillPercent, setCurrentFillPercent] = useState<number>(40);

  const [dailyUsageGallons, setDailyUsageGallons] = useState<number>(3);

  const [bufferMode, setBufferMode] = useState<BufferMode>("days");
  const [bufferDays, setBufferDays] = useState<number>(7);
  const [bufferGallons, setBufferGallons] = useState<number>(20);

  const r = useMemo(() => {
    const cap = clamp(toNumberOrZero(tankCapacity), 10, 5000);
    const fillPct = clamp(toNumberOrZero(currentFillPercent), 0, 100);

    const daily = clamp(toNumberOrZero(dailyUsageGallons), 0, 500);

    const currentGallons = cap * (fillPct / 100);

    const bufDays = clamp(Math.round(toNumberOrZero(bufferDays)), 0, 365);
    const bufGal = clamp(toNumberOrZero(bufferGallons), 0, cap);

    const bufferG =
      bufferMode === "days" ? daily * bufDays : bufGal;

    const usable = Math.max(0, currentGallons - bufferG);

    const daysUntilReorder = daily > 0 ? usable / daily : 0;

    // "Run-out" (ignoring buffer) is a useful second number
    const daysUntilEmpty = daily > 0 ? currentGallons / daily : 0;

    const invalid = cap <= 0 || daily <= 0;

    return {
      cap,
      fillPct,
      daily,
      currentGallons,
      bufferG,
      usable,
      daysUntilReorder,
      daysUntilEmpty,
      invalid,
    };
  }, [
    tankCapacity,
    currentFillPercent,
    dailyUsageGallons,
    bufferMode,
    bufferDays,
    bufferGallons,
  ]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Plan when to order heating oil so you don’t run low. This tool estimates the number of days
        until you hit your safety buffer, based on tank level and daily usage.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Tank capacity (gallons)</label>
            <input
              className="input mt-1"
              type="number"
              min={10}
              step="1"
              value={tankCapacity}
              onChange={(e) => setTankCapacity(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Common sizes: 275, 330, 500.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Current fill level (%)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              max={100}
              step="1"
              value={currentFillPercent}
              onChange={(e) => setCurrentFillPercent(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              If you know current gallons instead, convert it to % first.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Daily usage (gallons/day)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="0.1"
              value={dailyUsageGallons}
              onChange={(e) => setDailyUsageGallons(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Use your estimate (or compute from season usage ÷ heating days).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Safety buffer mode</label>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className={`px-3 py-2 rounded border text-sm ${
                  bufferMode === "days" ? "font-semibold" : "opacity-80"
                }`}
                onClick={() => setBufferMode("days")}
              >
                Buffer in days
              </button>
              <button
                type="button"
                className={`px-3 py-2 rounded border text-sm ${
                  bufferMode === "gallons" ? "font-semibold" : "opacity-80"
                }`}
                onClick={() => setBufferMode("gallons")}
              >
                Buffer in gallons
              </button>
            </div>
            <p className="text-xs opacity-70 mt-2">
              Choose how you define “don’t go below this point.”
            </p>
          </div>
        </div>

        {bufferMode === "days" ? (
          <div>
            <label className="block text-sm font-medium">Safety buffer (days)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="1"
              value={bufferDays}
              onChange={(e) => setBufferDays(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Example: 7 days buffer gives you a week of cushion.
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium">Safety buffer (gallons)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="1"
              value={bufferGallons}
              onChange={(e) => setBufferGallons(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Example: keep at least 20 gallons to avoid running dry.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        {r.invalid ? (
          <p className="text-sm opacity-80">
            Enter a valid tank capacity and a positive daily usage to plan delivery timing.
          </p>
        ) : (
          <>
            <p className="text-sm opacity-80">
              Current oil in tank: <span className="font-semibold">{r.currentGallons.toFixed(1)}</span> gal
              ({r.fillPct.toFixed(0)}% of {r.cap.toFixed(0)} gal)
            </p>

            <p className="text-sm opacity-80">
              Safety buffer: <span className="font-semibold">{r.bufferG.toFixed(1)}</span> gal
            </p>

            <p className="font-extrabold text-lg">
              Days until reorder point: {Math.floor(r.daysUntilReorder)} days
            </p>

            <p className="text-sm opacity-80">
              Estimated reorder date (ISO):{" "}
              <span className="font-semibold">{addDaysISO(Math.max(0, Math.floor(r.daysUntilReorder)))}</span>
            </p>

            <div className="pt-2 space-y-1">
              <p className="text-sm opacity-80">
                Days until empty (no buffer): {Math.floor(r.daysUntilEmpty)} days
              </p>
              <p className="text-xs opacity-70">
                This is a planning estimate. Real usage changes with temperature, thermostat settings, and system efficiency.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
