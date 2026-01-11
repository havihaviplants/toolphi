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

function monthlyPayment(principal: number, annualRatePct: number, years: number) {
  const P = clampMin(principal, 0);
  const r = clampMin(annualRatePct, 0) / 100 / 12;
  const nMonths = Math.round(clampMin(years, 0) * 12);

  if (P === 0 || nMonths === 0) return 0;
  if (r === 0) return P / nMonths;

  const pow = Math.pow(1 + r, nMonths);
  return (P * r * pow) / (pow - 1);
}

export default function UsdaSubsidyVsLoanComparisonCalculator() {
  // Amount
  const [amount, setAmount] = useState<number>(50000);

  // Loan assumptions
  const [interestRate, setInterestRate] = useState<number>(8);
  const [termYears, setTermYears] = useState<number>(5);
  const [feePct, setFeePct] = useState<number>(1);

  const r = useMemo(() => {
    const A = clampMin(amount, 0);

    const rate = clampMin(interestRate, 0);
    const years = clampMin(termYears, 0);
    const fee = clampMin(feePct, 0);

    const fees = A * (fee / 100);

    const pmt = monthlyPayment(A, rate, years);
    const nMonths = Math.round(years * 12);

    const totalPaid = pmt * nMonths;
    const totalInterest = Math.max(0, totalPaid - A);

    const totalLoanCost = totalInterest + fees;

    // Subsidy benefit is treated as immediate cash with no repayment.
    const subsidyBenefit = A;

    // Compare: if you get subsidy instead of borrowing A, you avoid loan cost AND you receive cash A.
    // To keep it simple and explainable, show two views:
    // (1) "Financing cost" = interest + fees
    // (2) "Net advantage of subsidy vs loan" = subsidy (cash) + avoided financing cost
    const netAdvantage = subsidyBenefit + totalLoanCost;

    const hint =
      years <= 0
        ? "Enter a positive loan term to calculate financing cost."
        : "Tip: If you’re comparing to a partial subsidy, enter the subsidy amount only (not project total cost).";

    return {
      A,
      rate,
      years,
      fee,
      fees,
      pmt,
      nMonths,
      totalPaid,
      totalInterest,
      totalLoanCost,
      subsidyBenefit,
      netAdvantage,
      hint,
    };
  }, [amount, interestRate, termYears, feePct]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Compare two ways to fund the same amount: <strong>USDA subsidy</strong> (no repayment) vs{" "}
        <strong>loan financing</strong> (monthly payments + interest + fees).
      </p>

      {/* Inputs */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Amount</div>

        <div>
          <label className="block text-sm font-medium">Amount ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="100"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Use the subsidy amount (or the amount you’d otherwise finance).
          </p>
        </div>
      </div>

      {/* Loan assumptions */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Loan assumptions</div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium">Interest rate (%)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">APR assumption.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Term (years)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={termYears}
              onChange={(e) => setTermYears(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Length of repayment period.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Fees (% of amount)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.1"
              value={feePct}
              onChange={(e) => setFeePct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Origination/closing/admin fees.</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">USDA subsidy (cash benefit)</p>
            <p className="text-xl font-bold">${money0(r.subsidyBenefit)}</p>
            <p className="text-xs opacity-70">No repayment required (assumed).</p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Loan monthly payment</p>
            <p className="text-xl font-bold">${money2(r.pmt)}</p>
            <p className="text-xs opacity-70">
              Over {r.nMonths} months · Total paid: <strong>${money0(r.totalPaid)}</strong>
            </p>
          </div>
        </div>

        <div className="pt-3 border-t grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm opacity-70">Total interest</p>
            <p className="font-semibold">${money0(r.totalInterest)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm opacity-70">Fees</p>
            <p className="font-semibold">${money0(r.fees)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm opacity-70">Financing cost (interest + fees)</p>
            <p className="font-semibold">${money0(r.totalLoanCost)}</p>
          </div>
        </div>

        <div className="pt-3 border-t space-y-1">
          <p className="text-sm opacity-70">Net advantage of subsidy vs taking a loan</p>
          <p className="text-xl font-bold">${money0(r.netAdvantage)}</p>
          <p className="text-xs opacity-70">
            Computed as: subsidy (${money0(r.subsidyBenefit)}) + avoided financing cost (${money0(r.totalLoanCost)}).
          </p>
        </div>

        <p className="text-sm opacity-80">{r.hint}</p>
      </div>

      {/* How it works + FAQ */}
      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Loan payment uses standard amortization (amount, rate, term).</li>
          <li>Total interest = (monthly payment × months) − amount.</li>
          <li>Fees are estimated as a % of the amount.</li>
          <li>
            Net advantage shows how much cash + avoided financing cost you get by receiving a subsidy instead of borrowing.
          </li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">What if subsidy is delayed or uncertain?</span>
            <br />
            Use a smaller amount (conservative) or model it as partial subsidy only.
          </p>
          <p>
            <span className="font-medium">Does this include taxes?</span>
            <br />
            No. Some subsidy programs may have tax implications depending on the situation.
          </p>
          <p>
            <span className="font-medium">Why is “net advantage” so large?</span>
            <br />
            Because it counts both the subsidy cash and the financing cost you avoid by not borrowing.
          </p>
        </div>
      </div>
    </div>
  );
}
