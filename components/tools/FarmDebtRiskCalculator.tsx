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
function pct1(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return `${x.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}
function x2(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return `${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}×`;
}

type Band = "Low" | "Moderate" | "High";

function bandLabel(b: Band) {
  if (b === "Low") return "Low risk";
  if (b === "Moderate") return "Moderate risk";
  return "High risk";
}

export default function FarmDebtRiskCalculator() {
  // Balance sheet
  const [totalDebt, setTotalDebt] = useState<number>(600000);
  const [totalAssets, setTotalAssets] = useState<number>(2000000);

  // Cash flow
  const [annualNOI, setAnnualNOI] = useState<number>(140000);
  const [annualDebtService, setAnnualDebtService] = useState<number>(95000);

  const r = useMemo(() => {
    const debt = clampMin(totalDebt, 0);
    const assets = clampMin(totalAssets, 0);
    const noi = clampMin(annualNOI, 0);
    const ds = clampMin(annualDebtService, 0);

    const debtToAsset = assets > 0 ? debt / assets : 0; // fraction
    const debtToIncome = noi > 0 ? debt / noi : 0; // x
    const dscr = ds > 0 ? noi / ds : 0; // x

    // Heuristic bands (simple, explainable; not advice)
    const leverageBand: Band =
      debtToAsset <= 0.3 ? "Low" : debtToAsset <= 0.6 ? "Moderate" : "High";

    const incomeBand: Band =
      debtToIncome <= 3 ? "Low" : debtToIncome <= 6 ? "Moderate" : "High";

    const dscrBand: Band = dscr >= 1.5 ? "Low" : dscr >= 1.25 ? "Moderate" : "High";

    // Composite: if 2+ are High → High, else if any Moderate/High → Moderate, else Low
    const highs = [leverageBand, incomeBand, dscrBand].filter((b) => b === "High").length;
    const moderates = [leverageBand, incomeBand, dscrBand].filter((b) => b === "Moderate").length;

    const overall: Band = highs >= 2 ? "High" : highs === 1 || moderates >= 1 ? "Moderate" : "Low";

    const note =
      assets <= 0
        ? "Enter a positive total asset value to compute debt-to-asset."
        : ds <= 0
        ? "Enter annual debt service to compute DSCR."
        : overall === "High"
        ? "High risk signal: consider reducing leverage, extending term, refinancing, or increasing equity buffer."
        : overall === "Moderate"
        ? "Moderate risk signal: stress test NOI drops and rate increases; watch liquidity and working capital."
        : "Low risk signal: ratios look conservative—still stress test yield/price volatility."

    return {
      debt,
      assets,
      noi,
      ds,
      debtToAsset,
      debtToIncome,
      dscr,
      leverageBand,
      incomeBand,
      dscrBand,
      overall,
      note,
    };
  }, [totalDebt, totalAssets, annualNOI, annualDebtService]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        This calculator estimates debt risk using three simple signals:{" "}
        <strong>debt-to-asset</strong> (solvency), <strong>debt-to-income</strong> (leverage vs earnings), and{" "}
        <strong>DSCR</strong> (coverage).
      </p>

      {/* Balance sheet */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Balance sheet</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Total farm debt ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={totalDebt}
              onChange={(e) => setTotalDebt(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">All interest-bearing obligations (short + long term).</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Total farm assets ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={totalAssets}
              onChange={(e) => setTotalAssets(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Land, equipment, inventory, cash, etc. (approximate is fine).</p>
          </div>
        </div>
      </div>

      {/* Cash flow */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Cash flow</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Annual NOI ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={annualNOI}
              onChange={(e) => setAnnualNOI(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Net operating income before debt service (simplified).</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Annual debt service ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={annualDebtService}
              onChange={(e) => setAnnualDebtService(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Total annual principal + interest payments.</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Debt-to-asset</p>
            <p className="text-xl font-bold">{pct1(r.debtToAsset * 100)}</p>
            <p className="text-xs opacity-70">{bandLabel(r.leverageBand)}</p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Debt-to-income</p>
            <p className="text-xl font-bold">{x2(r.debtToIncome)}</p>
            <p className="text-xs opacity-70">{bandLabel(r.incomeBand)}</p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">DSCR</p>
            <p className="text-xl font-bold">{x2(r.dscr)}</p>
            <p className="text-xs opacity-70">{bandLabel(r.dscrBand)}</p>
          </div>
        </div>

        <div className="pt-3 border-t grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm opacity-70">Overall risk signal</p>
            <p className="text-xl font-bold">{bandLabel(r.overall)}</p>
          </div>

          <div>
            <p className="text-sm opacity-70">Snapshot inputs</p>
            <p className="text-sm">
              Debt: <strong>${money0(r.debt)}</strong> · Assets: <strong>${money0(r.assets)}</strong>
              <br />
              NOI: <strong>${money0(r.noi)}</strong> · Debt service: <strong>${money0(r.ds)}</strong>
            </p>
          </div>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      {/* How it works + FAQ */}
      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>
            Debt-to-asset = <strong>Total debt ÷ Total assets</strong> (solvency / leverage).
          </li>
          <li>
            Debt-to-income = <strong>Total debt ÷ Annual NOI</strong> (how many “NOI years” of debt).
          </li>
          <li>
            DSCR = <strong>Annual NOI ÷ Annual debt service</strong> (coverage; higher is safer).
          </li>
          <li>Overall risk is a simple composite signal from the three bands.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Are these lender standards?</span>
            <br />
            Not exactly. These are practical heuristics for stress signals. Lenders may use different thresholds and
            add liquidity, collateral quality, and history.
          </p>
          <p>
            <span className="font-medium">What should I stress test next?</span>
            <br />
            Try an NOI drop (crop price down / yield down) and see how DSCR changes, or run a rate-shock scenario with
            the Farm Loan Stress Test Calculator.
          </p>
          <p>
            <span className="font-medium">Does this replace an accountant or lender?</span>
            <br />
            No—use it as a fast “early warning” dashboard, then validate with detailed statements.
          </p>
        </div>
      </div>
    </div>
  );
}
