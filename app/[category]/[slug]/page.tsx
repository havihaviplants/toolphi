// app/[category]/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { categories } from "../../../data/categories";
import { tools } from "../../../data/tools";
import { getToolComponent } from "../../../components/tools/toolComponentMap";
import { getRelatedTools } from "../../../lib/related";

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

  const relatedTools = getRelatedTools(tool, 4);


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

      {/* ✅ 공통 How-to 섹션 (meta.howToSteps 기반) */}
      {tool.howToSteps && tool.howToSteps.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>
            How to use this {tool.title.toLowerCase()}
          </h2>
          <ol
            style={{
              paddingLeft: 20,
              fontSize: 14,
              color: "#555",
              lineHeight: 1.6,
            }}
          >
            {tool.howToSteps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </section>
      )}

      {/* ✅ 공통 Example 섹션 (meta.example 기반) */}
      {tool.example && (
        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Example</h2>
          <p
            style={{
              fontSize: 14,
              color: "#555",
              lineHeight: 1.6,
            }}
          >
            {tool.example.description}
          </p>
          <ul
            style={{
              paddingLeft: 20,
              fontSize: 14,
              color: "#555",
              lineHeight: 1.6,
            }}
          >
            {tool.example.bullets.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>
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
