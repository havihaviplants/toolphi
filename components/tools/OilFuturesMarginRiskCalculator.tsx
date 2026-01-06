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

export default function OilFuturesMarginRiskCalculator() {
  const [pricePerBarrel, setPricePerBarrel] = useState<number>(80);
  const [contracts, setContracts] = useState<number>(2);
  const [barrelsPerContract, setBarrelsPerContract] = useState<number>(1000);

  // Simple % model for margin estimation (varies by broker/exchange)
  const [marginRatePercent, setMarginRatePercent] = useState<number>(10);

  // Risk scenario: how many dollars per barrel against you
  const [adverseMovePerBarrel, setAdverseMovePerBarrel] = useState<number>(3);

  const r = useMemo(() => {
    const price = Math.max(0, toNumberOrZero(pricePerBarrel));
    const c = clamp(Math.round(toNumberOrZero(contracts)), 0, 1_000_000);
    const bpc = clamp(toNumberOrZero(barrelsPerContract), 0, 10_000_000);

    const mPct = clamp(toNumberOrZero(marginRatePercent), 0, 100);
    const adv = Math.max(0, toNumberOrZero(adverseMovePerBarrel));

    const totalBarrels = c * bpc;
    const notional = price * totalBarrels;

    const margin = notional * (mPct / 100);

    const leverage = safeDiv(notional, margin);

    const plImpact = adv * totalBarrels; // adverse move magnitude * barrels

    const plAsPctOfMargin = margin > 0 ? (plImpact / margin) * 100 : 0;

    const invalid = price <= 0 || c <= 0 || bpc <= 0 || mPct <= 0;

    return {
      price,
      c,
      bpc,
      totalBarrels,
      notional,
      mPct,
      margin,
      leverage,
      adv,
      plImpact,
      plAsPctOfMargin,
      invalid,
    };
  }, [
    pricePerBarrel,
    contracts,
    barrelsPerContract,
    marginRatePercent,
    adverseMovePerBarrel,
  ]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate notional exposure, margin requirement (as a simple % of notional), leverage, and a
        risk scenario impact for an oil futures position. Real margin rules vary by exchange and broker.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Futures price ($ per barrel)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="0.01"
              value={pricePerBarrel}
              onChange={(e) => setPricePerBarrel(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Used to compute notional exposure.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Contracts</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="1"
              value={contracts}
              onChange={(e) => setContracts(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Number of contracts.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Barrels per contract</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="1"
              value={barrelsPerContract}
              onChange={(e) => setBarrelsPerContract(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Example: 1,000 bbl/contract (varies by product).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Margin rate (% of notional)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={marginRatePercent}
              onChange={(e) => setMarginRatePercent(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Simple estimate. Your broker may require initial + maintenance margin rules.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Adverse move ($ per barrel)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="0.01"
              value={adverseMovePerBarrel}
              onChange={(e) => setAdverseMovePerBarrel(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Example: “price moves $3 against me”.
            </p>
          </div>

          <div className="rounded border p-3">
            <p className="text-sm font-medium">Quick presets</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="px-3 py-2 rounded border text-sm"
                onClick={() => setMarginRatePercent(8)}
              >
                Margin 8%
              </button>
              <button
                type="button"
                className="px-3 py-2 rounded border text-sm"
                onClick={() => setMarginRatePercent(10)}
              >
                Margin 10%
              </button>
              <button
                type="button"
                className="px-3 py-2 rounded border text-sm"
                onClick={() => setMarginRatePercent(15)}
              >
                Margin 15%
              </button>
              <button
                type="button"
                className="px-3 py-2 rounded border text-sm"
                onClick={() => setAdverseMovePerBarrel(1)}
              >
                Move $1
              </button>
              <button
                type="button"
                className="px-3 py-2 rounded border text-sm"
                onClick={() => setAdverseMovePerBarrel(3)}
              >
                Move $3
              </button>
              <button
                type="button"
                className="px-3 py-2 rounded border text-sm"
                onClick={() => setAdverseMovePerBarrel(5)}
              >
                Move $5
              </button>
            </div>
            <p className="text-xs opacity-70 mt-2">
              Presets are optional — you can type exact values.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        {r.invalid ? (
          <p className="text-sm opacity-80">
            Enter positive price, position size, and margin rate to estimate margin and risk.
          </p>
        ) : (
          <>
            <p className="text-sm opacity-80">
              Total barrels: <span className="font-semibold">{r.totalBarrels.toLocaleString()}</span> bbl
            </p>

            <p className="text-sm opacity-80">
              Notional exposure: <span className="font-semibold">${r.notional.toFixed(2)}</span>
            </p>

            <p className="font-extrabold text-lg">
              Estimated margin: ${r.margin.toFixed(2)}
            </p>

            <p className="text-sm opacity-80">
              Estimated leverage: {r.leverage.toFixed(2)}× (notional ÷ margin)
            </p>

            <div className="pt-2 space-y-1">
              <p className="text-sm opacity-80">
                Adverse move scenario: ${r.adv.toFixed(2)} / bbl
              </p>
              <p className="font-extrabold text-lg">
                Scenario P/L impact: -${r.plImpact.toFixed(2)}
              </p>
              <p className="text-sm opacity-80">
                Impact as % of margin: {r.plAsPctOfMargin.toFixed(1)}%
              </p>
              <p className="text-xs opacity-70">
                This is magnitude only (fees, slippage, and broker liquidation rules are not included).
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
