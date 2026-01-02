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

type OptionResult = {
  netAfterFees: number; // net in send currency after all fees
  recipientAmount: number; // netAfterFees * rate
  totalFees: number; // total fees in send currency
};

function computeOption(sendAmount: number, fee: number, extraFees: number, rate: number): OptionResult {
  const s = Math.max(n(sendAmount), 0);
  const f = Math.max(n(fee), 0);
  const ef = Math.max(n(extraFees), 0);
  const r = Math.max(n(rate), 0);

  const totalFees = Math.min(f + ef, s);
  const netAfterFees = Math.max(s - totalFees, 0);
  const recipientAmount = netAfterFees * r;

  return { netAfterFees, recipientAmount, totalFees };
}

export default function WireTransferVsOnlineTransferCalculator() {
  const [sendAmount, setSendAmount] = useState<number>(1000);

  // Wire option
  const [wireFee, setWireFee] = useState<number>(35);
  const [wireExtraFees, setWireExtraFees] = useState<number>(10); // intermediary/receiving/etc.
  const [wireRate, setWireRate] = useState<number>(0.88);

  // Online option
  const [onlineFee, setOnlineFee] = useState<number>(12);
  const [onlineExtraFees, setOnlineExtraFees] = useState<number>(0); // usually none, but keep flexible
  const [onlineRate, setOnlineRate] = useState<number>(0.9);

  const { wire, online, winner } = useMemo(() => {
    const wireRes = computeOption(sendAmount, wireFee, wireExtraFees, wireRate);
    const onlineRes = computeOption(sendAmount, onlineFee, onlineExtraFees, onlineRate);

    // Decide winner by recipient amount (primary), then by total fees (secondary)
    let win: "wire" | "online" | "tie" = "tie";
    const diff = wireRes.recipientAmount - onlineRes.recipientAmount;

    if (Math.abs(diff) < 0.0001) {
      const feeDiff = wireRes.totalFees - onlineRes.totalFees;
      if (Math.abs(feeDiff) < 0.0001) win = "tie";
      else win = feeDiff < 0 ? "wire" : "online";
    } else {
      win = diff > 0 ? "wire" : "online";
    }

    return { wire: wireRes, online: onlineRes, winner: win };
  }, [sendAmount, wireFee, wireExtraFees, wireRate, onlineFee, onlineExtraFees, onlineRate]);

  const winnerLabel =
    winner === "tie" ? "Tie" : winner === "wire" ? "Wire transfer" : "Online transfer";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Wire Transfer vs Online Transfer</h1>
        <p className="text-muted-foreground">
          Compare total fees and recipient amount across a bank wire transfer vs an online money transfer service.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Amount you send</label>
        <input
          className="w-full max-w-sm rounded-md border px-3 py-2"
          type="number"
          min={0}
          value={sendAmount}
          onChange={(e) => setSendAmount(Number(e.target.value))}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Wire */}
        <div className="rounded-xl border p-5 space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Wire transfer</h2>
            <p className="text-xs text-muted-foreground">
              Often includes bank fees and possible intermediary/receiving fees.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Wire fee</label>
              <input
                className="w-full rounded-md border px-3 py-2"
                type="number"
                min={0}
                value={wireFee}
                onChange={(e) => setWireFee(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Extra wire fees (optional)</label>
              <input
                className="w-full rounded-md border px-3 py-2"
                type="number"
                min={0}
                value={wireExtraFees}
                onChange={(e) => setWireExtraFees(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Intermediary bank fees, receiving bank fees, lifting fees, etc. (estimate).
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Exchange rate (wire)</label>
              <input
                className="w-full rounded-md border px-3 py-2"
                type="number"
                min={0}
                step="0.0001"
                value={wireRate}
                onChange={(e) => setWireRate(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="rounded-lg border px-4 py-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total fees</span>
              <span className="font-semibold">{fmt(wire.totalFees)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Net after fees</span>
              <span className="font-semibold">{fmt(wire.netAfterFees)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Recipient receives</span>
              <span className="text-2xl font-bold">{fmt(wire.recipientAmount)}</span>
            </div>
          </div>
        </div>

        {/* Online */}
        <div className="rounded-xl border p-5 space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Online transfer</h2>
            <p className="text-xs text-muted-foreground">
              Usually lower fees, but exchange rate markup can vary by provider.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Online fee</label>
              <input
                className="w-full rounded-md border px-3 py-2"
                type="number"
                min={0}
                value={onlineFee}
                onChange={(e) => setOnlineFee(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Extra online fees (optional)</label>
              <input
                className="w-full rounded-md border px-3 py-2"
                type="number"
                min={0}
                value={onlineExtraFees}
                onChange={(e) => setOnlineExtraFees(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                If the provider has additional receiving fees or card processing fees.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Exchange rate (online)</label>
              <input
                className="w-full rounded-md border px-3 py-2"
                type="number"
                min={0}
                step="0.0001"
                value={onlineRate}
                onChange={(e) => setOnlineRate(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="rounded-lg border px-4 py-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total fees</span>
              <span className="font-semibold">{fmt(online.totalFees)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Net after fees</span>
              <span className="font-semibold">{fmt(online.netAfterFees)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Recipient receives</span>
              <span className="text-2xl font-bold">{fmt(online.recipientAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-5 space-y-2">
        <div className="text-sm text-muted-foreground">Best option (by recipient amount)</div>
        <div className="text-2xl font-bold">{winnerLabel}</div>
        <p className="text-xs text-muted-foreground">
          Tip: If recipient amount is close, consider speed, reliability, tracking, and refund policy.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">How it works</h2>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>We subtract each option&apos;s total fees from the send amount.</li>
          <li>We convert the net amount using the exchange rate for each option.</li>
          <li>We compare recipient amounts to recommend the better option.</li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">FAQ</h2>
        <div className="space-y-2 text-sm">
          <div>
            <div className="font-medium">Why do wires sometimes cost more?</div>
            <div className="text-muted-foreground">
              Banks may charge sending fees, receiving fees, and intermediary routing fees.
            </div>
          </div>
          <div>
            <div className="font-medium">Which exchange rate should I use?</div>
            <div className="text-muted-foreground">
              Use the rate shown by the provider at checkout. Some providers embed markup in the rate.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
