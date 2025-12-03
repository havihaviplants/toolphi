// data/tools.ts
import type { CategoryId } from "./categories";

export type ToolType = "calculator" | "converter" | "analyzer";

export interface Tool {
  slug: string;
  category: CategoryId;
  title: string;
  description: string;
  keywords: string[];
  type: ToolType;
}

export const tools: Tool[] = [
  {
    slug: "store-profit",
    category: "finance",
    title: "Store Profit Calculator",
    description: "Calculate net profit, margin and break-even point for your store.",
    keywords: ["store profit", "margin calculator", "net profit"],
    type: "calculator",
  },
  {
    slug: "breakeven-units",
    category: "finance",
    title: "Break-even Units Calculator",
    description:
      "Calculate the number of units you need to sell to cover your fixed and variable costs.",
    keywords: ["break even", "breakeven units", "fixed cost", "contribution margin"],
    type: "calculator",
  },
  {
    slug: "roi-calculator",
    category: "finance",
    title: "ROI Calculator",
    description:
      "Calculate return on investment (ROI) based on your initial investment and final value.",
    keywords: ["roi", "return on investment", "investment calculator"],
    type: "calculator",
  },
];
