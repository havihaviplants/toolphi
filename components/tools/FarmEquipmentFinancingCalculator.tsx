"use client";

import { useMemo, useState } from "react";

export default function FarmEquipmentFinancingCalculator() {
  const [price, setPrice] = useState("");
  const [tradeIn, setTradeIn] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [upfrontFees, setUpfrontFees] = useState("");

  const [apr, setApr] = useState("");
  const [termMode, setTermMode] = useState<"months" | "years">("months");
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
    const trade = clamp(toNumber(tradeIn), 0, equipmentPrice);
    const dp = clamp(toNumber(downPayment), 0, equipmentPrice);
    const fees = Math.max(toNumber(upfrontFees), 0);

    const rate = toNumber(apr);
    const term = toNumber(termValue);

    if (equipmentPrice <= 0 || rate <= 0 || term <= 0) return null;

    const months = termMode === "years" ? term * 12 : term;

    // Base financed principal: price minus credits paid upfront (trade-in & down)
    // Clamp so principal doesn't go below 0.
    const financedPrincipal = Math.max(equipmentPrice - trade - dp, 0);

    const pi = compute(financedPrincipal, rate, months);
    if (!pi) return null;

    // Effective total cost if fees are paid upfront:
    // upfront out-of-pocket = down payment + (trade-in is value, not cash)
    // effective cost from buyer perspective: (down payment + fees + total payments) + trade-in opportunity cost?
    // For simplicity: show "cash out" and "total value exchanged".
    const cashOutUpfront = dp + fees;
    const totalCashOut = cashOutUpfront + pi.totalPaid;

    // Total value exchanged including trade-in (useful for decision-making):
    const totalValueExchanged = totalCashOut + trade;

    return {
      equipmentPrice,
      tradeIn: trade,
      downPayment: dp,
      fees,
      financedPrincipal,
      months,
      monthly: pi.monthly,
      totalInterest: pi.totalInterest,
      totalPaidPI: pi.totalPaid,
      cashOutUpfront,
      totalCashOut,
      totalValueExchanged,
    };
  }, [price, tradeIn, downPayment, upfrontFees, apr, termMode, termValue]);

  const feeHandling = useMemo(() => {
    if (!result) return null;

    const rate = toNumber(apr);
    const term = toNumber(termValue);
    if (rate <= 0 || term <= 0) return null;

    const months = termMode === "years" ? term * 12 : term;

    // Scenario: fees rolled into loan principal (common with dealer financing)
    const rolledPrincipal = result.financedPrincipal + result.fees;
    const rolled = compute(rolledPrincipal, rate, months);
    if (!rolled) return null;

    const rolledCashOutUpfront = result.downPayment; // fees not paid upfront
    const rolledTotalCashOut = rolledCashOutUpfront + rolled.totalPaid;
    const rolledTotalValueExchanged = rolledTotalCashOut + result.tradeIn;

    return {
      upfrontFees: {
        monthly: result.monthly,
        totalInterest: result.totalInterest,
        totalCashOut: result.totalCashOut,
        totalValueExchanged: result.totalValueExchanged,
      },
      rolledFees: {
        monthly: rolled.monthly,
        totalInterest: rolled.totalInterest,
        totalCashOut: rolledTotalCashOut,
        totalValueExchanged: rolledTotalValueExchanged,
      },
    };
  }, [result, apr, termMode, termValue]);

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
        This farm equipment financing calculator estimates{" "}
        <strong>monthly payments</strong>, <strong>total interest</strong>, and
        a more realistic <strong>all-in cost</strong> by allowing trade-in value,
        down payment, and fees. This matches how many equipment purchases are
        negotiated in practice.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        <label>
          Equipment price
          <div style={helper}>Sticker price or negotiated price</div>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 110000"
            style={input}
          />
        </label>

        <label>
          Trade-in value (optional)
          <div style={helper}>Value credited from your old equipment</div>
          <input
            value={tradeIn}
            onChange={(e) => setTradeIn(e.target.value)}
            placeholder="e.g. 15000"
            style={input}
          />
        </label>

        <label>
          Down payment (optional)
          <div style={helper}>Cash paid upfront</div>
          <input
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            placeholder="e.g. 10000"
            style={input}
          />
        </label>

        <label>
          Upfront fees (optional)
          <div style={helper}>Dealer/doc/origination fees</div>
          <input
            value={upfrontFees}
            onChange={(e) => setUpfrontFees(e.target.value)}
            placeholder="e.g. 1200"
            style={input}
          />
        </label>

        <label>
          Annual interest rate (APR %)
          <div style={helper}>Example: 8.25 means 8.25% APR</div>
          <input
            value={apr}
            onChange={(e) => setApr(e.target.value)}
            placeholder="e.g. 8.25"
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
            placeholder={termMode === "months" ? "e.g. 72" : "e.g. 6"}
            style={input}
          />
          <div style={helper}>
            Typical ranges: 36–84 months (varies by dealer/lender).
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

        <div style={{ marginTop: 12, fontSize: 13 }}>
          <p style={{ marginBottom: 6, fontWeight: 700 }}>All-in views</p>
          <p>
            Cash out upfront (down + fees):{" "}
            {result ? format0(result.cashOutUpfront) : "—"}
          </p>
          <p>
            Total cash out (upfront + payments):{" "}
            {result ? format0(result.totalCashOut) : "—"}
          </p>
          <p>
            Total value exchanged (cash out + trade-in):{" "}
            {result ? format0(result.totalValueExchanged) : "—"}
          </p>
        </div>

        <p style={{ marginTop: 10, fontSize: 12, color: "#555" }}>
          Tip: “Total value exchanged” is useful when trade-in value is a big part
          of the deal (even if it isn’t cash).
        </p>
      </div>

      {feeHandling && (
        <>
          <h3 style={{ marginTop: 26 }}>Fees: upfront vs rolled into financing</h3>
          <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
            Some deals roll fees into the financed amount. Compare both.
          </p>

          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Monthly payment</th>
                  <th>Total interest</th>
                  <th>Total cash out</th>
                  <th>Total value exchanged</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Fees paid upfront</td>
                  <td>{format0(feeHandling.upfrontFees.monthly)}</td>
                  <td>{format0(feeHandling.upfrontFees.totalInterest)}</td>
                  <td>{format0(feeHandling.upfrontFees.totalCashOut)}</td>
                  <td>{format0(feeHandling.upfrontFees.totalValueExchanged)}</td>
                </tr>
                <tr>
                  <td>Fees rolled into financing</td>
                  <td>{format0(feeHandling.rolledFees.monthly)}</td>
                  <td>{format0(feeHandling.rolledFees.totalInterest)}</td>
                  <td>{format0(feeHandling.rolledFees.totalCashOut)}</td>
                  <td>{format0(feeHandling.rolledFees.totalValueExchanged)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      <h3 style={{ marginTop: 28 }}>How this calculator works</h3>
      <ul>
        <li>Financed amount = price − trade-in − down payment</li>
        <li>Monthly payment uses fixed-rate amortization math</li>
        <li>Total value exchanged helps compare trade-in heavy deals</li>
      </ul>

      <h3>Frequently asked questions</h3>
      <p>
        <strong>Should I treat trade-in as cash?</strong>
        <br />
        It’s not cash, but it is value you give up. “Total value exchanged” helps
        compare deals fairly.
      </p>
      <p>
        <strong>Does this include taxes?</strong>
        <br />
        No. If you want to include sales tax, add it to the equipment price.
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
