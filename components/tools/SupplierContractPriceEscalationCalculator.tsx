"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}
function clampMin(v: number, min: number) {
  return Math.max(min, n(v));
}
function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n(v)));
}
function money2(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function pct2(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return `${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

type Row = {
  year: number;
  appliedEscalationPct: number;
  price: number;
};

export default function SupplierContractPriceEscalationCalculator() {
  const [startingPrice, setStartingPrice] = useState<number>(100);

  const [annualEscalationPct, setAnnualEscalationPct] = useState<number>(6);

  const [useCapFloor, setUseCapFloor] = useState<boolean>(true);
  const [capPct, setCapPct] = useState<number>(4);
  const [floorPct, setFloorPct] = useState<number>(1);

  const [years, setYears] = useState<number>(3);

  const r = useMemo(() => {
    const p0 = clampMin(startingPrice, 0);
    const rawEsc = n(annualEscalationPct);

    const y = clamp(Math.floor(n(years)), 1, 20);

    const cap = n(capPct);
    const floor = n(floorPct);

    const rows: Row[] = [];
    let price = p0;

    for (let i = 1; i <= y; i++) {
      let applied = rawEsc;

      if (useCapFloor) {
        applied = Math.min(Math.max(applied, floor), cap);
      }

      const factor = 1 + applied / 100;
      price = price * factor;

      rows.push({
        year: i,
        appliedEscalationPct: applied,
        price,
      });
    }

    const finalPrice = rows[rows.length - 1]?.price ?? p0;
    const totalIncreasePct = p0 > 0 ? ((finalPrice - p0) / p0) * 100 : 0;

    let note =
      "This assumes escalation is applied once per year and compounds.";
    if (!useCapFloor) note = "No cap/floor applied. Escalation uses the raw rate each year.";
    if (useCapFloor && floor > cap) note = "Warning: floor is greater than cap. Results may be unintuitive.";

    return { rows, finalPrice, totalIncreasePct, y, note };
  }, [startingPrice, annualEscalationPct, useCapFloor, capPct, floorPct, years]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Model a supplier contract <strong>price escalation clause</strong> with an optional{" "}
        <strong>cap</strong> and <strong>floor</strong>.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Contract inputs</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Starting unit price ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={startingPrice}
              onChange={(e) => setStartingPrice(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Contract price at Year 0.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Annual escalation rate (%)</label>
            <input
              className="input"
              type="number"
              step="0.25"
              value={annualEscalationPct}
              onChange={(e) => setAnnualEscalationPct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Often tied to CPI/PPI or commodity index change.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Contract length (years)</label>
            <input
              className="input"
              type="number"
              min={1}
              max={20}
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Up to 20 years for this calculator.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold">Cap & floor (optional)</div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useCapFloor}
              onChange={(e) => setUseCapFloor(e.target.checked)}
            />
            Apply cap/floor
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Cap (%)</label>
            <input
              className="input"
              type="number"
              step="0.25"
              value={capPct}
              onChange={(e) => setCapPct(Number(e.target.value))}
              disabled={!useCapFloor}
            />
            <p className="text-xs opacity-70 mt-1">Maximum escalation applied each year.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Floor (%)</label>
            <input
              className="input"
              type="number"
              step="0.25"
              value={floorPct}
              onChange={(e) => setFloorPct(Number(e.target.value))}
              disabled={!useCapFloor}
            />
            <p className="text-xs opacity-70 mt-1">Minimum escalation applied each year.</p>
          </div>
        </div>

        {useCapFloor && floorPct > capPct ? (
          <p className="text-sm">
            <strong>Note:</strong> Floor is greater than cap. Consider swapping values.
          </p>
        ) : null}
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Price schedule</div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="py-2 pr-3">Year</th>
                <th className="py-2 pr-3">Applied escalation</th>
                <th className="py-2 pr-3">Unit price</th>
              </tr>
            </thead>
            <tbody>
              {r.rows.map((row) => (
                <tr key={row.year} className="border-b">
                  <td className="py-2 pr-3">{row.year}</td>
                  <td className="py-2 pr-3">{pct2(row.appliedEscalationPct)}</td>
                  <td className="py-2 pr-3">${money2(row.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-md border p-3 space-y-1">
          <p className="text-sm opacity-70">Summary</p>
          <p className="text-sm">
            Final price (Year {r.y}): <strong>${money2(r.finalPrice)}</strong>
            <br />
            Total increase vs start: <strong>{pct2(r.totalIncreasePct)}</strong>
          </p>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Each year, an escalation rate is applied and compounded on the prior year’s price.</li>
          <li>If enabled, the escalation rate is clipped to the cap/floor range.</li>
          <li>This is a simplified annual model for quick contract planning.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Is escalation usually compounded?</span>
            <br />
            Often yes, because the new price becomes the base for the next adjustment.
          </p>
          <p>
            <span className="font-medium">What if escalation happens monthly or quarterly?</span>
            <br />
            This tool uses annual steps. For monthly/quarterly escalation, you’d need a higher-frequency schedule.
          </p>
        </div>
      </div>
    </div>
  );
}
