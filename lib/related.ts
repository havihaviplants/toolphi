// lib/related.ts
import { tools } from "../data/tools";

type Tool = (typeof tools)[number];

// 너무 흔해서 “연결 오염” 일으키는 태그들: 점수에서 제외
export const STOP_TAGS = new Set([
  "finance",
  "calculator",
  "calculation",
  "estimate",
  "estimator",
  "comparison",
  "compare",
  "cost",
  "fee",
  "impact",
  "rate",
]);

// 코어 태그 가중치(최소 버전) — 필요하면 점진적으로만 추가
export const CORE_TAG_WEIGHT: Record<string, number> = {
  "exchange-rate": 100,
  "currency-exchange": 95,
  "tax": 90,
  "income-tax": 92,
  "capital-gains-tax": 92,
  "take-home-pay": 95,
  "payroll": 88,
  "hourly-rate": 90,
  "salary": 85,
  "dividend": 88,
  "retirement": 86,
  "mortgage": 86,
  "loan": 84,
  "credit-card": 84,
  "insurance": 82,
};

export function normalizeTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function normalizeTags(tags?: string[]): string[] {
  if (!tags || tags.length === 0) return [];
  return tags.map(normalizeTag);
}

function pickCoreTag(tags: string[]): string | null {
  let best: { tag: string; w: number } | null = null;
  for (const t of tags) {
    const w = CORE_TAG_WEIGHT[t] ?? 0;
    if (!best || w > best.w) best = { tag: t, w };
  }
  // 딕셔너리에 아무것도 안 걸리면 core는 null로 두고, 하위 점수로만 판단
  return best && best.w > 0 ? best.tag : null;
}

function sharedTags(a: string[], b: string[]): string[] {
  const setA = new Set(a);
  return b.filter((t) => setA.has(t));
}

// v1 점수: 단순/안전
function scoreTools(base: Tool, other: Tool): number {
  const a = normalizeTags(base.tags);
  const b = normalizeTags(other.tags);

  // stop-tags 제거
  const aClean = a.filter((t) => !STOP_TAGS.has(t));
  const bClean = b.filter((t) => !STOP_TAGS.has(t));

  const shared = sharedTags(aClean, bClean);
  if (shared.length === 0) return 0;

  const coreA = pickCoreTag(aClean);
  const coreB = pickCoreTag(bClean);

  let score = 0;

  // Core 동일이면 강결합
  if (coreA && coreB && coreA === coreB) score += 100;

  // 공통 태그 수 기반 가중치 (modifier/context/unit 구분 없이 v1 단순화)
  // 대신 core가 같으면 이미 100이 들어가므로 자연스럽게 위로 올라감
  score += shared.length * 12; // (과결합 방지 위해 20보다 낮게)

  return score;
}

// page.tsx에서 바로 쓰게: related N개 반환
export function getRelatedTools(tool: Tool, limit = 4): Tool[] {
  return tools
    .filter((t) => t.category === tool.category && t.slug !== tool.slug)
    .map((t) => ({ t, s: scoreTools(tool, t) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ t }) => t);
}
