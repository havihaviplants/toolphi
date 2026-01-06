"use client";

import { useMemo, useState } from "react";

function toNumberOrZero(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function parseDate(value: string) {
  // expects YYYY-MM-DD from <input type="date">
  const d = new Date(value + "T00:00:00");
  return Number.isFinite(d.getTime()) ? d : null;
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);

  // Handle month rollover (e.g., Jan 31 + 1 month -> Mar 3). Try to keep same day where possible.
  // If day changed due to shorter month, roll back to last day of previous month.
  if (d.getDate() !== day) {
    d.setDate(0);
  }
  return d;
}

function diffDays(from: Date, to: Date) {
  const ms = to.getTime() - from.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function formatDateYYYYMMDD(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function EngineOilChangeIntervalCalculator() {
  // mileage
  const [currentMileage, setCurrentMileage] = useState<number>(33200);
  const [lastChangeMileage, setLastChangeMileage] = useState<number>(30000);

  // interval
  const [intervalMiles, setIntervalMiles] = useState<number>(5000);
  const [intervalMonths, setIntervalMonths] = useState<number>(6);

  // dates
  const [lastChangeDate, setLastChangeDate] = useState<string>("2025-10-01");

  const r = useMemo(() => {
    const cur = clamp(toNumberOrZero(currentMileage), 0, 10_000_000);
    const lastMi = clamp(toNumberOrZero(lastChangeMileage), 0, 10_000_000);

    const milesInt = clamp(Math.round(toNumberOrZero(intervalMiles)), 0, 200_000);
    const monthsInt = clamp(Math.round(toNumberOrZero(intervalMonths)), 0, 60);

    const lastDt = parseDate(lastChangeDate);
    const today = new Date();
    const todayMid = new Date(formatDateYYYYMMDD(today) + "T00:00:00");

    const dueMileage = milesInt > 0 ? lastMi + milesInt : 0;
    const remainingMiles = milesInt > 0 ? dueMileage - cur : 0;

    const dueDate = lastDt && monthsInt > 0 ? addMonths(lastDt, monthsInt) : null;
    const remainingDays = dueDate ? diffDays(todayMid, dueDate) : 0;

    const invalidMileage = cur <= 0 || lastMi <= 0 || cur < lastMi;
    const invalidInterval = milesInt <= 0 && monthsInt <= 0;
    const invalidDate = monthsInt > 0 && !lastDt;

    const invalid = invalidMileage || invalidInterval || invalidDate;

    return {
      cur,
      lastMi,
      milesInt,
      monthsInt,
      dueMileage,
      remainingMiles,
      lastDt,
      dueDate,
      remainingDays,
      invalid,
      invalidMileage,
      invalidInterval,
      invalidDate,
    };
  }, [currentMileage, lastChangeMileage, intervalMiles, intervalMonths, lastChangeDate]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate your next oil change timing using mileage and time intervals. You can use
        mileage-only, time-only, or both (whichever comes first in real life).
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Current odometer</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="1"
              value={currentMileage}
              onChange={(e) => setCurrentMileage(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Your current mileage/odometer reading.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Last oil change mileage</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="1"
              value={lastChangeMileage}
              onChange={(e) => setLastChangeMileage(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Mileage when you last changed the oil.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Last oil change date</label>
            <input
              className="input mt-1"
              type="date"
              value={lastChangeDate}
              onChange={(e) => setLastChangeDate(e.target.value)}
            />
            <p className="text-xs opacity-70 mt-1">
              Used only if you set a month-based interval.
            </p>
          </div>

          <div className="rounded border p-3">
            <p className="text-sm font-medium">Intervals</p>
            <div className="mt-3 grid gap-4">
              <div>
                <label className="block text-sm font-medium">Mileage interval (miles)</label>
                <input
                  className="input mt-1"
                  type="number"
                  min={0}
                  step="100"
                  value={intervalMiles}
                  onChange={(e) => setIntervalMiles(Number(e.target.value))}
                />
                <p className="text-xs opacity-70 mt-1">
                  Set 0 to ignore mileage-based schedule.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium">Time interval (months)</label>
                <input
                  className="input mt-1"
                  type="number"
                  min={0}
                  step="1"
                  value={intervalMonths}
                  onChange={(e) => setIntervalMonths(Number(e.target.value))}
                />
                <p className="text-xs opacity-70 mt-1">
                  Set 0 to ignore time-based schedule.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded border p-3">
          <p className="text-sm font-medium">Quick presets</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded border text-sm"
              onClick={() => {
                setIntervalMiles(5000);
                setIntervalMonths(6);
              }}
            >
              5,000 mi / 6 mo
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded border text-sm"
              onClick={() => {
                setIntervalMiles(7500);
                setIntervalMonths(6);
              }}
            >
              7,500 mi / 6 mo
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded border text-sm"
              onClick={() => {
                setIntervalMiles(10000);
                setIntervalMonths(12);
              }}
            >
              10,000 mi / 12 mo
            </button>
          </div>
          <p className="text-xs opacity-70 mt-2">
            These are common intervals, but always follow your vehicle manual.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        {r.invalid ? (
          <div className="space-y-1 text-sm opacity-80">
            <p>Fix the following to calculate:</p>
            <ul className="list-disc pl-5 space-y-1">
              {r.invalidMileage && (
                <li>Current mileage must be ≥ last oil change mileage, and both should be positive.</li>
              )}
              {r.invalidInterval && <li>Set at least one interval (miles or months) above 0.</li>}
              {r.invalidDate && <li>Provide a valid last oil change date for month-based interval.</li>}
            </ul>
          </div>
        ) : (
          <>
            {r.milesInt > 0 && (
              <>
                <p className="text-sm opacity-80">
                  Next due mileage:{" "}
                  <span className="font-semibold">{r.dueMileage.toLocaleString()}</span>
                </p>
                <p className="font-extrabold text-lg">
                  Remaining miles:{" "}
                  {r.remainingMiles >= 0
                    ? r.remainingMiles.toLocaleString()
                    : `Overdue by ${Math.abs(r.remainingMiles).toLocaleString()}`}
                </p>
              </>
            )}

            {r.monthsInt > 0 && r.dueDate && (
              <>
                <p className="text-sm opacity-80">
                  Due date: <span className="font-semibold">{formatDateYYYYMMDD(r.dueDate)}</span>
                </p>
                <p className="font-extrabold text-lg">
                  Remaining days:{" "}
                  {r.remainingDays >= 0 ? r.remainingDays.toLocaleString() : `Overdue by ${Math.abs(r.remainingDays).toLocaleString()}`}
                </p>
              </>
            )}

            <p className="text-xs opacity-70 pt-2">
              If you use both mileage and time intervals, many drivers follow whichever comes first.
              This tool shows both independently.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
