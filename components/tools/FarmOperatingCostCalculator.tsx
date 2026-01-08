"use client";

import { useState } from "react";

export default function FarmOperatingCostCalculator() {
  const [labor, setLabor] = useState("");
  const [fuel, setFuel] = useState("");
  const [inputs, setInputs] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [overhead, setOverhead] = useState("");

  const parse = (v: string) => {
    const n = Number(v.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const format = (n: number) =>
    n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const laborN = parse(labor);
  const fuelN = parse(fuel);
  const inputsN = parse(inputs);
  const maintenanceN = parse(maintenance);
  const overheadN = parse(overhead);

  const total =
    laborN + fuelN + inputsN + maintenanceN + overheadN;

  const percent = (value: number) =>
    total > 0 ? ((value / total) * 100).toFixed(1) : "0";

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
        This farm operating cost calculator estimates the true annual cost of
        running a farm. Understanding operating expenses is essential for cash
        flow planning, loan decisions, and profitability analysis.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        <label>
          Labor costs (annual)
          <div style={helper}>Wages, salaries, contractors</div>
          <input
            value={labor}
            onChange={(e) => setLabor(e.target.value)}
            placeholder="e.g. 85000"
            style={input}
          />
        </label>

        <label>
          Fuel & energy costs
          <div style={helper}>Diesel, gasoline, electricity</div>
          <input
            value={fuel}
            onChange={(e) => setFuel(e.target.value)}
            placeholder="e.g. 32000"
            style={input}
          />
        </label>

        <label>
          Seed, fertilizer & inputs
          <div style={helper}>Crop inputs and consumables</div>
          <input
            value={inputs}
            onChange={(e) => setInputs(e.target.value)}
            placeholder="e.g. 74000"
            style={input}
          />
        </label>

        <label>
          Equipment maintenance & repairs
          <div style={helper}>Parts, servicing, downtime</div>
          <input
            value={maintenance}
            onChange={(e) => setMaintenance(e.target.value)}
            placeholder="e.g. 28000"
            style={input}
          />
        </label>

        <label>
          Overhead & insurance
          <div style={helper}>Rent, insurance, admin, utilities</div>
          <input
            value={overhead}
            onChange={(e) => setOverhead(e.target.value)}
            placeholder="e.g. 21000"
            style={input}
          />
        </label>
      </div>

      <div style={summary}>
        <p>
          <strong>Total annual operating cost:</strong>{" "}
          {format(total)}
        </p>
        {total > 0 && (
          <>
            <p>Labor: {percent(laborN)}%</p>
            <p>Fuel & energy: {percent(fuelN)}%</p>
            <p>Inputs: {percent(inputsN)}%</p>
            <p>Maintenance: {percent(maintenanceN)}%</p>
            <p>Overhead: {percent(overheadN)}%</p>
          </>
        )}
      </div>

      <h3 style={{ marginTop: 28 }}>Why operating cost matters</h3>
      <ul>
        <li>Determines true farm profitability</li>
        <li>Critical for loan and financing decisions</li>
        <li>Helps identify cost reduction opportunities</li>
        <li>Supports cash flow and break-even analysis</li>
      </ul>

      <h3>Notes & assumptions</h3>
      <ul>
        <li>Annual estimates only</li>
        <li>Does not include loan principal payments</li>
        <li>Actual costs vary by crop, region, and scale</li>
      </ul>

      <h3>Frequently asked questions</h3>
      <p>
        <strong>Is this the same as farm profit?</strong>
        <br />
        No. Operating cost measures expenses only. Profit depends on revenue
        minus operating and financing costs.
      </p>

      <p>
        <strong>Should I include land purchase costs?</strong>
        <br />
        No. Land and loan payments are typically analyzed separately.
      </p>
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  marginTop: 6,
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #ddd",
  fontSize: 14,
};

const helper: React.CSSProperties = {
  fontSize: 12,
  color: "#777",
};

const summary: React.CSSProperties = {
  marginTop: 20,
  padding: 14,
  borderRadius: 8,
  background: "#f6f9ff",
  border: "1px solid #d6e0ff",
  fontSize: 14,
};
