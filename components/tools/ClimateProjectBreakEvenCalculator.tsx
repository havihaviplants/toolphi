"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

export default function ClimateProjectBreakEvenCalculator() {
  const [upfrontCost, setUpfrontCost] = useState("");
  const [annualOperatingCost, setAnnualOperatingCost] = useState("");
  const [annualSavings, setAnnualSavings] = useState("");
  const [annualBenefits, setAnnualBenefits] = useState("");
  const [computed, setComputed] = useState(false);

  const baseBorderColor = "#d0d7de";
  const errorBorderColor = "#d1242f";

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: `1px solid ${baseBorderColor}`,
    background: "#ffffff",
    fontSize: 16,
    outline: "none",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    fontWeight: 600,
    marginBottom: 8,
  };

  const groupStyle: CSSProperties = {
    marginTop: 14,
    marginBottom: 14,
  };

  const helpStyle: CSSProperties = {
    marginTop: 8,
    fontSize: 13,
    color: "#57606a",
    lineHeight: 1.4,
  };

  const buttonPrimaryStyle: CSSProperties = {
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

  const buttonSecondaryStyle: CSSProperties = {
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

  const resultBoxStyle: CSSProperties = {
    marginTop: 18,
    padding: 16,
    borderRadius: 12,
    border: `1px solid ${baseBorderColor}`,
    background: "#f6f8fa",
  };

  const toNumberOrZero = (raw: string) => {
    const t = raw.trim();
    if (t === "") return 0;
    const n = Number(t);
    return Number.isFinite(n) ? n : 0;
  };

  const isInvalidInput = (raw: string) => {
    const t = raw.trim();
    if (t === "") return false; // blank is allowed (treated as 0)
    const n = Number(t);
    return !Number.isFinite(n) || n < 0;
  };

  const invalid = useMemo(() => {
    return (
      isInvalidInput(upfrontCost) ||
      isInvalidInput(annualOperatingCost) ||
      isInvalidInput(annualSavings) ||
      isInvalidInput(annualBenefits)
    );
  }, [upfrontCost, annualOperatingCost, annualSavings, annualBenefits]);

  const values = useMemo(() => {
    return {
      upfront: toNumberOrZero(upfrontCost),
      opex: toNumberOrZero(annualOperatingCost),
      savings: toNumberOrZero(annualSavings),
      benefits: toNumberOrZero(annualBenefits),
    };
  }, [upfrontCost, annualOperatingCost, annualSavings, annualBenefits]);

  const showError = computed && invalid;

  const result = useMemo(() => {
    if (!computed) return null;
    if (invalid) return null;

    const annualNetBenefit = values.savings + values.benefits - values.opex;
    const breakEvenYears =
      annualNetBenefit > 0 ? values.upfront / annualNetBenefit : null;

    return {
      annualNetBenefit,
      breakEvenYears,
      ...values,
    };
  }, [computed, invalid, values]);

  const calc = () => setComputed(true);

  const reset = () => {
    setUpfrontCost("");
    setAnnualOperatingCost("");
    setAnnualSavings("");
    setAnnualBenefits("");
    setComputed(false);
  };

  const fmtMoney = (n: number) => `$${Math.round(n).toLocaleString()}`;

  return (
    <div className="tool-container">
      <h1>Climate Project Break-Even Calculator</h1>
      <p>
        Estimate when a climate project breaks even by comparing upfront and ongoing
        costs against annual savings and other financial benefits (incentives, avoided
        fees, credits).
      </p>

      <div style={groupStyle}>
        <label style={labelStyle}>Upfront Project Cost (CapEx, $)</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && isInvalidInput(upfrontCost) ? errorBorderColor : baseBorderColor,
          }}
          type="number"
          step="any"
          min={0}
          value={upfrontCost}
          onChange={(e) => setUpfrontCost(e.target.value)}
          placeholder="e.g. 500000"
        />
        <div style={helpStyle}>One-time upfront investment required to start the project.</div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Annual Operating Cost (OpEx, $)</label>
        <input
          style={{
            ...inputStyle,
            borderColor:
              showError && isInvalidInput(annualOperatingCost) ? errorBorderColor : baseBorderColor,
          }}
          type="number"
          step="any"
          min={0}
          value={annualOperatingCost}
          onChange={(e) => setAnnualOperatingCost(e.target.value)}
          placeholder="e.g. 30000"
        />
        <div style={helpStyle}>
          Ongoing annual cost to operate, maintain, monitor, or report the project.
        </div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Annual Savings (Cost Reduction, $)</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && isInvalidInput(annualSavings) ? errorBorderColor : baseBorderColor,
          }}
          type="number"
          step="any"
          min={0}
          value={annualSavings}
          onChange={(e) => setAnnualSavings(e.target.value)}
          placeholder="e.g. 140000"
        />
        <div style={helpStyle}>
          Annual savings from energy efficiency, fuel reduction, lower waste, or process improvements.
        </div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>
          Additional Annual Benefits (Incentives, Credits, Avoided Fees, $)
        </label>
        <input
          style={{
            ...inputStyle,
            borderColor:
              showError && isInvalidInput(annualBenefits) ? errorBorderColor : baseBorderColor,
          }}
          type="number"
          step="any"
          min={0}
          value={annualBenefits}
          onChange={(e) => setAnnualBenefits(e.target.value)}
          placeholder="e.g. 20000"
        />
        <div style={helpStyle}>
          Optional. Include annualized incentives, tax credits, avoided penalties, or other recurring benefits.
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
          Please enter valid inputs (numbers only, and values cannot be negative).
        </p>
      )}

      {result && (
        <div style={resultBoxStyle}>
          <p style={{ marginBottom: 10, fontSize: 13, color: "#57606a" }}>
            Annual net benefit = (annual savings + annual benefits) − annual operating cost.
          </p>

          <p style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
            Annual Net Benefit: {fmtMoney(result.annualNetBenefit)}
          </p>

          {result.breakEvenYears === null ? (
            <p style={{ marginTop: 10, fontWeight: 700 }}>
              Break-even: Not reached (annual net benefit is zero or negative).
            </p>
          ) : (
            <p style={{ marginTop: 10, fontWeight: 700 }}>
              Estimated Break-Even (Payback Period):{" "}
              <span style={{ fontSize: 18 }}>{result.breakEvenYears.toFixed(2)} years</span>
            </p>
          )}

          <div style={{ display: "grid", gap: 6, marginTop: 12 }}>
            <p>
              <strong>Upfront cost:</strong> {fmtMoney(result.upfront)}
            </p>
            <p>
              <strong>Annual operating cost:</strong> {fmtMoney(result.opex)}
            </p>
            <p>
              <strong>Annual savings:</strong> {fmtMoney(result.savings)}
            </p>
            <p>
              <strong>Additional annual benefits:</strong> {fmtMoney(result.benefits)}
            </p>
          </div>
        </div>
      )}

      <section className="tool-footer" style={{ marginTop: 22 }}>
        <h2>How it works</h2>
        <p>
          This calculator estimates break-even using a simple payback method:
          upfront cost divided by annual net benefit. It’s useful for quick screening and
          comparing projects. For capital budgeting, you may also consider NPV/IRR.
        </p>

        <h2>FAQ</h2>
        <p>
          <strong>What does “break-even” mean here?</strong>
          <br />
          It means the point where cumulative net benefits recover the upfront project cost (simple payback).
        </p>
        <p>
          <strong>What if annual net benefit is negative?</strong>
          <br />
          Then the project does not break even under these assumptions. Re-check savings, incentives, or costs.
        </p>
        <p>
          <strong>Does this include carbon price or avoided compliance costs?</strong>
          <br />
          You can include those in “Additional annual benefits” as long as they’re recurring and annualized.
        </p>
      </section>
    </div>
  );
}
