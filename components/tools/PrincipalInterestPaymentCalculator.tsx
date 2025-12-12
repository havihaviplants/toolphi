"use client";

import { useMemo, useState } from "react";

function toNumberLoose(v: string) {
  const n = Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function PrincipalInterestPaymentCalculator() {
  // principal / years는 숫자로 둬도 UX 문제 거의 없음
  const [principal, setPrincipal] = useState<number>(250000);
  const [years, setYears] = useState<number>(30);

  // ✅ rate는 문자열로 유지해야 소수점 입력 UX가 깨지지 않음 (예: "4.", "4.5")
  const [rateStr, setRateStr] = useState<string>("5");

  const { monthlyPayment, totalPaid, warning } = useMemo(() => {
    const P = Math.max(0, principal);
    const n = Math.max(0, years) * 12;

    const parsedRate = toNumberLoose(rateStr);
    const apr = Math.max(0, parsedRate);

    if (P <= 0) {
      return { monthlyPayment: 0, totalPaid: 0, warning: "Enter a loan amount greater than 0." };
    }
    if (apr <= 0) {
      return { monthlyPayment: 0, totalPaid: 0, warning: "Enter an interest rate greater than 0." };
    }
    if (n <= 0) {
      return { monthlyPayment: 0, totalPaid: 0, warning: "Enter a loan term greater than 0." };
    }

    const r = apr / 100 / 12;

    // 표준 원리금 균등 상환 공식
    const pow = Math.pow(1 + r, n);
    const payment = (P * r * pow) / (pow - 1);

    return {
      monthlyPayment: payment,
      totalPaid: payment * n,
      warning: "",
    };
  }, [principal, years, rateStr]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold">Inputs</h3>
        <p className="mt-1 text-sm text-gray-600">
          This calculator estimates <strong>principal & interest (P&amp;I)</strong> only (excluding taxes and insurance).
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">
              Loan Amount
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-7 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={principal === 0 ? "" : String(principal)}
                onChange={(e) => setPrincipal(toNumberLoose(e.target.value))}
                placeholder="250000"
                aria-label="Loan amount"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">
              Interest Rate (APR)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={rateStr}
                onChange={(e) => setRateStr(e.target.value)}
                placeholder="5 or 4.5"
                aria-label="Interest rate (APR)"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">
              Loan Term
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-14 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={years === 0 ? "" : String(years)}
                onChange={(e) => setYears(toNumberLoose(e.target.value))}
                placeholder="30"
                aria-label="Loan term (years)"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">years</span>
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

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Monthly P&amp;I Payment</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {monthlyPayment > 0 ? `$${formatMoney(monthlyPayment)}` : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Total Paid (P&amp;I Only)</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {totalPaid > 0 ? `$${formatMoney(totalPaid)}` : "—"}
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Note: This excludes property taxes, homeowners insurance, HOA, and PMI.
        </div>
      </div>
    </div>
  );
}
