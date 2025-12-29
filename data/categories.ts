// data/categories.ts
export const categories = [
  {
    id: "finance",
    name: "Finance Tools",
    description: "Calculators for profit, margin, ROI, loans, and more.",
  }
  
] as const;

export type CategoryId = (typeof categories)[number]["id"];
