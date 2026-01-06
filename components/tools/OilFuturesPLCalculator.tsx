"use client";

import { useMemo, useState } from "react";

function toNumberOrZero(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

type Side = "long" | "short";

export default function OilFuturesPLCalculator() {
  const [side, setSide] = useState<Side>("long");
  const [entryPrice, setEntryPrice] = useState<number>(78);
  const [exitPrice, setExitPrice] = useState<number>(82);

  const [contracts, setContracts] = useState<number>(2);
  const [barrelsPerContract, setBarrelsPerContract] = useState<number>(1000);

  const r = useMemo(() => {
    const entry = Math.max(0, toNumberOrZero(entryPrice));
    const exit = Math.max(0, toNumberOrZero(exitPrice));

    const c = clamp(Math.round(toNumberOrZero(contracts)), 0, 1_000_000);
    const bpc = clamp(toNumberOrZero(barrelsPerContract), 0, 10_000_000);

    const totalBarrels = c * bpc;

    // For long: (exit - entry)
    // For short: (entry - exit)
    const plPerBarrel = side === "long" ? (exit - entry) : (entry - exit);
    const totalPL = plPerBarrel * totalBarrels;

    const notionalEntry = entry * totalBarrels;
    const notionalExit = exit * totalBarrels;

    const invalid = entry <= 0 || exit <= 0 || c <= 0 || bpc <= 0;

    return {
      side,
      entry,
      exit,
      c,
      bpc,
      totalBarrels,
      plPerBarrel,
      totalPL,
      notionalEntry,
      notionalExit,
      invalid,
    };
  }, [side, entryPrice, exitPrice, contracts, barrelsPerContract]);

  const swapPrices = () => {
    setEntryPrice(exitPrice);
    setExitPrice(entryPrice);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate futures profit/loss from price movement and position size. This tool uses a simple
        contract math model (price per barrel × barrels per contract × number of contracts).
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div>
          <p className="text-sm font-medium">Position side</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className={`px-3 py-2 rounded border text-sm ${
                side === "long" ? "font-semibold" : "opacity-80"
              }`}
              onClick={() => setSide("long")}
            >
              Long (profit if price rises)
            </button>
            <button
              type="button"
              className={`px-3 py-2 rounded border text-sm ${
                side === "short" ? "font-semibold" : "opacity-80"
              }`}
              onClick={() => setSide("short")}
            >
              Short (profit if price falls)
            </button>
          </div>
          <p className="text-xs opacity-70 mt-2">
            This is P/L from price change only. Fees, funding, and slippage are not included.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Entry price ($ per barrel)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="0.01"
              value={entryPrice}
              onChange={(e) => setEntryPrice(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Your trade entry level.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Exit price ($ per barrel)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="0.01"
              value={exitPrice}
              onChange={(e) => setExitPrice(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Your trade exit level.</p>
          </div>

          <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded border text-sm"
              onClick={swapPrices}
            >
              Swap entry/exit
            </button>
            <p className="text-xs opacity-70">Useful for quick what-if checks.</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
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
            <p className="text-xs opacity-70 mt-1">Number of futures contracts.</p>
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
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        {r.invalid ? (
          <p className="text-sm opacity-80">
            Enter positive entry/exit prices and a positive position size to calculate P/L.
          </p>
        ) : (
          <>
            <p className="text-sm opacity-80">
              Total barrels: <span className="font-semibold">{r.totalBarrels.toLocaleString()}</span> bbl
              ({r.c.toLocaleString()} contracts × {r.bpc.toLocaleString()} bbl)
            </p>

            <p className="text-sm opacity-80">
              P/L per barrel ({r.side}): {r.plPerBarrel >= 0 ? "+" : ""}
              ${r.plPerBarrel.toFixed(2)}
            </p>

            <p className="font-extrabold text-lg">
              Total P/L: {r.totalPL >= 0 ? "+" : ""}
              ${r.totalPL.toFixed(2)}
            </p>

            <div className="pt-2 space-y-1">
              <p className="text-sm opacity-80">
                Notional at entry: ${r.notionalEntry.toFixed(2)}
              </p>
              <p className="text-sm opacity-80">
                Notional at exit: ${r.notionalExit.toFixed(2)}
              </p>
              <p className="text-xs opacity-70">
                Notional is price × barrels. This is not margin requirement.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
