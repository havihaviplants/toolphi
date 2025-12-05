// app/[category]/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { categories } from "../../../data/categories";
import { tools } from "../../../data/tools";
import { getToolComponent } from "../../../components/tools/toolComponentMap";

type ToolPageParams = {
  category: string;
  slug: string;
};

type ToolPageProps = {
  params: Promise<ToolPageParams>;
};

type Tool = (typeof tools)[number];

export function generateStaticParams() {
  return tools.map((tool) => ({
    category: tool.category,
    slug: tool.slug,
  }));
}

// ✅ JSON-LD payload builder (Schema.org)
function buildToolJsonLd(tool: Tool, categoryName: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolphi.com";
  const url = `${baseUrl}/${tool.category}/${tool.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    description: tool.description,
    applicationCategory: `${categoryName} tool`,
    url,
    keywords: tool.keywords.join(", "),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

// ✅ Next 16: 동적 라우트별 SEO 메타 생성
export async function generateMetadata(
  props: ToolPageProps
): Promise<Metadata> {
  const { category, slug } = await props.params;

  const categoryObj = categories.find((c) => c.id === category);
  const tool = tools.find(
    (t) => t.category === category && t.slug === slug
  );

  if (!categoryObj || !tool) {
    return {};
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolphi.com";
  const url = `${baseUrl}/${tool.category}/${tool.slug}`;

  const title = `${tool.title} | ${categoryObj.name} tools | ToolPhi`;
  const description = tool.description;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  // ✅ Next 16: params는 Promise라 반드시 await
  const { category, slug } = await params;

  const categoryObj = categories.find((c) => c.id === category);
  const tool = tools.find(
    (t) => t.category === category && t.slug === slug
  );

  if (!categoryObj || !tool) {
    return notFound();
  }

  // 🔑 slug 기반으로 컴포넌트 가져오기
  const ToolComponent = getToolComponent(tool.slug);
  const jsonLd = buildToolJsonLd(tool, categoryObj.name);

  // ✅ 같은 카테고리의 연관 툴(자기 자신 제외)
  const relatedTools = tools
    .filter(
      (t) => t.category === tool.category && t.slug !== tool.slug
    )
    .slice(0, 4);

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: "0 16px 40px",
      }}
    >
      {/* ✅ JSON-LD 스키마 (검색엔진용 구조화 데이터) */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header style={{ marginBottom: 24 }}>
        <p
          style={{
            fontSize: 14,
            color: "#777",
            marginBottom: 4,
          }}
        >
          {categoryObj.name}
        </p>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          {tool.title}
        </h1>
        <p style={{ color: "#555" }}>{tool.description}</p>
      </header>

      <section
        style={{
          border: "1px solid #eee",
          borderRadius: 8,
          padding: 16,
          background: "#fff",
          minHeight: 200,
        }}
      >
        {ToolComponent ? (
          <ToolComponent />
        ) : (
          <p style={{ color: "#777" }}>
            This is where the tool UI for <strong>{tool.title}</strong> will
            live.
          </p>
        )}
      </section>

      {/* store-profit 전용 How to / Example 섹션 */}
      {tool.slug === "store-profit" && (
        <>
          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>
              How to use this profit calculator
            </h2>
            <ol
              style={{
                paddingLeft: 20,
                fontSize: 14,
                color: "#555",
                lineHeight: 1.6,
              }}
            >
              <li>Enter your monthly total store revenue.</li>
              <li>
                Set your average COGS rate (%). For example, 60 means 60% of
                revenue goes to product cost.
              </li>
              <li>
                Fill in fixed costs like rent, payroll, and other recurring
                expenses.
              </li>
              <li>
                Click <strong>Calculate profit</strong> to see gross profit,
                net profit, margin, and break-even revenue.
              </li>
            </ol>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>Example</h2>
            <p
              style={{
                fontSize: 14,
                color: "#555",
                lineHeight: 1.6,
              }}
            >
              Suppose your store makes <strong>$30,000</strong> per month in
              revenue, your COGS rate is <strong>60%</strong>, rent is
              <strong>$5,000</strong>, payroll is <strong>$8,000</strong>,
              and other fixed costs are <strong>$2,000</strong>. This tool
              will show you:
            </p>
            <ul
              style={{
                paddingLeft: 20,
                fontSize: 14,
                color: "#555",
                lineHeight: 1.6,
              }}
            >
              <li>Gross profit after COGS</li>
              <li>Net profit after all fixed costs</li>
              <li>Net profit margin (%)</li>
              <li>Monthly break-even revenue level</li>
            </ul>
          </section>
        </>
      )}

      {/* breakeven-units 전용 How to / Example */}
      {tool.slug === "breakeven-units" && (
        <>
          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>
              How to use this break-even units calculator
            </h2>
            <ol
              style={{
                paddingLeft: 20,
                fontSize: 14,
                color: "#555",
                lineHeight: 1.6,
              }}
            >
              <li>
                Enter your total fixed costs (rent, salaries, insurance,
                etc.).
              </li>
              <li>
                Enter the selling price per unit of your product or service.
              </li>
              <li>
                Enter the variable cost per unit (materials, packaging,
                shipping, etc.).
              </li>
              <li>
                Click <strong>Calculate</strong> to see how many units you
                need to sell to cover all your fixed and variable costs.
              </li>
            </ol>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>Example</h2>
            <p
              style={{
                fontSize: 14,
                color: "#555",
                lineHeight: 1.6,
              }}
            >
              Imagine your monthly fixed costs are{" "}
              <strong>$10,000</strong>, you sell each unit for{" "}
              <strong>$50</strong>, and your variable cost per unit is{" "}
              <strong>$20</strong>. This calculator will show you:
            </p>
            <ul
              style={{
                paddingLeft: 20,
                fontSize: 14,
                color: "#555",
                lineHeight: 1.6,
              }}
            >
              <li>The exact number of units you must sell to break even</li>
              <li>
                How changes in price or variable cost affect your break-even
                point
              </li>
              <li>
                Whether your current sales target is above or below
                break-even
              </li>
            </ul>
          </section>
        </>
      )}

      {/* roi-calculator 전용 How to / Example */}
      {tool.slug === "roi-calculator" && (
        <>
          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>
              How to use this ROI calculator
            </h2>
            <ol
              style={{
                paddingLeft: 20,
                fontSize: 14,
                color: "#555",
                lineHeight: 1.6,
              }}
            >
              <li>
                Enter your initial investment amount (how much money you put
                in).
              </li>
              <li>
                Enter the final value (how much the investment is worth now,
                or how much revenue/profit it generated).
              </li>
              <li>
                Click <strong>Calculate ROI</strong> to see your return as a
                percentage.
              </li>
              <li>
                Use the percentage to compare different projects, campaigns,
                or investments.
              </li>
            </ol>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>Example</h2>
            <p
              style={{
                fontSize: 14,
                color: "#555",
                lineHeight: 1.6,
              }}
            >
              Suppose you spent <strong>$5,000</strong> on an online marketing
              campaign, and that campaign generated <strong>$8,500</strong> in
              additional profit. This calculator will show you:
            </p>
            <ul
              style={{
                paddingLeft: 20,
                fontSize: 14,
                color: "#555",
                lineHeight: 1.6,
              }}
            >
              <li>Your ROI percentage for this campaign</li>
              <li>
                How this ROI compares to other investments or campaigns
              </li>
              <li>
                Whether it makes sense to scale, repeat, or stop this type of
                investment
              </li>
            </ul>
          </section>
        </>
      )}

      {/* ✅ 연관 툴 섹션 */}
      {relatedTools.length > 0 && (
        <section
          style={{
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid #eee",
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            More tools in {categoryObj.name}
          </h2>
          <ul
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {relatedTools.map((t) => (
              <li
                key={t.slug}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 8,
                  padding: 12,
                  background: "#fafafa",
                }}
              >
                <Link
                  href={`/${t.category}/${t.slug}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {t.title}
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#555",
                    }}
                  >
                    {t.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div
        style={{
          marginTop: 32,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <p>
          <Link href={`/${categoryObj.id}`} style={{ color: "#0366d6" }}>
            ← Back to {categoryObj.name}
          </Link>
        </p>
        <p>
          <Link href="/" style={{ color: "#0366d6" }}>
            ← Back to ToolPhi Home
          </Link>
        </p>
      </div>
    </main>
  );
}
