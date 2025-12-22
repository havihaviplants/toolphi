"use client";

import { useMemo, useState } from "react";

function toNum(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min = 0, max = Number.POSITIVE_INFINITY) {
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}

function fmtMoney(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return x.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function fmtPct(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return `${x.toFixed(2)}%`;
}

export default function QualifiedVsOrdinaryDividendTaxCalculator() {
  const [dividendsStr, setDividendsStr] = useState<string>("2000");
  const [qualifiedRateStr, setQualifiedRateStr] = useState<string>("15");
  const [ordinaryRateStr, setOrdinaryRateStr] = useState<string>("30");

  const computed = useMemo(() => {
    const dividends = clamp(toNum(dividendsStr), 0);
    const qualifiedRate = clamp(toNum(qualifiedRateStr), 0, 100);
    const ordinaryRate = clamp(toNum(ordinaryRateStr), 0, 100);

    const qTax = (dividends * qualifiedRate) / 100;
    const oTax = (dividends * ordinaryRate) / 100;

    const qTakeHome = dividends - qTax;
    const oTakeHome = dividends - oTax;

    const taxSavings = oTax - qTax;
    const takeHomeDiff = qTakeHome - oTakeHome;

    return {
      dividends,
      qualifiedRate,
      ordinaryRate,
      qTax,
      oTax,
      qTakeHome,
      oTakeHome,
      taxSavings,
      takeHomeDiff,
    };
  }, [dividendsStr, qualifiedRateStr, ordinaryRateStr]);

  return (
    <div className="tool-container">
      <h1>Qualified vs Ordinary Dividend Tax Calculator</h1>

      <p className="muted" style={{ marginTop: 8 }}>
        Compare estimated taxes on <strong>qualified</strong> vs{" "}
        <strong>ordinary (non-qualified)</strong> dividends. Enter your dividend
        amount and two estimated tax rates to see the difference in{" "}
        <strong>take-home dividend income</strong>.
      </p>

      {/* Inputs */}
      <div style={{ marginTop: 16 }}>
        <label>
          Dividend Amount
          <input
            type="number"
            inputMode="decimal"
            value={dividendsStr}
            onChange={(e) => setDividendsStr(e.target.value)}
            min={0}
            placeholder="e.g., 2000"
          />
          <div className="muted">
            Enter total dividends received (annual, quarterly, or any period you want—just be consistent).
          </div>
        </label>

        <label>
          Qualified Dividend Tax Rate (%)
          <input
            type="number"
            inputMode="decimal"
            value={qualifiedRateStr}
            onChange={(e) => setQualifiedRateStr(e.target.value)}
            min={0}
            max={100}
            placeholder="e.g., 15"
          />
          <div className="muted">
            Use an estimated rate for qualified dividends in your situation.
          </div>
        </label>

        <label>
          Ordinary Dividend Tax Rate (%)
          <input
            type="number"
            inputMode="decimal"
            value={ordinaryRateStr}
            onChange={(e) => setOrdinaryRateStr(e.target.value)}
            min={0}
            max={100}
            placeholder="e.g., 30"
          />
          <div className="muted">
            Ordinary dividends are often taxed closer to ordinary income rates (varies by jurisdiction).
          </div>
        </label>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0 }}>Results</h2>

        <div style={{ marginTop: 10 }}>
          <p className="muted" style={{ marginBottom: 6 }}>
            Qualified dividend scenario:
          </p>
          <p>
            Estimated Tax: <strong>${fmtMoney(computed.qTax)}</strong>
          </p>
          <p>
            Take-Home Dividends: <strong>${fmtMoney(computed.qTakeHome)}</strong>
          </p>

          <hr style={{ margin: "12px 0" }} />

          <p className="muted" style={{ marginBottom: 6 }}>
            Ordinary dividend scenario:
          </p>
          <p>
            Estimated Tax: <strong>${fmtMoney(computed.oTax)}</strong>
          </p>
          <p>
            Take-Home Dividends: <strong>${fmtMoney(computed.oTakeHome)}</strong>
          </p>

          <hr style={{ margin: "12px 0" }} />

          <p>
            Estimated Tax Savings (Qualified vs Ordinary):{" "}
            <strong>${fmtMoney(computed.taxSavings)}</strong>
          </p>
          <p>
            Difference in Take-Home Dividends:{" "}
            <strong>${fmtMoney(computed.takeHomeDiff)}</strong>
          </p>

          <p className="muted" style={{ marginTop: 12 }}>
            Rates used: qualified <strong>{fmtPct(computed.qualifiedRate)}</strong>, ordinary{" "}
            <strong>{fmtPct(computed.ordinaryRate)}</strong>. This tool provides an estimate for planning.
          </p>
        </div>
      </div>

      {/* How-to (SEO block) */}
      <div style={{ marginTop: 20 }}>
        <h2>How to use</h2>
        <ol>
          <li>Enter your total dividend amount.</li>
          <li>Enter an estimated qualified dividend tax rate.</li>
          <li>Enter an estimated ordinary dividend tax rate.</li>
          <li>Compare tax and take-home amounts under both scenarios.</li>
        </ol>
      </div>

      {/* FAQ (SEO block) */}
      <div style={{ marginTop: 20 }}>
        <h2>FAQ</h2>

        <h3 style={{ marginBottom: 6 }}>What are qualified dividends?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Qualified dividends are dividends that meet certain requirements and may be taxed at
          preferential rates in some tax systems (rules vary by country).
        </p>

        <h3 style={{ marginBottom: 6 }}>Are all dividends qualified?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          No. Some dividends may be treated as ordinary (non-qualified) and taxed at higher rates.
          Check your broker’s tax documents or local tax guidance.
        </p>

        <h3 style={{ marginBottom: 6 }}>Can I use this outside the US?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Yes. This calculator simply applies the two rates you enter. Use it as a planning estimate
          and confirm the correct classification and rates for your jurisdiction.
        </p>
      </div>
    </div>
  );
}
