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

export default function SupplierPriceIncreaseCostCalculator() {
  // Supplier pricing
  const [supplierUnitPrice, setSupplierUnitPrice] = useState<number>(4);
  const [priceIncreasePct, setPriceIncreasePct] = useState<number>(9);

  // Usage & volume
  const [inputUnitsPerProductUnit, setInputUnitsPerProductUnit] = useState<number>(2.2);
  const [annualProductionUnits, setAnnualProductionUnits] = useState<number>(60000);

  // Coverage
  const [supplierSharePct, setSupplierSharePct] = useState<number>(70);

  const r = useMemo(() => {
    const p = clampMin(supplierUnitPrice, 0);
    const inc = n(priceIncreasePct); // allow negative if needed
    const usage = clampMin(inputUnitsPerProductUnit, 0);
    const vol = clampMin(annualProductionUnits, 0);
    const share = Math.min(100, Math.max(0, n(supplierSharePct))) / 100;

    const newSupplierUnitPrice = p * (1 + inc / 100);

    const annualInputUnits = usage * vol;
    const supplierCoveredInputUnits = annualInputUnits * share;

    const currentAnnualSpend = p * supplierCoveredInputUnits;
    const newAnnualSpend = newSupplierUnitPrice * supplierCoveredInputUnits;
    const annualSpendChange = newAnnualSpend - currentAnnualSpend;

    const currentCostPerProductUnit = usage * p * share;
    const newCostPerProductUnit = usage * newSupplierUnitPrice * share;
    const costPerUnitChange = newCostPerProductUnit - currentCostPerProductUnit;

    const note =
      vol <= 0
        ? "Enter annual production volume to estimate annual spend impact."
        : "Tip: If you split suppliers, use supplier share to isolate the impact from one vendor.";

    return {
      newSupplierUnitPrice,
      annualInputUnits,
      supplierCoveredInputUnits,
      currentAnnualSpend,
      newAnnualSpend,
      annualSpendChange,
      currentCostPerProductUnit,
      newCostPerProductUnit,
      costPerUnitChange,
      note,
    };
  }, [
    supplierUnitPrice,
    priceIncreasePct,
    inputUnitsPerProductUnit,
    annualProductionUnits,
    supplierSharePct,
  ]);

  const signedMoney0 = (v: number) =>
    v >= 0 ? `+$${money0(v)}` : `-$${money0(Math.abs(v))}`;
  const signedMoney2 = (v: number) =>
    v >= 0 ? `+$${money2(v)}` : `-$${money2(Math.abs(v))}`;

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate the impact of a <strong>supplier price increase</strong> on your{" "}
        <strong>unit cost</strong> and <strong>annual purchasing spend</strong>.
      </p>

      {/* Inputs */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Supplier pricing</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Supplier unit price ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={supplierUnitPrice}
              onChange={(e) => setSupplierUnitPrice(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Current price per input unit.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Price increase (%)</label>
            <input
              className="input"
              type="number"
              step="0.5"
              value={priceIncreasePct}
              onChange={(e) => setPriceIncreasePct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Use negative values for price decreases.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Usage & volume</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Input units per product unit</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={inputUnitsPerProductUnit}
              onChange={(e) => setInputUnitsPerProductUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">How many supplier input units are used per finished unit.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Annual production volume (units)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="100"
              value={annualProductionUnits}
              onChange={(e) => setAnnualProductionUnits(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Units produced/sold per year.</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Supplier share (%)</label>
            <input
              className="input"
              type="number"
              min={0}
              max={100}
              step="1"
              value={supplierSharePct}
              onChange={(e) => setSupplierSharePct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              If this supplier only covers part of your input (split sourcing), set the share here.
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Supplier price</p>
            <p className="text-sm">
              New supplier unit price: <strong>${money2(r.newSupplierUnitPrice)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Unit cost impact</p>
            <p className="text-sm">
              Cost per finished unit: <strong>${money2(r.currentCostPerProductUnit)}</strong> →{" "}
              <strong>${money2(r.newCostPerProductUnit)}</strong>
              <br />
              Change: <strong>{signedMoney2(r.costPerUnitChange)}</strong>
            </p>
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-1">
          <p className="text-sm opacity-70">Annual spend impact</p>
          <p className="text-sm">
            Supplier-covered input units: <strong>{money0(r.supplierCoveredInputUnits)}</strong>
            <br />
            Annual spend: <strong>${money0(r.currentAnnualSpend)}</strong> → <strong>${money0(r.newAnnualSpend)}</strong>
            <br />
            Spend change: <strong>{signedMoney0(r.annualSpendChange)}</strong>
          </p>
          <p className="text-xs opacity-70 mt-1">
            Annual input units are approximated as (input units per product) × (annual volume).
          </p>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>New supplier price = current price × (1 + increase%).</li>
          <li>Annual input units = usage per unit × annual production volume.</li>
          <li>Supplier-covered units = annual input units × supplier share.</li>
          <li>Unit cost impact isolates only the supplier-covered portion.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Why include supplier share?</span>
            <br />
            Many businesses split sourcing across vendors. Share isolates the impact from one supplier.
          </p>
          <p>
            <span className="font-medium">Does this include freight or tariffs?</span>
            <br />
            Not directly. Add them into the supplier unit price (effective landed cost) if you want that included.
          </p>
        </div>
      </div>
    </div>
  );
}
