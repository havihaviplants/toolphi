"use client";

import { useMemo, useState } from "react";

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

export default function CommodityPriceChangeMarginCalculator() {
  // Commodity
  const [commodityUnitPrice, setCommodityUnitPrice] = useState<number>(3.2);
  const [priceChangePct, setPriceChangePct] = useState<number>(10);

  // Usage / volume
  const [usagePerUnit, setUsagePerUnit] = useState<number>(1.8);
  const [annualUnits, setAnnualUnits] = useState<number>(50000);

  // Product economics
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState<number>(18);
  const [otherUnitCosts, setOtherUnitCosts] = useState<number>(10.5);

  const r = useMemo(() => {
    const p = clampMin(commodityUnitPrice, 0);
    const ch = priceChangePct; // allow negative
    const u = clampMin(usagePerUnit, 0);
    const vol = clampMin(annualUnits, 0);

    const sell = clampMin(sellingPricePerUnit, 0);
    const other = clampMin(otherUnitCosts, 0);

    const currentCommodityCostPerUnit = u * p;
    const newCommodityUnitPrice = p * (1 + ch / 100);
    const newCommodityCostPerUnit = u * newCommodityUnitPrice;

    const currentUnitCost = currentCommodityCostPerUnit + other;
    const newUnitCost = newCommodityCostPerUnit + other;

    const currentUnitMargin = sell - currentUnitCost;
    const newUnitMargin = sell - newUnitCost;

    const unitMarginChange = newUnitMargin - currentUnitMargin;

    const currentAnnualProfit = currentUnitMargin * vol;
    const newAnnualProfit = newUnitMargin * vol;
    const annualProfitChange = newAnnualProfit - currentAnnualProfit;

    const currentMarginPct = sell > 0 ? (currentUnitMargin / sell) * 100 : 0;
    const newMarginPct = sell > 0 ? (newUnitMargin / sell) * 100 : 0;

    // Pass-through needed per unit to keep the same unit margin
    const requiredPricePerUnit = newUnitCost + currentUnitMargin;
    const requiredPriceIncreasePerUnit = Math.max(0, requiredPricePerUnit - sell);
    const requiredPriceIncreasePct = sell > 0 ? (requiredPriceIncreasePerUnit / sell) * 100 : 0;

    const note =
      vol <= 0
        ? "Enter a positive annual production volume to estimate annual profit impact."
        : sell <= 0
        ? "Enter a selling price to evaluate unit margin."
        : "Tip: If your commodity price can go both ways, test negative and positive scenarios to bracket your risk.";

    return {
      currentCommodityCostPerUnit,
      newCommodityUnitPrice,
      newCommodityCostPerUnit,
      currentUnitCost,
      newUnitCost,
      currentUnitMargin,
      newUnitMargin,
      unitMarginChange,
      currentAnnualProfit,
      newAnnualProfit,
      annualProfitChange,
      currentMarginPct,
      newMarginPct,
      requiredPricePerUnit,
      requiredPriceIncreasePerUnit,
      requiredPriceIncreasePct,
      note,
    };
  }, [
    commodityUnitPrice,
    priceChangePct,
    usagePerUnit,
    annualUnits,
    sellingPricePerUnit,
    otherUnitCosts,
  ]);

  const signedMoney2 = (v: number) =>
    v >= 0 ? `+$${money2(v)}` : `-$${money2(Math.abs(v))}`;
  const signedMoney0 = (v: number) =>
    v >= 0 ? `+$${money0(v)}` : `-$${money0(Math.abs(v))}`;

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Calculate how a <strong>commodity price change</strong> affects your <strong>unit margin</strong> and{" "}
        <strong>annual profit</strong> based on usage per unit and production volume.
      </p>

      {/* Inputs */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Commodity inputs</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Commodity unit price ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={commodityUnitPrice}
              onChange={(e) => setCommodityUnitPrice(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Current purchase price per commodity unit.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Price change (%)</label>
            <input
              className="input"
              type="number"
              step="0.5"
              value={priceChangePct}
              onChange={(e) => setPriceChangePct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Use negative values for price declines.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Usage & volume</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Commodity usage per product unit</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={usagePerUnit}
              onChange={(e) => setUsagePerUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">How much commodity is consumed per unit produced.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Annual production volume (units)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="100"
              value={annualUnits}
              onChange={(e) => setAnnualUnits(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Total units produced/sold per year.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Unit economics</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Selling price per unit ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={sellingPricePerUnit}
              onChange={(e) => setSellingPricePerUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Average realized price per unit.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Other unit costs ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={otherUnitCosts}
              onChange={(e) => setOtherUnitCosts(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">All non-commodity costs per unit.</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Commodity cost per unit</p>
            <p className="text-sm">
              Current: <strong>${money2(r.currentCommodityCostPerUnit)}</strong>
              <br />
              New: <strong>${money2(r.newCommodityCostPerUnit)}</strong>
              <br />
              Change: <strong>{signedMoney2(r.newCommodityCostPerUnit - r.currentCommodityCostPerUnit)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Unit margin</p>
            <p className="text-sm">
              Margin: <strong>${money2(r.currentUnitMargin)}</strong> → <strong>${money2(r.newUnitMargin)}</strong>
              <br />
              Margin %: <strong>{pct2(r.currentMarginPct)} → {pct2(r.newMarginPct)}</strong>
              <br />
              Change: <strong>{signedMoney2(r.unitMarginChange)}</strong>
            </p>
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-1">
          <p className="text-sm opacity-70">Annual profit impact</p>
          <p className="text-sm">
            Annual profit: <strong>${money0(r.currentAnnualProfit)}</strong> → <strong>${money0(r.newAnnualProfit)}</strong>
            <br />
            Profit change: <strong>{signedMoney0(r.annualProfitChange)}</strong>
          </p>
          <p className="text-xs opacity-70 mt-1">
            Annual profit here is approximated as unit margin × annual volume.
          </p>
        </div>

        <div className="rounded-md border p-3 space-y-1">
          <p className="text-sm opacity-70">Price pass-through (simple)</p>
          <p className="text-sm">
            Required selling price to keep original unit margin: <strong>${money2(r.requiredPricePerUnit)}</strong>
            <br />
            Required price increase: <strong>${money2(r.requiredPriceIncreasePerUnit)}</strong> (
            <strong>{pct2(r.requiredPriceIncreasePct)}</strong>)
          </p>
          <p className="text-xs opacity-70 mt-1">Assumes constant volume and other costs.</p>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      {/* How it works + FAQ */}
      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Commodity cost per unit = usage per unit × commodity unit price.</li>
          <li>Unit margin = selling price − (commodity cost + other unit costs).</li>
          <li>Annual profit ≈ unit margin × annual volume.</li>
          <li>Pass-through estimate shows price needed to keep the original unit margin.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Why allow negative price change?</span>
            <br />
            Commodity prices move both ways. Negative scenarios help you estimate upside too.
          </p>
          <p>
            <span className="font-medium">Is annual profit here “true profit”?</span>
            <br />
            It’s a unit-economics approximation. For full P&amp;L, use a total-cost profit tool.
          </p>
        </div>
      </div>
    </div>
  );
}
