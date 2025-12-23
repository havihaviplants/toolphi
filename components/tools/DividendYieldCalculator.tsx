"use client";

import { useMemo, useState } from "react";

type Mode = "ANNUAL_DIVIDENDS_AND_PRICE" | "DPS_AND_PRICE";

function num(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min = 0, max = Infinity) {
  return Math.min(Math.max(n, min), max);
}

function pct(n: number) {
  if (!Number.isFinite(n)) return "0.00%";
  return `${n.toFixed(2)}%`;
}

function money(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return x.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.15)",
  marginTop: 6,
};

const block: React.CSSProperties = { marginTop: 14 };

export default function DividendYieldCalculator() {
  const [mode, setMode] = useState<Mode>("DPS_AND_PRICE");

  // Inputs
  const [annualDividendsStr, setAnnualDividendsStr] = useState("2"); // per share
  const [dividendPerShareStr, setDividendPerShareStr] = useState("0.5"); // quarterly default
  const [dividendsPerYearStr, setDividendsPerYearStr] = useState("4"); // quarterly
  const [priceStr, setPriceStr] = useState("50");

  const out = useMemo(() => {
    const price = clamp(num(priceStr), 0.0000001);

    let annualDividends = 0;

    if (mode === "ANNUAL_DIVIDENDS_AND_PRICE") {
      annualDividends = clamp(num(annualDividendsStr), 0);
    } else {
      const dps = clamp(num(dividendPerShareStr), 0);
      const payments = clamp(num(dividendsPerYearStr), 0, 365);
      annualDividends = dps * payments;
    }

    const yieldDec = annualDividends / price;
    const yieldPct = yieldDec * 100;

    return {
      price,
      annualDividends,
      yieldPct,
      formula: `Dividend Yield = Annual Dividends ÷ Price = ${money(
        annualDividends
      )} ÷ ${money(price)} = ${pct(yieldPct)}`,
    };
  }, [
    mode,
    annualDividendsStr,
    dividendPerShareStr,
    dividendsPerYearStr,
    priceStr,
  ]);

  return (
    <div className="tool-container">
      <h1>Dividend Yield Calculator</h1>

      <p className="muted" style={{ marginTop: 8 }}>
        Quickly calculate <strong>pre-tax dividend yield</strong> using annual
        dividends and the current price. This is useful for comparing dividend
        stocks and ETFs. (For take-home yield, use an after-tax dividend yield
        calculator.)
      </p>

      {/* Inputs */}
      <div style={{ marginTop: 10 }}>
        <div style={block}>
          <label>
            Input Method
            <select
              style={inputStyle}
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
            >
              <option value="DPS_AND_PRICE">
                Dividend per share + Payments per year + Price
              </option>
              <option value="ANNUAL_DIVIDENDS_AND_PRICE">
                Annual dividends (per share) + Price
              </option>
            </select>
          </label>
          <div className="muted">
            Choose the format that matches the dividend data you have.
          </div>
        </div>

        {mode === "ANNUAL_DIVIDENDS_AND_PRICE" ? (
          <div style={block}>
            <label>
              Annual Dividends (per share)
              <input
                style={inputStyle}
                type="number"
                inputMode="decimal"
                value={annualDividendsStr}
                onChange={(e) => setAnnualDividendsStr(e.target.value)}
                min={0}
                placeholder="e.g., 2.00"
              />
            </label>
            <div className="muted">
              Total dividends paid per share over 1 year.
            </div>
          </div>
        ) : (
          <>
            <div style={block}>
              <label>
                Dividend per Share (each payment)
                <input
                  style={inputStyle}
                  type="number"
                  inputMode="decimal"
                  value={dividendPerShareStr}
                  onChange={(e) => setDividendPerShareStr(e.target.value)}
                  min={0}
                  placeholder="e.g., 0.50"
                />
              </label>
              <div className="muted">
                Example: quarterly dividend per share.
              </div>
            </div>

            <div style={block}>
              <label>
                Payments per Year
                <input
                  style={inputStyle}
                  type="number"
                  inputMode="numeric"
                  value={dividendsPerYearStr}
                  onChange={(e) => setDividendsPerYearStr(e.target.value)}
                  min={0}
                  placeholder="e.g., 4"
                />
              </label>
              <div className="muted">
                Quarterly = 4, monthly = 12, annual = 1.
              </div>
            </div>
          </>
        )}

        <div style={block}>
          <label>
            Current Price (per share)
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              value={priceStr}
              onChange={(e) => setPriceStr(e.target.value)}
              min={0}
              placeholder="e.g., 50"
            />
          </label>
          <div className="muted">
            Use the latest market price (or your entry price for a personal
            yield-on-cost view).
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 18 }}>
        <h2 style={{ margin: 0 }}>Results</h2>

        <div style={{ marginTop: 10 }}>
          <p>
            Annual Dividends (computed):{" "}
            <strong>${money(out.annualDividends)}</strong>
          </p>
          <p>
            Dividend Yield (pre-tax): <strong>{pct(out.yieldPct)}</strong>
          </p>

          <hr style={{ margin: "12px 0" }} />

          <p className="muted" style={{ marginTop: 0 }}>
            {out.formula}
          </p>
        </div>
      </div>

      {/* SEO blocks */}
      <div style={{ marginTop: 22 }}>
        <h2>How to calculate dividend yield</h2>
        <p className="muted">
          Dividend yield is the annual dividend amount divided by the current
          price. It helps compare income potential across dividend stocks and
          ETFs, but future dividends can change.
        </p>

        <h2 style={{ marginTop: 18 }}>FAQ</h2>

        <h3 style={{ marginBottom: 6 }}>Is dividend yield the same as yield on cost?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Not exactly. Dividend yield typically uses the current price. Yield on
          cost uses your purchase price, which can be helpful for personal
          tracking.
        </p>

        <h3 style={{ marginBottom: 6 }}>Does dividend yield include taxes?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          No. This tool calculates a pre-tax yield. For take-home yield, use an
          after-tax dividend yield calculator.
        </p>
      </div>
    </div>
  );
}
