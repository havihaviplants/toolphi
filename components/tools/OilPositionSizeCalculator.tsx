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

export default function OilPositionSizeCalculator() {
  const [accountSize, setAccountSize] = useState<number>(50000);
  const [riskPercent, setRiskPercent] = useState<number>(1);

  const [stopDistancePerBarrel, setStopDistancePerBarrel] = useState<number>(2);
  const [barrelsPerContract, setBarrelsPerContract] = useState<number>(1000);

  const [roundingMode, setRoundingMode] = useState<"down" | "nearest">("down");

  const r = useMemo(() => {
    const acct = Math.max(0, toNumberOrZero(accountSize));
    const riskPct = clamp(toNumberOrZero(riskPercent), 0, 100);

    const stop = Math.max(0, toNumberOrZero(stopDistancePerBarrel));
    const bpc = clamp(toNumberOrZero(barrelsPerContract), 0, 10_000_000);

    const riskBudget = acct * (riskPct / 100);

    const riskPerContract = stop * bpc;

    const rawContracts = safeDiv(riskBudget, riskPerContract);

    const contracts =
      roundingMode === "down"
        ? Math.floor(rawContracts)
        : Math.round(rawContracts);

    const invalid = acct <= 0 || riskPct <= 0 || stop <= 0 || bpc <= 0;

    const totalRiskIfTrade = contracts * riskPerContract;

    const unusedRiskBudget = Math.max(0, riskBudget - totalRiskIfTrade);

    return {
      acct,
      riskPct,
      stop,
      bpc,
      riskBudget,
      riskPerContract,
      rawContracts,
      contracts,
      totalRiskIfTrade,
      unusedRiskBudget,
      invalid,
    };
  }, [
    accountSize,
    riskPercent,
    stopDistancePerBarrel,
    barrelsPerContract,
    roundingMode,
  ]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Position sizing uses a simple risk model: decide how much you can lose if your stop is hit,
        then compute how many contracts fit inside that risk budget.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Account size ($)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="1"
              value={accountSize}
              onChange={(e) => setAccountSize(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Your trading account equity (or the capital allocated to this strategy).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Risk per trade (%)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Common ranges: 0.25%–2% depending on strategy and volatility.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Stop distance ($ per barrel)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="0.01"
              value={stopDistancePerBarrel}
              onChange={(e) => setStopDistancePerBarrel(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              How far price can move against you before you exit.
            </p>
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
              Contract size (varies by product).
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Rounding</label>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className={`px-3 py-2 rounded border text-sm ${
                roundingMode === "down" ? "font-semibold" : "opacity-80"
              }`}
              onClick={() => setRoundingMode("down")}
            >
              Round down (safer)
            </button>
            <button
              type="button"
              className={`px-3 py-2 rounded border text-sm ${
                roundingMode === "nearest" ? "font-semibold" : "opacity-80"
              }`}
              onClick={() => setRoundingMode("nearest")}
            >
              Round to nearest
            </button>
          </div>
          <p className="text-xs opacity-70 mt-2">
            Futures contracts are discrete. “Round down” is typical risk management.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        {r.invalid ? (
          <p className="text-sm opacity-80">
            Enter positive values to calculate position size.
          </p>
        ) : (
          <>
            <p className="text-sm opacity-80">
              Risk budget: <span className="font-semibold">${r.riskBudget.toFixed(2)}</span>
              {" "}({r.riskPct.toFixed(2)}% of ${r.acct.toFixed(2)})
            </p>

            <p className="text-sm opacity-80">
              Risk per contract: <span className="font-semibold">${r.riskPerContract.toFixed(2)}</span>
              {" "}(stop {r.stop.toFixed(2)} × {r.bpc.toLocaleString()} bbl)
            </p>

            <p className="font-extrabold text-lg">
              Estimated contracts: {r.contracts.toLocaleString()}
              <span className="text-sm font-normal opacity-70">
                {" "} (raw: {r.rawContracts.toFixed(3)})
              </span>
            </p>

            <div className="pt-2 space-y-1">
              <p className="text-sm opacity-80">
                Total risk if traded: ${r.totalRiskIfTrade.toFixed(2)}
              </p>
              <p className="text-sm opacity-80">
                Unused risk budget: ${r.unusedRiskBudget.toFixed(2)}
              </p>
              <p className="text-xs opacity-70">
                This assumes you exit exactly at the stop. Slippage and gaps can increase realized loss.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
