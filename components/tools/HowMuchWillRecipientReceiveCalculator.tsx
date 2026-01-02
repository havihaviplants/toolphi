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

export default function HowMuchWillRecipientReceiveCalculator() {
  const [sendAmount, setSendAmount] = useState<number>(1000);
  const [fee, setFee] = useState<number>(30);
  const [exchangeRate, setExchangeRate] = useState<number>(0.9);

  const { netAfterFee, recipientAmount } = useMemo(() => {
    const net = Math.max(n(sendAmount) - Math.max(n(fee), 0), 0);
    const received = net * Math.max(n(exchangeRate), 0);
    return { netAfterFee: net, recipientAmount: received };
  }, [sendAmount, fee, exchangeRate]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">How Much Will the Recipient Receive?</h1>
        <p className="text-muted-foreground">
          Estimate the recipient&apos;s final amount after transfer fees and currency conversion.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount you send</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            value={sendAmount}
            onChange={(e) => setSendAmount(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Your starting amount (in the sending currency).</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Transfer fee</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Flat fee charged by the provider (same currency as sent).</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Exchange rate</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="0.0001"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Rate used to convert to the recipient currency.</p>
        </div>
      </div>

      <div className="rounded-xl border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Net amount after fee</div>
          <div className="text-lg font-semibold">{fmt(netAfterFee)}</div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Recipient receives</div>
          <div className="text-2xl font-bold">{fmt(recipientAmount)}</div>
        </div>

        <p className="text-xs text-muted-foreground">
          This estimate excludes intermediary bank fees (if any). Provider pricing and FX rates vary by method and
          destination.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">How it works</h2>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>Subtract the provider&apos;s transfer fee from the amount you send.</li>
          <li>Convert the remaining amount using the exchange rate.</li>
          <li>The result is the estimated amount the recipient receives.</li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">FAQ</h2>
        <div className="space-y-2 text-sm">
          <div>
            <div className="font-medium">Does this include intermediary bank fees?</div>
            <div className="text-muted-foreground">
              Not usually. Intermediary fees depend on banks and routing. If you expect them, add a buffer to the fee.
            </div>
          </div>
          <div>
            <div className="font-medium">Is the exchange rate the same as mid-market?</div>
            <div className="text-muted-foreground">
              Often no. Many providers apply a spread or markup. Use the rate your provider shows at checkout.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
