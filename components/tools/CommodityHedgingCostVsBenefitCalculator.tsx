"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}
function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n(v)));
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

export default function CommodityHedgingCostVsBenefitCalculator() {
  // Exposure
  const [annualUnits, setAnnualUnits] = useState<number>(500000);
  const [currentPricePerUnit, setCurrentPricePerUnit] = useState<number>(2.4);

  // Scenario
  const [expectedPriceChangePct, setExpectedPriceChangePct] = useState<number>(12); // can be negative
  const [hedgeRatioPct, setHedgeRatioPct] = useState<number>(70);

  // Hedge cost
  const [costMode, setCostMode] = useState<"premiumPct" | "fixedFee">("premiumPct");
  const [hedgePremiumPct, setHedgePremiumPct] = useState<number>(1.5);
  const [fixedFee, setFixedFee] = useState<number>(10000);

  const r = useMemo(() => {
    const units = Math.max(0, n(annualUnits));
    const price = Math.max(0, n(currentPricePerUnit));

    const ch = n(expectedPriceChangePct) / 100;
    const hedgeRatio = clamp(hedgeRatioPct, 0, 100) / 100;

    const notional = units * price; // baseline spend
    const scenarioPrice = price * (1 + ch);

    const unhedgedSpend = units * scenarioPrice;

    // Simple hedge model:
    // - Hedge protects hedgeRatio of the *price change*.
    // - Effective price change on hedged portion is 0 (locked).
    // - Unhedged portion follows scenario.
    const hedgedPortionSpend = units * price * hedgeRatio; // locked at current price
    const unhedgedPortionSpend = units * scenarioPrice * (1 - hedgeRatio);

    const hedgedSpendBeforeCost = hedgedPortionSpend + unhedgedPortionSpend;

    // Hedge cost:
    const premium = Math.max(0, n(hedgePremiumPct)) / 100;
    const hedgeCost =
      costMode === "premiumPct" ? notional * hedgeRatio * premium : Math.max(0, n(fixedFee));

    const hedgedSpend = hedgedSpendBeforeCost + hedgeCost;

    const costDifference = hedgedSpend - unhedgedSpend; // negative means hedge saves money

    const unhedgedChangeFromBaseline = unhedgedSpend - notional;
    const hedgedChangeFromBaseline = hedgedSpend - notional;

    const note =
      units <= 0
        ? "Enter annual commodity usage to estimate spend."
        : "Tip: This is a simplified hedge model. It’s useful for quick decision-making, not for pricing derivatives.";

    return {
      notional,
      scenarioPrice,
      unhedgedSpend,
      hedgedSpendBeforeCost,
      hedgeCost,
      hedgedSpend,
      costDifference,
      unhedgedChangeFromBaseline,
      hedgedChangeFromBaseline,
      note,
    };
  }, [
    annualUnits,
    currentPricePerUnit,
    expectedPriceChangePct,
    hedgeRatioPct,
    costMode,
    hedgePremiumPct,
    fixedFee,
  ]);

  const signedMoney0 = (v: number) =>
    v >= 0 ? `+$${money0(v)}` : `-$${money0(Math.abs(v))}`;

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate the <strong>cost vs benefit of hedging</strong> a commodity price change using a hedge ratio and a
        simplified hedging cost model.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Exposure</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Annual commodity usage (units)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={annualUnits}
              onChange={(e) => setAnnualUnits(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Total units purchased per year.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Current price per unit ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={currentPricePerUnit}
              onChange={(e) => setCurrentPricePerUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Current commodity purchase price.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Scenario & hedge</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Expected price change (%)</label>
            <input
              className="input"
              type="number"
              step="0.5"
              value={expectedPriceChangePct}
              onChange={(e) => setExpectedPriceChangePct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Use negative values for expected declines.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Hedge ratio (%)</label>
            <input
              className="input"
              type="number"
              min={0}
              max={100}
              step="1"
              value={hedgeRatioPct}
              onChange={(e) => setHedgeRatioPct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Percent of exposure you hedge (coverage).</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Hedging cost</div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`px-3 py-1 rounded border text-sm ${costMode === "premiumPct" ? "font-semibold" : "opacity-80"}`}
            onClick={() => setCostMode("premiumPct")}
          >
            Premium (% of hedged notional)
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded border text-sm ${costMode === "fixedFee" ? "font-semibold" : "opacity-80"}`}
            onClick={() => setCostMode("fixedFee")}
          >
            Fixed fee ($)
          </button>
        </div>

        {costMode === "premiumPct" ? (
          <div>
            <label className="block text-sm font-medium">Hedging premium (%)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.1"
              value={hedgePremiumPct}
              onChange={(e) => setHedgePremiumPct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Simple proxy for option premium / hedge carry cost.</p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium">Fixed hedging fee ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="100"
              value={fixedFee}
              onChange={(e) => setFixedFee(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Broker fees, admin cost, or flat premium approximation.</p>
          </div>
        )}
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Baseline & scenario</p>
            <p className="text-sm">
              Baseline spend: <strong>${money0(r.notional)}</strong>
              <br />
              Scenario price: <strong>${money2(r.scenarioPrice)}</strong>
              <br />
              Unhedged spend: <strong>${money0(r.unhedgedSpend)}</strong> (
              <strong>{signedMoney0(r.unhedgedChangeFromBaseline)}</strong>)
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Hedged outcome</p>
            <p className="text-sm">
              Hedge cost: <strong>${money0(r.hedgeCost)}</strong>
              <br />
              Hedged spend: <strong>${money0(r.hedgedSpend)}</strong> (
              <strong>{signedMoney0(r.hedgedChangeFromBaseline)}</strong>)
            </p>
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-1">
          <p className="text-sm opacity-70">Net impact (hedged − unhedged)</p>
          <p className="text-sm">
            Difference: <strong>{signedMoney0(r.costDifference)}</strong>
          </p>
          <p className="text-xs opacity-70 mt-1">
            Negative means hedging is cheaper than unhedged under this scenario (saves money). Positive means it costs more.
          </p>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Unhedged spend uses the scenario price for all units.</li>
          <li>Hedged portion is assumed locked at current price (simplified).</li>
          <li>Hedge cost is modeled as a premium (% of hedged notional) or fixed fee.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Is this accurate for options/futures pricing?</span>
            <br />
            No—this is a simplified planning model. It helps compare “roughly worth it” scenarios.
          </p>
          <p>
            <span className="font-medium">What if prices fall?</span>
            <br />
            Hedging can reduce downside benefit. Test negative price-change scenarios to see opportunity cost.
          </p>
        </div>
      </div>
    </div>
  );
}
