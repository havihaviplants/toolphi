"use client";

import { useMemo, useState } from "react";

function toNumberOrZero(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function safeDiv(n: number, d: number) {
  return d === 0 ? 0 : n / d;
}

type Benchmark = "WTI" | "Brent";

export default function CrudeOilPriceChangePercentCalculator() {
  const [benchmark, setBenchmark] = useState<Benchmark>("WTI");
  const [oldPrice, setOldPrice] = useState<number>(74);
  const [newPrice, setNewPrice] = useState<number>(79.18);

  const r = useMemo(() => {
    const oldP = Math.max(0, toNumberOrZero(oldPrice));
    const newP = Math.max(0, toNumberOrZero(newPrice));

    const diff = newP - oldP;
    const pct = safeDiv(diff, oldP) * 100;

    const invalid = oldP <= 0 || newP <= 0;

    const direction =
      diff > 0 ? "Increase" : diff < 0 ? "Decrease" : "No change";

    return {
      oldP,
      newP,
      diff,
      pct,
      invalid,
      direction,
    };
  }, [oldPrice, newPrice]);

  const swap = () => {
    setOldPrice(newPrice);
    setNewPrice(oldPrice);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Calculate the percentage change in crude oil price between two values. Use the benchmark
        selector to label whether you’re tracking WTI or Brent.
      </p>

      <div className="rounded-lg border p-4 space-y-3">
        <div>
          <p className="text-sm font-medium">Benchmark label</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className={`px-3 py-2 rounded border text-sm ${
                benchmark === "WTI" ? "font-semibold" : "opacity-80"
              }`}
              onClick={() => setBenchmark("WTI")}
            >
              WTI
            </button>
            <button
              type="button"
              className={`px-3 py-2 rounded border text-sm ${
                benchmark === "Brent" ? "font-semibold" : "opacity-80"
              }`}
              onClick={() => setBenchmark("Brent")}
            >
              Brent
            </button>
          </div>
          <p className="text-xs opacity-70 mt-2">
            This does not fetch live prices — it’s just a label for your inputs.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Old price ($ per barrel)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="0.01"
              value={oldPrice}
              onChange={(e) => setOldPrice(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Starting price (e.g., yesterday’s close).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">New price ($ per barrel)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Ending price (e.g., today’s price).
            </p>
          </div>

          <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded border text-sm"
              onClick={swap}
            >
              Swap old/new
            </button>
            <p className="text-xs opacity-70">
              Quickly reverse the move without retyping.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        {r.invalid ? (
          <p className="text-sm opacity-80">
            Enter positive values for both old and new prices to calculate the change.
          </p>
        ) : (
          <>
            <p className="text-sm opacity-80">
              {benchmark} — {r.direction} from ${r.oldP.toFixed(2)} to ${r.newP.toFixed(2)}
            </p>

            <p className="font-extrabold text-lg">
              {r.pct >= 0 ? "+" : ""}
              {r.pct.toFixed(2)}%
            </p>

            <p className="text-sm opacity-80">
              Absolute change: {r.diff >= 0 ? "+" : ""}
              ${r.diff.toFixed(2)}
            </p>

            <p className="text-xs opacity-70 pt-1">
              Percent change is (new − old) ÷ old. This is a simple change measure, not a forecast.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
