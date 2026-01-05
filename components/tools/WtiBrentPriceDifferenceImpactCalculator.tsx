"use client";

import { useMemo, useState } from "react";

function toNumberOrZero(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function safeDiv(n: number, d: number) {
  return d === 0 ? 0 : n / d;
}

export default function WtiBrentPriceDifferenceImpactCalculator() {
  const [wtiPrice, setWtiPrice] = useState<number>(78);
  const [brentPrice, setBrentPrice] = useState<number>(82);
  const [barrels, setBarrels] = useState<number>(10000);

  const r = useMemo(() => {
    const wti = Math.max(0, toNumberOrZero(wtiPrice));
    const brent = Math.max(0, toNumberOrZero(brentPrice));
    const qty = Math.max(0, toNumberOrZero(barrels));

    const spread = brent - wti; // Brent − WTI
    const wtiTotal = wti * qty;
    const brentTotal = brent * qty;

    const difference = brentTotal - wtiTotal; // same as spread * qty
    const pctVsWti = safeDiv(spread, wti) * 100;

    const invalid = wti <= 0 || brent <= 0 || qty <= 0;

    let higher: "WTI" | "Brent" | "Equal" = "Equal";
    if (brentTotal > wtiTotal) higher = "Brent";
    else if (wtiTotal > brentTotal) higher = "WTI";

    return {
      wti,
      brent,
      qty,
      spread,
      pctVsWti,
      wtiTotal,
      brentTotal,
      difference,
      higher,
      invalid,
    };
  }, [wtiPrice, brentPrice, barrels]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate the cost impact of pricing oil using Brent vs WTI for a specific volume. This is
        useful for budgeting, contract comparisons, or understanding benchmark exposure.
      </p>

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
          <p className="text-xs opacity-70 mt-1">Example: 78.00</p>
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
          <p className="text-xs opacity-70 mt-1">Example: 82.00</p>
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
            Use the volume in your contract, shipment, or monthly planning horizon.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        {r.invalid ? (
          <p className="text-sm opacity-80">
            Enter positive values for WTI, Brent, and volume to calculate the impact.
          </p>
        ) : (
          <>
            <p className="text-sm opacity-80">
              Spread (Brent − WTI): {r.spread >= 0 ? "+" : ""}
              ${r.spread.toFixed(2)} / bbl ({r.pctVsWti >= 0 ? "+" : ""}
              {r.pctVsWti.toFixed(2)}% vs WTI)
            </p>

            <div className="pt-2 space-y-1">
              <p className="text-sm opacity-80">
                WTI-based total: ${r.wtiTotal.toFixed(2)}
              </p>
              <p className="text-sm opacity-80">
                Brent-based total: ${r.brentTotal.toFixed(2)}
              </p>

              <p className="font-extrabold text-lg">
                Total cost difference: {r.difference >= 0 ? "+" : ""}
                ${r.difference.toFixed(2)}
              </p>

              <p className="text-sm opacity-80">
                Higher total cost: <span className="font-semibold">{r.higher}</span>
              </p>
            </div>

            <p className="text-xs opacity-70 pt-1">
              Difference equals (Brent − WTI) × volume. This is an impact estimate, not a prediction of future spreads.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
