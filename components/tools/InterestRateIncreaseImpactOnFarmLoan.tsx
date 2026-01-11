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

function totalInterest(principal: number, annualRatePct: number, years: number) {
  const P = clampMin(principal, 0);
  const pmt = monthlyPayment(P, annualRatePct, years);
  const nMonths = Math.round(clampMin(years, 0) * 12);
  const totalPaid = pmt * nMonths;
  return Math.max(0, totalPaid - P);
}

export default function InterestRateIncreaseImpactOnFarmLoan() {
  const [loanAmount, setLoanAmount] = useState<number>(400000);
  const [termYears, setTermYears] = useState<number>(20);

  // Baseline vs New rate (explicit, avoids confusion)
  const [currentRate, setCurrentRate] = useState<number>(6.5);
  const [newRate, setNewRate] = useState<number>(8.0);

  const r = useMemo(() => {
    const P = clampMin(loanAmount, 0);
    const years = clampMin(termYears, 0);

    const baseRate = clampMin(currentRate, 0);
    const nextRate = clampMin(newRate, 0);

    const basePmt = monthlyPayment(P, baseRate, years);
    const nextPmt = monthlyPayment(P, nextRate, years);

    const baseAnnual = basePmt * 12;
    const nextAnnual = nextPmt * 12;

    const baseInt = totalInterest(P, baseRate, years);
    const nextInt = totalInterest(P, nextRate, years);

    const deltaPmt = nextPmt - basePmt;
    const deltaPmtPct = basePmt > 0 ? (deltaPmt / basePmt) * 100 : 0;

    const deltaAnnual = nextAnnual - baseAnnual;
    const deltaInt = nextInt - baseInt;

    const rateDelta = nextRate - baseRate;

    const hint =
      years <= 0
        ? "Enter a positive loan term to calculate payment changes."
        : nextRate < baseRate
        ? "New rate is lower than current rate. This becomes a rate decrease comparison."
        : "Tip: Try a +1% or +2% shock and compare the annual cash impact.";

    return {
      P,
      years,
      baseRate,
      nextRate,
      rateDelta,
      basePmt,
      nextPmt,
      baseAnnual,
      nextAnnual,
      baseInt,
      nextInt,
      deltaPmt,
      deltaPmtPct,
      deltaAnnual,
      deltaInt,
      hint,
    };
  }, [loanAmount, termYears, currentRate, newRate]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        See how a higher interest rate changes your farm loan’s <strong>monthly payment</strong>,{" "}
        <strong>annual debt service</strong>, and <strong>total interest</strong>.
      </p>

      {/* Loan inputs */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Loan inputs</div>

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
            <p className="text-xs opacity-70 mt-1">Principal (amount financed).</p>
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
            <p className="text-xs opacity-70 mt-1">Used for standard amortized payment.</p>
          </div>
        </div>
      </div>

      {/* Rate comparison */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Rate comparison</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Current interest rate (%)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={currentRate}
              onChange={(e) => setCurrentRate(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Your existing rate assumption.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">New interest rate (%)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={newRate}
              onChange={(e) => setNewRate(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Try a higher rate to model tightening cycles.</p>
          </div>
        </div>

        <p className="text-xs opacity-70">
          Rate change: <strong>{pct2(r.rateDelta)}</strong> ({pct2(r.baseRate)} → {pct2(r.nextRate)})
        </p>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Monthly payment (current)</p>
            <p className="text-xl font-bold">${money2(r.basePmt)}</p>
            <p className="text-xs opacity-70">Annual debt service: <strong>${money0(r.baseAnnual)}</strong></p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Monthly payment (new)</p>
            <p className="text-xl font-bold">${money2(r.nextPmt)}</p>
            <p className="text-xs opacity-70">Annual debt service: <strong>${money0(r.nextAnnual)}</strong></p>
          </div>
        </div>

        <div className="pt-3 border-t grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm opacity-70">Payment increase</p>
            <p className="font-semibold">
              +${money2(r.deltaPmt)} / month ({pct2(r.deltaPmtPct)})
            </p>
            <p className="text-xs opacity-70">
              Annual cash impact: <strong>+${money0(r.deltaAnnual)}</strong>
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm opacity-70">Total interest change (over full term)</p>
            <p className="font-semibold">+${money0(r.deltaInt)}</p>
            <p className="text-xs opacity-70">
              Current: <strong>${money0(r.baseInt)}</strong> · New: <strong>${money0(r.nextInt)}</strong>
            </p>
          </div>
        </div>

        <p className="text-sm opacity-80">{r.hint}</p>
      </div>

      {/* How it works + FAQ */}
      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Uses the standard amortization formula for monthly payments.</li>
          <li>Annual debt service = monthly payment × 12.</li>
          <li>Total interest = (monthly payment × total months) − principal.</li>
          <li>Compares baseline vs new rate and reports the delta.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Does this apply to variable-rate loans?</span>
            <br />
            It approximates the impact by treating your loan as if it reprices to the new rate for the full remaining
            term. For adjustable loans, actual impact depends on caps, reset dates, and remaining term.
          </p>
          <p>
            <span className="font-medium">Should I compare by rate increase instead?</span>
            <br />
            You can—just set the new rate to current + shock (e.g., 6.5 → 8.0).
          </p>
          <p>
            <span className="font-medium">What’s the fastest practical use?</span>
            <br />
            Translate rate shocks into annual cash impact, then compare against your NOI buffer.
          </p>
        </div>
      </div>
    </div>
  );
}
