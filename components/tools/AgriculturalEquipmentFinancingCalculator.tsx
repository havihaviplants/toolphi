"use client";

import { useMemo, useState } from "react";

export default function AgriculturalEquipmentFinancingCalculator() {
  const [price, setPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [upfrontFees, setUpfrontFees] = useState("");

  const [apr, setApr] = useState("");
  const [termMode, setTermMode] = useState<"years" | "months">("months");
  const [termValue, setTermValue] = useState("");

  const toNumber = (v: string) => {
    const n = Number(v.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const clamp = (n: number, min: number, max: number) =>
    Math.min(Math.max(n, min), max);

  const format0 = (n: number) =>
    n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const compute = (P: number, ratePct: number, months: number) => {
    const r = ratePct / 100 / 12;
    const n = months;
    if (P <= 0 || r <= 0 || n <= 0) return null;

    const monthly =
      (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const totalPaid = monthly * n;
    const totalInterest = totalPaid - P;

    return { monthly, totalPaid, totalInterest };
  };

  const result = useMemo(() => {
    const equipmentPrice = toNumber(price);
    const dp = clamp(toNumber(downPayment), 0, equipmentPrice);
    const fees = Math.max(toNumber(upfrontFees), 0);

    const rate = toNumber(apr);
    const term = toNumber(termValue);

    if (equipmentPrice <= 0 || rate <= 0 || term <= 0) return null;

    const months = termMode === "years" ? term * 12 : term;

    // Financing expectation: fees might be financed OR paid upfront.
    // We treat "upfront fees" as part of effective cost, not financed principal by default.
    // But we show both: financed principal and all-in effective cost.
    const financedPrincipal = equipmentPrice - dp;

    const res = compute(financedPrincipal, rate, months);
    if (!res) return null;

    const effectiveTotalCost = dp + fees + res.totalPaid; // dp + fees + total P&I paid

    return {
      equipmentPrice,
      downPayment: dp,
      fees,
      financedPrincipal,
      monthly: res.monthly,
      totalInterest: res.totalInterest,
      totalPaidPI: res.totalPaid,
      effectiveTotalCost,
      months,
    };
  }, [price, downPayment, upfrontFees, apr, termMode, termValue]);

  const feeScenarios = useMemo(() => {
    if (!result) return null;

    // Show the two common interpretations:
    // 1) Fees paid upfront (default)
    // 2) Fees rolled into financing principal (if lender finances fees)
    const rate = toNumber(apr);
    const term = toNumber(termValue);
    if (rate <= 0 || term <= 0) return null;

    const months = termMode === "years" ? term * 12 : term;

    const rolledPrincipal = result.financedPrincipal + result.fees;
    const rolled = compute(rolledPrincipal, rate, months);

    if (!rolled) return null;

    return {
      upfront: {
        monthly: result.monthly,
        totalPaidPI: result.totalPaidPI,
        totalInterest: result.totalInterest,
        effectiveTotalCost: result.effectiveTotalCost,
      },
      rolled: {
        monthly: rolled.monthly,
        totalPaidPI: rolled.totalPaid,
        totalInterest: rolled.totalInterest,
        effectiveTotalCost: result.downPayment + rolled.totalPaid, // fees included inside payments
      },
    };
  }, [result, apr, termMode, termValue]);

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
        This agricultural equipment financing calculator estimates{" "}
        <strong>monthly payments</strong> and your <strong>effective total cost</strong>{" "}
        when buying machinery. Financing offers often include dealer or origination fees,
        so this tool helps you see the difference between <em>loan payments</em> and
        <em>all-in cost</em>.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        <label>
          Equipment price
          <div style={helper}>Sticker price or negotiated price</div>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 95000"
            style={input}
          />
        </label>

        <label>
          Down payment
          <div style={helper}>Amount you pay upfront (not financed)</div>
          <input
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            placeholder="e.g. 10000"
            style={input}
          />
        </label>

        <label>
          Upfront fees (optional)
          <div style={helper}>Dealer / documentation / origination fees</div>
          <input
            value={upfrontFees}
            onChange={(e) => setUpfrontFees(e.target.value)}
            placeholder="e.g. 1500"
            style={input}
          />
        </label>

        <label>
          Annual interest rate (APR %)
          <div style={helper}>Example: 8.5 means 8.5% APR</div>
          <input
            value={apr}
            onChange={(e) => setApr(e.target.value)}
            placeholder="e.g. 8.5"
            style={input}
          />
        </label>

        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 600 }}>Financing term</div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <label style={radioLabel}>
              <input
                type="radio"
                checked={termMode === "months"}
                onChange={() => setTermMode("months")}
              />
              <span style={{ marginLeft: 6 }}>Months</span>
            </label>
            <label style={radioLabel}>
              <input
                type="radio"
                checked={termMode === "years"}
                onChange={() => setTermMode("years")}
              />
              <span style={{ marginLeft: 6 }}>Years</span>
            </label>
          </div>

          <input
            value={termValue}
            onChange={(e) => setTermValue(e.target.value)}
            placeholder={termMode === "months" ? "e.g. 60" : "e.g. 5"}
            style={input}
          />
          <div style={helper}>
            Dealer financing is often 36–84 months, but terms vary.
          </div>
        </div>
      </div>

      <div style={summary}>
        <p>
          <strong>Financed amount (principal):</strong>{" "}
          {result ? format0(result.financedPrincipal) : "—"}
        </p>
        <p>
          <strong>Estimated monthly payment (P&amp;I):</strong>{" "}
          {result ? format0(result.monthly) : "—"}
        </p>
        <p>
          <strong>Total interest paid:</strong>{" "}
          {result ? format0(result.totalInterest) : "—"}
        </p>
        <p>
          <strong>Total paid (P&amp;I):</strong>{" "}
          {result ? format0(result.totalPaidPI) : "—"}
        </p>
        <p>
          <strong>Effective total cost (down + fees + payments):</strong>{" "}
          {result ? format0(result.effectiveTotalCost) : "—"}
        </p>

        <p style={{ marginTop: 10, fontSize: 12, color: "#555" }}>
          Note: Some lenders roll fees into the loan. See the scenario comparison below.
        </p>
      </div>

      {feeScenarios && (
        <>
          <h3 style={{ marginTop: 26 }}>Fee handling scenarios</h3>
          <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
            Two common ways fees are treated: paid upfront vs rolled into the financed amount.
          </p>

          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Monthly payment</th>
                  <th>Total interest</th>
                  <th>Effective total cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Fees paid upfront</td>
                  <td>{format0(feeScenarios.upfront.monthly)}</td>
                  <td>{format0(feeScenarios.upfront.totalInterest)}</td>
                  <td>{format0(feeScenarios.upfront.effectiveTotalCost)}</td>
                </tr>
                <tr>
                  <td>Fees rolled into loan</td>
                  <td>{format0(feeScenarios.rolled.monthly)}</td>
                  <td>{format0(feeScenarios.rolled.totalInterest)}</td>
                  <td>{format0(feeScenarios.rolled.effectiveTotalCost)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      <h3 style={{ marginTop: 28 }}>How this calculator works</h3>
      <ul>
        <li>Financed principal = equipment price − down payment</li>
        <li>Monthly payment uses amortization math (fixed-rate)</li>
        <li>Effective total cost = down payment + fees + total payments</li>
      </ul>

      <h3>Frequently asked questions</h3>
      <p>
        <strong>Does this include sales tax?</strong>
        <br />
        No. If you want to include tax, add it to the equipment price.
      </p>
      <p>
        <strong>Is this accurate for balloon financing?</strong>
        <br />
        No. Balloon deals require custom calculations because a balance remains at the end.
      </p>
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  marginTop: 6,
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #ddd",
  fontSize: 14,
};

const helper: React.CSSProperties = {
  fontSize: 12,
  color: "#777",
};

const summary: React.CSSProperties = {
  marginTop: 20,
  padding: 14,
  borderRadius: 8,
  background: "#f6f9ff",
  border: "1px solid #d6e0ff",
  fontSize: 14,
};

const radioLabel: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  fontSize: 13,
  color: "#333",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 12,
  fontSize: 13,
};
