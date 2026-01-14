"use client";

import { useMemo, useState } from "react";

type ShockMode = "percent" | "absolute";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}
function clampMin(v: number, min: number) {
  return Math.max(min, n(v));
}
function money0(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function money2(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function x2(v: number) {
  if (!Number.isFinite(v)) return "—";
  return `${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`;
}
function pct2(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return `${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

export default function CostShockCovenantHeadroomCalculator() {
  const [netDebt, setNetDebt] = useState<number>(6_000_000);
  const [ebitda, setEbitda] = useState<number>(2_000_000);

  const [shockMode, setShockMode] = useState<ShockMode>("percent");
  const [ebitdaDropPct, setEbitdaDropPct] = useState<number>(20);
  const [ebitdaDropAbs, setEbitdaDropAbs] = useState<number>(400_000);

  const [covenantLimit, setCovenantLimit] = useState<number>(3.5);

  const r = useMemo(() => {
    const d = clampMin(netDebt, 0);
    const e0 = clampMin(ebitda, 0);
    const limit = clampMin(covenantLimit, 0);

    const dropPct = n(ebitdaDropPct) / 100;
    const dropAbs = clampMin(ebitdaDropAbs, 0);

    const e1 =
      shockMode === "percent"
        ? Math.max(0, e0 * (1 - dropPct))
        : Math.max(0, e0 - dropAbs);

    const lev0 = e0 > 0 ? d / e0 : Infinity;
    const lev1 = e1 > 0 ? d / e1 : Infinity;

    const headroom0 = limit - lev0;
    const headroom1 = limit - lev1;

    const breach0 = lev0 >= limit;
    const breach1 = lev1 >= limit;

    let risk = "Healthy headroom";
    if (!Number.isFinite(lev1) || e1 <= 0) risk = "Critical: EBITDA is zero/near zero (ratio undefined).";
    else if (breach1) risk = "Breach risk: leverage exceeds covenant limit.";
    else if (headroom1 < 0.25) risk = "Tight: less than 0.25x headroom.";
    else if (headroom1 < 0.5) risk = "Watch: less than 0.50x headroom.";

    let note =
      "This tool models a common leverage covenant: Net Debt / EBITDA must stay below a limit. A cost shock can reduce EBITDA, increasing leverage.";
    if (e0 <= 0) note = "Enter baseline EBITDA to compute leverage.";
    if (limit <= 0) note = "Enter a covenant limit (e.g., 3.50x).";

    return {
      e1,
      lev0,
      lev1,
      headroom0,
      headroom1,
      breach0,
      breach1,
      risk,
      note,
    };
  }, [netDebt, ebitda, shockMode, ebitdaDropPct, ebitdaDropAbs, covenantLimit]);

  const signedX2 = (v: number) => {
    if (!Number.isFinite(v)) return "—";
    return v >= 0 ? `+${x2(v)}` : `-${x2(Math.abs(v))}`;
  };

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate whether a <strong>cost shock</strong> could trigger a <strong>loan covenant breach</strong>{" "}
        by reducing EBITDA and worsening <strong>Net Debt / EBITDA</strong>.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Inputs</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Net debt ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="10000"
              value={netDebt}
              onChange={(e) => setNetDebt(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Total debt minus cash (approx).</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Baseline EBITDA ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="10000"
              value={ebitda}
              onChange={(e) => setEbitda(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Used as the covenant denominator.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Covenant limit (Net Debt / EBITDA)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.05"
              value={covenantLimit}
              onChange={(e) => setCovenantLimit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Example: 3.50 means must be ≤ 3.50x.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Shock assumptions</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Shock mode</label>
            <select
              className="input"
              value={shockMode}
              onChange={(e) => setShockMode(e.target.value as ShockMode)}
            >
              <option value="percent">EBITDA % decrease</option>
              <option value="absolute">EBITDA $ decrease</option>
            </select>
            <p className="text-xs opacity-70 mt-1">Pick % if you’re modeling margin compression.</p>
          </div>

          {shockMode === "percent" ? (
            <div>
              <label className="block text-sm font-medium">EBITDA decrease (%)</label>
              <input
                className="input"
                type="number"
                step="0.5"
                value={ebitdaDropPct}
                onChange={(e) => setEbitdaDropPct(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">
                Example: {pct2(20)} means EBITDA drops by 20%.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium">EBITDA decrease ($)</label>
              <input
                className="input"
                type="number"
                min={0}
                step="10000"
                value={ebitdaDropAbs}
                onChange={(e) => setEbitdaDropAbs(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">Absolute drop in EBITDA.</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">EBITDA</p>
            <p className="text-sm">
              Before: <strong>${money0(ebitda)}</strong>
              <br />
              After: <strong>${money0(r.e1)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Leverage (Net Debt / EBITDA)</p>
            <p className="text-sm">
              Before: <strong>{x2(r.lev0)}</strong>
              <br />
              After: <strong>{x2(r.lev1)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1 sm:col-span-2">
            <p className="text-sm opacity-70">Headroom vs covenant limit</p>
            <p className="text-sm">
              Limit: <strong>{x2(covenantLimit)}</strong>
              <br />
              Headroom before: <strong>{signedX2(r.headroom0)}</strong>
              <br />
              Headroom after: <strong>{signedX2(r.headroom1)}</strong>
            </p>
            <p className="text-xs opacity-70 mt-1">
              Headroom = limit − actual. Negative means breach.
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1 sm:col-span-2">
            <p className="text-sm opacity-70">Risk flag</p>
            <p className="text-sm">
              <strong>{r.risk}</strong>
            </p>
          </div>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Leverage ratio = Net Debt ÷ EBITDA.</li>
          <li>Cost shock reduces EBITDA → ratio increases.</li>
          <li>Headroom = covenant limit − actual ratio.</li>
          <li>If actual ≥ limit, the covenant is breached (in this simplified model).</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Is “Net Debt / EBITDA” always the covenant?</span>
            <br />
            No—some loans use Total Debt / EBITDA, Fixed Charge Coverage, or other tests. This tool targets the most common leverage covenant.
          </p>
          <p>
            <span className="font-medium">What if net debt changes too?</span>
            <br />
            This tool holds net debt constant. If you expect borrowing to increase, raise net debt accordingly and re-run.
          </p>
        </div>
      </div>
    </div>
  );
}
