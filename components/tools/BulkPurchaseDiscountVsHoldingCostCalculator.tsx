"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}
function clampMin(v: number, min: number) {
  return Math.max(min, n(v));
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

export default function BulkPurchaseDiscountVsHoldingCostCalculator() {
  // Pricing
  const [regularUnitPrice, setRegularUnitPrice] = useState<number>(5);
  const [discountMode, setDiscountMode] = useState<"percent" | "discountedPrice">("percent");
  const [discountPct, setDiscountPct] = useState<number>(8);
  const [discountedUnitPrice, setDiscountedUnitPrice] = useState<number>(4.6);

  // Quantity & usage
  const [bulkPurchaseUnits, setBulkPurchaseUnits] = useState<number>(80000);
  const [monthlyUsageUnits, setMonthlyUsageUnits] = useState<number>(20000);

  // Carrying costs
  const [annualCarryRatePct, setAnnualCarryRatePct] = useState<number>(18);

  const r = useMemo(() => {
    const reg = clampMin(regularUnitPrice, 0);
    const discPct = n(discountPct) / 100;
    const discPriceInput = clampMin(discountedUnitPrice, 0);

    const bulk = clampMin(bulkPurchaseUnits, 0);
    const monthlyUse = clampMin(monthlyUsageUnits, 0);

    const carryRate = clampMin(annualCarryRatePct, 0) / 100;

    const bulkUnitPrice =
      discountMode === "percent" ? reg * (1 - discPct) : discPriceInput;

    const unitDiscount = Math.max(0, reg - bulkUnitPrice);

    const grossDiscountSavings = unitDiscount * bulk;

    // Inventory time & average inventory approximation:
    // If you buy 'bulk' units and consume 'monthlyUse' per month,
    // the inventory lasts bulk/monthlyUse months.
    const monthsOfSupply = monthlyUse > 0 ? bulk / monthlyUse : 0;

    // Average inventory value over the period ≈ (starting inventory / 2) × unit price
    // Using bulk unit price as inventory value basis (conservative to discount case).
    const avgInventoryUnits = bulk / 2;
    const avgInventoryValue = avgInventoryUnits * bulkUnitPrice;

    // Holding cost over that period:
    const holdingCost = avgInventoryValue * carryRate * (monthsOfSupply / 12);

    const netSavings = grossDiscountSavings - holdingCost;

    // Break-even months: when holding cost equals gross discount savings.
    // holdingCost = avgInvValue * carryRate * (m/12)
    // m = (12 * grossDiscountSavings) / (avgInvValue * carryRate)
    const breakEvenMonths =
      avgInventoryValue > 0 && carryRate > 0
        ? (12 * grossDiscountSavings) / (avgInventoryValue * carryRate)
        : 0;

    const note =
      bulk <= 0
        ? "Enter bulk purchase units to compare discount vs holding cost."
        : monthlyUse <= 0
        ? "Enter monthly usage to estimate how long you’ll hold inventory."
        : "Tip: If spoilage/obsolescence is meaningful, increase the carrying rate to reflect write-down risk.";

    return {
      bulkUnitPrice,
      unitDiscount,
      grossDiscountSavings,
      monthsOfSupply,
      avgInventoryValue,
      holdingCost,
      netSavings,
      breakEvenMonths,
      note,
    };
  }, [
    regularUnitPrice,
    discountMode,
    discountPct,
    discountedUnitPrice,
    bulkPurchaseUnits,
    monthlyUsageUnits,
    annualCarryRatePct,
  ]);

  const signedMoney0 = (v: number) =>
    v >= 0 ? `+$${money0(v)}` : `-$${money0(Math.abs(v))}`;

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Compare <strong>bulk purchase discounts</strong> against <strong>inventory holding costs</strong> to estimate
        net savings and break-even holding time.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Pricing</div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`px-3 py-1 rounded border text-sm ${discountMode === "percent" ? "font-semibold" : "opacity-80"}`}
            onClick={() => setDiscountMode("percent")}
          >
            Discount (%)
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded border text-sm ${discountMode === "discountedPrice" ? "font-semibold" : "opacity-80"}`}
            onClick={() => setDiscountMode("discountedPrice")}
          >
            Discounted price ($)
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Regular unit price ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={regularUnitPrice}
              onChange={(e) => setRegularUnitPrice(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Price without bulk discount.</p>
          </div>

          {discountMode === "percent" ? (
            <div>
              <label className="block text-sm font-medium">Bulk discount (%)</label>
              <input
                className="input"
                type="number"
                step="0.5"
                value={discountPct}
                onChange={(e) => setDiscountPct(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">Percent discount offered for bulk buying.</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium">Discounted unit price ($)</label>
              <input
                className="input"
                type="number"
                min={0}
                step="0.01"
                value={discountedUnitPrice}
                onChange={(e) => setDiscountedUnitPrice(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">Price per unit if you buy in bulk.</p>
            </div>
          )}
        </div>

        <p className="text-xs opacity-70">
          Bulk unit price: <strong>${money2(r.bulkUnitPrice)}</strong> (unit discount:{" "}
          <strong>${money2(r.unitDiscount)}</strong>)
        </p>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Quantity & usage</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Bulk purchase units</label>
            <input
              className="input"
              type="number"
              min={0}
              step="100"
              value={bulkPurchaseUnits}
              onChange={(e) => setBulkPurchaseUnits(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">How many units you buy in the bulk order.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Monthly usage (units)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="10"
              value={monthlyUsageUnits}
              onChange={(e) => setMonthlyUsageUnits(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Average monthly consumption of this input.</p>
          </div>
        </div>

        <p className="text-xs opacity-70">
          Estimated months of supply: <strong>{r.monthsOfSupply.toLocaleString("en-US", { maximumFractionDigits: 2 })}</strong>
        </p>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Holding cost</div>

        <div>
          <label className="block text-sm font-medium">Annual carrying cost rate (%)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.5"
            value={annualCarryRatePct}
            onChange={(e) => setAnnualCarryRatePct(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Includes cost of capital, storage, insurance, shrinkage, and write-down risk.
          </p>
        </div>

        <p className="text-xs opacity-70">
          Average inventory value (approx): <strong>${money0(r.avgInventoryValue)}</strong>
        </p>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Discount savings</p>
            <p className="text-sm">
              Gross discount savings: <strong>${money0(r.grossDiscountSavings)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Holding cost</p>
            <p className="text-sm">
              Estimated holding cost: <strong>-${money0(r.holdingCost)}</strong>
            </p>
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-1">
          <p className="text-sm opacity-70">Net outcome</p>
          <p className="text-sm">
            Net savings: <strong>{signedMoney0(r.netSavings)}</strong>
          </p>
          <p className="text-xs opacity-70 mt-1">
            Positive means bulk discount outweighs holding cost (under these assumptions).
          </p>
        </div>

        <div className="rounded-md border p-3 space-y-1">
          <p className="text-sm opacity-70">Break-even holding months</p>
          <p className="text-sm">
            Break-even months:{" "}
            <strong>{r.breakEvenMonths.toLocaleString("en-US", { maximumFractionDigits: 2 })}</strong>
          </p>
          <p className="text-xs opacity-70 mt-1">
            If you expect to hold inventory longer than this, the carrying cost may erase the discount benefit.
          </p>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Gross discount savings = (regular price − bulk price) × bulk units.</li>
          <li>Months of supply = bulk units ÷ monthly usage.</li>
          <li>Average inventory (approx) ≈ bulk units ÷ 2.</li>
          <li>Holding cost ≈ avg inventory value × carrying rate × (months/12).</li>
          <li>Net savings = discount savings − holding cost.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Why use average inventory (bulk/2)?</span>
            <br />
            If you consume inventory steadily, inventory declines linearly, so average on-hand is about half of starting inventory.
          </p>
          <p>
            <span className="font-medium">What if usage is seasonal?</span>
            <br />
            This tool assumes steady usage. For seasonal usage, treat monthly usage as your weighted average or test scenarios.
          </p>
        </div>
      </div>
    </div>
  );
}
