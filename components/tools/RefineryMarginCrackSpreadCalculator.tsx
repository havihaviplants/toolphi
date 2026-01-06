"use client";

import { useMemo, useState } from "react";

function toNumberOrZero(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function safeDiv(n: number, d: number) {
  return d === 0 ? 0 : n / d;
}

type Mode = "321" | "custom";

export default function RefineryMarginCrackSpreadCalculator() {
  const [mode, setMode] = useState<Mode>("321");

  // Prices per barrel (simple model)
  const [crudePrice, setCrudePrice] = useState<number>(80);
  const [gasolinePrice, setGasolinePrice] = useState<number>(95);
  const [distillatePrice, setDistillatePrice] = useState<number>(100);

  // Volume of crude processed (barrels)
  const [crudeBarrels, setCrudeBarrels] = useState<number>(30000);

  // Custom ratio coefficients:
  // crudeIn = how many barrels crude "in"
  // gasOut = barrels gasoline "out"
  // distOut = barrels distillate "out"
  const [crudeIn, setCrudeIn] = useState<number>(3);
  const [gasOut, setGasOut] = useState<number>(2);
  const [distOut, setDistOut] = useState<number>(1);

  const r = useMemo(() => {
    const crude = Math.max(0, toNumberOrZero(crudePrice));
    const gas = Math.max(0, toNumberOrZero(gasolinePrice));
    const dist = Math.max(0, toNumberOrZero(distillatePrice));

    const vol = Math.max(0, toNumberOrZero(crudeBarrels));

    const inBbl =
      mode === "321" ? 3 : clamp(Math.round(toNumberOrZero(crudeIn)), 1, 1000);
    const gasBbl =
      mode === "321" ? 2 : clamp(Math.round(toNumberOrZero(gasOut)), 0, 1000);
    const distBbl =
      mode === "321" ? 1 : clamp(Math.round(toNumberOrZero(distOut)), 0, 1000);

    // Crack spread per crude barrel (simplified):
    // (gasBbl*gas + distBbl*dist - inBbl*crude) / inBbl
    const crackPerBbl = safeDiv(gasBbl * gas + distBbl * dist - inBbl * crude, inBbl);

    const totalMargin = crackPerBbl * vol;

    const invalid = crude <= 0 || gas <= 0 || dist <= 0 || vol <= 0 || inBbl <= 0;

    return {
      crude,
      gas,
      dist,
      vol,
      inBbl,
      gasBbl,
      distBbl,
      crackPerBbl,
      totalMargin,
      invalid,
    };
  }, [
    mode,
    crudePrice,
    gasolinePrice,
    distillatePrice,
    crudeBarrels,
    crudeIn,
    gasOut,
    distOut,
  ]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Crack spread is a simplified proxy for refinery margin: compare the value of refined products
        to the cost of crude input. This tool supports a standard <span className="font-medium">3-2-1</span>{" "}
        model or a custom ratio.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div>
          <p className="text-sm font-medium">Model</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className={`px-3 py-2 rounded border text-sm ${
                mode === "321" ? "font-semibold" : "opacity-80"
              }`}
              onClick={() => setMode("321")}
            >
              3-2-1 (standard)
            </button>
            <button
              type="button"
              className={`px-3 py-2 rounded border text-sm ${
                mode === "custom" ? "font-semibold" : "opacity-80"
              }`}
              onClick={() => setMode("custom")}
            >
              Custom ratio
            </button>
          </div>
          <p className="text-xs opacity-70 mt-2">
            3-2-1 approximates turning 3 barrels of crude into 2 barrels of gasoline + 1 barrel of distillate.
          </p>
        </div>

        {mode === "custom" && (
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium">Crude in (barrels)</label>
              <input
                className="input mt-1"
                type="number"
                min={1}
                step="1"
                value={crudeIn}
                onChange={(e) => setCrudeIn(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Gasoline out (barrels)</label>
              <input
                className="input mt-1"
                type="number"
                min={0}
                step="1"
                value={gasOut}
                onChange={(e) => setGasOut(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Distillate out (barrels)</label>
              <input
                className="input mt-1"
                type="number"
                min={0}
                step="1"
                value={distOut}
                onChange={(e) => setDistOut(Number(e.target.value))}
              />
            </div>
            <p className="text-xs opacity-70 sm:col-span-3">
              This is a simplified ratio model for estimating a spread, not an exact yield accounting.
            </p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Crude price ($/bbl)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="0.01"
              value={crudePrice}
              onChange={(e) => setCrudePrice(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Gasoline price ($/bbl)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="0.01"
              value={gasolinePrice}
              onChange={(e) => setGasolinePrice(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Distillate price ($/bbl)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="0.01"
              value={distillatePrice}
              onChange={(e) => setDistillatePrice(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Crude processed (barrels)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="1"
              value={crudeBarrels}
              onChange={(e) => setCrudeBarrels(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Used to estimate total margin from the spread.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        {r.invalid ? (
          <p className="text-sm opacity-80">
            Enter positive prices and a positive crude volume to estimate crack spread and margin.
          </p>
        ) : (
          <>
            <p className="text-sm opacity-80">
              Model ratio:{" "}
              <span className="font-semibold">
                {r.inBbl}-{r.gasBbl}-{r.distBbl}
              </span>{" "}
              (crude in – gasoline out – distillate out)
            </p>

            <p className="font-extrabold text-lg">
              Crack spread (per crude barrel): {r.crackPerBbl >= 0 ? "+" : ""}${r.crackPerBbl.toFixed(2)} / bbl
            </p>

            <p className="text-sm opacity-80">
              Total margin estimate: {r.totalMargin >= 0 ? "+" : ""}${r.totalMargin.toFixed(2)}
            </p>

            <p className="text-xs opacity-70 pt-2">
              Formula: (gasoline_out×gas_price + distillate_out×dist_price − crude_in×crude_price) ÷ crude_in.
              This is a simplified spread proxy, not a full refinery cost model.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
