"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}
function money(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function pct2(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toFixed(2) + "%";
}

function calcMonthlyPayment(principal: number, apr: number, months: number) {
  const P = Math.max(0, principal);
  const m = Math.max(1, Math.round(months));
  const r = Math.max(0, apr) / 12;

  if (P === 0) return 0;
  if (r === 0) return P / m;

  const p = P * (r * Math.pow(1 + r, m)) / (Math.pow(1 + r, m) - 1);
  return Number.isFinite(p) ? p : 0;
}

export default function FarmEquipmentLoanCalculator() {
  // Base deal
  const [equipmentPrice, setEquipmentPrice] = useState<number>(180000);
  const [downPayment, setDownPayment] = useState<number>(30000);
  const [feesFinanced, setFeesFinanced] = useState<number>(2000);
  const [aprPct, setAprPct] = useState<number>(7.25);
  const [termYears, setTermYears] = useState<number>(7);

  // Optional: affordability/burden
  const [monthlyOperatingCashFlow, setMonthlyOperatingCashFlow] = useState<number>(8000);

  // Scenario compare (simple A/B)
  const [compareAprPct, setCompareAprPct] = useState<number>(6.25);
  const [compareTermYears, setCompareTermYears] = useState<number>(5);

  const r = useMemo(() => {
    const price = Math.max(0, n(equipmentPrice));
    const dp = Math.min(Math.max(0, n(downPayment)), price);
    const fees = Math.max(0, n(feesFinanced));

    const principal = Math.max(0, price - dp + fees);

    const apr = Math.max(0, n(aprPct)) / 100;
    const months = Math.max(1, Math.round(Math.max(1, n(termYears)) * 12));

    const mp = calcMonthlyPayment(principal, apr, months);
    const totalPaid = mp * months;
    const totalInterest = totalPaid - principal;

    // Burden
    const mcf = Math.max(0, n(monthlyOperatingCashFlow));
    const paymentBurden = mcf > 0 ? (mp / mcf) * 100 : 0;

    // Scenario compare
    const apr2 = Math.max(0, n(compareAprPct)) / 100;
    const months2 = Math.max(1, Math.round(Math.max(1, n(compareTermYears)) * 12));
    const mp2 = calcMonthlyPayment(principal, apr2, months2);
    const totalPaid2 = mp2 * months2;
    const totalInterest2 = totalPaid2 - principal;

    const deltaMonthly = mp2 - mp;
    const deltaInterest = totalInterest2 - totalInterest;

    return {
      price,
      dp,
      fees,
      principal,
      months,
      mp,
      totalPaid,
      totalInterest,
      mcf,
      paymentBurden,
      // compare
      months2,
      mp2,
      totalPaid2,
      totalInterest2,
      deltaMonthly,
      deltaInterest,
    };
  }, [
    equipmentPrice,
    downPayment,
    feesFinanced,
    aprPct,
    termYears,
    monthlyOperatingCashFlow,
    compareAprPct,
    compareTermYears,
  ]);

  const burdenColor =
    r.paymentBurden < 15 ? "text-green-600" : r.paymentBurden < 25 ? "text-amber-600" : "text-red-600";

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate equipment financing costs with payment, total interest, and total cost. Use the scenario
        comparison to test different rate/term assumptions.
      </p>

      {/* Loan inputs */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Equipment loan inputs</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Equipment price ($)</label>
            <input className="input" type="number" min={0} step="1" value={equipmentPrice} onChange={(e) => setEquipmentPrice(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Sticker price or negotiated purchase price.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Down payment ($)</label>
            <input className="input" type="number" min={0} step="1" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Upfront cash reduces principal and interest.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Fees financed ($)</label>
            <input className="input" type="number" min={0} step="1" value={feesFinanced} onChange={(e) => setFeesFinanced(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Origination/document fees rolled into the loan (if any).</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Interest rate (APR %)</label>
            <input className="input" type="number" min={0} step="0.01" value={aprPct} onChange={(e) => setAprPct(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Term (years)</label>
            <input className="input" type="number" min={1} step="1" value={termYears} onChange={(e) => setTermYears(Number(e.target.value))} />
          </div>
        </div>

        <div className="pt-3 border-t grid gap-2 sm:grid-cols-2 text-sm opacity-80">
          <div>
            Amount financed: <span className="font-semibold">${money(r.principal)}</span>
          </div>
          <div>
            Term: <span className="font-semibold">{r.months} months</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-sm opacity-70">Monthly payment</p>
            <p className="text-xl font-bold">${money(r.mp)}</p>
          </div>
          <div>
            <p className="text-sm opacity-70">Total interest</p>
            <p className="text-xl font-bold">${money(r.totalInterest)}</p>
          </div>
          <div>
            <p className="text-sm opacity-70">Total paid</p>
            <p className="font-semibold">${money(r.totalPaid)}</p>
          </div>
          <div>
            <p className="text-sm opacity-70">Total cost (down payment + total paid)</p>
            <p className="font-semibold">${money(r.totalPaid + r.dp)}</p>
          </div>
        </div>
      </div>

      {/* Affordability / burden */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Payment burden (optional)</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Estimated monthly operating cash flow ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={monthlyOperatingCashFlow}
              onChange={(e) => setMonthlyOperatingCashFlow(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Use a conservative average. For seasonal farms, consider your weak months.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t text-sm opacity-80">
          Payment burden = payment ÷ cash flow ={" "}
          <span className={`font-semibold ${burdenColor}`}>{r.paymentBurden.toFixed(1)}%</span>
        </div>
      </div>

      {/* Scenario comparison */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Scenario comparison</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Compare APR (%)</label>
            <input className="input" type="number" min={0} step="0.01" value={compareAprPct} onChange={(e) => setCompareAprPct(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium">Compare term (years)</label>
            <input className="input" type="number" min={1} step="1" value={compareTermYears} onChange={(e) => setCompareTermYears(Number(e.target.value))} />
          </div>
        </div>

        <div className="pt-3 border-t grid gap-2 sm:grid-cols-2 text-sm opacity-80">
          <div>
            Compare monthly payment: <span className="font-semibold">${money(r.mp2)}</span>
          </div>
          <div>
            Compare total interest: <span className="font-semibold">${money(r.totalInterest2)}</span>
          </div>
          <div>
            Monthly difference: <span className="font-semibold">${money(r.deltaMonthly)}</span>
          </div>
          <div>
            Interest difference: <span className="font-semibold">${money(r.deltaInterest)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Amount financed = price − down payment + financed fees</li>
          <li>Monthly payment is calculated using the standard amortization formula</li>
          <li>Total interest = total paid − amount financed</li>
          <li>Payment burden helps you gauge risk using estimated monthly cash flow</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Why include “fees financed”?</span><br />
            Many equipment deals roll fees into the loan. It increases principal and interest cost.
          </p>
          <p>
            <span className="font-medium">Should I always choose the shortest term?</span><br />
            Not always—shorter terms reduce interest but can stress cash flow during weak seasons.
          </p>
        </div>
      </div>
    </div>
  );
}
