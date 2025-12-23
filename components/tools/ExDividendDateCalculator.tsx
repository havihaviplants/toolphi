"use client";

import { useMemo, useState } from "react";

type Convention = "US_T1_REGULAR" | "LEGACY_T2_STYLE";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.15)",
  marginTop: 6,
};

const block: React.CSSProperties = { marginTop: 14 };

function isWeekend(d: Date) {
  const day = d.getDay(); // 0 Sun, 6 Sat
  return day === 0 || day === 6;
}

function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseISODate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(`${s}T00:00:00`);
  return Number.isFinite(d.getTime()) ? d : null;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function prevBusinessDay(d: Date) {
  let x = new Date(d);
  x = addDays(x, -1);
  while (isWeekend(x)) x = addDays(x, -1);
  return x;
}

function adjustToBusinessDay(d: Date) {
  // weekend-only adjustment (does not account for market holidays)
  let x = new Date(d);
  while (isWeekend(x)) x = addDays(x, -1);
  return x;
}

export default function ExDividendDateCalculator() {
  const [recordDateStr, setRecordDateStr] = useState<string>("");
  const [convention, setConvention] = useState<Convention>("US_T1_REGULAR");

  const out = useMemo(() => {
    const record = parseISODate(recordDateStr);
    if (!record) {
      return {
        ok: false,
        recordISO: "",
        exISO: "",
        lastBuyISO: "",
        notes: [] as string[],
      };
    }

    // Record date should typically be a business day; we do a weekend-only adjustment for display.
    const recordAdj = adjustToBusinessDay(record);

    let exDate: Date;

    /**
     * Rules (simplified):
     * - US T+1 regular-way processing: ex-date is generally set as the record date (same business day).
     * - Legacy T+2-style convention: ex-date often one business day before record date.
     * Notes: Exchanges can set late/irregular ex-dates (e.g., due bills), and holidays aren’t handled here.
     */
    if (convention === "US_T1_REGULAR") {
      exDate = new Date(recordAdj);
    } else {
      exDate = prevBusinessDay(recordAdj);
    }

    // For most common stock dividends: buy before ex-date to receive the dividend.
    // So “last day to buy” ≈ business day before ex-date.
    const lastBuy = prevBusinessDay(exDate);

    const notes: string[] = [];
    if (isWeekend(record)) {
      notes.push(
        "Record date you entered falls on a weekend. This tool adjusted it to the prior weekday (weekend-only adjustment)."
      );
    }
    notes.push(
      "This calculator uses weekend-only business day logic (no market holiday calendar)."
    );
    notes.push(
      "Some events can have special ex-date rules (e.g., due bills / large distributions). Always confirm with your exchange/broker."
    );

    return {
      ok: true,
      recordISO: toISODate(recordAdj),
      exISO: toISODate(exDate),
      lastBuyISO: toISODate(lastBuy),
      notes,
    };
  }, [recordDateStr, convention]);

  return (
    <div className="tool-container">
      <h1>Ex-Dividend Date Calculator</h1>

      <p className="muted" style={{ marginTop: 8 }}>
        Estimate the <strong>ex-dividend date</strong> from a dividend{" "}
        <strong>record date</strong> using common conventions (US T+1 regular-way
        or legacy T+2-style). You’ll also see an estimated{" "}
        <strong>last day to buy</strong> (cum-dividend) to receive the dividend.
      </p>

      {/* Inputs */}
      <div style={{ marginTop: 10 }}>
        <div style={block}>
          <label>
            Record Date (YYYY-MM-DD)
            <input
              style={inputStyle}
              type="date"
              value={recordDateStr}
              onChange={(e) => setRecordDateStr(e.target.value)}
            />
          </label>
          <div className="muted">
            The record date is the date the company checks its shareholder
            records for dividend eligibility.
          </div>
        </div>

        <div style={block}>
          <label>
            Convention
            <select
              style={inputStyle}
              value={convention}
              onChange={(e) => setConvention(e.target.value as Convention)}
            >
              <option value="US_T1_REGULAR">
                US T+1 (Regular-way): Ex-date ≈ Record date
              </option>
              <option value="LEGACY_T2_STYLE">
                Legacy T+2-style: Ex-date ≈ 1 business day before record date
              </option>
            </select>
          </label>
          <div className="muted">
            Under US T+1 regular-way processing, ex-date is typically set on the
            record date (same business day). Special cases can differ.
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 18 }}>
        <h2 style={{ margin: 0 }}>Results</h2>

        {!out.ok ? (
          <p className="muted" style={{ marginTop: 10 }}>
            Enter a record date to calculate.
          </p>
        ) : (
          <div style={{ marginTop: 10 }}>
            <p>
              Adjusted Record Date (estimate): <strong>{out.recordISO}</strong>
            </p>
            <p>
              Ex-Dividend Date (estimate): <strong>{out.exISO}</strong>
            </p>
            <p>
              Last Day to Buy to Receive Dividend (estimate):{" "}
              <strong>{out.lastBuyISO}</strong>
            </p>

            <hr style={{ margin: "12px 0" }} />

            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {out.notes.map((note) => (
                <li key={note} className="muted" style={{ marginTop: 6 }}>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* SEO: How-to + FAQ */}
      <div style={{ marginTop: 22 }}>
        <h2>How to use</h2>
        <ol>
          <li>Enter the dividend record date.</li>
          <li>
            Select the convention that matches your market context (US T+1 or
            legacy T+2-style).
          </li>
          <li>Review the estimated ex-dividend date.</li>
          <li>
            Use “last day to buy” as a planning estimate and confirm with your
            broker/exchange.
          </li>
        </ol>

        <h2 style={{ marginTop: 18 }}>FAQ</h2>

        <h3 style={{ marginBottom: 6 }}>What is the ex-dividend date?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          It’s the first day a stock trades without the right to receive the
          most recently announced dividend. If you buy on or after the ex-date,
          you typically do not receive that dividend.
        </p>

        <h3 style={{ marginBottom: 6 }}>
          Why can ex-date equal record date?
        </h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Under US T+1 regular-way processing, ex-date is commonly set on the
          record date (same business day) for standard dividends. Special cases
          can differ.
        </p>

        <h3 style={{ marginBottom: 6 }}>
          Does this tool account for holidays and special cases?
        </h3>
        <p className="muted" style={{ marginTop: 0 }}>
          No. This uses weekend-only business day logic and doesn’t model market
          holidays or special “due bill” cases. Treat results as an estimate and
          verify with official sources.
        </p>
      </div>
    </div>
  );
}
