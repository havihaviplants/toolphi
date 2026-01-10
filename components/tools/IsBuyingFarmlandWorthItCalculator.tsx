"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}
function money(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function pct(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toFixed(2) + "%";
}

export default function IsBuyingFarmlandWorthItCalculator() {
  // Purchase + financing
  const [purchasePrice, setPurchasePrice] = useState<number>(500000);
  const [downPayment, setDownPayment] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(6.5); // APR
  const [loanTermYears, setLoanTermYears] = useState<number>(20);
  const [useLoan, setUseLoan] = useState<boolean>(true);

  // Annual economics
  const [annualNetIncome, setAnnualNetIncome] = useState<number>(25000); // after operating costs
  const [annualPropertyTax, setAnnualPropertyTax] = useState<number>(3500);
  const [annualInsurance, setAnnualInsurance] = useState<number>(1500);

  // Investment assumptions
  const [appreciationRate, setAppreciationRate] = useState<number>(3.0);
  const [holdingYears, setHoldingYears] = useState<number>(10);

  // Compare vs alternative
  const [altReturnRate, setAltReturnRate] = useState<number>(6.0);

  const r = useMemo(() => {
    const price = Math.max(0, n(purchasePrice));
    const dp = Math.min(Math.max(0, n(downPayment)), price);
    const loanAmount = useLoan ? Math.max(0, price - dp) : 0;

    const apr = Math.max(0, n(interestRate)) / 100;
    const termMonths = Math.max(1, Math.round(Math.max(1, n(loanTermYears)) * 12));
    const monthlyRate = apr / 12;

    // Monthly payment (amortizing)
    let monthlyPayment = 0;
    if (loanAmount > 0) {
      if (monthlyRate === 0) {
        monthlyPayment = loanAmount / termMonths;
      } else {
        const p = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
        monthlyPayment = Number.isFinite(p) ? p : 0;
      }
    }

    const annualDebtService = monthlyPayment * 12;

    const netIncome = Math.max(0, n(annualNetIncome));
    const tax = Math.max(0, n(annualPropertyTax));
    const ins = Math.max(0, n(annualInsurance));

    const annualCashFlowBeforeDebt = netIncome - tax - ins;
    const annualCashFlowAfterDebt = annualCashFlowBeforeDebt - annualDebtService;

    const holdYears = Math.max(1, Math.round(Math.max(1, n(holdingYears))));
    const appr = Math.max(-100, n(appreciationRate)) / 100;

    // Future land value (simple compounding)
    const futureValue = price * Math.pow(1 + appr, holdYears);

    // Equity invested = down payment + (optional) extra cash if you choose “no loan”
    // Here we treat “equity invested” as down payment (if loan), otherwise full price.
    const equityInvested = useLoan ? dp : price;

    // Total cash flow over holding (simple: cash flow * years)
    // (we keep it simple—no inflation/step-up; user gets decision-level answer)
    const totalCashFlow = annualCashFlowAfterDebt * holdYears;

    // Total return = cash flows + value increase (futureValue - price)
    const appreciationGain = futureValue - price;
    const totalReturn = totalCashFlow + appreciationGain;

    // ROI on equity invested
    const roi = equityInvested > 0 ? (totalReturn / equityInvested) * 100 : 0;

    // Annualized return (approx): (1 + totalReturn/equity)^(1/years) - 1
    const annualized =
      equityInvested > 0
        ? (Math.pow(1 + totalReturn / equityInvested, 1 / holdYears) - 1) * 100
        : 0;

    // Payback: equity / annual cash flow after debt (if positive)
    const paybackYears =
      annualCashFlowAfterDebt > 0 ? equityInvested / annualCashFlowAfterDebt : Number.POSITIVE_INFINITY;

    // Alternative: invest equity at alt return for holding period
    const altR = Math.max(-100, n(altReturnRate)) / 100;
    const altFuture = equityInvested * Math.pow(1 + altR, holdYears);
    const altGain = altFuture - equityInvested;

    // Break-even appreciation rate: what appreciation makes farmland match alt gain, given cashflows?
    // Need appreciationGain such that totalCashFlow + appreciationGain == altGain
    // => futureValue - price = altGain - totalCashFlow
    // => price*(1+a)^years = price + (altGain - totalCashFlow)
    const targetFuture = price + (altGain - totalCashFlow);
    let breakEvenAppr = 0;
    if (price > 0 && targetFuture > 0) {
      breakEvenAppr = (Math.pow(targetFuture / price, 1 / holdYears) - 1) * 100;
      if (!Number.isFinite(breakEvenAppr)) breakEvenAppr = 0;
    }

    return {
      price,
      dp,
      loanAmount,
      monthlyPayment,
      annualDebtService,
      annualCashFlowBeforeDebt,
      annualCashFlowAfterDebt,
      futureValue,
      appreciationGain,
      totalCashFlow,
      totalReturn,
      equityInvested,
      roi,
      annualized,
      paybackYears,
      altGain,
      breakEvenAppr,
      holdYears,
    };
  }, [
    purchasePrice,
    downPayment,
    interestRate,
    loanTermYears,
    useLoan,
    annualNetIncome,
    annualPropertyTax,
    annualInsurance,
    appreciationRate,
    holdingYears,
    altReturnRate,
  ]);

  const verdict =
    r.annualized >= altReturnRate ? "Likely worth it (beats your alternative)" : "Maybe not (lags your alternative)";

  const verdictColor =
    r.annualized >= altReturnRate ? "text-green-600" : "text-amber-600";

  const paybackLabel =
    r.paybackYears === Number.POSITIVE_INFINITY ? "No payback (negative cash flow)" : r.paybackYears.toFixed(1) + " yrs";

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        This tool estimates whether buying farmland is worth it by combining{" "}
        <strong>cash flow</strong> + <strong>appreciation</strong> and comparing against an{" "}
        <strong>alternative investment return</strong>.
      </p>

      {/* Purchase & financing */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Purchase & financing</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Purchase price ($)</label>
            <input className="input" type="number" min={0} step="1" value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Down payment ($)</label>
            <input className="input" type="number" min={0} step="1" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Equity invested upfront (if using a loan).</p>
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={useLoan}
              onChange={(e) => setUseLoan(e.target.checked)}
            />
            <span className="text-sm">Use a loan (amortized payment)</span>
          </div>

          {useLoan && (
            <>
              <div>
                <label className="block text-sm font-medium">Interest rate (APR %)</label>
                <input className="input" type="number" min={0} step="0.01" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} />
              </div>

              <div>
                <label className="block text-sm font-medium">Loan term (years)</label>
                <input className="input" type="number" min={1} step="1" value={loanTermYears} onChange={(e) => setLoanTermYears(Number(e.target.value))} />
              </div>
            </>
          )}
        </div>

        <div className="pt-3 border-t grid gap-2 sm:grid-cols-2 text-sm opacity-80">
          <div>
            Loan amount: <span className="font-semibold">${money(r.loanAmount)}</span>
          </div>
          <div>
            Monthly payment: <span className="font-semibold">${money(r.monthlyPayment)}</span>
          </div>
        </div>
      </div>

      {/* Economics */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Annual economics</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Annual net income ($)</label>
            <input className="input" type="number" min={0} step="1" value={annualNetIncome} onChange={(e) => setAnnualNetIncome(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">After operating costs (rent profit or farm net).</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Property tax ($/yr)</label>
            <input className="input" type="number" min={0} step="1" value={annualPropertyTax} onChange={(e) => setAnnualPropertyTax(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Insurance ($/yr)</label>
            <input className="input" type="number" min={0} step="1" value={annualInsurance} onChange={(e) => setAnnualInsurance(Number(e.target.value))} />
          </div>
        </div>

        <div className="pt-3 border-t grid gap-2 sm:grid-cols-2 text-sm opacity-80">
          <div>
            Cash flow (before debt): <span className="font-semibold">${money(r.annualCashFlowBeforeDebt)}</span>
          </div>
          <div>
            Cash flow (after debt): <span className="font-semibold">${money(r.annualCashFlowAfterDebt)}</span>
          </div>
        </div>
      </div>

      {/* Investment assumptions */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Investment assumptions</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Expected appreciation (%/yr)</label>
            <input className="input" type="number" step="0.01" value={appreciationRate} onChange={(e) => setAppreciationRate(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Holding period (years)</label>
            <input className="input" type="number" min={1} step="1" value={holdingYears} onChange={(e) => setHoldingYears(Number(e.target.value))} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Alternative investment return (%/yr)</label>
            <input className="input" type="number" step="0.01" value={altReturnRate} onChange={(e) => setAltReturnRate(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Used to compare opportunity cost (e.g., index fund).</p>
          </div>
        </div>

        <div className="pt-3 border-t grid gap-2 sm:grid-cols-2 text-sm opacity-80">
          <div>
            Future land value: <span className="font-semibold">${money(r.futureValue)}</span>
          </div>
          <div>
            Appreciation gain: <span className="font-semibold">${money(r.appreciationGain)}</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-70">Verdict (vs alternative)</p>
        <p className={`text-xl font-bold ${verdictColor}`}>{verdict}</p>

        <div className="grid gap-2 sm:grid-cols-2 pt-2">
          <div>
            <p className="text-sm opacity-70">Total return (cash flow + appreciation)</p>
            <p className="font-semibold">${money(r.totalReturn)}</p>
          </div>

          <div>
            <p className="text-sm opacity-70">ROI on equity</p>
            <p className="font-semibold">{pct(r.roi)}</p>
          </div>

          <div>
            <p className="text-sm opacity-70">Annualized return (approx)</p>
            <p className="font-semibold">{pct(r.annualized)}</p>
          </div>

          <div>
            <p className="text-sm opacity-70">Payback period</p>
            <p className="font-semibold">{paybackLabel}</p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-sm opacity-70">Alternative gain over {r.holdYears} years</p>
            <p className="font-semibold">${money(r.altGain)}</p>
            <p className="text-xs opacity-70 mt-1">
              Break-even appreciation to match alternative:{" "}
              <span className="font-semibold">{pct(r.breakEvenAppr)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Total return = (annual cash flow after debt × years) + (future value − purchase price)</li>
          <li>ROI uses equity invested (down payment if loan, otherwise full price)</li>
          <li>Annualized return approximates a compounded rate over the holding period</li>
          <li>Break-even appreciation shows what land growth rate would match your alternative investment</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Is this a perfect farmland underwriting model?</span><br />
            No—real deals include transaction costs, rent growth, variable yields, taxes, and leverage nuances. This gives a fast decision-grade estimate.
          </p>
          <p>
            <span className="font-medium">Why compare against an alternative return?</span><br />
            Because “worth it” is relative—you’re choosing between this and another use of your equity.
          </p>
        </div>
      </div>
    </div>
  );
}
