"use client";

import { useMemo, useState } from "react";

type MatchMode = "NONE" | "FLAT_ANNUAL" | "PERCENT_OF_SALARY";

function num(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min = 0, max = Infinity) {
  return Math.min(Math.max(n, min), max);
}

function money(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.18)",
  marginTop: 8,
};

export default function K401Calculator() {
  const [currentStr, setCurrentStr] = useState("75000");
  const [employeeAnnualStr, setEmployeeAnnualStr] = useState("12000");
  const [returnRateStr, setReturnRateStr] = useState("6");
  const [yearsStr, setYearsStr] = useState("25");

  const [matchMode, setMatchMode] = useState<MatchMode>("FLAT_ANNUAL");
  const [employerFlatAnnualStr, setEmployerFlatAnnualStr] = useState("3000");

  const [salaryStr, setSalaryStr] = useState("80000");
  const [matchPctStr, setMatchPctStr] = useState("3"); // 3% of salary

  const out = useMemo(() => {
    const current = clamp(num(currentStr), 0);
    const employeeAnnual = clamp(num(employeeAnnualStr), 0);
    const r = clamp(num(returnRateStr), 0, 100) / 100;
    const years = clamp(num(yearsStr), 0, 120);

    let employerAnnual = 0;
    if (matchMode === "FLAT_ANNUAL") {
      employerAnnual = clamp(num(employerFlatAnnualStr), 0);
    } else if (matchMode === "PERCENT_OF_SALARY") {
      const salary = clamp(num(salaryStr), 0);
      const pct = clamp(num(matchPctStr), 0, 100) / 100;
      employerAnnual = salary * pct;
    }

    const totalAnnualAdd = employeeAnnual + employerAnnual;

    let balance = current;
    for (let i = 0; i < years; i++) {
      balance = balance * (1 + r) + totalAnnualAdd;
    }

    return {
      employerAnnual,
      totalAnnualAdd,
      futureBalance: balance,
    };
  }, [
    currentStr,
    employeeAnnualStr,
    returnRateStr,
    yearsStr,
    matchMode,
    employerFlatAnnualStr,
    salaryStr,
    matchPctStr,
  ]);

  return (
    <div className="tool-container">
      <h1>401(k) Calculator</h1>

      <p className="muted" style={{ marginTop: 10 }}>
        Estimate how your <strong>401(k) balance</strong> could grow over time
        based on contributions, optional employer match, and an expected annual
        return rate. This is a simplified projection for planning.
      </p>

      {/* Inputs */}
      <div style={{ marginTop: 18 }}>
        <label>
          Current 401(k) Balance
          <input
            style={inputStyle}
            type="number"
            value={currentStr}
            onChange={(e) => setCurrentStr(e.target.value)}
            placeholder="e.g. 75000"
          />
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Your Annual Contribution
          <input
            style={inputStyle}
            type="number"
            value={employeeAnnualStr}
            onChange={(e) => setEmployeeAnnualStr(e.target.value)}
            placeholder="e.g. 12000"
          />
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Employer Match (mode)
          <select
            style={inputStyle}
            value={matchMode}
            onChange={(e) => setMatchMode(e.target.value as MatchMode)}
          >
            <option value="NONE">No employer match</option>
            <option value="FLAT_ANNUAL">Flat annual match amount</option>
            <option value="PERCENT_OF_SALARY">Percent of salary</option>
          </select>
        </label>
      </div>

      {matchMode === "FLAT_ANNUAL" && (
        <div style={{ marginTop: 18 }}>
          <label>
            Employer Match (annual)
            <input
              style={inputStyle}
              type="number"
              value={employerFlatAnnualStr}
              onChange={(e) => setEmployerFlatAnnualStr(e.target.value)}
              placeholder="e.g. 3000"
            />
          </label>
        </div>
      )}

      {matchMode === "PERCENT_OF_SALARY" && (
        <>
          <div style={{ marginTop: 18 }}>
            <label>
              Annual Salary
              <input
                style={inputStyle}
                type="number"
                value={salaryStr}
                onChange={(e) => setSalaryStr(e.target.value)}
                placeholder="e.g. 80000"
              />
            </label>
          </div>

          <div style={{ marginTop: 18 }}>
            <label>
              Employer Match (% of salary)
              <input
                style={inputStyle}
                type="number"
                value={matchPctStr}
                onChange={(e) => setMatchPctStr(e.target.value)}
                placeholder="e.g. 3"
              />
            </label>
            <div className="muted">
              Example: 3% match means employer adds 3% of your salary each year.
            </div>
          </div>
        </>
      )}

      <div style={{ marginTop: 18 }}>
        <label>
          Expected Annual Return (%)
          <input
            style={inputStyle}
            type="number"
            value={returnRateStr}
            onChange={(e) => setReturnRateStr(e.target.value)}
            placeholder="e.g. 6"
          />
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Years Until Retirement
          <input
            style={inputStyle}
            type="number"
            value={yearsStr}
            onChange={(e) => setYearsStr(e.target.value)}
            placeholder="e.g. 25"
          />
        </label>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 24 }}>
        <h2 style={{ margin: 0 }}>Results</h2>

        <p style={{ marginTop: 12 }}>
          Employer Match (annual): <strong>${money(out.employerAnnual)}</strong>
        </p>

        <p style={{ marginTop: 8 }}>
          Total Added Each Year: <strong>${money(out.totalAnnualAdd)}</strong>
        </p>

        <hr style={{ margin: "12px 0" }} />

        <p style={{ marginTop: 8 }}>
          Estimated 401(k) Balance at Retirement:{" "}
          <strong>${money(out.futureBalance)}</strong>
        </p>
      </div>

      {/* SEO */}
      <div style={{ marginTop: 26 }}>
        <h2>How a 401(k) grows</h2>
        <p className="muted">
          A 401(k) typically grows through ongoing contributions and compound
          returns. Employer match can meaningfully increase long-term outcomes.
          This calculator uses a simple annual projection model.
        </p>

        <h2 style={{ marginTop: 18 }}>FAQ</h2>

        <h3>Does this include contribution limits?</h3>
        <p className="muted">
          No. This tool is a planning estimate and does not enforce annual IRS
          contribution limits. You can adjust your contribution input to match
          your expected limit.
        </p>

        <h3>Is this inflation-adjusted?</h3>
        <p className="muted">
          No. This shows nominal dollars. For a conservative view, lower the
          return rate to approximate inflation-adjusted growth.
        </p>
      </div>
    </div>
  );
}
