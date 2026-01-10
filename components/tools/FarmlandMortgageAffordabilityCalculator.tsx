"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}
function money(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function pct1(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toFixed(1) + "%";
}

function monthlyPayment(loanAmount: number, apr: number, termMonths: number) {
  const L = Math.max(0, loanAmount);
  const m = Math.max(1, Math.round(termMonths));
  const r = Math.max(0, apr) / 12;

  if (L === 0) return 0;
  if (r === 0) return L / m;

  const p = L * (r * Math.pow(1 + r, m)) / (Math.pow(1 + r, m) - 1);
  return Number.isFinite(p) ? p : 0;
}

export default function FarmlandMortgageAffordabilityCalculator() {
  // Purchase / loan
  const [price, setPrice] = useState<number>(500000);
  const [downPayment, setDownPayment] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(6.5); // APR %
  const [termYears, setTermYears] = useState<number>(20);

  // Farm economics
  const [annualIncome, setAnnualIncome] = useState<number>(250000);
  const [annualOperatingExpenses, setAnnualOperatingExpenses] = useState<number>(170000);

  // Other debt + buffers
  const [otherAnnualDebtPayments, setOtherAnnualDebtPayments] = useState<number>(10000);
  const [annualPropertyTax, setAnnualPropertyTax] = useState<number>(3500);
  const [annualInsurance, setAnnualInsurance] = useState<number>(1500);

  // Stress test knobs
  const [rateShock, setRateShock] = useState<number>(1.5); // +% points
  const [incomeDropPct, setIncomeDropPct] = useState<number>(10); // %

  const r = useMemo(() => {
    const P = Math.max(0, n(price));
    const dp = Math.min(Math.max(0, n(downPayment)), P);
    const loan = Math.max(0, P - dp);

    const apr = Math.max(0, n(interestRate)) / 100;
    const months = Math.max(1, Math.round(Math.max(1, n(termYears)) * 12));
    const mp = monthlyPayment(loan, apr, months);
    const annualMortgageDebt = mp * 12;

    const income = Math.max(0, n(annualIncome));
    const opx = Math.max(0, n(annualOperatingExpenses));
    const otherDebt = Math.max(0, n(otherAnnualDebtPayments));
    const tax = Math.max(0, n(annualPropertyTax));
    const ins = Math.max(0, n(annualInsurance));

    const annualAllDebt = annualMortgageDebt + otherDebt;

    // DTI-style metrics
    const debtToIncome = income > 0 ? (annualAllDebt / income) * 100 : 0;
    const mortgageShare = income > 0 ? (annualMortgageDebt / income) * 100 : 0;

    // Coverage view: (income - operating - tax - insurance) / annual debt
    const surplus = income - opx - tax - ins;
    const coverage = annualAllDebt > 0 ? surplus / annualAllDebt : Number.POSITIVE_INFINITY;

    // Stress: rate up
    const shockedApr = Math.max(0, (n(interestRate) + Math.max(0, n(rateShock)))) / 100;
    const mpShock = monthlyPayment(loan, shockedApr, months);
    const annualMortgageShock = mpShock * 12;
    const annualAllDebtShock = annualMortgageShock + otherDebt;
    const dtiShock = income > 0 ? (annualAllDebtShock / income) * 100 : 0;
    const covShock = annualAllDebtShock > 0 ? surplus / annualAllDebtShock : Number.POSITIVE_INFINITY;

    // Stress: income down
    const drop = Math.max(0, Math.min(100, n(incomeDropPct))) / 100;
    const incomeDown = income * (1 - drop);
    const surplusDown = incomeDown - opx - tax - ins;
    const dtiIncomeDown = incomeDown > 0 ? (annualAllDebt / incomeDown) * 100 : 0;
    const covIncomeDown = annualAllDebt > 0 ? surplusDown / annualAllDebt : Number.POSITIVE_INFINITY;

    return {
      P,
      dp,
      loan,
      mp,
      annualMortgageDebt,
      annualAllDebt,
      income,
      opx,
      tax,
      ins,
      otherDebt,
      surplus,
      debtToIncome,
      mortgageShare,
      coverage,
      // stress
      mpShock,
      annualMortgageShock,
      annualAllDebtShock,
      dtiShock,
      covShock,
      incomeDown,
      surplusDown,
      dtiIncomeDown,
      covIncomeDown,
    };
  }, [
    price,
    downPayment,
    interestRate,
    termYears,
    annualIncome,
    annualOperatingExpenses,
    otherAnnualDebtPayments,
    annualPropertyTax,
    annualInsurance,
    rateShock,
    incomeDropPct,
  ]);

  const coverageLabel =
    r.coverage === Number.POSITIVE_INFINITY ? "∞" : Number.isFinite(r.coverage) ? r.coverage.toFixed(2) : "—";

  const covColor =
    r.coverage >= 1.5 ? "text-green-600" : r.coverage >= 1.2 ? "text-amber-600" : "text-red-600";

  const dtiColor =
    r.debtToIncome < 20 ? "text-green-600" : r.debtToIncome < 35 ? "text-amber-600" : "text-red-600";

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        This farmland mortgage affordability tool estimates your monthly payment and evaluates affordability using{" "}
        <strong>DTI-style ratios</strong> and a farm-friendly <strong>coverage view</strong>{" "}
        (surplus ÷ total annual debt). It also includes simple stress tests.
      </p>

      {/* Purchase / Loan */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Farmland purchase & loan</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Farmland price ($)</label>
            <input className="input" type="number" min={0} step="1" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Down payment ($)</label>
            <input className="input" type="number" min={0} step="1" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Interest rate (APR %)</label>
            <input className="input" type="number" min={0} step="0.01" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Loan term (years)</label>
            <input className="input" type="number" min={1} step="1" value={termYears} onChange={(e) => setTermYears(Number(e.target.value))} />
          </div>
        </div>

        <div className="pt-3 border-t grid gap-2 sm:grid-cols-2 text-sm opacity-80">
          <div>
            Loan amount: <span className="font-semibold">${money(r.loan)}</span>
          </div>
          <div>
            Monthly payment: <span className="font-semibold">${money(r.mp)}</span>
          </div>
        </div>
      </div>

      {/* Income / Expenses */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Farm income & expenses (annual)</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Annual farm income ($)</label>
            <input className="input" type="number" min={0} step="1" value={annualIncome} onChange={(e) => setAnnualIncome(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Annual operating expenses ($)</label>
            <input className="input" type="number" min={0} step="1" value={annualOperatingExpenses} onChange={(e) => setAnnualOperatingExpenses(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Seed/feed, fertilizer, fuel, labor, repairs, utilities, etc.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Other annual debt payments ($)</label>
            <input className="input" type="number" min={0} step="1" value={otherAnnualDebtPayments} onChange={(e) => setOtherAnnualDebtPayments(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Equipment loans, operating notes, other obligations.</p>
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
            Surplus (income − opx − tax − insurance):{" "}
            <span className="font-semibold">${money(r.surplus)}</span>
          </div>
          <div>
            Total annual debt (mortgage + other):{" "}
            <span className="font-semibold">${money(r.annualAllDebt)}</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-sm opacity-70">Debt-to-income (total debt ÷ income)</p>
            <p className={`text-xl font-bold ${dtiColor}`}>{pct1(r.debtToIncome)}</p>
            <p className="text-xs opacity-70 mt-1">
              Mortgage share of income: <span className="font-semibold">{pct1(r.mortgageShare)}</span>
            </p>
          </div>

          <div>
            <p className="text-sm opacity-70">Coverage (surplus ÷ total debt)</p>
            <p className={`text-xl font-bold ${covColor}`}>{coverageLabel}</p>
            <p className="text-xs opacity-70 mt-1">
              Rule of thumb: coverage below ~1.2 can be tight in volatile years.
            </p>
          </div>
        </div>
      </div>

      {/* Stress tests */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Stress tests</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Rate shock (+% points)</label>
            <input className="input" type="number" min={0} step="0.1" value={rateShock} onChange={(e) => setRateShock(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Example: +1.5 means 6.5% → 8.0%.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Income drop (%)</label>
            <input className="input" type="number" min={0} max={100} step="1" value={incomeDropPct} onChange={(e) => setIncomeDropPct(Number(e.target.value))} />
          </div>
        </div>

        <div className="pt-3 border-t grid gap-3 sm:grid-cols-2 text-sm opacity-80">
          <div>
            <div className="font-medium">If rates rise</div>
            <div>Monthly payment: <span className="font-semibold">${money(r.mpShock)}</span></div>
            <div>DTI: <span className="font-semibold">{pct1(r.dtiShock)}</span></div>
            <div>Coverage: <span className="font-semibold">{Number.isFinite(r.covShock) ? r.covShock.toFixed(2) : "—"}</span></div>
          </div>

          <div>
            <div className="font-medium">If income drops</div>
            <div>Income: <span className="font-semibold">${money(r.incomeDown)}</span></div>
            <div>DTI: <span className="font-semibold">{pct1(r.dtiIncomeDown)}</span></div>
            <div>Coverage: <span className="font-semibold">{Number.isFinite(r.covIncomeDown) ? r.covIncomeDown.toFixed(2) : "—"}</span></div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Monthly payment uses a standard amortization formula.</li>
          <li>DTI (%) = total annual debt payments ÷ annual income.</li>
          <li>Coverage = (income − operating expenses − tax − insurance) ÷ total annual debt.</li>
          <li>Stress tests help you see sensitivity to rates and income volatility.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Why include operating expenses?</span><br />
            Farms are cash-flow businesses. Income alone is misleading if costs consume most of it.
          </p>
          <p>
            <span className="font-medium">Is “coverage” the same as DSCR?</span><br />
            Not exactly. DSCR is typically based on net operating income and specific lender definitions. This is a fast decision-grade proxy.
          </p>
        </div>
      </div>
    </div>
  );
}
