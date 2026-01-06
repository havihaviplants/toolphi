"use client";

import { useMemo, useState } from "react";

function toNumberOrZero(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

type ChangeMode = "dollar" | "percent";
type ExposurePeriod = "month" | "year";

function safeDiv(n: number, d: number) {
  return d === 0 ? 0 : n / d;
}

export default function OilPriceSensitivityCalculator() {
  const [exposureBarrels, setExposureBarrels] = useState<number>(10000);
  const [period, setPeriod] = useState<ExposurePeriod>("month");

  const [baselineOilPrice, setBaselineOilPrice] = useState<number>(80);

  const [changeMode, setChangeMode] = useState<ChangeMode>("dollar");
  const [priceChangeDollar, setPriceChangeDollar] = useState<number>(5);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(6);

  const [passThroughPercent, setPassThroughPercent] = useState<number>(40);

  const r = useMemo(() => {
    const exposure = Math.max(0, toNumberOrZero(exposureBarrels));
    const base = Math.max(0, toNumberOrZero(baselineOilPrice));

    const passPct = clamp(toNumberOrZero(passThroughPercent), 0, 100) / 100;

    const dChange =
      changeMode === "dollar"
        ? toNumberOrZero(priceChangeDollar)
        : base * (toNumberOrZero(priceChangePercent) / 100);

    // Allow negative change as well (price down reduces cost / may reduce revenue)
    const delta = Number.isFinite(dChange) ? dChange : 0;

    const grossImpact = exposure * delta; // $ per period
    const passed = grossImpact * passPct;
    const netImpact = grossImpact - passed;

    const sensitivityPerDollar = exposure * 1; // $ per $1/bbl move

    const changePercentComputed = base > 0 ? (safeDiv(delta, base) * 100) : 0;

    const invalid = exposure <= 0 || base <= 0;

    return {
      exposure,
      base,
      delta,
      grossImpact,
      passed,
      netImpact,
      sensitivityPerDollar,
      passPct,
      changePercentComputed,
      invalid,
    };
  }, [
    exposureBarrels,
    baselineOilPrice,
    changeMode,
    priceChangeDollar,
    priceChangePercent,
    passThroughPercent,
  ]);

  const periodLabel = period === "month" ? "per month" : "per year";

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Model how oil price changes affect your business. Enter your exposure in barrels for a given
        period, apply a price change, and optionally apply pass-through (how much you can transfer to
        customers via pricing).
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">
              Exposure volume (barrels {periodLabel})
            </label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="1"
              value={exposureBarrels}
              onChange={(e) => setExposureBarrels(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Example: barrels consumed, purchased, or sold in that period.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Exposure period</label>
            <select
              className="input mt-1"
              value={period}
              onChange={(e) => setPeriod(e.target.value as ExposurePeriod)}
            >
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
            <p className="text-xs opacity-70 mt-1">
              Used for labeling (your math is still “per selected period”).
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Baseline oil price ($/bbl)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="0.01"
              value={baselineOilPrice}
              onChange={(e) => setBaselineOilPrice(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Used to convert % change into $ change.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Pass-through (%)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              max={100}
              step="1"
              value={passThroughPercent}
              onChange={(e) => setPassThroughPercent(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              0% = you absorb it; 100% = fully passed to customers (simplified).
            </p>
          </div>
        </div>

        <div className="rounded border p-3 space-y-3">
          <p className="text-sm font-medium">Price change</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`px-3 py-2 rounded border text-sm ${
                changeMode === "dollar" ? "font-semibold" : "opacity-80"
              }`}
              onClick={() => setChangeMode("dollar")}
            >
              $ change
            </button>
            <button
              type="button"
              className={`px-3 py-2 rounded border text-sm ${
                changeMode === "percent" ? "font-semibold" : "opacity-80"
              }`}
              onClick={() => setChangeMode("percent")}
            >
              % change
            </button>
          </div>

          {changeMode === "dollar" ? (
            <div>
              <label className="block text-sm font-medium">Oil price change ($/bbl)</label>
              <input
                className="input mt-1"
                type="number"
                step="0.01"
                value={priceChangeDollar}
                onChange={(e) => setPriceChangeDollar(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">
                Use negative values for a price drop (e.g., -5).
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium">Oil price change (%)</label>
              <input
                className="input mt-1"
                type="number"
                step="0.1"
                value={priceChangePercent}
                onChange={(e) => setPriceChangePercent(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">
                Converted using baseline price. Negative values mean price down.
              </p>
            </div>
          )}

          <p className="text-xs opacity-70">
            Note: net impact sign depends on your business model. For a buyer, price up is usually a cost increase.
            For a producer, price up may increase revenue. This tool shows raw $ impact from price movement × volume.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        {r.invalid ? (
          <p className="text-sm opacity-80">
            Enter a positive exposure volume and a positive baseline price to calculate sensitivity.
          </p>
        ) : (
          <>
            <p className="text-sm opacity-80">
              Price change applied:{" "}
              <span className="font-semibold">
                {r.delta >= 0 ? "+" : ""}${r.delta.toFixed(2)}/bbl
              </span>{" "}
              (≈ {r.changePercentComputed >= 0 ? "+" : ""}
              {r.changePercentComputed.toFixed(2)}%)
            </p>

            <p className="text-sm opacity-80">
              Gross impact ({periodLabel}):{" "}
              <span className="font-semibold">
                {r.grossImpact >= 0 ? "+" : ""}${r.grossImpact.toFixed(2)}
              </span>
            </p>

            <p className="text-sm opacity-80">
              Pass-through ({(r.passPct * 100).toFixed(0)}%):{" "}
              <span className="font-semibold">
                {r.passed >= 0 ? "+" : ""}${r.passed.toFixed(2)}
              </span>
            </p>

            <p className="font-extrabold text-lg">
              Net impact ({periodLabel}):{" "}
              {r.netImpact >= 0 ? "+" : ""}${r.netImpact.toFixed(2)}
            </p>

            <div className="pt-2 space-y-1">
              <p className="text-sm opacity-80">
                Sensitivity per $1/bbl move ({periodLabel}):{" "}
                <span className="font-semibold">${r.sensitivityPerDollar.toFixed(2)}</span>
              </p>
              <p className="text-xs opacity-70">
                This is a simplified linear model (volume × price change). It does not include hedges, basis, or nonlinear operational effects.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
