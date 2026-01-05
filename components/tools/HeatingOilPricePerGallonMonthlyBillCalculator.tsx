"use client";

import { useMemo, useState } from "react";

function toNumberOrZero(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export default function HeatingOilPricePerGallonMonthlyBillCalculator() {
  const [pricePerGallon, setPricePerGallon] = useState<number>(3.5);
  const [monthlyGallons, setMonthlyGallons] = useState<number>(80);

  const [deliveryFee, setDeliveryFee] = useState<number>(20);
  const [salesTaxRate, setSalesTaxRate] = useState<number>(6);

  const r = useMemo(() => {
    const p = Math.max(0, toNumberOrZero(pricePerGallon));
    const g = Math.max(0, toNumberOrZero(monthlyGallons));
    const fee = Math.max(0, toNumberOrZero(deliveryFee));
    const taxRate = clamp(toNumberOrZero(salesTaxRate), 0, 100) / 100;

    const fuelCost = p * g;
    const subtotal = fuelCost + fee;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const invalid = p <= 0 || g <= 0;

    return {
      p,
      g,
      fee,
      taxRatePct: taxRate * 100,
      fuelCost,
      subtotal,
      tax,
      total,
      annual: total * 12,
      invalid,
    };
  }, [pricePerGallon, monthlyGallons, deliveryFee, salesTaxRate]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm opacity-80">
          Estimate a monthly heating oil bill from price per gallon and your expected usage.
          Add delivery fees and tax if they apply in your area.
        </p>
      </div>

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
          <p className="text-xs opacity-70 mt-1">
            Example: 3.25 means $3.25/gal.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Monthly usage (gallons)</label>
          <input
            className="input mt-1"
            type="number"
            min={0}
            step="1"
            value={monthlyGallons}
            onChange={(e) => setMonthlyGallons(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            If unsure, start with last winter’s average delivery volume.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Delivery fee (per month, $)</label>
          <input
            className="input mt-1"
            type="number"
            min={0}
            step="0.01"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Optional. Put 0 if you don’t pay a delivery/service fee.
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
            Enter a positive price per gallon and monthly gallons to calculate your bill.
          </p>
        ) : (
          <>
            <p className="text-sm opacity-80">
              Fuel cost = ${r.p.toFixed(2)} × {r.g.toFixed(0)} gal
            </p>

            <div className="pt-2 space-y-1">
              <p className="font-extrabold text-lg">
                Estimated monthly bill: ${r.total.toFixed(2)}
              </p>
              <p className="text-sm opacity-80">
                Fuel: ${r.fuelCost.toFixed(2)} · Delivery: ${r.fee.toFixed(2)} · Tax ({r.taxRatePct.toFixed(2)}%): ${r.tax.toFixed(2)}
              </p>
              <p className="text-sm opacity-80">
                Annual projection (×12): ${r.annual.toFixed(2)}
              </p>
            </div>

            <div className="pt-2 text-xs opacity-70">
              Note: Real bills vary with weather, thermostat settings, insulation, and delivery schedule.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
