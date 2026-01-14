"use client";

import { useMemo, useState } from "react";

type Mode = "units" | "spend";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}
function clampMin(v: number, min: number) {
  return Math.max(min, n(v));
}
function money0(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function money2(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function pct2(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return `${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

export default function SupplierPriceIncreaseNegotiationSavingsCalculator() {
  const [mode, setMode] = useState<Mode>("units");

  // units mode
  const [annualUnits, setAnnualUnits] = useState<number>(600000);
  const [unitPrice, setUnitPrice] = useState<number>(8);

  // spend mode
  const [annualSpend, setAnnualSpend] = useState<number>(4_800_000);

  // common
  const [proposedIncreasePct, setProposedIncreasePct] = useState<number>(12);
  const [negotiatedIncreasePct, setNegotiatedIncreasePct] = useState<number>(7);

  // optional pass-through
  const [passThroughPct, setPassThroughPct] = useState<number>(30);

  const r = useMemo(() => {
    const proposed = n(proposedIncreasePct) / 100;
    const negotiated = n(negotiatedIncreasePct) / 100;
    const pass = clampMin(passThroughPct, 0) / 100;

    const units = clampMin(annualUnits, 0);
    const price = clampMin(unitPrice, 0);
    const spend0 = clampMin(annualSpend, 0);

    const baseCost =
      mode === "units" ? units * price : spend0;

    const proposedCost = baseCost * (1 + proposed);
    const negotiatedCost = baseCost * (1 + negotiated);

    const proposedIncrease$ = proposedCost - baseCost;
    const negotiatedIncrease$ = negotiatedCost - baseCost;

    const savings$ = proposedCost - negotiatedCost;

    const savingsPerUnit =
      mode === "units" && units > 0 ? savings$ / units : 0;

    // absorbed cost after pass-through
    const proposedAbsorbed = proposedIncrease$ * (1 - pass);
    const negotiatedAbsorbed = negotiatedIncrease$ * (1 - pass);
    const absorbedSavings = proposedAbsorbed - negotiatedAbsorbed;

    let flag = "OK";
    if (baseCost <= 0) flag = "Enter purchases/spend greater than zero.";
    else if (negotiated > proposed) flag = "Negotiated increase is higher than proposed (check inputs).";
    else if (savings$ <= 0) flag = "No savings vs proposed (check increases).";

    const note =
      "This compares the supplier’s proposed increase vs your negotiated increase. If you can pass some costs to customers, the ‘absorbed’ portion shows what hits your margin/cash directly.";

    return {
      baseCost,
      proposedCost,
      negotiatedCost,
      proposedIncrease$,
      negotiatedIncrease$,
      savings$,
      savingsPerUnit,
      proposedAbsorbed,
      negotiatedAbsorbed,
      absorbedSavings,
      flag,
      note,
    };
  }, [
    mode,
    annualUnits,
    unitPrice,
    annualSpend,
    proposedIncreasePct,
    negotiatedIncreasePct,
    passThroughPct,
  ]);

  const signedMoney0 = (v: number) =>
    v >= 0 ? `+$${money0(v)}` : `-$${money0(Math.abs(v))}`;

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate how much you save annually by negotiating a <strong>lower supplier price increase</strong>{" "}
        compared with the supplier’s proposed increase.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Input mode</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className={`rounded-md border px-3 py-2 text-sm text-left ${
              mode === "units" ? "bg-black text-white" : ""
            }`}
            onClick={() => setMode("units")}
          >
            <div className="font-medium">Units + unit price</div>
            <div className="text-xs opacity-80">Compute annual spend from volume × price.</div>
          </button>

          <button
            type="button"
            className={`rounded-md border px-3 py-2 text-sm text-left ${
              mode === "spend" ? "bg-black text-white" : ""
            }`}
            onClick={() => setMode("spend")}
          >
            <div className="font-medium">Annual spend</div>
            <div className="text-xs opacity-80">Enter total annual purchases directly.</div>
          </button>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Purchases</div>

        {mode === "units" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Annual purchase volume (units)</label>
              <input
                className="input"
                type="number"
                min={0}
                step="1000"
                value={annualUnits}
                onChange={(e) => setAnnualUnits(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">Your annual purchased units from the supplier.</p>
            </div>

            <div>
              <label className="block text-sm font-medium">Current unit price ($)</label>
              <input
                className="input"
                type="number"
                min={0}
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">Current negotiated unit price.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Current annual spend ($)</label>
              <input
                className="input"
                type="number"
                min={0}
                step="10000"
                value={annualSpend}
                onChange={(e) => setAnnualSpend(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">Total annual purchases from the supplier.</p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Price increase scenarios</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Supplier proposed increase (%)</label>
            <input
              className="input"
              type="number"
              step="0.5"
              value={proposedIncreasePct}
              onChange={(e) => setProposedIncreasePct(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Negotiated increase (%)</label>
            <input
              className="input"
              type="number"
              step="0.5"
              value={negotiatedIncreasePct}
              onChange={(e) => setNegotiatedIncreasePct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Lower than proposed → saves money vs the proposed outcome.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Pass-through rate (%) (optional)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={passThroughPct}
              onChange={(e) => setPassThroughPct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              If you can raise customer prices, some of the increase is passed through.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Annual cost</p>
            <p className="text-sm">
              Before: <strong>${money0(r.baseCost)}</strong>
              <br />
              Proposed: <strong>${money0(r.proposedCost)}</strong>
              <br />
              Negotiated: <strong>${money0(r.negotiatedCost)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Negotiation savings</p>
            <p className="text-sm">
              Savings vs proposed: <strong>${money0(r.savings$)}</strong>
              <br />
              Savings per unit: <strong>${money2(r.savingsPerUnit)}</strong>
            </p>
            <p className="text-xs opacity-70 mt-1">
              Savings = proposed cost − negotiated cost
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1 sm:col-span-2">
            <p className="text-sm opacity-70">Absorbed cost (after pass-through)</p>
            <p className="text-sm">
              Proposed absorbed increase: <strong>${money0(r.proposedAbsorbed)}</strong>
              <br />
              Negotiated absorbed increase: <strong>${money0(r.negotiatedAbsorbed)}</strong>
              <br />
              Absorbed savings: <strong>{signedMoney0(r.absorbedSavings)}</strong>
            </p>
            <p className="text-xs opacity-70 mt-1">
              Absorbed increase = increase × (1 − pass-through rate)
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1 sm:col-span-2">
            <p className="text-sm opacity-70">Flag</p>
            <p className="text-sm">
              <strong>{r.flag}</strong>
            </p>
          </div>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Compute baseline annual cost from purchases/spend.</li>
          <li>Apply proposed vs negotiated increases to get two “after” outcomes.</li>
          <li>Savings = proposed cost − negotiated cost.</li>
          <li>Optional pass-through shows how much increase is absorbed vs passed to customers.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">What if the supplier raises price in multiple steps?</span>
            <br />
            Use a weighted average increase or run multiple scenarios.
          </p>
          <p>
            <span className="font-medium">Is pass-through required?</span>
            <br />
            No. It’s optional and mainly helps interpret the margin hit.
          </p>
        </div>
      </div>
    </div>
  );
}
