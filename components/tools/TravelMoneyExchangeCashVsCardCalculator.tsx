"use client";

import { useMemo, useState } from "react";

export default function TravelMoneyExchangeCashVsCardCalculator() {
  const [marketRate, setMarketRate] = useState("");
  const [amount, setAmount] = useState("");

  // Cash exchange inputs
  const [cashRate, setCashRate] = useState("");
  const [cashFlatFee, setCashFlatFee] = useState("");
  const [cashPercentFee, setCashPercentFee] = useState("");

  // Card payment inputs
  const [cardRate, setCardRate] = useState(""); // optional; if blank, use marketRate
  const [cardFxFeePercent, setCardFxFeePercent] = useState("");

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

  const buttonStyle: React.CSSProperties = {
    marginTop: 10,
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
    maxWidth: 360,
  };

  const resultBoxStyle: React.CSSProperties = {
    marginTop: 18,
    padding: 16,
    borderRadius: 12,
    border: `1px solid ${baseBorderColor}`,
    background: "#f6f8fa",
  };

  const sectionTitleStyle: React.CSSProperties = {
    marginTop: 18,
    fontSize: 16,
    fontWeight: 800,
  };

  const parsed = useMemo(() => {
    const m = parseFloat(marketRate);
    const a = parseFloat(amount);

    const cr = parseFloat(cashRate);
    const cf = cashFlatFee.trim() === "" ? 0 : parseFloat(cashFlatFee);
    const cp = cashPercentFee.trim() === "" ? 0 : parseFloat(cashPercentFee);

    const cardR = cardRate.trim() === "" ? null : parseFloat(cardRate);
    const cfx = cardFxFeePercent.trim() === "" ? 0 : parseFloat(cardFxFeePercent);

    return {
      m: Number.isFinite(m) ? m : null,
      a: Number.isFinite(a) ? a : null,

      cr: Number.isFinite(cr) ? cr : null,
      cf: Number.isFinite(cf) ? cf : null,
      cp: Number.isFinite(cp) ? cp : null,

      cardR: cardR !== null && Number.isFinite(cardR) ? cardR : cardR === null ? null : null,
      cfx: Number.isFinite(cfx) ? cfx : null,
    };
  }, [marketRate, amount, cashRate, cashFlatFee, cashPercentFee, cardRate, cardFxFeePercent]);

  const showError =
    computed &&
    (parsed.m === null ||
      parsed.a === null ||
      parsed.cr === null ||
      parsed.cf === null ||
      parsed.cp === null ||
      parsed.cfx === null ||
      parsed.m <= 0 ||
      parsed.a <= 0 ||
      parsed.cr <= 0 ||
      parsed.cf < 0 ||
      parsed.cp < 0 ||
      parsed.cfx < 0 ||
      (parsed.cardR !== null && parsed.cardR <= 0));

  const result = useMemo(() => {
    if (!computed) return null;
    if (
      parsed.m === null ||
      parsed.a === null ||
      parsed.cr === null ||
      parsed.cf === null ||
      parsed.cp === null ||
      parsed.cfx === null ||
      parsed.m <= 0 ||
      parsed.a <= 0 ||
      parsed.cr <= 0 ||
      parsed.cf < 0 ||
      parsed.cp < 0 ||
      parsed.cfx < 0
    )
      return null;
    if (parsed.cardR !== null && parsed.cardR <= 0) return null;

    // Baseline ideal value at mid-market (no fees)
    const idealValue = parsed.a * parsed.m;

    // CASH option:
    // fees in base currency: flat + % of amount
    const cashPercentFeeAmt = parsed.a * (parsed.cp / 100);
    const cashFeesBase = parsed.cf + cashPercentFeeAmt;
    const cashNetBase = parsed.a - cashFeesBase;
    const cashReceived = cashNetBase * parsed.cr;
    const cashEffectiveRate = cashReceived / parsed.a;
    const cashTotalCost = idealValue - cashReceived;

    // CARD option:
    // card rate defaults to mid-market if blank
    const usedCardRate = parsed.cardR === null ? parsed.m : parsed.cardR;
    // FX fee increases your base-currency cost: amount * (1 + fee%)
    const cardTotalBaseCost = parsed.a * (1 + parsed.cfx / 100);
    // Received value in quote currency (as if you spent that base amount at usedCardRate)
    const cardReceived = parsed.a * usedCardRate; // the purchase amount converted
    // Compare card to ideal: fee impact is in extra base cost
    // Convert extra base cost to quote currency (approx using usedCardRate)
    const cardExtraBase = cardTotalBaseCost - parsed.a;
    const cardFeeImpactQuote = cardExtraBase * usedCardRate;
    const cardTotalCost = cardFeeImpactQuote + (idealValue - cardReceived); // includes any rate difference if cardRate != mid
    const cardEffectiveRate = cardReceived / cardTotalBaseCost;

    const cheaper =
      cashTotalCost < cardTotalCost ? "Cash exchange" : cashTotalCost > cardTotalCost ? "Card payment" : "Tie";
    const diff = Math.abs(cashTotalCost - cardTotalCost);

    return {
      idealValue,

      cashFeesBase,
      cashReceived,
      cashTotalCost,
      cashEffectiveRate,

      usedCardRate,
      cardTotalBaseCost,
      cardReceived,
      cardTotalCost,
      cardEffectiveRate,

      cheaper,
      diff,
    };
  }, [computed, parsed]);

  const calc = () => setComputed(true);

  return (
    <div className="tool-container">
      <h1>Travel Money Exchange Calculator (Cash vs Card)</h1>
      <p>
        When traveling, you can exchange cash or pay by card. This tool compares the all-in
        cost using exchange rates and fees, so you can choose the cheaper option.
      </p>

      <div style={groupStyle}>
        <label style={labelStyle}>Mid-Market Exchange Rate</label>
        <input
          style={{
            ...inputStyle,
            borderColor:
              showError && (parsed.m === null || parsed.m <= 0)
                ? errorBorderColor
                : baseBorderColor,
          }}
          type="number"
          step="any"
          value={marketRate}
          onChange={(e) => setMarketRate(e.target.value)}
          placeholder="e.g. 1.10"
        />
        <div style={helpStyle}>Baseline “true” exchange rate for comparison.</div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Amount (Base Currency)</label>
        <input
          style={{
            ...inputStyle,
            borderColor:
              showError && (parsed.a === null || parsed.a <= 0)
                ? errorBorderColor
                : baseBorderColor,
          }}
          type="number"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 1000"
        />
        <div style={helpStyle}>How much you plan to exchange/spend.</div>
      </div>

      <div style={sectionTitleStyle}>Cash Exchange</div>

      <div style={groupStyle}>
        <label style={labelStyle}>Cash Offered Rate</label>
        <input
          style={{
            ...inputStyle,
            borderColor:
              showError && (parsed.cr === null || parsed.cr <= 0)
                ? errorBorderColor
                : baseBorderColor,
          }}
          type="number"
          step="any"
          value={cashRate}
          onChange={(e) => setCashRate(e.target.value)}
          placeholder="e.g. 1.05"
        />
        <div style={helpStyle}>The cash exchange rate you’re offered.</div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Cash Flat Fee (Optional)</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && parsed.cf === null ? errorBorderColor : baseBorderColor,
          }}
          type="number"
          step="any"
          value={cashFlatFee}
          onChange={(e) => setCashFlatFee(e.target.value)}
          placeholder="e.g. 5"
        />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Cash Percentage Fee (Optional)</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && parsed.cp === null ? errorBorderColor : baseBorderColor,
          }}
          type="number"
          step="any"
          value={cashPercentFee}
          onChange={(e) => setCashPercentFee(e.target.value)}
          placeholder="e.g. 1"
        />
      </div>

      <div style={sectionTitleStyle}>Card Payment</div>

      <div style={groupStyle}>
        <label style={labelStyle}>Card Exchange Rate (Optional)</label>
        <input
          style={{
            ...inputStyle,
            borderColor:
              showError && parsed.cardR !== null && parsed.cardR <= 0
                ? errorBorderColor
                : baseBorderColor,
          }}
          type="number"
          step="any"
          value={cardRate}
          onChange={(e) => setCardRate(e.target.value)}
          placeholder="Leave blank to use mid-market rate"
        />
        <div style={helpStyle}>
          If you don’t know it, leave blank to assume card uses mid-market.
        </div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Card FX Fee (%)</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && (parsed.cfx === null || parsed.cfx < 0) ? errorBorderColor : baseBorderColor,
          }}
          type="number"
          step="any"
          value={cardFxFeePercent}
          onChange={(e) => setCardFxFeePercent(e.target.value)}
          placeholder="e.g. 2"
        />
        <div style={helpStyle}>Foreign transaction fee percentage.</div>
      </div>

      <button style={buttonStyle} onClick={calc}>
        Calculate
      </button>

      {showError && (
        <p style={{ marginTop: 12, color: errorBorderColor, fontWeight: 600 }}>
          Please enter valid inputs (rates & amount must be greater than 0, fees cannot be negative).
        </p>
      )}

      {result && (
        <div style={resultBoxStyle}>
          <p>
            <strong>Cheaper Option:</strong> {result.cheaper}
          </p>
          <p>
            <strong>Cost Difference (Quote Currency):</strong>{" "}
            {result.diff.toFixed(2)}
          </p>

          <hr style={{ margin: "12px 0", border: "none", borderTop: `1px solid ${baseBorderColor}` }} />

          <p style={{ fontWeight: 800, marginBottom: 6 }}>Cash Exchange</p>
          <p>
            <strong>Received:</strong> {result.cashReceived.toFixed(2)}
          </p>
          <p>
            <strong>Total Cost vs Mid-Market:</strong> {result.cashTotalCost.toFixed(2)}
          </p>
          <p>
            <strong>Effective Rate (All-In):</strong> {result.cashEffectiveRate.toFixed(6)}
          </p>

          <hr style={{ margin: "12px 0", border: "none", borderTop: `1px solid ${baseBorderColor}` }} />

          <p style={{ fontWeight: 800, marginBottom: 6 }}>Card Payment</p>
          <p>
            <strong>Assumed Card Rate:</strong> {result.usedCardRate.toFixed(6)}
          </p>
          <p>
            <strong>Total Base Cost (incl. FX fee):</strong> {result.cardTotalBaseCost.toFixed(2)}
          </p>
          <p>
            <strong>Total Cost vs Mid-Market (Quote):</strong> {result.cardTotalCost.toFixed(2)}
          </p>
          <p>
            <strong>Effective Rate (All-In):</strong> {result.cardEffectiveRate.toFixed(6)}
          </p>
        </div>
      )}

      <section className="tool-footer" style={{ marginTop: 22 }}>
        <h2>How it works</h2>
        <p>
          We compare each option to the mid-market baseline. Cash uses the offered rate minus any
          cash fees. Card uses the card rate (or mid-market if unknown) and applies the FX fee to
          your base-currency cost.
        </p>

        <h2>FAQ</h2>
        <p>
          <strong>Is the card rate really mid-market?</strong>
          <br />
          Often it’s close, but not always. If you know your card network rate, enter it for accuracy.
        </p>
        <p>
          <strong>What about ATM fees?</strong>
          <br />
          Add them as additional “Cash Flat Fee” if you withdraw cash abroad.
        </p>
      </section>
    </div>
  );
}
