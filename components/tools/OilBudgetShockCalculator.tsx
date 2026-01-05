"use client";

import { useMemo, useState } from "react";

function toNumberOrZero(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

type Unit = "gallons" | "barrels";

export default function OilBudgetShockCalculator() {
  const [baselinePricePerBarrel, setBaselinePricePerBarrel] = useState<number>(75);
  const [newPricePerBarrel, setNewPricePerBarrel] = useState<number>(85);

  const [unit, setUnit] = useState<Unit>("gallons");
  const [monthlyUsage, setMonthlyUsage] = useState<number>(300);

  const [gallonsPerBarrel, setGallonsPerBarrel] = useState<number>(42);

  const r = useMemo(() => {
    const baseP = Math.max(0, toNumberOrZero(baselinePricePerBarrel));
    const newP = Math.max(0, toNumberOrZero(newPricePerBarrel));

    const usage = Math.max(0, toNumberOrZero(monthlyUsage));
    const gpb = clamp(toNumberOrZero(gallonsPerBarrel), 0.01, 200);

    const monthlyBarrels =
      unit === "barrels" ? usage : usage / gpb;

    const baseMonthlyCost = monthlyBarrels * baseP;
    const newMonthlyCost = monthlyBarrels * newP;

    const monthlyImpact = newMonthlyCost - baseMonthlyCost;
    const annualImpact = monthlyImpact * 12;

    const pctChange = baseP > 0 ? ((newP - baseP) / baseP) * 100 : 0;

    const invalid =
      baseP <= 0 || newP <= 0 || usage <= 0 || monthlyBarrels <= 0;

    return {
      baseP,
      newP,
      usage,
      unit,
      gpb,
      monthlyBarrels,
      baseMonthlyCost,
      newMonthlyCost,
      monthlyImpact,
      annualImpact,
      pctChange,
      invalid,
    };
  }, [
    baselinePricePerBarrel,
    newPricePerBarrel,
    unit,
    monthlyUsage,
    gallonsPerBarrel,
  ]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate how a price move in oil affects your budget, based on your monthly consumption.
        Enter prices per barrel and your monthly usage in either gallons or barrels.
      </p>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Baseline price ($ per barrel)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="0.01"
              value={baselinePricePerBarrel}
              onChange={(e) => setBaselinePricePerBarrel(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Example: last month’s average.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">New price ($ per barrel)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="0.01"
              value={newPricePerBarrel}
              onChange={(e) => setNewPricePerBarrel(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Example: today’s price.</p>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-sm font-medium">Monthly usage unit</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className={`px-3 py-2 rounded border text-sm ${
                unit === "gallons" ? "font-semibold" : "opacity-80"
              }`}
              onClick={() => setUnit("gallons")}
            >
              Gallons / month
            </button>
            <button
              type="button"
              className={`px-3 py-2 rounded border text-sm ${
                unit === "barrels" ? "font-semibold" : "opacity-80"
              }`}
              onClick={() => setUnit("barrels")}
            >
              Barrels / month
            </button>
          </div>
          <p className="text-xs opacity-70 mt-2">
            If you track deliveries in gallons, select gallons. If you track commodity volume, select barrels.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">
              Monthly usage ({unit === "gallons" ? "gallons" : "barrels"})
            </label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="1"
              value={monthlyUsage}
              onChange={(e) => setMonthlyUsage(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Your typical monthly consumption.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Gallons per barrel (for conversion)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="0.1"
              value={gallonsPerBarrel}
              onChange={(e) => setGallonsPerBarrel(Number(e.target.value))}
              disabled={unit === "barrels"}
            />
            <p className="text-xs opacity-70 mt-1">
              Standard crude oil is 42 gal/barrel. Only used when your usage is in gallons.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        {r.invalid ? (
          <p className="text-sm opacity-80">
            Enter positive prices and a positive monthly usage to estimate the budget impact.
          </p>
        ) : (
          <>
            <p className="text-sm opacity-80">
              Price change: ${r.baseP.toFixed(2)} → ${r.newP.toFixed(2)} ({r.pctChange >= 0 ? "+" : ""}
              {r.pctChange.toFixed(2)}%)
            </p>

            <p className="text-sm opacity-80">
              Monthly volume ≈ <span className="font-semibold">{r.monthlyBarrels.toFixed(4)}</span> barrels
            </p>

            <div className="pt-2 space-y-1">
              <p className="text-sm opacity-80">
                Baseline monthly cost: ${r.baseMonthlyCost.toFixed(2)}
              </p>
              <p className="text-sm opacity-80">
                New monthly cost: ${r.newMonthlyCost.toFixed(2)}
              </p>

              <p className="font-extrabold text-lg">
                Monthly impact: {r.monthlyImpact >= 0 ? "+" : ""}
                ${r.monthlyImpact.toFixed(2)}
              </p>

              <p className="text-sm opacity-80">
                Annual impact (×12): {r.annualImpact >= 0 ? "+" : ""}
                ${r.annualImpact.toFixed(2)}
              </p>
            </div>

            <p className="text-xs opacity-70 pt-1">
              This uses prices per barrel and converts your monthly usage into barrels when needed.
              It’s an impact estimate (not a forecast).
            </p>
          </>
        )}
      </div>
    </div>
  );
}
