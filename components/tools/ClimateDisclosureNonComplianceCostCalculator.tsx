"use client";

import { useMemo, useState } from "react";

export default function ClimateDisclosureNonComplianceCostCalculator() {
  const [regulatoryFines, setRegulatoryFines] = useState("");
  const [financingCostIncrease, setFinancingCostIncrease] = useState("");
  const [reputationalCost, setReputationalCost] = useState("");
  const [computed, setComputed] = useState(false);

  const baseBorderColor = "#d0d7de";
  const errorBorderColor = "#d1242f";

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: `1px solid ${baseBorderColor}`,
    background: "#ffffff",
    fontSize: 16,
    outline: "none",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontWeight: 600,
    marginBottom: 8,
  };

  const groupStyle: React.CSSProperties = {
    marginTop: 14,
    marginBottom: 14,
  };

  const helpStyle: React.CSSProperties = {
    marginTop: 8,
    fontSize: 13,
    color: "#57606a",
    lineHeight: 1.4,
  };

  const buttonPrimaryStyle: React.CSSProperties = {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
    width: "100%",
    maxWidth: 240,
  };

  const buttonSecondaryStyle: React.CSSProperties = {
    padding: "12px 14px",
    borderRadius: 10,
    border: `1px solid ${baseBorderColor}`,
    background: "#ffffff",
    color: "#111827",
    fontWeight: 800,
    cursor: "pointer",
    width: "100%",
    maxWidth: 240,
  };

  const resultBoxStyle: React.CSSProperties = {
    marginTop: 18,
    padding: 16,
    borderRadius: 12,
    border: `1px solid ${baseBorderColor}`,
    background: "#f6f8fa",
  };

  const parsed = useMemo(() => {
    const fines = parseFloat(regulatoryFines);
    const finance = parseFloat(financingCostIncrease);
    const rep = parseFloat(reputationalCost);

    return {
      fines: regulatoryFines.trim() === "" ? 0 : Number.isFinite(fines) ? fines : null,
      finance:
        financingCostIncrease.trim() === ""
          ? 0
          : Number.isFinite(finance)
          ? finance
          : null,
      rep: reputationalCost.trim() === "" ? 0 : Number.isFinite(rep) ? rep : null,
    };
  }, [regulatoryFines, financingCostIncrease, reputationalCost]);

  const showError =
    computed &&
    (parsed.fines === null ||
      parsed.finance === null ||
      parsed.rep === null ||
      parsed.fines < 0 ||
      parsed.finance < 0 ||
      parsed.rep < 0);

  const result = useMemo(() => {
    if (!computed) return null;
    if (
      parsed.fines === null ||
      parsed.finance === null ||
      parsed.rep === null ||
      parsed.fines < 0 ||
      parsed.finance < 0 ||
      parsed.rep < 0
    )
      return null;

    const total = parsed.fines + parsed.finance + parsed.rep;

    return {
      total,
      fines: parsed.fines,
      finance: parsed.finance,
      rep: parsed.rep,
    };
  }, [computed, parsed]);

  const calc = () => setComputed(true);

  const reset = () => {
    setRegulatoryFines("");
    setFinancingCostIncrease("");
    setReputationalCost("");
    setComputed(false);
  };

  return (
    <div className="tool-container">
      <h1>Climate Disclosure Non-Compliance Cost Calculator</h1>
      <p>
        Estimate the annual financial impact of not complying with climate disclosure requirements.
        Combine direct penalties, higher financing costs, and reputational/business risk into one
        number you can compare against compliance costs.
      </p>

      <div style={groupStyle}>
        <label style={labelStyle}>Estimated Regulatory Fines / Penalties (Annual, $)</label>
        <input
          style={{
            ...inputStyle,
            borderColor:
              showError && (parsed.fines === null || parsed.fines < 0)
                ? errorBorderColor
                : baseBorderColor,
          }}
          type="number"
          step="any"
          min={0}
          value={regulatoryFines}
          onChange={(e) => setRegulatoryFines(e.target.value)}
          placeholder="e.g. 250000"
        />
        <div style={helpStyle}>
          Direct fines, penalties, or enforcement costs. Leave blank if unknown (defaults to 0).
        </div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Increased Financing / Capital Cost (Annual, $)</label>
        <input
          style={{
            ...inputStyle,
            borderColor:
              showError && (parsed.finance === null || parsed.finance < 0)
                ? errorBorderColor
                : baseBorderColor,
          }}
          type="number"
          step="any"
          min={0}
          value={financingCostIncrease}
          onChange={(e) => setFinancingCostIncrease(e.target.value)}
          placeholder="e.g. 400000"
        />
        <div style={helpStyle}>
          Estimate extra interest expense, higher borrowing costs, reduced access to capital, or
          insurance pricing impacts driven by non-compliance.
        </div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Reputational / Business Risk Cost (Annual, $)</label>
        <input
          style={{
            ...inputStyle,
            borderColor:
              showError && (parsed.rep === null || parsed.rep < 0)
                ? errorBorderColor
                : baseBorderColor,
          }}
          type="number"
          step="any"
          min={0}
          value={reputationalCost}
          onChange={(e) => setReputationalCost(e.target.value)}
          placeholder="e.g. 150000"
        />
        <div style={helpStyle}>
          Expected loss from brand damage, lost deals, procurement exclusions, churn, or delayed
          partnerships. Leave blank if unknown (defaults to 0).
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
        <button style={buttonPrimaryStyle} onClick={calc}>
          Calculate
        </button>
        <button style={buttonSecondaryStyle} onClick={reset}>
          Reset
        </button>
      </div>

      {showError && (
        <p style={{ marginTop: 12, color: errorBorderColor, fontWeight: 700 }}>
          Please enter valid inputs (values cannot be negative).
        </p>
      )}

      {result && (
        <div style={resultBoxStyle}>
          <p style={{ marginBottom: 10, fontSize: 13, color: "#57606a" }}>
            Estimated annual non-compliance cost (sum of fines + financing impact + reputational risk).
          </p>

          <p style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
            Total: ${result.total.toLocaleString()}
          </p>

          <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
            <p>
              <strong>Regulatory fines:</strong> ${result.fines.toLocaleString()}
            </p>
            <p>
              <strong>Financing impact:</strong> ${result.finance.toLocaleString()}
            </p>
            <p>
              <strong>Reputational/business risk:</strong> ${result.rep.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <section className="tool-footer" style={{ marginTop: 22 }}>
        <h2>How it works</h2>
        <p>
          This calculator adds three annual cost components: (1) direct penalties, (2) higher financing
          costs, and (3) reputational/business risk. The result is a single annual figure you can use
          for a break-even comparison against reporting and compliance investments.
        </p>

        <h2>FAQ</h2>
        <p>
          <strong>Is this an official regulatory fine estimator?</strong>
          <br />
          No. It’s a decision-support model. Use your jurisdiction’s guidance and internal risk
          estimates.
        </p>
        <p>
          <strong>What if I don’t know reputational cost?</strong>
          <br />
          Leave it blank (0). You can later add a conservative estimate (e.g., 0.05%–0.5% of revenue).
        </p>
        <p>
          <strong>Should this be monthly instead of annual?</strong>
          <br />
          Use annual to compare against annual compliance budgets. If you prefer monthly, divide the
          result by 12.
        </p>
      </section>
    </div>
  );
}
