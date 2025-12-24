"use client";
import { useMemo, useState } from "react";

const n = (v: string) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const pct01 = (v: string) => Math.min(Math.max(n(v) / 100, 0), 1);
const money = (x: number) =>
  Number.isFinite(x) ? x.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-";

type Mode = "percent" | "newPremium";
type Frequency = "monthly" | "annual";
type HorizonUnit = "months" | "years";

export default function InsurancePremiumIncreaseImpactCalculator() {
  const [currentPremium, setCurrentPremium] = useState("200");
  const [frequency, setFrequency] = useState<Frequency>("monthly");

  const [mode, setMode] = useState<Mode>("percent");
  const [increasePct, setIncreasePct] = useState("15");
  const [newPremium, setNewPremium] = useState("230");

  const [horizonValue, setHorizonValue] = useState("12");
  const [horizonUnit, setHorizonUnit] = useState<HorizonUnit>("months");

  const result = useMemo(() => {
    const cur = n(currentPremium);
    const hv = Math.max(0, Math.floor(n(horizonValue)));

    const periods =
      horizonUnit === "months"
        ? hv
        : hv * 12; // years -> months

    const curMonthly = frequency === "monthly" ? cur : cur / 12;

    let nextMonthly = curMonthly;

    if (mode === "percent") {
      const p = pct01(increasePct);
      nextMonthly = curMonthly * (1 + p);
    } else {
      const np = n(newPremium);
      nextMonthly = frequency === "monthly" ? np : np / 12;
    }

    const monthlyDiff = nextMonthly - curMonthly;
    const extraTotal = monthlyDiff * periods;

    const currentTotal = curMonthly * periods;
    const newTotal = nextMonthly * periods;

    return {
      periods,
      curMonthly,
      nextMonthly,
      monthlyDiff,
      currentTotal,
      newTotal,
      extraTotal,
    };
  }, [currentPremium, frequency, mode, increasePct, newPremium, horizonValue, horizonUnit]);

  const labelPeriods =
    horizonUnit === "months"
      ? `${result.periods} month${result.periods === 1 ? "" : "s"}`
      : `${Math.floor(n(horizonValue))} year${Math.floor(n(horizonValue)) === 1 ? "" : "s"} (${result.periods} months)`;

  return (
    <div>
      <p style={{ marginBottom: 12, color: "#555" }}>
        Estimate how much extra you’ll pay after an insurance premium increase over a selected time horizon.
      </p>

      <h3>Current Premium</h3>
      <label>Current Premium Amount ($)</label>
      <input
        type="number"
        value={currentPremium}
        onChange={(e) => setCurrentPremium(e.target.value)}
        placeholder="200"
        style={{ width: "100%", marginBottom: 8 }}
      />

      <label>Payment Frequency</label>
      <select
        value={frequency}
        onChange={(e) => setFrequency(e.target.value as Frequency)}
        style={{ width: "100%", marginBottom: 14 }}
      >
        <option value="monthly">Monthly</option>
        <option value="annual">Annual</option>
      </select>

      <h3>Increase Input</h3>
      <label>How do you want to enter the increase?</label>
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as Mode)}
        style={{ width: "100%", marginBottom: 10 }}
      >
        <option value="percent">Increase by percentage</option>
        <option value="newPremium">Enter new premium amount</option>
      </select>

      {mode === "percent" ? (
        <>
          <label>Increase (%)</label>
          <input
            type="number"
            value={increasePct}
            onChange={(e) => setIncreasePct(e.target.value)}
            placeholder="15"
            style={{ width: "100%", marginBottom: 14 }}
          />
        </>
      ) : (
        <>
          <label>New Premium Amount ($)</label>
          <input
            type="number"
            value={newPremium}
            onChange={(e) => setNewPremium(e.target.value)}
            placeholder="230"
            style={{ width: "100%", marginBottom: 14 }}
          />
        </>
      )}

      <h3>Time Horizon</h3>
      <label>Horizon</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="number"
          value={horizonValue}
          onChange={(e) => setHorizonValue(e.target.value)}
          placeholder="12"
          style={{ width: "50%" }}
        />
        <select
          value={horizonUnit}
          onChange={(e) => setHorizonUnit(e.target.value as HorizonUnit)}
          style={{ width: "50%" }}
        >
          <option value="months">Months</option>
          <option value="years">Years</option>
        </select>
      </div>

      <div style={{ marginTop: 8 }}>
        <h3>Results</h3>

        <div style={{ color: "#555", fontSize: 14, lineHeight: 1.75 }}>
          <div>
            • Horizon: <strong>{labelPeriods}</strong>
          </div>
          <div>• Current monthly equivalent: ${money(result.curMonthly)}</div>
          <div>• New monthly equivalent: ${money(result.nextMonthly)}</div>
          <div>
            • Extra per month: <strong>${money(result.monthlyDiff)}</strong>
          </div>
          <div>
            • Extra paid over horizon: <strong>${money(result.extraTotal)}</strong>
          </div>
          <div>• Total (current) over horizon: ${money(result.currentTotal)}</div>
          <div>• Total (new) over horizon: ${money(result.newTotal)}</div>
        </div>

        <p style={{ marginTop: 12, color: "#777", fontSize: 13, lineHeight: 1.6 }}>
          Tip: If your insurer quotes an annual premium, choose “Annual” frequency to compare accurately.
        </p>
      </div>
    </div>
  );
}
