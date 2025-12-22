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

const blockStyle: React.CSSProperties = { marginTop: 14 };
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.15)",
  marginTop: 6,
};

export default function TaxLossHarvestingBenefitCalculator() {
  const [realizedGainsStr, setRealizedGainsStr] = useState<string>("10000");
  const [harvestedLossesStr, setHarvestedLossesStr] = useState<string>("4000");
  const [capGainsTaxRateStr, setCapGainsTaxRateStr] = useState<string>("20");
  const [offsetCapStr, setOffsetCapStr] = useState<string>("0"); // 0 = no cap

  const computed = useMemo(() => {
    const realizedGains = clamp(toNum(realizedGainsStr), 0);
    const harvestedLosses = clamp(toNum(harvestedLossesStr), 0);
    const capGainsRatePct = clamp(toNum(capGainsTaxRateStr), 0, 100);
    const offsetCap = clamp(toNum(offsetCapStr), 0); // 0 means unlimited

    const maxOffset = offsetCap > 0 ? Math.min(harvestedLosses, offsetCap) : harvestedLosses;
    const offsetUsed = Math.min(realizedGains, maxOffset);

    const taxableGainsBefore = realizedGains;
    const taxableGainsAfter = Math.max(0, realizedGains - offsetUsed);

    const taxBefore = (taxableGainsBefore * capGainsRatePct) / 100;
    const taxAfter = (taxableGainsAfter * capGainsRatePct) / 100;

    const taxSavings = taxBefore - taxAfter;

    const unusedLosses = Math.max(0, harvestedLosses - offsetUsed);

    return {
      realizedGains,
      harvestedLosses,
      capGainsRatePct,
      offsetCap,
      offsetUsed,
      taxableGainsBefore,
      taxableGainsAfter,
      taxBefore,
      taxAfter,
      taxSavings,
      unusedLosses,
    };
  }, [realizedGainsStr, harvestedLossesStr, capGainsTaxRateStr, offsetCapStr]);

  return (
    <div className="tool-container">
      <h1>Tax Loss Harvesting Benefit Calculator</h1>

      <p className="muted" style={{ marginTop: 8 }}>
        Tax-loss harvesting can reduce taxes by using realized capital losses to offset realized capital gains.
        This calculator estimates <strong>taxable gains after harvesting</strong> and your{" "}
        <strong>potential tax savings</strong> using a simple tax-rate assumption.
      </p>

      {/* Inputs */}
      <div style={{ marginTop: 10 }}>
        <div style={blockStyle}>
          <label>
            Realized Capital Gains (for the period)
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              value={realizedGainsStr}
              onChange={(e) => setRealizedGainsStr(e.target.value)}
              min={0}
              placeholder="e.g., 10000"
            />
          </label>
          <div className="muted">
            Use realized gains (sales) for the same period you’re planning to harvest losses.
          </div>
        </div>

        <div style={blockStyle}>
          <label>
            Harvested Capital Losses
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              value={harvestedLossesStr}
              onChange={(e) => setHarvestedLossesStr(e.target.value)}
              min={0}
              placeholder="e.g., 4000"
            />
          </label>
          <div className="muted">
            This is the amount of losses you plan to realize by selling positions at a loss.
          </div>
        </div>

        <div style={blockStyle}>
          <label>
            Capital Gains Tax Rate (%)
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              value={capGainsTaxRateStr}
              onChange={(e) => setCapGainsTaxRateStr(e.target.value)}
              min={0}
              max={100}
              placeholder="e.g., 20"
            />
          </label>
          <div className="muted">
            Use an estimated effective capital gains tax rate for planning (varies by jurisdiction).
          </div>
        </div>

        <div style={blockStyle}>
          <label>
            Optional: Maximum Loss Offset Limit (0 = no cap)
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              value={offsetCapStr}
              onChange={(e) => setOffsetCapStr(e.target.value)}
              min={0}
              placeholder="e.g., 3000"
            />
          </label>
          <div className="muted">
            Some tax systems cap how much loss can offset certain income types. Set to 0 to ignore caps.
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0 }}>Results</h2>

        <div style={{ marginTop: 10 }}>
          <p>
            Taxable Gains (before): <strong>${fmtMoney(computed.taxableGainsBefore)}</strong>
          </p>
          <p>
            Loss Offset Used: <strong>${fmtMoney(computed.offsetUsed)}</strong>
          </p>
          <p>
            Taxable Gains (after): <strong>${fmtMoney(computed.taxableGainsAfter)}</strong>
          </p>

          <hr style={{ margin: "12px 0" }} />

          <p>
            Estimated Tax (before): <strong>${fmtMoney(computed.taxBefore)}</strong>
          </p>
          <p>
            Estimated Tax (after): <strong>${fmtMoney(computed.taxAfter)}</strong>
          </p>
          <p>
            Estimated Tax Savings: <strong>${fmtMoney(computed.taxSavings)}</strong>
          </p>

          <hr style={{ margin: "12px 0" }} />

          <p>
            Unused Losses (carryforward potential):{" "}
            <strong>${fmtMoney(computed.unusedLosses)}</strong>
          </p>

          <p className="muted" style={{ marginTop: 12 }}>
            Inputs used: gains ${fmtMoney(computed.realizedGains)}, losses ${fmtMoney(computed.harvestedLosses)},
            tax rate <strong>{fmtPct(computed.capGainsRatePct)}</strong>. This is a simplified estimate for planning.
          </p>
        </div>
      </div>

      {/* How-to */}
      <div style={{ marginTop: 20 }}>
        <h2>How to use</h2>
        <ol>
          <li>Enter your realized capital gains amount for the period.</li>
          <li>Enter how much capital loss you plan to harvest.</li>
          <li>Enter your estimated capital gains tax rate.</li>
          <li>Optionally add a loss offset cap to model limits.</li>
          <li>Review estimated taxable gains and tax savings.</li>
        </ol>
      </div>

      {/* FAQ */}
      <div style={{ marginTop: 20 }}>
        <h2>FAQ</h2>

        <h3 style={{ marginBottom: 6 }}>What is tax-loss harvesting?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          It’s a strategy where you realize investment losses to offset realized gains, potentially reducing taxes.
          Rules vary by country, so use this as a planning estimate.
        </p>

        <h3 style={{ marginBottom: 6 }}>Can I harvest losses and buy back immediately?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Some jurisdictions have rules that disallow losses if you repurchase substantially identical assets too soon
          (often referred to as wash-sale-like rules). Confirm your local rules.
        </p>

        <h3 style={{ marginBottom: 6 }}>What happens to unused losses?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          In many systems, unused losses may carry forward to future years, but treatment and caps differ.
          This tool shows unused losses as a simple planning value.
        </p>
      </div>
    </div>
  );
}
