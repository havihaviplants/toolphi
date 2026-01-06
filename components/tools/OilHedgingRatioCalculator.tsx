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

type Rounding = "down" | "nearest" | "up";

export default function OilHedgingRatioCalculator() {
  const [physicalExposureBarrels, setPhysicalExposureBarrels] = useState<number>(25000);
  const [barrelsPerContract, setBarrelsPerContract] = useState<number>(1000);

  const [hedgeCoveragePercent, setHedgeCoveragePercent] = useState<number>(80);
  const [rounding, setRounding] = useState<Rounding>("nearest");

  const r = useMemo(() => {
    const exposure = Math.max(0, toNumberOrZero(physicalExposureBarrels));
    const bpc = clamp(toNumberOrZero(barrelsPerContract), 0, 10_000_000);

    const coverage = clamp(toNumberOrZero(hedgeCoveragePercent), 0, 100) / 100;

    const hedgedVolume = exposure * coverage;

    const rawContracts = safeDiv(hedgedVolume, bpc);

    let contracts = rawContracts;
    if (rounding === "down") contracts = Math.floor(rawContracts);
    if (rounding === "nearest") contracts = Math.round(rawContracts);
    if (rounding === "up") contracts = Math.ceil(rawContracts);

    const contractsInt = Math.max(0, Number.isFinite(contracts) ? Number(contracts) : 0);

    const impliedHedgedVolume = contractsInt * bpc;
    const impliedCoverage = exposure > 0 ? (impliedHedgedVolume / exposure) * 100 : 0;

    const invalid = exposure <= 0 || bpc <= 0;

    return {
      exposure,
      bpc,
      coveragePct: coverage * 100,
      hedgedVolume,
      rawContracts,
      contractsInt,
      impliedHedgedVolume,
      impliedCoverage,
      invalid,
    };
  }, [physicalExposureBarrels, barrelsPerContract, hedgeCoveragePercent, rounding]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        A simple hedge sizing tool: choose how much of your physical oil exposure you want to hedge,
        then convert that volume into a futures contract count using contract size.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Physical exposure (barrels)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="1"
              value={physicalExposureBarrels}
              onChange={(e) => setPhysicalExposureBarrels(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              If you have gallons, convert to barrels first (or use your own conversion).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Barrels per futures contract</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              step="1"
              value={barrelsPerContract}
              onChange={(e) => setBarrelsPerContract(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Example: 1,000 bbl/contract.</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Hedge coverage (%)</label>
            <input
              className="input mt-1"
              type="number"
              min={0}
              max={100}
              step="1"
              value={hedgeCoveragePercent}
              onChange={(e) => setHedgeCoveragePercent(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              100% hedges the full exposure (in volume terms).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Rounding</label>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className={`px-3 py-2 rounded border text-sm ${
                  rounding === "down" ? "font-semibold" : "opacity-80"
                }`}
                onClick={() => setRounding("down")}
              >
                Round down
              </button>
              <button
                type="button"
                className={`px-3 py-2 rounded border text-sm ${
                  rounding === "nearest" ? "font-semibold" : "opacity-80"
                }`}
                onClick={() => setRounding("nearest")}
              >
                Round nearest
              </button>
              <button
                type="button"
                className={`px-3 py-2 rounded border text-sm ${
                  rounding === "up" ? "font-semibold" : "opacity-80"
                }`}
                onClick={() => setRounding("up")}
              >
                Round up
              </button>
            </div>
            <p className="text-xs opacity-70 mt-2">
              Rounding changes your realized coverage because contracts are discrete.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        {r.invalid ? (
          <p className="text-sm opacity-80">
            Enter a positive exposure and contract size to estimate hedge contracts.
          </p>
        ) : (
          <>
            <p className="text-sm opacity-80">
              Target hedged volume:{" "}
              <span className="font-semibold">{r.hedgedVolume.toLocaleString()}</span> bbl
              {" "}({r.coveragePct.toFixed(0)}% of {r.exposure.toLocaleString()} bbl)
            </p>

            <p className="text-sm opacity-80">
              Raw contracts: <span className="font-semibold">{r.rawContracts.toFixed(3)}</span>
            </p>

            <p className="font-extrabold text-lg">
              Estimated hedge contracts: {r.contractsInt.toLocaleString()}
            </p>

            <div className="pt-2 space-y-1">
              <p className="text-sm opacity-80">
                Implied hedged volume: {r.impliedHedgedVolume.toLocaleString()} bbl
              </p>
              <p className="text-sm opacity-80">
                Implied coverage: {r.impliedCoverage.toFixed(1)}%
              </p>
              <p className="text-xs opacity-70">
                This is volume-based sizing only. Real hedge effectiveness depends on basis risk, contract specs, and timing.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
