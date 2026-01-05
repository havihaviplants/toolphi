"use client";

import { useMemo, useState } from "react";

function toNumberOrZero(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function safeDiv(n: number, d: number) {
  return d === 0 ? 0 : n / d;
}

export default function CrudeOilBenchmarkComparisonCalculator() {
  const [wtiPrice, setWtiPrice] = useState<number>(78);
  const [brentPrice, setBrentPrice] = useState<number>(82);
  const [barrels, setBarrels] = useState<number>(5000);

  const r = useMemo(() => {
    const wti = Math.max(0, toNumberOrZero(wtiPrice));
    const brent = Math.max(0, toNumberOrZero(brentPrice));
    const qty = Math.max(0, toNumberOrZero(barrels));

    const spread = brent - wti; // Brent − WTI
    const pctVsWti = safeDiv(spread, wti) * 100;

    const wtiTotal = wti * qty;
    const brentTotal = brent * qty;
    const diffTotal = brentTotal - wtiTotal;

    const invalid = wti <= 0 || brent <= 0 || qty <= 0;

    let higherPrice: "WTI" | "Brent" | "Equal" = "Equal";
    if (brent > wti) higherPrice = "Brent";
    else if (wti > brent) higherPrice = "WTI";

    let higherTotal: "WTI" | "Brent" | "Equal" = "Equal";
    if (brentTotal > wtiTotal) higherTotal = "Brent";
    else if (wtiTotal > brentTotal) higherTotal = "WTI";

    return {
      wti,
      brent,
      qty,
      spread,
      pctVsWti,
      wtiTotal,
      brentTotal,
      diffTotal,
      higherPrice,
      higherTotal,
      invalid,
    };
  }, [wtiPrice, brentPrice, barrels]);

  const preset = (kind: "tight" | "wide" | "reversed") => {
    if (kind === "tight") {
      setWtiPrice(80);
      setBrentPrice(81.2);
    } else if (kind === "wide") {
      setWtiPrice(72);
      setBrentPrice(80);
    } else {
      setWtiPrice(82);
      setBrentPrice(78);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Compare WTI and Brent across price, spread, percent difference, and total cost for a chosen
        volume. Helpful for budgeting and benchmark exposure checks.
      </p>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="px-3 py-2 rounded border text-sm"
            onClick={() => preset("tight")}
          >
            Preset: Tight spread
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded border text-sm"
            onClick={() => preset("wide")}
          >
            Preset: Wide spread
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded border text-sm"
            onClick={() => preset("reversed")}
          >
            Preset: Reversed
          </button>
          <p className="text-xs opacity-70 self-center">
            Optional quick examples (editable).
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">WTI price ($ per barrel)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="0.01"
              value={wtiPrice}
              onChange={(e) => setWtiPrice(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Brent price ($ per barrel)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="0.01"
              value={brentPrice}
              onChange={(e) => setBrentPrice(Number(e.target.value))}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Volume (barrels)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="1"
              value={barrels}
              onChange={(e) => setBarrels(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Used to compare total cost difference (Brent vs WTI) for that volume.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        {r.invalid ? (
          <p className="text-sm opacity-80">
            Enter positive values for WTI, Brent, and volume to compare benchmarks.
          </p>
        ) : (
          <>
            <p className="text-sm opacity-80">
              Higher price: <span className="font-semibold">{r.higherPrice}</span>
            </p>

            <p className="font-extrabold text-lg">
              Spread (Brent − WTI): {r.spread >= 0 ? "+" : ""}${r.spread.toFixed(2)} / bbl
            </p>

            <p className="text-sm opacity-80">
              Percent difference vs WTI: {r.pctVsWti >= 0 ? "+" : ""}{r.pctVsWti.toFixed(2)}%
            </p>

            <div className="pt-2 space-y-1">
              <p className="text-sm opacity-80">WTI total: ${r.wtiTotal.toFixed(2)}</p>
              <p className="text-sm opacity-80">Brent total: ${r.brentTotal.toFixed(2)}</p>

              <p className="font-extrabold text-lg">
                Total difference (Brent − WTI): {r.diffTotal >= 0 ? "+" : ""}${r.diffTotal.toFixed(2)}
              </p>

              <p className="text-sm opacity-80">
                Higher total cost: <span className="font-semibold">{r.higherTotal}</span>
              </p>
            </div>

            <p className="text-xs opacity-70 pt-1">
              Spread is Brent − WTI. Total difference is spread × volume.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
