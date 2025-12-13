"use client";

import { useState } from "react";

type Answer = "yes" | "no" | "";

export default function IDREligibilityChecklist() {
  const [federalLoan, setFederalLoan] = useState<Answer>("");
  const [income, setIncome] = useState<Answer>("");

  const eligible =
    federalLoan === "yes" && income === "yes";

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>
        IDR Eligibility & Application Checklist
      </h2>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Check basic eligibility for income-driven repayment (IDR) plans and see
        what to prepare before applying.
      </p>

      <div style={{ marginBottom: 16 }}>
        <label>
          Do you have federal student loans?
          <select
            value={federalLoan}
            onChange={(e) => setFederalLoan(e.target.value as Answer)}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>
          Do you currently have taxable income?
          <select
            value={income}
            onChange={(e) => setIncome(e.target.value as Answer)}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
      </div>

      {federalLoan && income && (
        <div style={{ marginTop: 20 }}>
          {eligible ? (
            <>
              <h3>You may be eligible for IDR plans</h3>
              <ul>
                <li>IBR, PAYE, SAVE, or ICR may apply</li>
                <li>Payments are based on income and family size</li>
              </ul>
            </>
          ) : (
            <>
              <h3>You may not qualify for IDR</h3>
              <ul>
                <li>Private loans are not eligible</li>
                <li>No income may still require documentation</li>
              </ul>
            </>
          )}

          <h4 style={{ marginTop: 16 }}>Application checklist</h4>
          <ul>
            <li>Federal Student Aid (FSA) ID login</li>
            <li>Most recent tax return or income proof</li>
            <li>Loan servicer account access</li>
            <li>Family size information</li>
          </ul>
        </div>
      )}

      <p style={{ fontSize: 12, color: "#666", marginTop: 12 }}>
        This tool provides general guidance only. Official eligibility is
        determined by the U.S. Department of Education.
      </p>
    </div>
  );
}
