"use client";

import { useMemo, useState } from "react";

function toNumberLoose(v: string) {
  const n = Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatMonths(m: number) {
  const months = Math.max(0, Math.round(m));
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (months === 0) return "—";
  if (years === 0) return `${rem} months`;
  if (rem === 0) return `${years} years`;
  return `${years} years ${rem} months`;
}

type SimResult = {
  months: number;
  totalInterest: number;
};

function monthlyPaymentForAmortizedLoan(P: number, annualRatePct: number, years: number) {
  const principal = Math.max(0, P);
  const r = Math.max(0, annualRatePct) / 100 / 12;
  const n = Math.max(0, years) * 12;

  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return principal / n;

  const pow = Math.pow(1 + r, n);
  return (principal * r * pow) / (pow - 1);
}

// 핵심: "추가 원금(principal-only)"은 이자 계산에 영향은 같고,
// 매달 상환에서 "원금"을 더 깎는 효과로 시뮬레이션.
function simulate(params: {
  principal: number;
  annualRatePct: number;
  baseMonthlyPayment: number;
  extraPrincipalMonthly: number;
}): SimResult {
  const { principal, annualRatePct, baseMonthlyPayment, extraPrincipalMonthly } = params;

  const P0 = Math.max(0, principal);
  const r = Math.max(0, annualRatePct) / 100 / 12;
  const basePay = Math.max(0, baseMonthlyPayment);
  const extraP = Math.max(0, extraPrincipalMonthly);

  if (P0 <= 0) return { months: 0, totalInterest: 0 };
  if (r > 0 && basePay <= P0 * r) {
    // 기본 납입이 이자보다 작으면 상환 불가
    return { months: Infinity, totalInterest: Infinity };
  }
  if (r === 0) {
    const months = Math.ceil(P0 / (basePay + extraP));
    return { months, totalInterest: 0 };
  }

  let balance = P0;
  let months = 0;
  let totalInterest = 0;

  const maxMonths = 1200; // 100년 안전장치

  while (balance > 0.01 && months < maxMonths) {
    const interest = balance * r;
    totalInterest += interest;

    // 기본 월 납입에서 이자를 먼저 내고 남는 금액이 원금 상환
    const principalFromBase = Math.max(0, basePay - interest);

    // extra principal-only는 그대로 원금에 직격
    const principalPaid = principalFromBase + extraP;

    balance = balance - principalPaid;
    months += 1;
  }

  return { months, totalInterest };
}

export default function AdditionalPrincipalPaymentCalculator() {
  const [principal, setPrincipal] = useState<number>(200000);
  const [rateStr, setRateStr] = useState<string>("5.5");
  const [years, setYears] = useState<number>(25);
  const [extraPrincipal, setExtraPrincipal] = useState<number>(150);

  const {
    baseMonthly,
    baseline,
    withExtra,
    interestSaved,
    timeSavedMonths,
    warning,
  } = useMemo(() => {
    const P = Math.max(0, principal);
    const apr = Math.max(0, toNumberLoose(rateStr));
    const Y = Math.max(0, years);
    const extra = Math.max(0, extraPrincipal);

    if (P <= 0) {
      return {
        baseMonthly: 0,
        baseline: { months: 0, totalInterest: 0 } as SimResult,
        withExtra: { months: 0, totalInterest: 0 } as SimResult,
        interestSaved: 0,
        timeSavedMonths: 0,
        warning: "Enter a loan balance greater than 0.",
      };
    }
    if (apr <= 0) {
      return {
        baseMonthly: 0,
        baseline: { months: 0, totalInterest: 0 } as SimResult,
        withExtra: { months: 0, totalInterest: 0 } as SimResult,
        interestSaved: 0,
        timeSavedMonths: 0,
        warning: "Enter an interest rate greater than 0.",
      };
    }
    if (Y <= 0) {
      return {
        baseMonthly: 0,
        baseline: { months: 0, totalInterest: 0 } as SimResult,
        withExtra: { months: 0, totalInterest: 0 } as SimResult,
        interestSaved: 0,
        timeSavedMonths: 0,
        warning: "Enter a remaining term greater than 0.",
      };
    }

    const baseMonthlyPayment = monthlyPaymentForAmortizedLoan(P, apr, Y);

    const base = simulate({
      principal: P,
      annualRatePct: apr,
      baseMonthlyPayment,
      extraPrincipalMonthly: 0,
    });

    const extraRes = simulate({
      principal: P,
      annualRatePct: apr,
      baseMonthlyPayment,
      extraPrincipalMonthly: extra,
    });

    const bad = base.months === Infinity || extraRes.months === Infinity;

    const savedInterest =
      Number.isFinite(base.totalInterest) && Number.isFinite(extraRes.totalInterest)
        ? Math.max(0, base.totalInterest - extraRes.totalInterest)
        : 0;

    const savedMonths =
      Number.isFinite(base.months) && Number.isFinite(extraRes.months)
        ? Math.max(0, base.months - extraRes.months)
        : 0;

    return {
      baseMonthly: baseMonthlyPayment,
      baseline: base,
      withExtra: extraRes,
      interestSaved: savedInterest,
      timeSavedMonths: savedMonths,
      warning: bad
        ? "Your payment may be too low to ever pay off this loan (interest exceeds payment)."
        : "",
    };
  }, [principal, rateStr, years, extraPrincipal]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold">Inputs</h3>
        <p className="mt-1 text-sm text-gray-600">
          This tool focuses on <strong>principal-only</strong> extra payments (not a full schedule).
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Loan Balance</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-7 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={principal === 0 ? "" : String(principal)}
                onChange={(e) => setPrincipal(toNumberLoose(e.target.value))}
                placeholder="200000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Interest Rate (APR)</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={rateStr}
                onChange={(e) => setRateStr(e.target.value)}
                placeholder="5.5"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Remaining Term</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-14 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={years === 0 ? "" : String(years)}
                onChange={(e) => setYears(toNumberLoose(e.target.value))}
                placeholder="25"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">years</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">
              Additional Principal (Monthly)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-7 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={extraPrincipal === 0 ? "" : String(extraPrincipal)}
                onChange={(e) => setExtraPrincipal(toNumberLoose(e.target.value))}
                placeholder="150"
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

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Estimated Monthly Payment (P&I)</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {baseMonthly > 0 ? `$${formatMoney(baseMonthly)}` : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Time Saved</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {timeSavedMonths > 0 ? formatMonths(timeSavedMonths) : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Interest Saved</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {interestSaved > 0 ? `$${formatMoney(interestSaved)}` : "—"}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-900">Baseline</div>
            <div className="mt-2 text-sm text-gray-700">
              <div>Payoff time: <strong>{Number.isFinite(baseline.months) ? formatMonths(baseline.months) : "—"}</strong></div>
              <div>Total interest: <strong>{Number.isFinite(baseline.totalInterest) ? `$${formatMoney(baseline.totalInterest)}` : "—"}</strong></div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-900">With Additional Principal</div>
            <div className="mt-2 text-sm text-gray-700">
              <div>Payoff time: <strong>{Number.isFinite(withExtra.months) ? formatMonths(withExtra.months) : "—"}</strong></div>
              <div>Total interest: <strong>{Number.isFinite(withExtra.totalInterest) ? `$${formatMoney(withExtra.totalInterest)}` : "—"}</strong></div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Note: This estimate assumes a fixed rate and consistent payments. Extra principal is applied monthly.
        </div>
      </div>
    </div>
  );
}
