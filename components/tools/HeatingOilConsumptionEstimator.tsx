"use client";

import { useMemo, useState } from "react";

function toNumberOrZero(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

type Insulation = "poor" | "average" | "good";
type Climate = "mild" | "average" | "cold";

const INSULATION_FACTOR: Record<Insulation, number> = {
  poor: 1.25,
  average: 1.0,
  good: 0.8,
};

const CLIMATE_FACTOR: Record<Climate, number> = {
  mild: 0.75,
  average: 1.0,
  cold: 1.25,
};

export default function HeatingOilConsumptionEstimator() {
  const [homeSqft, setHomeSqft] = useState<number>(2000);
  const [insulation, setInsulation] = useState<Insulation>("average");
  const [climate, setClimate] = useState<Climate>("average");
  const [heatingDays, setHeatingDays] = useState<number>(150);

  // Heuristic baseline:
  // For an "average" home, "average" insulation, "average" climate:
  // gallons/day ≈ (sqft / 1000) * BASE_GPD_PER_1000
  // This is intentionally conservative and explained as an estimate.
  const [baseGallonsPerDayPer1000Sqft, setBaseGallonsPerDayPer1000Sqft] =
    useState<number>(1.0);

  const r = useMemo(() => {
    const sqft = clamp(toNumberOrZero(homeSqft), 100, 20000);
    const days = clamp(Math.round(toNumberOrZero(heatingDays)), 1, 365);

    const base = clamp(toNumberOrZero(baseGallonsPerDayPer1000Sqft), 0.1, 5);

    const insF = INSULATION_FACTOR[insulation];
    const cliF = CLIMATE_FACTOR[climate];

    const gallonsPerDay = (sqft / 1000) * base * insF * cliF;
    const seasonGallons = gallonsPerDay * days;

    const seasonMonthsApprox = days / 30;
    const monthlyAvg =
      seasonMonthsApprox > 0 ? seasonGallons / seasonMonthsApprox : 0;

    const invalid = sqft <= 0 || days <= 0 || base <= 0;

    return {
      sqft,
      days,
      base,
      insF,
      cliF,
      gallonsPerDay,
      seasonGallons,
      seasonMonthsApprox,
      monthlyAvg,
      invalid,
    };
  }, [homeSqft, heatingDays, baseGallonsPerDayPer1000Sqft, insulation, climate]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate heating oil usage for a winter season using a simple model based on home size,
        insulation/efficiency, climate severity, and heating days. This is a planning estimate — your
        actual usage can vary by thermostat settings, heat loss, and weather.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Home size (square feet)</label>
            <input
              className="input mt-1"
              type="number"
              min={100}
              step="10"
              value={homeSqft}
              onChange={(e) => setHomeSqft(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Use conditioned (heated) square footage if possible.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Heating season length (days)</label>
            <input
              className="input mt-1"
              type="number"
              min={1}
              max={365}
              step="1"
              value={heatingDays}
              onChange={(e) => setHeatingDays(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Typical range: 120–200 days depending on location.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Insulation / efficiency</label>
            <select
              className="input mt-1"
              value={insulation}
              onChange={(e) => setInsulation(e.target.value as Insulation)}
            >
              <option value="poor">Poor (older / leaky) — higher usage</option>
              <option value="average">Average</option>
              <option value="good">Good (efficient / insulated) — lower usage</option>
            </select>
            <p className="text-xs opacity-70 mt-1">
              This adjusts consumption up/down relative to an average home.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Climate severity</label>
            <select
              className="input mt-1"
              value={climate}
              onChange={(e) => setClimate(e.target.value as Climate)}
            >
              <option value="mild">Mild winter</option>
              <option value="average">Average winter</option>
              <option value="cold">Cold winter</option>
            </select>
            <p className="text-xs opacity-70 mt-1">
              Colder climates generally require more heating energy per day.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">
            Baseline gallons/day per 1,000 sq ft (advanced)
          </label>
          <input
            className="input mt-1"
            type="number"
            min={0.1}
            step="0.1"
            value={baseGallonsPerDayPer1000Sqft}
            onChange={(e) => setBaseGallonsPerDayPer1000Sqft(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Default is 1.0. If you have past winter data, you can calibrate this to match your
            real-world usage.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        {r.invalid ? (
          <p className="text-sm opacity-80">
            Enter valid inputs to estimate seasonal heating oil consumption.
          </p>
        ) : (
          <>
            <p className="text-sm opacity-80">
              Estimated gallons/day:{" "}
              <span className="font-semibold">{r.gallonsPerDay.toFixed(2)}</span> gal/day
            </p>

            <p className="font-extrabold text-lg">
              Estimated season usage: {r.seasonGallons.toFixed(0)} gallons
            </p>

            <p className="text-sm opacity-80">
              Approx season length: {r.seasonMonthsApprox.toFixed(1)} months →{" "}
              {r.monthlyAvg.toFixed(0)} gallons/month (average)
            </p>

            <div className="pt-2">
              <p className="text-xs opacity-70">
                Factors applied: insulation ×{r.insF.toFixed(2)}, climate ×{r.cliF.toFixed(2)}.
                This is a planning estimate — real usage varies with weather, thermostat settings,
                and heating system efficiency.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
