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

function monthlyPayment(principal: number, apr: number, months: number) {
  const P = Math.max(0, principal);
  const m = Math.max(1, Math.round(months));
  const r = Math.max(0, apr) / 12;

  if (P === 0) return 0;
  if (r === 0) return P / m;

  const p = P * (r * Math.pow(1 + r, m)) / (Math.pow(1 + r, m) - 1);
  return Number.isFinite(p) ? p : 0;
}

export default function RuralLandLoanPaymentCalculator() {
  const [loanAmount, setLoanAmount] = useState<number>(300000);
  const [interestRate, setInterestRate] = useState<number>(6.0);
  const [termYears, setTermYears] = useState<number>(25);

  // optional “두께” 요소: 부담률
  const [monthlyCashFlow, setMonthlyCashFlow] = useState<number>(6000);

  const r = useMemo(() => {
    const principal = Math.max(0, n(loanAmount));
    const apr = Math.max(0, n(interestRate)) / 100;
    const months = Math.max(1, Math.round(Math.max(1, n(termYears)) * 12));

    const mp = monthlyPayment(principal, apr, months);
    const totalPaid = mp * months;
    const totalInterest = totalPaid - principal;

    const mcf = Math.max(0, n(monthlyCashFlow));
    const burden = mcf > 0 ? (mp / mcf) * 100 : 0;

    return {
      principal,
      aprPct: Math.max(0, n(interestRate)),
      months,
      mp,
      totalPaid,
      totalInterest,
      mcf,
      burden,
    };
  }, [loanAmount, interestRate, termYears, monthlyCashFlow]);

  const burdenColor =
    r.burden < 20 ? "text-green-600" : r.burden < 35 ? "text-amber-600" : "text-red-600";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Rural Land Loan Payment Calculator</h1>
        <p className="text-sm opacity-80">
          Estimate rural land loan payments (principal + interest). Includes total interest, total paid,
          and an optional payment-burden check.
        </p>
      </div>

      {/* Inputs */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Loan inputs</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Loan amount ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Usually purchase price minus down payment.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Interest rate (APR %)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Enter the lender’s annual rate.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Loan term (years)</label>
            <input
              className="input"
              type="number"
              min={1}
              step="1"
              value={termYears}
              onChange={(e) => setTermYears(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Many rural land loans fall in the 15–30 year range.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Estimated monthly cash flow (optional)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={monthlyCashFlow}
              onChange={(e) => setMonthlyCashFlow(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Used only to show payment burden (%). Put a conservative number.
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-sm opacity-70">Estimated monthly payment</p>
            <p className="text-xl font-bold">${money(r.mp)}</p>
          </div>

          <div>
            <p className="text-sm opacity-70">Total interest (over term)</p>
            <p className="text-xl font-bold">${money(r.totalInterest)}</p>
          </div>

          <div>
            <p className="text-sm opacity-70">Total paid</p>
            <p className="font-semibold">${money(r.totalPaid)}</p>
          </div>

          <div>
            <p className="text-sm opacity-70">Payment burden (payment ÷ cash flow)</p>
            <p className={`font-semibold ${burdenColor}`}>{pct2(r.burden)}</p>
          </div>
        </div>
      </div>

      {/* Thick content */}
      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Uses a standard amortization formula for fixed monthly payments.</li>
          <li>Monthly payment covers principal + interest only (no taxes/insurance).</li>
          <li>Payment burden is optional: payment ÷ estimated monthly cash flow.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Does this include property taxes or insurance?</span>
            <br />
            No—those vary by county and policy. This is principal + interest only.
          </p>
          <p>
            <span className="font-medium">Why do rural land loans sometimes cost more?</span>
            <br />
            Unimproved land can be treated as higher risk, so rates/terms may differ from home mortgages.
          </p>
        </div>
      </div>
    </div>
  );
}
