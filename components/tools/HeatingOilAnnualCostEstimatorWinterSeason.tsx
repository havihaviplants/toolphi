"use client";

import { useMemo, useState } from "react";

function toNumberOrZero(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export default function HeatingOilAnnualCostEstimatorWinterSeason() {
  const [pricePerGallon, setPricePerGallon] = useState<number>(3.6);

  // Allow either monthly usage or total season gallons (users have both styles)
  const [mode, setMode] = useState<"monthly" | "season">("monthly");
  const [monthlyGallons, setMonthlyGallons] = useState<number>(90);
  const [seasonGallons, setSeasonGallons] = useState<number>(450);

  const [winterMonths, setWinterMonths] = useState<number>(5);

  const [deliveryFeePerMonth, setDeliveryFeePerMonth] = useState<number>(20);
  const [salesTaxRate, setSalesTaxRate] = useState<number>(6);

  const r = useMemo(() => {
    const p = Math.max(0, toNumberOrZero(pricePerGallon));
    const months = clamp(Math.round(toNumberOrZero(winterMonths)), 1, 12);

    const feePerMonth = Math.max(0, toNumberOrZero(deliveryFeePerMonth));
    const taxRate = clamp(toNumberOrZero(salesTaxRate), 0, 100) / 100;

    const mGallons = Math.max(0, toNumberOrZero(monthlyGallons));
    const sGallons = Math.max(0, toNumberOrZero(seasonGallons));

    const totalGallons = mode === "monthly" ? mGallons * months : sGallons;

    const fuelCost = p * totalGallons;
    const deliveryFees = feePerMonth * months;
    const subtotal = fuelCost + deliveryFees;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const avgMonthly = total / months;

    const invalid =
      p <= 0 ||
      (mode === "monthly" ? mGallons <= 0 : sGallons <= 0) ||
      months <= 0;

    return {
      p,
      months,
      totalGallons,
      fuelCost,
      deliveryFees,
      subtotal,
      tax,
      total,
      avgMonthly,
      taxRatePct: taxRate * 100,
      invalid,
    };
  }, [
    pricePerGallon,
    mode,
    monthlyGallons,
    seasonGallons,
    winterMonths,
    deliveryFeePerMonth,
    salesTaxRate,
  ]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate your winter-season heating oil cost. Use monthly gallons if you track average
        usage, or switch to total season gallons if you have a known estimate.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Heating oil price ($ per gallon)</label>
          <input
            className="input mt-1"
            type="number"
            min={0}
            step="0.01"
            value={pricePerGallon}
            onChange={(e) => setPricePerGallon(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">Example: 3.60 means $3.60/gal.</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Winter season length (months)</label>
          <input
            className="input mt-1"
            type="number"
            min={1}
            max={12}
            step="1"
            value={winterMonths}
            onChange={(e) => setWinterMonths(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Typical ranges are 4–7 months depending on climate.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Usage input method</label>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className={`px-3 py-2 rounded border text-sm ${
                mode === "monthly" ? "font-semibold" : "opacity-80"
              }`}
              onClick={() => setMode("monthly")}
            >
              Monthly gallons
            </button>
            <button
              type="button"
              className={`px-3 py-2 rounded border text-sm ${
                mode === "season" ? "font-semibold" : "opacity-80"
              }`}
              onClick={() => setMode("season")}
            >
              Total season gallons
            </button>
          </div>
          <p className="text-xs opacity-70 mt-2">
            Choose the style that matches your data (delivery logs vs. a seasonal estimate).
          </p>
        </div>

        {mode === "monthly" ? (
          <div>
            <label className="block text-sm font-medium">Gallons used per month</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="1"
              value={monthlyGallons}
              onChange={(e) => setMonthlyGallons(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              We’ll multiply this by winter months to estimate season gallons.
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium">Total gallons for the season</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="1"
              value={seasonGallons}
              onChange={(e) => setSeasonGallons(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Use a known estimate (e.g., last winter’s total deliveries).
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Delivery fee (per month, $)</label>
          <input
            className="input mt-1"
            type="number"
            min={0}
            step="0.01"
            value={deliveryFeePerMonth}
            onChange={(e) => setDeliveryFeePerMonth(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Optional. If you pay per delivery instead, convert to an average monthly fee.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Sales tax rate (%)</label>
          <input
            className="input mt-1"
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={salesTaxRate}
            onChange={(e) => setSalesTaxRate(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Optional. Use 0 if heating oil is not taxed in your area.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        {r.invalid ? (
          <p className="text-sm opacity-80">
            Enter a positive price and usage to estimate your winter total.
          </p>
        ) : (
          <>
            <p className="text-sm opacity-80">
              Season gallons ≈ <span className="font-semibold">{r.totalGallons.toFixed(0)}</span> gal
              over <span className="font-semibold">{r.months}</span> months
            </p>

            <p className="font-extrabold text-lg">
              Estimated winter total: ${r.total.toFixed(2)}
            </p>

            <p className="text-sm opacity-80">
              Fuel: ${r.fuelCost.toFixed(2)} · Delivery: ${r.deliveryFees.toFixed(2)} · Tax (
              {r.taxRatePct.toFixed(2)}%): ${r.tax.toFixed(2)}
            </p>

            <p className="text-sm opacity-80">
              Average per winter month: ${r.avgMonthly.toFixed(2)}
            </p>

            <p className="text-xs opacity-70 pt-1">
              Note: Weather, insulation, thermostat settings, and delivery timing can significantly
              change real usage.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
