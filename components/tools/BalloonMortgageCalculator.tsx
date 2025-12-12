"use client";

import { useMemo, useState } from "react";

function toNumberLoose(v: string) {
  const n = Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function money(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function monthsToText(m: number) {
  const months = Math.max(0, Math.round(m));
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (months === 0) return "—";
  if (years === 0) return `${rem} months`;
  if (rem === 0) return `${years} years`;
  return `${years} years ${rem} months`;
}

type Row = {
  month: number;
  paymentPI: number; // principal+interest
  interest: number;
  principal: number;
  balance: number;
};

function monthlyPaymentPI(P: number, aprPct: number, years: number) {
  const principal = Math.max(0, P);
  const r = Math.max(0, aprPct) / 100 / 12;
  const n = Math.max(0, years) * 12;

  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return principal / n;

  const pow = Math.pow(1 + r, n);
  return (principal * r * pow) / (pow - 1);
}

function simulateToMonth(params: {
  principal: number;
  aprPct: number;
  amortYears: number;
  monthsToSim: number;
}): {
  monthlyPI: number;
  rows: Row[];
  remainingBalance: number;
  totalInterest: number;
  totalPaidPI: number;
  warning: string;
} {
  const P0 = Math.max(0, params.principal);
  const apr = Math.max(0, params.aprPct);
  const amortYears = Math.max(0, params.amortYears);
  const monthsToSim = Math.max(0, Math.floor(params.monthsToSim));

  if (P0 <= 0) {
    return { monthlyPI: 0, rows: [], remainingBalance: 0, totalInterest: 0, totalPaidPI: 0, warning: "Enter a loan amount greater than 0." };
  }
  if (apr <= 0) {
    return { monthlyPI: 0, rows: [], remainingBalance: 0, totalInterest: 0, totalPaidPI: 0, warning: "Enter an interest rate greater than 0." };
  }
  if (amortYears <= 0) {
    return { monthlyPI: 0, rows: [], remainingBalance: 0, totalInterest: 0, totalPaidPI: 0, warning: "Enter an amortization term greater than 0." };
  }
  if (monthsToSim <= 0) {
    return {
      monthlyPI: monthlyPaymentPI(P0, apr, amortYears),
      rows: [],
      remainingBalance: P0,
      totalInterest: 0,
      totalPaidPI: 0,
      warning: "Balloon due time must be greater than 0.",
    };
  }

  const r = apr / 100 / 12;
  const monthlyPI = monthlyPaymentPI(P0, apr, amortYears);

  if (r > 0 && monthlyPI <= P0 * r) {
    return {
      monthlyPI,
      rows: [],
      remainingBalance: Infinity,
      totalInterest: Infinity,
      totalPaidPI: Infinity,
      warning: "Monthly payment is too low to reduce balance (interest exceeds payment).",
    };
  }

  let balance = P0;
  let totalInterest = 0;
  let totalPaidPI = 0;
  const rows: Row[] = [];

  const cap = Math.min(monthsToSim, 1200);

  for (let m = 1; m <= cap; m++) {
    const interest = balance * r;
    let principalPaid = Math.max(0, monthlyPI - interest);
    if (principalPaid > balance) principalPaid = balance;

    const paymentPI = interest + principalPaid;

    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;
    totalPaidPI += paymentPI;

    rows.push({
      month: m,
      paymentPI,
      interest,
      principal: principalPaid,
      balance,
    });

    if (balance <= 0.01) break;
  }

  const warning =
    monthsToSim > 1200
      ? "Balloon due time is very long. Showing first 100 years only."
      : "";

  return { monthlyPI, rows, remainingBalance: balance, totalInterest, totalPaidPI, warning };
}

export default function BalloonMortgageCalculator() {
  const [homePrice, setHomePrice] = useState<number>(400000);
  const [downPctStr, setDownPctStr] = useState<string>("20");
  const [aprStr, setAprStr] = useState<string>("6.5");
  const [amortYears, setAmortYears] = useState<number>(30);
  const [balloonYears, setBalloonYears] = useState<number>(7);

  const [annualTax, setAnnualTax] = useState<number>(4800); // optional
  const [annualInsurance, setAnnualInsurance] = useState<number>(1500); // optional

  const [showAll, setShowAll] = useState<boolean>(false);

  const {
    loanAmount,
    monthlyPI,
    monthlyTaxIns,
    monthlyTotal,
    remainingBalance,
    totalInterest,
    rows,
    warning,
    balloonMonths,
    effectiveDownPct,
    downPaymentAmount,
  } = useMemo(() => {
    const price = Math.max(0, homePrice);
    const dpPct = Math.max(0, Math.min(100, toNumberLoose(downPctStr)));
    const dpAmt = (price * dpPct) / 100;
    const loan = Math.max(0, price - dpAmt);

    const apr = Math.max(0, toNumberLoose(aprStr));
    const amort = Math.max(0, amortYears);
    const by = Math.max(0, balloonYears);
    const months = Math.max(0, Math.round(by * 12));

    const sim = simulateToMonth({
      principal: loan,
      aprPct: apr,
      amortYears: amort,
      monthsToSim: months,
    });

    const tax = Math.max(0, annualTax) / 12;
    const ins = Math.max(0, annualInsurance) / 12;
    const monthlyTaxIns = tax + ins;

    const monthlyPI = sim.monthlyPI;
    const monthlyTotal = Number.isFinite(monthlyPI) ? monthlyPI + monthlyTaxIns : 0;

    return {
      loanAmount: loan,
      monthlyPI,
      monthlyTaxIns,
      monthlyTotal,
      remainingBalance: sim.remainingBalance,
      totalInterest: sim.totalInterest,
      rows: sim.rows,
      warning: sim.warning,
      balloonMonths: months,
      effectiveDownPct: dpPct,
      downPaymentAmount: dpAmt,
    };
  }, [homePrice, downPctStr, aprStr, amortYears, balloonYears, annualTax, annualInsurance]);

  const visibleRows = useMemo(() => {
    if (showAll) return rows;
    return rows.slice(0, 24);
  }, [rows, showAll]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold">Inputs</h3>
        <p className="mt-1 text-sm text-gray-600">
          This calculates monthly <strong>principal & interest</strong> using the amortization term,
          and shows the remaining balance due at the balloon date.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Home Price</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-7 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={homePrice === 0 ? "" : String(homePrice)}
                onChange={(e) => setHomePrice(toNumberLoose(e.target.value))}
                placeholder="400000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Down Payment (%)</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={downPctStr}
                onChange={(e) => setDownPctStr(e.target.value)}
                placeholder="20"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
            <div className="text-xs text-gray-500">
              Down payment: <span className="font-medium">${money(downPaymentAmount)}</span> ({effectiveDownPct}%)
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Interest Rate (APR)</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={aprStr}
                onChange={(e) => setAprStr(e.target.value)}
                placeholder="6.5"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Amortization Term</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-14 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={amortYears === 0 ? "" : String(amortYears)}
                onChange={(e) => setAmortYears(toNumberLoose(e.target.value))}
                placeholder="30"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">years</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Balloon Due In</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-14 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={balloonYears === 0 ? "" : String(balloonYears)}
                onChange={(e) => setBalloonYears(toNumberLoose(e.target.value))}
                placeholder="7"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">years</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Annual Property Tax (optional)</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-7 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={annualTax === 0 ? "" : String(annualTax)}
                onChange={(e) => setAnnualTax(toNumberLoose(e.target.value))}
                placeholder="4800"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Annual Home Insurance (optional)</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-7 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={annualInsurance === 0 ? "" : String(annualInsurance)}
                onChange={(e) => setAnnualInsurance(toNumberLoose(e.target.value))}
                placeholder="1500"
              />
            </div>
          </div>
        </div>

        {warning && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {warning}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold">Results</h3>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Loan Amount</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              ${money(loanAmount)}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Monthly P&I</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {monthlyPI > 0 ? `$${money(monthlyPI)}` : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Monthly Tax + Insurance</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              ${money(monthlyTaxIns)}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Estimated Monthly Total</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {monthlyTotal > 0 ? `$${money(monthlyTotal)}` : "—"}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Balloon Payment (Remaining Balance)</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {Number.isFinite(remainingBalance) ? `$${money(remainingBalance)}` : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Interest Paid (Before Balloon)</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {Number.isFinite(totalInterest) ? `$${money(totalInterest)}` : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Time to Balloon</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {balloonYears > 0 ? monthsToText(balloonYears * 12) : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">Payment Breakdown (P&I)</h3>
            <p className="mt-1 text-sm text-gray-600">
              {showAll ? "Showing schedule up to balloon due date." : "Showing first 24 months."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
          >
            {showAll ? "Show less" : "Show full"}
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[780px] border-collapse text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="px-3 py-2 text-left font-semibold text-gray-800">Month</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-800">Payment (P&I)</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-800">Interest</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-800">Principal</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-800">Balance</th>
              </tr>
            </thead>
            <tbody>
              {(showAll ? rows : rows.slice(0, 24)).length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-gray-600" colSpan={5}>
                    Enter inputs to generate a breakdown.
                  </td>
                </tr>
              ) : (
                (showAll ? rows : rows.slice(0, 24)).map((r) => (
                  <tr key={r.month} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-3 py-2 text-left text-gray-800">{r.month}</td>
                    <td className="px-3 py-2 text-right text-gray-800">${money(r.paymentPI)}</td>
                    <td className="px-3 py-2 text-right text-gray-800">${money(r.interest)}</td>
                    <td className="px-3 py-2 text-right text-gray-800">${money(r.principal)}</td>
                    <td className="px-3 py-2 text-right text-gray-800">${money(r.balance)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
