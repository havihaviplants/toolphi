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

  // Standard amortization formula
  const pow = Math.pow(1 + r, nMonths);
  return (P * r * pow) / (pow - 1);
}

export default function FarmLoanStressTestCalculator() {
  // Loan
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(7);
  const [termYears, setTermYears] = useState<number>(20);

  // Cash flow
  const [annualNOI, setAnnualNOI] = useState<number>(120000);

  // Stress assumptions
  const [rateShockPctPoints, setRateShockPctPoints] = useState<number>(2); // +2%p
  const [noiDropPct, setNoiDropPct] = useState<number>(20); // -20%

  const r = useMemo(() => {
    const P = clampMin(loanAmount, 0);
    const baseRate = clampMin(annualInterestRate, 0);
    const years = clampMin(termYears, 0);

    const noi = clampMin(annualNOI, 0);

    const rateShock = clampMin(rateShockPctPoints, 0);
    const noiDrop = clampMin(noiDropPct, 0);

    const stressedRate = baseRate + rateShock;
    const stressedNOI = noi * (1 - noiDrop / 100);

    const basePmt = monthlyPayment(P, baseRate, years);
    const stressedPmt = monthlyPayment(P, stressedRate, years);

    const annualDebtServiceBase = basePmt * 12;
    const annualDebtServiceStressed = stressedPmt * 12;

    const baseDSCR = annualDebtServiceBase > 0 ? noi / annualDebtServiceBase : 0;
    const stressedDSCR =
      annualDebtServiceStressed > 0 ? stressedNOI / annualDebtServiceStressed : 0;

    const paymentDelta = stressedPmt - basePmt;
    const paymentDeltaPct = basePmt > 0 ? (paymentDelta / basePmt) * 100 : 0;

    const dscrDelta = stressedDSCR - baseDSCR;

    // Simple risk flags (not financial advice; just heuristic)
    const dscrFlagBase =
      baseDSCR >= 1.5 ? "Comfortable" : baseDSCR >= 1.25 ? "Tight" : "High risk";
    const dscrFlagStressed =
      stressedDSCR >= 1.5 ? "Comfortable" : stressedDSCR >= 1.25 ? "Tight" : "High risk";

    return {
      P,
      baseRate,
      years,
      noi,
      rateShock,
      noiDrop,
      stressedRate,
      stressedNOI,
      basePmt,
      stressedPmt,
      annualDebtServiceBase,
      annualDebtServiceStressed,
      baseDSCR,
      stressedDSCR,
      paymentDelta,
      paymentDeltaPct,
      dscrDelta,
      dscrFlagBase,
      dscrFlagStressed,
    };
  }, [loanAmount, annualInterestRate, termYears, annualNOI, rateShockPctPoints, noiDropPct]);

  const dscrHint =
    r.baseDSCR === 0
      ? "Enter a valid loan term and NOI to calculate DSCR."
      : r.stressedDSCR < 1.25
      ? "Stress-case DSCR is below 1.25. That usually signals refinancing / cost cutting / higher equity may be needed."
      : "Tip: Increase the rate shock or NOI drop to see worst-case outcomes.";

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        This tool simulates a <strong>rate shock</strong> and a <strong>cash-flow drop</strong> to see how your loan
        payment and <strong>DSCR</strong> change.
      </p>

      {/* Loan inputs */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Loan details</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Loan amount ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Principal amount financed (not including down payment).</p>
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
            <p className="text-xs opacity-70 mt-1">Typical ranges: 5–30 years depending on the loan type.</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Annual interest rate (%)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={annualInterestRate}
              onChange={(e) => setAnnualInterestRate(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Nominal APR assumption. This uses standard amortization math.</p>
          </div>
        </div>
      </div>

      {/* NOI inputs */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Cash flow</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Annual net operating income (NOI, $)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={annualNOI}
              onChange={(e) => setAnnualNOI(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Roughly: revenue − operating costs (before debt service). Use your most realistic base case.
            </p>
          </div>
        </div>
      </div>

      {/* Stress assumptions */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Stress assumptions</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Interest rate increase (percentage points)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.25"
              value={rateShockPctPoints}
              onChange={(e) => setRateShockPctPoints(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Example: enter <strong>2</strong> to model 7% → 9%.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">NOI drop (%)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={noiDropPct}
              onChange={(e) => setNoiDropPct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Example: 20 means NOI becomes 80% of baseline.</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Baseline monthly payment</p>
            <p className="text-xl font-bold">${money2(r.basePmt)}</p>
            <p className="text-xs opacity-70">
              Annual debt service: <strong>${money0(r.annualDebtServiceBase)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">
              Stressed payment ({pct2(r.baseRate)} → {pct2(r.stressedRate)})
            </p>
            <p className="text-xl font-bold">${money2(r.stressedPmt)}</p>
            <p className="text-xs opacity-70">
              Annual debt service: <strong>${money0(r.annualDebtServiceStressed)}</strong>
            </p>
          </div>
        </div>

        <div className="pt-3 border-t grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm opacity-70">Payment change</p>
            <p className="font-semibold">
              +${money2(r.paymentDelta)} / month ({pct2(r.paymentDeltaPct)})
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm opacity-70">NOI under stress</p>
            <p className="font-semibold">${money0(r.stressedNOI)} / year</p>
          </div>
        </div>

        <div className="pt-3 border-t grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm opacity-70">Baseline DSCR</p>
            <p className="text-xl font-bold">
              {r.baseDSCR.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs opacity-70">Heuristic: <strong>{r.dscrFlagBase}</strong></p>
          </div>

          <div className="space-y-1">
            <p className="text-sm opacity-70">Stressed DSCR</p>
            <p className="text-xl font-bold">
              {r.stressedDSCR.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs opacity-70">Heuristic: <strong>{r.dscrFlagStressed}</strong></p>
          </div>
        </div>

        <p className="text-sm opacity-80">{dscrHint}</p>
      </div>

      {/* How it works + FAQ */}
      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Monthly payment is calculated with the standard amortization formula (principal, rate, term).</li>
          <li>Stress-case payment uses: <strong>rate + rate shock</strong>.</li>
          <li>Stress-case cash flow uses: <strong>NOI × (1 − NOI drop)</strong>.</li>
          <li>
            DSCR = <strong>Annual NOI ÷ Annual debt service</strong> (higher is safer).
          </li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">What DSCR is “safe”?</span>
            <br />
            Many lenders prefer ~<strong>1.25+</strong>, but it varies by lender, collateral, and risk. Treat this as a
            stress signal, not a loan approval tool.
          </p>
          <p>
            <span className="font-medium">Does this include taxes or capex?</span>
            <br />
            No. This is a simplified model using NOI. If your operation has large capex cycles, stress test NOI more
            aggressively.
          </p>
          <p>
            <span className="font-medium">What stress inputs should I try?</span>
            <br />
            Common combos: <strong>+1–3%</strong> rate shock and <strong>−10–30%</strong> NOI drop (price drop, yield hit,
            cost spike).
          </p>
        </div>
      </div>
    </div>
  );
}
