"use client";

import { useMemo, useState } from "react";

function toNumberOrZero(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

type Direction = "bbl_to_gal" | "gal_to_bbl";

export default function BarrelGallonConversionCalculator() {
  const [direction, setDirection] = useState<Direction>("bbl_to_gal");
  const [amount, setAmount] = useState<number>(10);
  const [gallonsPerBarrel, setGallonsPerBarrel] = useState<number>(42);

  const r = useMemo(() => {
    const a = Math.max(0, toNumberOrZero(amount));
    const gpb = clamp(toNumberOrZero(gallonsPerBarrel), 0.0001, 1000);

    const result =
      direction === "bbl_to_gal" ? a * gpb : a / gpb;

    const invalid = a <= 0 || gpb <= 0;

    const formula =
      direction === "bbl_to_gal"
        ? "gallons = barrels × gallons_per_barrel"
        : "barrels = gallons ÷ gallons_per_barrel";

    return {
      a,
      gpb,
      result,
      invalid,
      formula,
    };
  }, [direction, amount, gallonsPerBarrel]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Convert between barrels and gallons. Standard crude oil conversion is{" "}
        <span className="font-medium">42 US gallons per barrel</span>, but you can adjust it if you need.
      </p>

      <div className="rounded-lg border p-4 space-y-3">
        <div>
          <p className="text-sm font-medium">Conversion direction</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className={`px-3 py-2 rounded border text-sm ${
                direction === "bbl_to_gal" ? "font-semibold" : "opacity-80"
              }`}
              onClick={() => setDirection("bbl_to_gal")}
            >
              Barrels → Gallons
            </button>
            <button
              type="button"
              className={`px-3 py-2 rounded border text-sm ${
                direction === "gal_to_bbl" ? "font-semibold" : "opacity-80"
              }`}
              onClick={() => setDirection("gal_to_bbl")}
            >
              Gallons → Barrels
            </button>
          </div>
          <p className="text-xs opacity-70 mt-2">
            Pick the direction that matches the unit you have.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">
              {direction === "bbl_to_gal" ? "Barrels (bbl)" : "Gallons (gal)"}
            </label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Enter the amount you want to convert.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Gallons per barrel</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="0.1"
              value={gallonsPerBarrel}
              onChange={(e) => setGallonsPerBarrel(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Default is 42 gal/bbl (US petroleum barrel).
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        {r.invalid ? (
          <p className="text-sm opacity-80">
            Enter a positive amount and a positive gallons-per-barrel value to convert.
          </p>
        ) : (
          <>
            <p className="text-sm opacity-80">
              Using {r.gpb.toFixed(4)} gal/bbl
            </p>

            <p className="font-extrabold text-lg">
              {direction === "bbl_to_gal"
                ? `${r.result.toFixed(4)} gallons`
                : `${r.result.toFixed(6)} barrels`}
            </p>

            <p className="text-xs opacity-70 pt-1">
              Formula: {r.formula}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
