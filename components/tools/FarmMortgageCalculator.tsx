"use client";

import { useMemo, useState } from "react";

export default function FarmMortgageCalculator() {
  // Core
  const [purchasePrice, setPurchasePrice] = useState("");
  const [downPaymentMode, setDownPaymentMode] = useState<"percent" | "amount">(
    "percent"
  );
  const [downPayment, setDownPayment] = useState("20");

  const [apr, setApr] = useState("");
  const [termYears, setTermYears] = useState("");

  // Optional "all-in"
  const [includePMI, setIncludePMI] = useState(false);
  const [pmiMonthly, setPmiMonthly] = useState("");

  const [includeTax, setIncludeTax] = useState(false);
  const [propertyTaxAnnual, setPropertyTaxAnnual] = useState("");

  const [includeInsurance, setIncludeInsurance] = useState(false);
  const [insuranceAnnual, setInsuranceAnnual] = useState("");

  const toNumber = (v: string) => {
    const n = Number(v.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const format0 = (n: number) =>
    n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const computeMonthlyPI = (principal: number, ratePct: number, years: number) => {
    const r = ratePct / 100 / 12;
    const n = years * 12;
    if (principal <= 0 || r <= 0 || n <= 0) return null;

    const monthly =
      (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const totalPaid = monthly * n;
    const totalInterest = totalPaid - principal;

    return { monthly, totalPaid, totalInterest, n };
  };

  const result = useMemo(() => {
    const price = toNumber(purchasePrice);
    const dpRaw = toNumber(downPayment);
    const rate = toNumber(apr);
    const years = toNumber(termYears);

    if (price <= 0 || rate <= 0 || years <= 0) return null;

    let dpAmount = 0;
    if (downPaymentMode === "percent") {
      dpAmount = price * (dpRaw / 100);
    } else {
      dpAmount = dpRaw;
    }

    if (dpAmount < 0) dpAmount = 0;
    if (dpAmount > price) dpAmount = price;

    const loanAmount = price - dpAmount;

    const pi = computeMonthlyPI(loanAmount, rate, years);
    if (!pi) return null;

    const pmi = includePMI ? toNumber(pmiMonthly) : 0;
    const taxMonthly = includeTax ? toNumber(propertyTaxAnnual) / 12 : 0;
    const insMonthly = includeInsurance ? toNumber(insuranceAnnual) / 12 : 0;

    const allInMonthly = pi.monthly + pmi + taxMonthly + insMonthly;

    return {
      purchasePrice: price,
      downPaymentAmount: dpAmount,
      downPaymentPercent: price > 0 ? (dpAmount / price) * 100 : 0,
      loanAmount,
      monthlyPI: pi.monthly,
      totalInterest: pi.totalInterest,
      totalPaid: pi.totalPaid,
      termMonths: pi.n,
      pmiMonthly: pmi,
      taxMonthly,
      insuranceMonthly: insMonthly,
      allInMonthly,
    };
  }, [
    purchasePrice,
    downPaymentMode,
    downPayment,
    apr,
    termYears,
    includePMI,
    pmiMonthly,
    includeTax,
    propertyTaxAnnual,
    includeInsurance,
    insuranceAnnual,
  ]);

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
        This farm mortgage calculator estimates monthly{" "}
        <strong>principal + interest</strong> payments and can also show an{" "}
        <strong>all-in monthly estimate</strong> by including optional costs
        like PMI, property tax, and insurance. This matches how many borrowers
        evaluate rural or farm property mortgages.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        <label>
          Farm property purchase price
          <div style={helper}>Total price of the farm property</div>
          <input
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="e.g. 600000"
            style={input}
          />
        </label>

        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 600 }}>Down payment</div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <label style={radioLabel}>
              <input
                type="radio"
                checked={downPaymentMode === "percent"}
                onChange={() => setDownPaymentMode("percent")}
              />
              <span style={{ marginLeft: 6 }}>Percent (%)</span>
            </label>

            <label style={radioLabel}>
              <input
                type="radio"
                checked={downPaymentMode === "amount"}
                onChange={() => setDownPaymentMode("amount")}
              />
              <span style={{ marginLeft: 6 }}>Amount ($)</span>
            </label>
          </div>

          <input
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            placeholder={downPaymentMode === "percent" ? "e.g. 20" : "e.g. 120000"}
            style={input}
          />
          <div style={helper}>
            Tip: Farm/rural mortgages may require higher down payments than
            standard home loans.
          </div>
        </div>

        <label>
          Annual interest rate (APR %)
          <div style={helper}>Example: 6.25 means 6.25% APR</div>
          <input
            value={apr}
            onChange={(e) => setApr(e.target.value)}
            placeholder="e.g. 6.25"
            style={input}
          />
        </label>

        <label>
          Mortgage term (years)
          <div style={helper}>Common: 15, 20, 30 years</div>
          <input
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
            placeholder="e.g. 30"
            style={input}
          />
        </label>
      </div>

      <h3 style={{ marginTop: 22 }}>Optional: all-in monthly estimate</h3>

      <div style={{ display: "grid", gap: 12 }}>
        <label style={toggleRow}>
          <input
            type="checkbox"
            checked={includePMI}
            onChange={(e) => setIncludePMI(e.target.checked)}
          />
          <span style={{ marginLeft: 8, fontWeight: 600 }}>Include PMI</span>
        </label>
        {includePMI && (
          <label>
            PMI (monthly)
            <div style={helper}>If applicable (enter monthly estimate)</div>
            <input
              value={pmiMonthly}
              onChange={(e) => setPmiMonthly(e.target.value)}
              placeholder="e.g. 180"
              style={input}
            />
          </label>
        )}

        <label style={toggleRow}>
          <input
            type="checkbox"
            checked={includeTax}
            onChange={(e) => setIncludeTax(e.target.checked)}
          />
          <span style={{ marginLeft: 8, fontWeight: 600 }}>
            Include property tax
          </span>
        </label>
        {includeTax && (
          <label>
            Property tax (annual)
            <div style={helper}>Enter annual property tax amount</div>
            <input
              value={propertyTaxAnnual}
              onChange={(e) => setPropertyTaxAnnual(e.target.value)}
              placeholder="e.g. 7200"
              style={input}
            />
          </label>
        )}

        <label style={toggleRow}>
          <input
            type="checkbox"
            checked={includeInsurance}
            onChange={(e) => setIncludeInsurance(e.target.checked)}
          />
          <span style={{ marginLeft: 8, fontWeight: 600 }}>
            Include insurance
          </span>
        </label>
        {includeInsurance && (
          <label>
            Insurance (annual)
            <div style={helper}>Home/farm property insurance estimate</div>
            <input
              value={insuranceAnnual}
              onChange={(e) => setInsuranceAnnual(e.target.value)}
              placeholder="e.g. 2400"
              style={input}
            />
          </label>
        )}
      </div>

      <div style={summary}>
        <p>
          <strong>Monthly payment (P&amp;I):</strong>{" "}
          {result ? format0(result.monthlyPI) : "—"}
        </p>
        <p>
          <strong>Loan amount:</strong>{" "}
          {result ? format0(result.loanAmount) : "—"}
        </p>
        <p>
          <strong>Down payment:</strong>{" "}
          {result ? `${format0(result.downPaymentAmount)} (${result.downPaymentPercent.toFixed(1)}%)` : "—"}
        </p>

        <div style={{ marginTop: 10 }}>
          <p>
            <strong>Total interest:</strong>{" "}
            {result ? format0(result.totalInterest) : "—"}
          </p>
          <p>
            <strong>Total paid (principal + interest):</strong>{" "}
            {result ? format0(result.totalPaid) : "—"}
          </p>
        </div>

        <div style={{ marginTop: 12, fontSize: 13 }}>
          <p style={{ marginBottom: 6, fontWeight: 700 }}>All-in monthly (optional)</p>
          <p>PMI: {result ? format0(result.pmiMonthly) : "—"}</p>
          <p>Property tax (monthly): {result ? format0(result.taxMonthly) : "—"}</p>
          <p>Insurance (monthly): {result ? format0(result.insuranceMonthly) : "—"}</p>
          <p style={{ marginTop: 8 }}>
            <strong>All-in monthly estimate:</strong>{" "}
            {result ? format0(result.allInMonthly) : "—"}
          </p>
        </div>

        <p style={{ marginTop: 10, fontSize: 12, color: "#555" }}>
          Note: “All-in” is an estimate to help budgeting. Lender escrows and
          local tax rates vary.
        </p>
      </div>

      <h3 style={{ marginTop: 28 }}>How this calculator works</h3>
      <ul>
        <li>Loan amount = purchase price − down payment</li>
        <li>Monthly P&amp;I uses standard amortization math (fixed-rate)</li>
        <li>Optional all-in monthly adds PMI + taxes + insurance</li>
      </ul>

      <h3>Frequently asked questions</h3>
      <p>
        <strong>Does a farm mortgage include land and buildings?</strong>
        <br />
        Often yes, but it depends on the lender and property type. Use the full
        purchase price when estimating.
      </p>
      <p>
        <strong>Is PMI always required?</strong>
        <br />
        Not always. PMI is often tied to loan-to-value (LTV). If your down
        payment is large, PMI may not apply.
      </p>
      <p>
        <strong>Is this accurate for variable-rate loans?</strong>
        <br />
        No. This assumes a fixed rate. Variable-rate loans require scenario
        modeling.
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
  marginTop: 22,
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

const toggleRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};
