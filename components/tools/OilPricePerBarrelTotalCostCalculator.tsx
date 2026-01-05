"use client";

import { useMemo, useState } from "react";

function toNumberOrZero(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export default function OilPricePerBarrelTotalCostCalculator() {
  const [pricePerBarrel, setPricePerBarrel] = useState<number>(78.5);
  const [barrels, setBarrels] = useState<number>(12);

  // Standard conversion for crude oil: 42 US gallons per barrel
  const [gallonsPerBarrel, setGallonsPerBarrel] = useState<number>(42);

  const r = useMemo(() => {
    const price = Math.max(0, toNumberOrZero(pricePerBarrel));
    const qtyBarrels = Math.max(0, toNumberOrZero(barrels));
    const gpb = clamp(toNumberOrZero(gallonsPerBarrel), 0, 200);

    const totalCost = price * qtyBarrels;
    const totalGallons = qtyBarrels * gpb;

    const costPerGallon =
      totalGallons > 0 ? totalCost / totalGallons : 0;

    const invalid = price <= 0 || qtyBarrels <= 0;

    return {
      price,
      qtyBarrels,
      gpb,
      totalCost,
      totalGallons,
      costPerGallon,
      invalid,
    };
  }, [pricePerBarrel, barrels, gallonsPerBarrel]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Convert an oil price per barrel into a total cost for a given number of barrels.
        You can also estimate cost per gallon using a conversion factor.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Oil price ($ per barrel)</label>
          <input
            className="input mt-1"
            type="number"
            min={0}
            step="0.01"
            value={pricePerBarrel}
            onChange={(e) => setPricePerBarrel(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Example: 78.50 means $78.50 per barrel.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Quantity (barrels)</label>
          <input
            className="input mt-1"
            type="number"
            min={0}
            step="1"
            value={barrels}
            onChange={(e) => setBarrels(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Enter how many barrels you want to price.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Gallons per barrel (optional)</label>
          <input
            className="input mt-1"
            type="number"
            min={0}
            step="0.1"
            value={gallonsPerBarrel}
            onChange={(e) => setGallonsPerBarrel(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Standard crude oil conversion is 42 US gallons per barrel. Change only if needed.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        {r.invalid ? (
          <p className="text-sm opacity-80">
            Enter a positive price per barrel and a positive number of barrels to calculate totals.
          </p>
        ) : (
          <>
            <p className="font-extrabold text-lg">
              Total cost: ${r.totalCost.toFixed(2)}
            </p>

            <p className="text-sm opacity-80">
              {r.qtyBarrels.toFixed(0)} barrels × ${r.price.toFixed(2)} = ${r.totalCost.toFixed(2)}
            </p>

            <div className="pt-2 space-y-1">
              <p className="text-sm opacity-80">
                Total gallons (estimate): {r.totalGallons.toFixed(2)} gal
              </p>
              <p className="text-sm opacity-80">
                Estimated cost per gallon: ${r.costPerGallon.toFixed(4)}/gal
              </p>
              <p className="text-xs opacity-70">
                Cost per gallon uses {r.gpb.toFixed(1)} gal/barrel. This is an estimate, not a retail fuel price.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
