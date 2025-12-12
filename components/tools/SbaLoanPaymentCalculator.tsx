"use client";

import { useMemo, useState } from "react";

function toNumberLoose(v: string) {
  // 소수점/콤마 허용
  const s = String(v).replace(/,/g, "").trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function money(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function monthlyPayment(P: number, aprPct: number, years: number) {
  const principal = Math.max(0, P);
  const r = Math.max(0, aprPct) / 100 / 12;
  const n = Math.max(0, years) * 12;

  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return principal / n;

  const pow = Math.pow(1 + r, n);
  return (principal * r * pow) / (pow - 1);
}

function totalInterestFromPayment(P: number, aprPct: number, years: number, payment: number) {
  const principal = Math.max(0, P);
  const r = Math.max(0, aprPct) / 100 / 12;
  const n = Math.max(0, years) * 12;

  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return Math.max(0, payment * n - principal);

  let balance = principal;
  let totalInterest = 0;

  // safety cap: 100 years
  const cap = Math.min(n, 1200);

  for (let i = 1; i <= cap; i++) {
    const interest = balance * r;
    let principalPaid = Math.max(0, payment - interest);
    if (principalPaid > balance) principalPaid = balance;

    totalInterest += interest;
    balance = Math.max(0, balance - principalPaid);

    if (balance <= 0.01) break;
  }

  return totalInterest;
}

export default function SbaLoanPaymentCalculator() {
  const [loanAmount, setLoanAmount] = useState<number>(350000);
  const [aprStr, setAprStr] = useState<string>("10.5");
  const [termYears, setTermYears] = useState<number>(10);

  // Optional fees
  const [guaranteeFeePctStr, setGuaranteeFeePctStr] = useState<string>("3"); // % of loan amount
  const [financeGuaranteeFee, setFinanceGuaranteeFee] = useState<boolean>(true);

  const [packagingFee, setPackagingFee] = useState<number>(0); // flat $
  const [financePackagingFee, setFinancePackagingFee] = useState<boolean>(false);

  const { financedPrincipal, monthlyPay, totalInterest, totalPaid, feeSummary, warning } = useMemo(() => {
    const P = Math.max(0, loanAmount);
    const apr = Math.max(0, toNumberLoose(aprStr));
    const years = Math.max(0, termYears);

    if (P <= 0) {
      return {
        financedPrincipal: 0,
        monthlyPay: 0,
        totalInterest: 0,
        totalPaid: 0,
        feeSummary: { guaranteeFee: 0, packagingFee: 0, financedFees: 0, upfrontFees: 0 },
        warning: "Enter a loan amount greater than 0.",
      };
    }
    if (apr <= 0) {
      return {
        financedPrincipal: 0,
        monthlyPay: 0,
        totalInterest: 0,
        totalPaid: 0,
        feeSummary: { guaranteeFee: 0, packagingFee: 0, financedFees: 0, upfrontFees: 0 },
        warning: "Enter an APR greater than 0.",
      };
    }
    if (years <= 0) {
      return {
        financedPrincipal: 0,
        monthlyPay: 0,
        totalInterest: 0,
        totalPaid: 0,
        feeSummary: { guaranteeFee: 0, packagingFee: 0, financedFees: 0, upfrontFees: 0 },
        warning: "Enter a loan term greater than 0.",
      };
    }

    const gPct = Math.max(0, Math.min(100, toNumberLoose(guaranteeFeePctStr)));
    const gFee = (P * gPct) / 100;

    const pkgFee = Math.max(0, packagingFee);

    const financedFees =
      (financeGuaranteeFee ? gFee : 0) + (financePackagingFee ? pkgFee : 0);

    const upfrontFees =
      (financeGuaranteeFee ? 0 : gFee) + (financePackagingFee ? 0 : pkgFee);

    const financedPrincipal = P + financedFees;

    const payment = monthlyPayment(financedPrincipal, apr, years);
    const interest = totalInterestFromPayment(financedPrincipal, apr, years, payment);
    const totalPaid = payment * years * 12;

    return {
      financedPrincipal,
      monthlyPay: payment,
      totalInterest: interest,
      totalPaid,
      feeSummary: {
        guaranteeFee: gFee,
        packagingFee: pkgFee,
        financedFees,
        upfrontFees,
      },
      warning: "",
    };
  }, [
    loanAmount,
    aprStr,
    termYears,
    guaranteeFeePctStr,
    financeGuaranteeFee,
    packagingFee,
    financePackagingFee,
  ]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold">Inputs</h3>
        <p className="mt-1 text-sm text-gray-600">
          Estimate SBA loan payments. You can optionally finance SBA-related fees into the loan.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Loan Amount */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Loan Amount</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-7 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={loanAmount === 0 ? "" : String(loanAmount)}
                onChange={(e) => setLoanAmount(toNumberLoose(e.target.value))}
                placeholder="350000"
              />
            </div>
          </div>

          {/* APR */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Interest Rate (APR)</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={aprStr}
                onChange={(e) => setAprStr(e.target.value)}
                placeholder="10.5"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          {/* Term */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Loan Term</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-14 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={termYears === 0 ? "" : String(termYears)}
                onChange={(e) => setTermYears(toNumberLoose(e.target.value))}
                placeholder="10"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">years</span>
            </div>
          </div>

          {/* Guarantee fee */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Guarantee Fee (optional)</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={guaranteeFeePctStr}
                onChange={(e) => setGuaranteeFeePctStr(e.target.value)}
                placeholder="3"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>

            <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={financeGuaranteeFee}
                onChange={(e) => setFinanceGuaranteeFee(e.target.checked)}
              />
              Finance guarantee fee into loan
            </label>
          </div>

          {/* Packaging fee */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Packaging/Origination Fee (optional)</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-7 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={packagingFee === 0 ? "" : String(packagingFee)}
                onChange={(e) => setPackagingFee(toNumberLoose(e.target.value))}
                placeholder="0"
              />
            </div>

            <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={financePackagingFee}
                onChange={(e) => setFinancePackagingFee(e.target.checked)}
              />
              Finance packaging fee into loan
            </label>
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
        <p className="mt-1 text-sm text-gray-600">
          Monthly payment is calculated using the financed amount (loan + any fees you chose to finance).
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Financed Principal</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              ${money(financedPrincipal)}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Monthly Payment</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {monthlyPay > 0 ? `$${money(monthlyPay)}` : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Total Interest</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              ${money(totalInterest)}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Total Paid (P+I)</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              ${money(totalPaid)}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="text-sm font-semibold text-gray-900">Fee Summary</div>
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs text-gray-600">Guarantee Fee</div>
              <div className="text-sm font-semibold text-gray-900">${money(feeSummary.guaranteeFee)}</div>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs text-gray-600">Packaging Fee</div>
              <div className="text-sm font-semibold text-gray-900">${money(feeSummary.packagingFee)}</div>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs text-gray-600">Financed Fees</div>
              <div className="text-sm font-semibold text-gray-900">${money(feeSummary.financedFees)}</div>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs text-gray-600">Upfront Fees</div>
              <div className="text-sm font-semibold text-gray-900">${money(feeSummary.upfrontFees)}</div>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Note: Actual SBA fees vary by program and lender. This is a simple estimate for planning.
          </div>
        </div>
      </div>
    </div>
  );
}
