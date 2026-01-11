"use client";

import { useState } from "react";

export default function FarmBreakEvenYieldCalculator() {
  const [totalCost, setTotalCost] = useState<number>(50000);
  const [pricePerUnit, setPricePerUnit] = useState<number>(5);

  const breakEvenYield =
    pricePerUnit > 0 ? totalCost / pricePerUnit : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">
        Farm Break-Even Yield Calculator
      </h1>

      <p className="text-gray-600">
        Estimate how much crop yield you need to cover your farming costs.
      </p>

      <div className="grid gap-6">
        <div>
          <label className="block font-medium">
            Total Farming Costs ($)
          </label>
          <input
            type="number"
            value={totalCost}
            onChange={(e) => setTotalCost(+e.target.value)}
            className="w-full border p-2 rounded"
          />
          <p className="text-sm text-gray-500">
            Includes seeds, fertilizer, labor, fuel, rent, etc.
          </p>
        </div>

        <div>
          <label className="block font-medium">
            Expected Crop Price (per unit)
          </label>
          <input
            type="number"
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(+e.target.value)}
            className="w-full border p-2 rounded"
          />
          <p className="text-sm text-gray-500">
            Price you expect to receive per bushel, ton, or unit.
          </p>
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold">Result</h2>
        <p className="text-lg mt-2">
          Break-even yield:{" "}
          <strong>
            {breakEvenYield.toLocaleString(undefined, {
              maximumFractionDigits: 2
            })}
          </strong>{" "}
          units
        </p>
      </div>

      <div className="space-y-4 text-sm text-gray-600">
        <h3 className="font-semibold">How it works</h3>
        <p>
          The calculator divides your total costs by the expected price
          per unit to determine the minimum yield needed to break even.
        </p>

        <h3 className="font-semibold">FAQ</h3>
        <p>
          <strong>Does this include profit?</strong> No. This shows the
          minimum yield needed to avoid losses.
        </p>
        <p>
          <strong>What if prices change?</strong> Recalculate using
          different price assumptions to stress test risk.
        </p>
      </div>
    </div>
  );
}
