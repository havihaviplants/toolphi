"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

function money(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function FarmWorkingCapitalCalculator() {
  // Current assets
  const [cash, setCash] = useState<number>(40000);
  const [accountsReceivable, setAccountsReceivable] = useState<number>(25000);
  const [inventory, setInventory] = useState<number>(90000);
  const [prepaidsOther, setPrepaidsOther] = useState<number>(25000);

  // Current liabilities
  const [operatingLoan, setOperatingLoan] = useState<number>(65000);
  const [accountsPayable, setAccountsPayable] = useState<number>(28000);
  const [creditCardsShortTerm, setCreditCardsShortTerm] = useState<number>(7000);
  const [taxesDueOther, setTaxesDueOther] = useState<number>(20000);

  // Optional normalization (to make it more “decision” useful)
  const [acresFarmed, setAcresFarmed] = useState<number>(800);
  const [livestockHeadcount, setLivestockHeadcount] = useState<number>(0);

  const r = useMemo(() => {
    const currentAssets =
      Math.max(0, n(cash)) +
      Math.max(0, n(accountsReceivable)) +
      Math.max(0, n(inventory)) +
      Math.max(0, n(prepaidsOther));

    const currentLiabilities =
      Math.max(0, n(operatingLoan)) +
      Math.max(0, n(accountsPayable)) +
      Math.max(0, n(creditCardsShortTerm)) +
      Math.max(0, n(taxesDueOther));

    const workingCapital = currentAssets - currentLiabilities;

    const currentRatio =
      currentLiabilities > 0 ? currentAssets / currentLiabilities : Number.POSITIVE_INFINITY;

    const wcPerAcre =
      acresFarmed > 0 ? workingCapital / acresFarmed : 0;

    const wcPerHead =
      livestockHeadcount > 0 ? workingCapital / livestockHeadcount : 0;

    // Simple “runway” estimate: how many months working capital could cover
    // if you provide an estimate of monthly operating expenses
    return {
      currentAssets,
      currentLiabilities,
      workingCapital,
      currentRatio,
      wcPerAcre,
      wcPerHead,
    };
  }, [
    cash,
    accountsReceivable,
    inventory,
    prepaidsOther,
    operatingLoan,
    accountsPayable,
    creditCardsShortTerm,
    taxesDueOther,
    acresFarmed,
    livestockHeadcount,
  ]);

  const wcColor =
    r.workingCapital > 0 ? "text-green-600" : r.workingCapital < 0 ? "text-red-600" : "text-slate-700";

  const ratioLabel =
    r.currentRatio === Number.POSITIVE_INFINITY ? "∞" : r.currentRatio.toFixed(2);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Working capital measures short-term financial health:{" "}
        <strong>current assets − current liabilities</strong>. This tool also shows{" "}
        <strong>current ratio</strong> and optional per-acre/per-head metrics for farm comparisons.
      </p>

      {/* Current assets */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Current assets</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Cash ($)</label>
            <input className="input" type="number" min={0} step="1" value={cash} onChange={(e) => setCash(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Checking, savings, cash on hand.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Accounts receivable ($)</label>
            <input className="input" type="number" min={0} step="1" value={accountsReceivable} onChange={(e) => setAccountsReceivable(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Unpaid invoices, receivables.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Inventory ($)</label>
            <input className="input" type="number" min={0} step="1" value={inventory} onChange={(e) => setInventory(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Stored crops, feed, inputs, supplies.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Prepaids & other current assets ($)</label>
            <input className="input" type="number" min={0} step="1" value={prepaidsOther} onChange={(e) => setPrepaidsOther(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Prepaid expenses, short-term deposits.</p>
          </div>
        </div>
      </div>

      {/* Current liabilities */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Current liabilities</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Operating loan / line of credit ($)</label>
            <input className="input" type="number" min={0} step="1" value={operatingLoan} onChange={(e) => setOperatingLoan(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Short-term operating note, revolving credit.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Accounts payable ($)</label>
            <input className="input" type="number" min={0} step="1" value={accountsPayable} onChange={(e) => setAccountsPayable(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Bills due to suppliers and vendors.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Short-term debt / credit cards ($)</label>
            <input className="input" type="number" min={0} step="1" value={creditCardsShortTerm} onChange={(e) => setCreditCardsShortTerm(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Short-term notes, credit card balances.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Taxes due & other current liabilities ($)</label>
            <input className="input" type="number" min={0} step="1" value={taxesDueOther} onChange={(e) => setTaxesDueOther(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Taxes payable, accrued expenses.</p>
          </div>
        </div>
      </div>

      {/* Optional normalization */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Optional comparison metrics</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Acres farmed</label>
            <input className="input" type="number" min={0} step="1" value={acresFarmed} onChange={(e) => setAcresFarmed(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Used to compute working capital per acre.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Livestock headcount</label>
            <input className="input" type="number" min={0} step="1" value={livestockHeadcount} onChange={(e) => setLivestockHeadcount(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Used to compute working capital per head (optional).</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-sm opacity-70">Current assets</p>
            <p className="font-semibold">${money(r.currentAssets)}</p>
          </div>
          <div>
            <p className="text-sm opacity-70">Current liabilities</p>
            <p className="font-semibold">${money(r.currentLiabilities)}</p>
          </div>
        </div>

        <div className="pt-3 border-t space-y-1">
          <p className="text-sm opacity-70">Working capital</p>
          <p className={`text-xl font-bold ${wcColor}`}>${money(r.workingCapital)}</p>

          <p className="text-sm opacity-70">
            Current ratio (assets ÷ liabilities):{" "}
            <span className="font-semibold">{ratioLabel}</span>
          </p>

          {acresFarmed > 0 && (
            <p className="text-sm opacity-70">
              Working capital per acre:{" "}
              <span className="font-semibold">${money(r.wcPerAcre)}</span>
            </p>
          )}

          {livestockHeadcount > 0 && (
            <p className="text-sm opacity-70">
              Working capital per head:{" "}
              <span className="font-semibold">${money(r.wcPerHead)}</span>
            </p>
          )}

          <p className="text-sm opacity-80">
            Rule of thumb: higher working capital generally improves resilience during volatile seasons.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Working capital = current assets − current liabilities</li>
          <li>Current ratio = current assets ÷ current liabilities</li>
          <li>Per-unit metrics help compare farms of different sizes</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">What counts as “current”?</span><br />
            Items expected to convert to cash (or be paid) within ~12 months are typically current.
          </p>
          <p>
            <span className="font-medium">Is a higher current ratio always better?</span><br />
            Not always—very high ratios can mean idle cash or excess inventory, but low ratios can signal risk.
          </p>
        </div>
      </div>
    </div>
  );
}
