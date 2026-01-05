"use client";

import { useMemo, useState } from "react";

function toNumberOrZero(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function safeDiv(n: number, d: number) {
  return d === 0 ? 0 : n / d;
}

export default function WtiVsBrentSpreadCalculator() {
  const [wtiPrice, setWtiPrice] = useState<number>(78);
  const [brentPrice, setBrentPrice] = useState<number>(82);

  const r = useMemo(() => {
    const wti = Math.max(0, toNumberOrZero(wtiPrice));
    const brent = Math.max(0, toNumberOrZero(brentPrice));

    const spread = brent - wti; // classic quoting
    const pctVsWti = safeDiv(spread, wti) * 100;

    const invalid = wti <= 0 || brent <= 0;

    let higher: "WTI" | "Brent" | "Equal" = "Equal";
    if (brent > wti) higher = "Brent";
    else if (wti > brent) higher = "WTI";

    return {
      wti,
      brent,
      spread,
      pctVsWti,
      invalid,
      higher,
    };
  }, [wtiPrice, brentPrice]);

  const swap = () => {
    setWtiPrice(brentPrice);
    setBrentPrice(wtiPrice);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Compare oil benchmarks by computing the spread between Brent and WTI. This is commonly quoted
        as <span className="font-medium">Brent − WTI</span>.
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

        <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="px-3 py-2 rounded border text-sm"
            onClick={swap}
          >
            Swap WTI/Brent
          </button>
          <p className="text-xs opacity-70">
            Swapping flips the sign of the spread (useful for reverse view).
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        {r.invalid ? (
          <p className="text-sm opacity-80">
            Enter positive values for both WTI and Brent to calculate the spread.
          </p>
        ) : (
          <>
            <p className="text-sm opacity-80">
              Higher benchmark: <span className="font-semibold">{r.higher}</span>
            </p>

            <p className="font-extrabold text-lg">
              Spread (Brent − WTI): {r.spread >= 0 ? "+" : ""}
              ${r.spread.toFixed(2)}
            </p>

            <p className="text-sm opacity-80">
              Percent difference vs WTI: {r.pctVsWti >= 0 ? "+" : ""}
              {r.pctVsWti.toFixed(2)}%
            </p>

            <p className="text-xs opacity-70 pt-1">
              Percent difference is (Brent − WTI) ÷ WTI. This is a simple comparison metric.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
