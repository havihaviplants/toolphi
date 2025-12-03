// data/categories.ts
export const categories = [
  {
    id: "finance",
    name: "Finance Tools",
    description: "Calculators for profit, margin, ROI, loans, and more.",
  },
  {
    id: "business",
    name: "Business Tools",
    description: "Tools for pricing, revenue, and business KPIs.",
  },
  {
    id: "health",
    name: "Health Tools",
    description: "Simple calculators for health and fitness metrics.",
  },
] as const;

export type CategoryId = (typeof categories)[number]["id"];
