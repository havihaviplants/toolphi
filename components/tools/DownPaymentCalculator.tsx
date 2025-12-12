"use client";

import { useMemo, useState } from "react";

function toNumber(raw: string) {
  // 빈 값/공백/NaN 방어
  const n = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function DownPaymentCalculator() {
  // UX: 기본값을 살짝 넣어두면 "결과가 바로 보이는" 편이라 체감이 좋아짐
  const [price, setPrice] = useState<number>(300000);
  const [percent, setPercent] = useState<number>(20);

  const safePercent = useMemo(() => clamp(percent, 0, 100), [percent]);

  const { downPayment, loanAmount, hasPayoff, warning } = useMemo(() => {
    const p = Math.max(0, price);
    const dp = (p * safePercent) / 100;
    const loan = Math.max(0, p - dp);

    let warn = "";
    if (p <= 0) warn = "Enter a purchase price greater than 0.";
    else if (safePercent === 0) warn = "Down payment is 0%. Loan amount equals purchase price.";
    else if (safePercent === 100) warn = "Down payment is 100%. No loan needed.";

    return {
      downPayment: dp,
      loanAmount: loan,
      hasPayoff: p > 0,
      warning: warn,
    };
  }, [price, safePercent]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold">Inputs</h3>
        <p className="mt-1 text-sm text-gray-600">
          Enter the purchase price and your down payment percentage.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Purchase Price */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">
              Purchase Price
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                inputMode="decimal"
                type="text"
                className="w-full rounded-xl border border-gray-300 bg-white px-7 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={price === 0 ? "" : String(price)}
                onChange={(e) => setPrice(toNumber(e.target.value))}
                placeholder="e.g., 300000"
                aria-label="Purchase price"
              />
            </div>
          </div>

          {/* Down Payment Percent */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">
              Down Payment (%)
            </label>
            <div className="relative">
              <input
                inputMode="decimal"
                type="text"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={percent === 0 ? "" : String(percent)}
                onChange={(e) => setPercent(toNumber(e.target.value))}
                placeholder="e.g., 20"
                aria-label="Down payment percentage"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                %
              </span>
            </div>

            {/* helper */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Allowed range: 0–100</span>
              <span>Applied: {safePercent}%</span>
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
        <p className="mt-1 text-sm text-gray-600">
          See your estimated down payment and remaining loan amount.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Down Payment</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {hasPayoff ? `$${formatMoney(downPayment)}` : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Loan Amount</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {hasPayoff ? `$${formatMoney(loanAmount)}` : "—"}
            </div>
          </div>
        </div>

        {/* Quick notes */}
        <div className="mt-4 text-xs text-gray-500">
          Tip: Link this tool to <span className="font-medium">Mortgage</span>,{" "}
          <span className="font-medium">Home Affordability</span>, and{" "}
          <span className="font-medium">HELOC</span> pages for stronger internal linking.
        </div>
      </div>
    </div>
  );
}
