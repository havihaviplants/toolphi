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

export default function CostInflationWorkingCapitalImpactCalculator() {
  const [unitCost, setUnitCost] = useState<number>(8);
  const [costIncreasePct, setCostIncreasePct] = useState<number>(12);
  const [avgInventoryUnits, setAvgInventoryUnits] = useState<number>(50000);

  // Optional: model net working capital change via AR/AP days on sales/purchases.
  const [showNetWC, setShowNetWC] = useState<boolean>(false);
  const [annualUnitsSold, setAnnualUnitsSold] = useState<number>(600000); // for AR/AP scaling
  const [sellingPrice, setSellingPrice] = useState<number>(12); // for AR estimate
  const [arDays, setArDays] = useState<number>(30);
  const [apDays, setApDays] = useState<number>(30);

  const r = useMemo(() => {
    const c0 = clampMin(unitCost, 0);
    const inc = n(costIncreasePct) / 100;
    const invUnits = clampMin(avgInventoryUnits, 0);

    const c1 = c0 * (1 + inc);

    const invValue0 = c0 * invUnits;
    const invValue1 = c1 * invUnits;
    const invDelta = invValue1 - invValue0;

    // Net WC (optional approximation):
    // AR ≈ (Annual revenue / 365) * AR days
    // AP ≈ (Annual COGS purchases / 365) * AP days
    // Here we treat annual purchases ≈ annual units sold * unit cost (before/after).
    const unitsSold = clampMin(annualUnitsSold, 0);
    const p = clampMin(sellingPrice, 0);
    const dAR = clampMin(arDays, 0);
    const dAP = clampMin(apDays, 0);

    const annualRevenue = unitsSold * p;
    const annualPurchases0 = unitsSold * c0;
    const annualPurchases1 = unitsSold * c1;

    const ar = (annualRevenue / 365) * dAR;
    const ap0 = (annualPurchases0 / 365) * dAP;
    const ap1 = (annualPurchases1 / 365) * dAP;

    // Net WC = Inventory + AR - AP
    const netWC0 = invValue0 + ar - ap0;
    const netWC1 = invValue1 + ar - ap1;
    const netWCDelta = netWC1 - netWC0;

    let note =
      "Higher unit costs increase the cash tied up in inventory. This tool estimates the added working capital needed to keep the same inventory units.";
    if (invUnits <= 0) note = "Enter average inventory units to estimate inventory cash tied up.";
    if (c0 <= 0) note = "Enter a unit cost greater than zero.";
    if (showNetWC && unitsSold <= 0)
      note = "For net working capital, enter annual units sold (or a rough annual volume).";

    return {
      c1,
      invValue0,
      invValue1,
      invDelta,
      netWC0,
      netWC1,
      netWCDelta,
      ar,
      ap0,
      ap1,
      note,
      annualRevenue,
      annualPurchases0,
      annualPurchases1,
    };
  }, [
    unitCost,
    costIncreasePct,
    avgInventoryUnits,
    showNetWC,
    annualUnitsSold,
    sellingPrice,
    arDays,
    apDays,
  ]);

  const signedMoney0 = (v: number) =>
    v >= 0 ? `+$${money0(v)}` : `-$${money0(Math.abs(v))}`;

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate how <strong>cost inflation</strong> increases cash tied up in{" "}
        <strong>inventory</strong> and (optionally) the change in{" "}
        <strong>net working capital</strong>.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Inventory inputs</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Current unit cost ($ / unit)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={unitCost}
              onChange={(e) => setUnitCost(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Use landed/fully-loaded unit cost if possible.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Cost increase (%)</label>
            <input
              className="input"
              type="number"
              step="0.5"
              value={costIncreasePct}
              onChange={(e) => setCostIncreasePct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Expected unit cost inflation.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Average inventory units on hand</label>
            <input
              className="input"
              type="number"
              min={0}
              step="100"
              value={avgInventoryUnits}
              onChange={(e) => setAvgInventoryUnits(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Average units you keep in inventory.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">New unit cost ($ / unit)</label>
            <input className="input" type="text" value={`$${money2(r.c1)}`} readOnly />
            <p className="text-xs opacity-70 mt-1">Calculated from cost increase %.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Inventory working capital impact</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Inventory value (before)</p>
            <p className="text-sm">
              <strong>${money0(r.invValue0)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Inventory value (after)</p>
            <p className="text-sm">
              <strong>${money0(r.invValue1)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1 sm:col-span-2">
            <p className="text-sm opacity-70">Extra cash tied up in inventory</p>
            <p className="text-sm">
              Change: <strong>{signedMoney0(r.invDelta)}</strong>
              <br />
              Percent change: <strong>{pct2(costIncreasePct)}</strong>
            </p>
            <p className="text-xs opacity-70 mt-1">
              This assumes you keep the same inventory units after costs rise.
            </p>
          </div>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold">Optional: net working capital</div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showNetWC}
              onChange={(e) => setShowNetWC(e.target.checked)}
            />
            Include AR/AP
          </label>
        </div>

        {showNetWC ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">Annual units sold</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  step="1000"
                  value={annualUnitsSold}
                  onChange={(e) => setAnnualUnitsSold(Number(e.target.value))}
                />
                <p className="text-xs opacity-70 mt-1">
                  Rough annual volume for AR/AP scaling.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium">Selling price ($ / unit)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  step="0.01"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                />
                <p className="text-xs opacity-70 mt-1">
                  Used to estimate AR (receivables).
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium">Accounts receivable days (AR)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  step="1"
                  value={arDays}
                  onChange={(e) => setArDays(Number(e.target.value))}
                />
                <p className="text-xs opacity-70 mt-1">Average days to collect cash.</p>
              </div>

              <div>
                <label className="block text-sm font-medium">Accounts payable days (AP)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  step="1"
                  value={apDays}
                  onChange={(e) => setApDays(Number(e.target.value))}
                />
                <p className="text-xs opacity-70 mt-1">Average days you take to pay suppliers.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border p-3 space-y-1">
                <p className="text-sm opacity-70">Net working capital (before)</p>
                <p className="text-sm">
                  <strong>${money0(r.netWC0)}</strong>
                </p>
                <p className="text-xs opacity-70">
                  Net WC = Inventory + AR − AP
                </p>
              </div>

              <div className="rounded-md border p-3 space-y-1">
                <p className="text-sm opacity-70">Net working capital (after)</p>
                <p className="text-sm">
                  <strong>${money0(r.netWC1)}</strong>
                </p>
                <p className="text-xs opacity-70">
                  AR held constant; AP increases with higher purchases.
                </p>
              </div>

              <div className="rounded-md border p-3 space-y-1 sm:col-span-2">
                <p className="text-sm opacity-70">Change in net working capital</p>
                <p className="text-sm">
                  Change: <strong>{signedMoney0(r.netWCDelta)}</strong>
                </p>
                <p className="text-xs opacity-70 mt-1">
                  This is a simplified approximation for planning, not accounting advice.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm opacity-80">
            Turn this on if you want a rough <strong>net working capital</strong> estimate including receivables and payables.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Inventory value = unit cost × average inventory units.</li>
          <li>Cost inflation increases inventory value (cash tied up) linearly.</li>
          <li>Optional net WC approximation: Net WC = Inventory + AR − AP.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Why focus on inventory?</span>
            <br />
            Inventory is often the largest cash sink that scales directly with unit cost inflation.
          </p>
          <p>
            <span className="font-medium">Does higher cost always increase net working capital?</span>
            <br />
            Not always—if suppliers extend payment terms (AP days) meaningfully, it can offset some of the increase.
          </p>
        </div>
      </div>
    </div>
  );
}
