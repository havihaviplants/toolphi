"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

function money(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function FarmCashFlowCalculator() {
  // Income
  const [cropIncome, setCropIncome] = useState<number>(190000);
  const [livestockIncome, setLivestockIncome] = useState<number>(40000);
  const [subsidyIncome, setSubsidyIncome] = useState<number>(15000);
  const [otherIncome, setOtherIncome] = useState<number>(5000);

  // Operating expenses
  const [seedFeed, setSeedFeed] = useState<number>(45000);
  const [fertilizerChem, setFertilizerChem] = useState<number>(25000);
  const [fuelEnergy, setFuelEnergy] = useState<number>(18000);
  const [labor, setLabor] = useState<number>(42000);
  const [utilities, setUtilities] = useState<number>(9000);
  const [insurance, setInsurance] = useState<number>(7000);
  const [repairsMaintenance, setRepairsMaintenance] = useState<number>(24000);

  // Financing + CapEx
  const [debtPayments, setDebtPayments] = useState<number>(50000);
  const [capitalSpending, setCapitalSpending] = useState<number>(20000);

  const r = useMemo(() => {
    const income =
      Math.max(0, n(cropIncome)) +
      Math.max(0, n(livestockIncome)) +
      Math.max(0, n(subsidyIncome)) +
      Math.max(0, n(otherIncome));

    const operating =
      Math.max(0, n(seedFeed)) +
      Math.max(0, n(fertilizerChem)) +
      Math.max(0, n(fuelEnergy)) +
      Math.max(0, n(labor)) +
      Math.max(0, n(utilities)) +
      Math.max(0, n(insurance)) +
      Math.max(0, n(repairsMaintenance));

    const debt = Math.max(0, n(debtPayments));
    const capex = Math.max(0, n(capitalSpending));

    const netCashFlow = income - operating - debt - capex;

    // “coverage” 느낌의 지표: (income - operating) / debt
    const operatingSurplus = income - operating;
    const coverage =
      debt > 0 ? operatingSurplus / debt : Number.POSITIVE_INFINITY;

    const margin = income > 0 ? (netCashFlow / income) * 100 : 0;

    return {
      income,
      operating,
      debt,
      capex,
      operatingSurplus,
      netCashFlow,
      margin,
      coverage,
    };
  }, [
    cropIncome,
    livestockIncome,
    subsidyIncome,
    otherIncome,
    seedFeed,
    fertilizerChem,
    fuelEnergy,
    labor,
    utilities,
    insurance,
    repairsMaintenance,
    debtPayments,
    capitalSpending,
  ]);

  const netColor =
    r.netCashFlow > 0 ? "text-green-600" : r.netCashFlow < 0 ? "text-red-600" : "text-slate-700";

  const coverageLabel = !Number.isFinite(r.coverage)
    ? "—"
    : r.coverage === Number.POSITIVE_INFINITY
    ? "∞"
    : r.coverage.toFixed(2);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm opacity-80">
          This calculator estimates annual farm cash flow by summing income and subtracting operating expenses,
          debt payments, and capital spending. It also shows a simple coverage metric to sanity-check debt load.
        </p>
      </div>

      {/* Income */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Income (annual)</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Crop income ($)</label>
            <input className="input" type="number" min={0} step="1" value={cropIncome} onChange={(e) => setCropIncome(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Sales of grains, produce, etc.</p>
          </div>
          <div>
            <label className="block text-sm font-medium">Livestock income ($)</label>
            <input className="input" type="number" min={0} step="1" value={livestockIncome} onChange={(e) => setLivestockIncome(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Animals, dairy, eggs, etc.</p>
          </div>
          <div>
            <label className="block text-sm font-medium">Subsidies / programs ($)</label>
            <input className="input" type="number" min={0} step="1" value={subsidyIncome} onChange={(e) => setSubsidyIncome(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Government payments, assistance.</p>
          </div>
          <div>
            <label className="block text-sm font-medium">Other income ($)</label>
            <input className="input" type="number" min={0} step="1" value={otherIncome} onChange={(e) => setOtherIncome(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Rent, custom work, misc.</p>
          </div>
        </div>
      </div>

      {/* Operating expenses */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Operating expenses (annual)</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Seed / feed ($)</label>
            <input className="input" type="number" min={0} step="1" value={seedFeed} onChange={(e) => setSeedFeed(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium">Fertilizer / chemicals ($)</label>
            <input className="input" type="number" min={0} step="1" value={fertilizerChem} onChange={(e) => setFertilizerChem(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium">Fuel / energy ($)</label>
            <input className="input" type="number" min={0} step="1" value={fuelEnergy} onChange={(e) => setFuelEnergy(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium">Labor ($)</label>
            <input className="input" type="number" min={0} step="1" value={labor} onChange={(e) => setLabor(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium">Utilities ($)</label>
            <input className="input" type="number" min={0} step="1" value={utilities} onChange={(e) => setUtilities(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium">Insurance ($)</label>
            <input className="input" type="number" min={0} step="1" value={insurance} onChange={(e) => setInsurance(Number(e.target.value))} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Repairs & maintenance ($)</label>
            <input className="input" type="number" min={0} step="1" value={repairsMaintenance} onChange={(e) => setRepairsMaintenance(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Machinery upkeep, parts, service.</p>
          </div>
        </div>
      </div>

      {/* Debt + CapEx */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Debt & capital (annual)</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Debt payments ($)</label>
            <input className="input" type="number" min={0} step="1" value={debtPayments} onChange={(e) => setDebtPayments(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Loans, equipment financing, mortgages.</p>
          </div>
          <div>
            <label className="block text-sm font-medium">Capital spending (CapEx) ($)</label>
            <input className="input" type="number" min={0} step="1" value={capitalSpending} onChange={(e) => setCapitalSpending(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">New machinery, upgrades, one-time investments.</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-sm opacity-70">Total income</p>
            <p className="font-semibold">${money(r.income)}</p>
          </div>
          <div>
            <p className="text-sm opacity-70">Operating expenses</p>
            <p className="font-semibold">${money(r.operating)}</p>
          </div>
          <div>
            <p className="text-sm opacity-70">Debt payments</p>
            <p className="font-semibold">${money(r.debt)}</p>
          </div>
          <div>
            <p className="text-sm opacity-70">Capital spending</p>
            <p className="font-semibold">${money(r.capex)}</p>
          </div>
        </div>

        <div className="pt-3 border-t space-y-1">
          <p className="text-sm opacity-70">Net cash flow</p>
          <p className={`text-xl font-bold ${netColor}`}>${money(r.netCashFlow)}</p>
          <p className="text-sm opacity-70">
            Cash flow margin: <span className="font-semibold">{r.margin.toFixed(1)}%</span>
          </p>
          <p className="text-sm opacity-70">
            Coverage (income − operating) ÷ debt:{" "}
            <span className="font-semibold">{coverageLabel}</span>
          </p>
          <p className="text-sm opacity-80">
            Tip: If coverage is below ~1.25, debt load may be tight depending on volatility.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Net cash flow = income − operating expenses − debt payments − capital spending</li>
          <li>Cash flow margin = net cash flow ÷ income</li>
          <li>Coverage shows whether operating surplus can service debt</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Is profit the same as cash flow?</span><br />
            Not always. Cash flow tracks cash moving in/out, while profit can include non-cash accounting items.
          </p>
          <p>
            <span className="font-medium">Should I include depreciation?</span><br />
            Typically no for cash flow. But depreciation matters for taxes—use a tax tool separately.
          </p>
        </div>
      </div>
    </div>
  );
}
