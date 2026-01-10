"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

function money(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function FarmDebtToIncomeRatioCalculator() {
  // Income
  const [annualIncome, setAnnualIncome] = useState<number>(250000);

  // Annual debt payments (cash outflow)
  const [operatingDebtPayments, setOperatingDebtPayments] = useState<number>(18000);
  const [longTermDebtPayments, setLongTermDebtPayments] = useState<number>(42000);

  // Optional: operating expenses to approximate “surplus coverage”
  // This pairs well with your Farm Cash Flow / Working Capital tools.
  const [annualOperatingExpenses, setAnnualOperatingExpenses] = useState<number>(170000);

  const r = useMemo(() => {
    const income = Math.max(0, n(annualIncome));
    const opDebt = Math.max(0, n(operatingDebtPayments));
    const ltDebt = Math.max(0, n(longTermDebtPayments));
    const totalDebt = opDebt + ltDebt;

    // DTI uses debt payments as a share of income
    const dtiPct = income > 0 ? (totalDebt / income) * 100 : 0;

    // Debt payment shares
    const opShare = totalDebt > 0 ? (opDebt / totalDebt) * 100 : 0;
    const ltShare = totalDebt > 0 ? (ltDebt / totalDebt) * 100 : 0;

    // Quick coverage view (not a perfect DSCR, but useful):
    // (income - operating expenses) / total debt payments
    const expenses = Math.max(0, n(annualOperatingExpenses));
    const operatingSurplus = income - expenses;
    const coverage =
      totalDebt > 0 ? operatingSurplus / totalDebt : Number.POSITIVE_INFINITY;

    return {
      income,
      opDebt,
      ltDebt,
      totalDebt,
      dtiPct,
      opShare,
      ltShare,
      expenses,
      operatingSurplus,
      coverage,
    };
  }, [annualIncome, operatingDebtPayments, longTermDebtPayments, annualOperatingExpenses]);

  const dtiLabel = r.dtiPct.toFixed(1) + "%";
  const coverageLabel =
    r.coverage === Number.POSITIVE_INFINITY
      ? "∞"
      : Number.isFinite(r.coverage)
      ? r.coverage.toFixed(2)
      : "—";

  const dtiColor =
    r.dtiPct < 20 ? "text-green-600" : r.dtiPct < 35 ? "text-amber-600" : "text-red-600";

  const coverageColor =
    r.coverage >= 1.5 ? "text-green-600" : r.coverage >= 1.2 ? "text-amber-600" : "text-red-600";

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Farm DTI (debt-to-income) estimates how much of your annual income goes to{" "}
        <strong>debt payments</strong>. This version also splits operating vs long-term debt and shows a simple
        coverage view using income minus operating expenses.
      </p>

      {/* Income */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Income (annual)</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Annual farm income ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Use gross income or net income—just be consistent when comparing over time.
            </p>
          </div>
        </div>
      </div>

      {/* Debt payments */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Debt payments (annual cash outflow)</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Operating debt payments ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={operatingDebtPayments}
              onChange={(e) => setOperatingDebtPayments(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Operating note / line of credit payments.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Long-term debt payments ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={longTermDebtPayments}
              onChange={(e) => setLongTermDebtPayments(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Land loans, equipment loans, mortgages, etc.
            </p>
          </div>
        </div>
      </div>

      {/* Optional expenses */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Optional: operating expenses (for coverage view)</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Annual operating expenses ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={annualOperatingExpenses}
              onChange={(e) => setAnnualOperatingExpenses(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Seed/feed, fertilizer, fuel, labor, utilities, repairs, insurance, etc.
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-sm opacity-70">Total debt payments</p>
            <p className="font-semibold">${money(r.totalDebt)}</p>
          </div>
          <div>
            <p className="text-sm opacity-70">Debt payment share of income (DTI)</p>
            <p className={`text-xl font-bold ${dtiColor}`}>{dtiLabel}</p>
          </div>
        </div>

        <div className="pt-3 border-t space-y-1">
          <p className="text-sm opacity-70">
            Operating debt share: <span className="font-semibold">{r.opShare.toFixed(1)}%</span>
          </p>
          <p className="text-sm opacity-70">
            Long-term debt share: <span className="font-semibold">{r.ltShare.toFixed(1)}%</span>
          </p>

          <p className="text-sm opacity-70">
            Operating surplus (income − operating expenses):{" "}
            <span className="font-semibold">${money(r.operatingSurplus)}</span>
          </p>

          <p className="text-sm opacity-70">
            Coverage (surplus ÷ debt payments):{" "}
            <span className={`font-semibold ${coverageColor}`}>{coverageLabel}</span>
          </p>

          <p className="text-sm opacity-80">
            Tip: DTI answers “how heavy is debt relative to income,” while coverage answers “can surplus service the payments.”
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>DTI (%) = (annual debt payments ÷ annual income) × 100</li>
          <li>Split operating vs long-term debt to see what’s driving the ratio</li>
          <li>Coverage uses (income − operating expenses) as a quick “payment capacity” check</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">What is a “good” farm DTI?</span><br />
            It depends on commodity volatility and margins. Lower is safer, but the key is whether your surplus covers payments through down cycles.
          </p>
          <p>
            <span className="font-medium">Should I use gross income or net income?</span><br />
            Either works if you stay consistent. Gross is common for quick screening; net is stricter.
          </p>
        </div>
      </div>
    </div>
  );
}
