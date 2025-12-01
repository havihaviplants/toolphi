// data/tools.ts
export type ToolCategory = 'finance' | 'business' | 'health';

export interface ToolItem {
  slug: string;
  title: string;
  description: string;
  category: ToolCategory;
}

export const tools: ToolItem[] = [
  // Finance
  {
    slug: 'store-profit',
    title: 'Store Profit Calculator',
    description: '매출, 원가, 고정비를 기반으로 자영업 순이익과 수익률을 계산합니다.',
    category: 'finance',
  },
  {
    slug: 'roi',
    title: 'ROI Calculator',
    description: '투자 금액과 수익을 바탕으로 투자수익률(ROI)을 계산합니다.',
    category: 'finance',
  },
  {
    slug: 'loan',
    title: 'Loan / LTV Calculator',
    description: '담보 가치와 대출 금액을 바탕으로 LTV를 계산합니다.',
    category: 'finance',
  },

  // Business
  {
    slug: 'markup',
    title: 'Markup Calculator',
    description: '원가 대비 판매가를 기준으로 마크업률을 계산합니다.',
    category: 'business',
  },
  {
    slug: 'margin',
    title: 'Margin Calculator',
    description: '판매가와 원가로 마진율을 계산합니다.',
    category: 'business',
  },

  // Health
  {
    slug: 'bmi',
    title: 'BMI Calculator',
    description: '키와 몸무게를 이용해 체질량지수(BMI)를 계산합니다.',
    category: 'health',
  },
];

export const categories: { id: ToolCategory; name: string; description: string }[] = [
  { id: 'finance', name: 'Finance Tools', description: '마진, 수익, 대출, 세금 등 재무 관련 툴.' },
  { id: 'business', name: 'Business Tools', description: '마크업, 마진 등 비즈니스 계산 툴.' },
  { id: 'health', name: 'Health Tools', description: 'BMI 등 건강 관련 계산 툴.' },
];
