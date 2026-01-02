"use client";

import { useMemo, useState } from "react";

function n(value: number) {
  if (!Number.isFinite(value)) return 0;
  return value;
}

function fmt(value: number, decimals = 2) {
  const v = n(value);
  return v.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function pct(value: number, decimals = 2) {
  return `${fmt(value * 100, decimals)}%`;
}

/**
 * Model (simple + SERP-friendly):
 * - Intended send amount S
 * - Original fee F0
 * - Expected exchange rate R_expected (send -> receive currency)
 * - Mistake extra fees in send currency F_extra (cancel/reverse/return/resend fees)
 * - Resend rate R_resend (optional; if not, default to expected)
 *
 * We estimate:
 * - Expected receive = (S - F0) * R_expected
 * - Actual receive after mistake = (S - F0 - F_extra) * R_resend
 * - Mistake cost (receive currency) = Expected receive - Actual receive
 *
 * This captures "extra fees + worse rate" in one number.
 */
export default function MoneyTransferMistakeCostCalculator() {
  const [sendAmount, setSendAmount] = useState<number>(1000);
  const [originalFee, setOriginalFee] = useState<number>(12);

  const [expectedRate, setExpectedRate] = useState<number>(0.9);
  const [extraMistakeFees, setExtraMistakeFees] = useState<number>(25);

  const [resendRateEnabled, setResendRateEnabled] = useState<boolean>(true);
  const [resendRate, setResendRate] = useState<number>(0.88);

  const result = useMemo(() => {
    const S = Math.max(n(sendAmount), 0);
    const F0 = Math.max(n(originalFee), 0);
    const Rex = Math.max(n(expectedRate), 0);
    const Fextra = Math.max(n(extraMistakeFees), 0);

    const Rresend = resendRateEnabled ? Math.max(n(resendRate), 0) : Rex;

    const baseNet = Math.max(S - F0, 0);
    const expectedReceive = baseNet * Rex;

    const actualNet = Math.max(S - F0 - Fextra, 0);
    const actualReceive = actualNet * Rresend;

    const mistakeCost = Math.max(expectedReceive - actualReceive, 0);
    const mistakeCostPct = expectedReceive > 0 ? mistakeCost / expectedReceive : 0;

    // Decompose: fee-driven loss vs FX-driven loss (approx)
    const feeLossReceive = Math.min(Fextra, baseNet) * (Rresend > 0 ? Rresend : Rex);
    const fxLossReceive =
      actualNet > 0 ? Math.max(actualNet * Rex - actualNet * Rresend, 0) : 0;

    return {
      expectedReceive,
      actualReceive,
      mistakeCost,
      mistakeCostPct,
      feeLossReceive,
      fxLossReceive,
      usedResendRate: Rresend,
    };
  }, [sendAmount, originalFee, expectedRate, extraMistakeFees, resendRateEnabled, resendRate]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Money Transfer Mistake Cost Calculator</h1>
        <p className="text-muted-foreground">
          Estimate how much a transfer mistake can cost you when you must cancel, reverse, or resend—based on extra fees
          and exchange rate changes.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Intended send amount</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            value={sendAmount}
            onChange={(e) => setSendAmount(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">In sending currency (e.g., USD).</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Original transfer fee</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            value={originalFee}
            onChange={(e) => setOriginalFee(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Fee paid for the original attempt.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Expected exchange rate</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="0.0001"
            value={expectedRate}
            onChange={(e) => setExpectedRate(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Reference rate you expected to receive.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Extra mistake fees</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            value={extraMistakeFees}
            onChange={(e) => setExtraMistakeFees(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            Cancellation, reversal, return, resend, correction fees (estimate).
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Resend exchange rate</label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={resendRateEnabled}
                onChange={(e) => setResendRateEnabled(e.target.checked)}
              />
              Use a different rate when resending
            </label>
          </div>

          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="0.0001"
            value={resendRate}
            onChange={(e) => setResendRate(Number(e.target.value))}
            disabled={!resendRateEnabled}
          />
          <p className="text-xs text-muted-foreground">
            If unchecked, we assume the resend uses the expected rate.
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-xl border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Estimated mistake cost</div>
          <div className="text-2xl font-bold">{fmt(result.mistakeCost)}</div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Mistake cost (as % of expected receive)</div>
          <div className="text-lg font-semibold">{pct(result.mistakeCostPct)}</div>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          <div className="rounded-lg border px-4 py-3">
            <div className="text-xs text-muted-foreground">Expected receive</div>
            <div className="text-lg font-semibold">{fmt(result.expectedReceive)}</div>
          </div>
          <div className="rounded-lg border px-4 py-3">
            <div className="text-xs text-muted-foreground">Receive after mistake</div>
            <div className="text-lg font-semibold">{fmt(result.actualReceive)}</div>
          </div>
          <div className="rounded-lg border px-4 py-3">
            <div className="text-xs text-muted-foreground">Resend rate used</div>
            <div className="text-lg font-semibold">{fmt(result.usedResendRate, 4)}</div>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-lg border px-4 py-3">
            <div className="text-xs text-muted-foreground">Approx. loss from extra fees</div>
            <div className="text-lg font-semibold">{fmt(result.feeLossReceive)}</div>
          </div>
          <div className="rounded-lg border px-4 py-3">
            <div className="text-xs text-muted-foreground">Approx. loss from rate change</div>
            <div className="text-lg font-semibold">{fmt(result.fxLossReceive)}</div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          This is an estimate. Real outcomes vary by provider policy, refund timing, intermediary bank fees, and FX rate
          movement during the correction.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">How it works</h2>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>We estimate what the recipient would have received without the mistake.</li>
          <li>We subtract mistake-related fees and apply the resend exchange rate (if different).</li>
          <li>The difference is the estimated cost of the mistake (in recipient currency).</li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">FAQ</h2>
        <div className="space-y-2 text-sm">
          <div>
            <div className="font-medium">What counts as “mistake fees”?</div>
            <div className="text-muted-foreground">
              Anything you pay because you made an error: cancel/reverse fees, return fees, resend fees, or correction
              fees.
            </div>
          </div>
          <div>
            <div className="font-medium">Why can the exchange rate change matter?</div>
            <div className="text-muted-foreground">
              If you resend later, you may get a worse rate. Even small rate moves can create meaningful FX loss.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
