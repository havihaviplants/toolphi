// app/[category]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { categories } from "../../data/categories";
import { tools } from "../../data/tools";

type CategoryPageParams = {
  category: string;
};

type CategoryPageProps = {
  params: Promise<CategoryPageParams>;
};

// ✅ 정적 빌드를 위한 카테고리 파라미터
export function generateStaticParams() {
  return categories.map((category) => ({
    category: category.id,
  }));
}

// ✅ 카테고리별 메타데이터
export async function generateMetadata(
  props: CategoryPageProps
): Promise<Metadata> {
  const { category } = await props.params;

  const categoryObj = categories.find((c) => c.id === category);

  if (!categoryObj) {
    return {};
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolphi.com";
  const url = `${baseUrl}/${categoryObj.id}`;

  const title = `${categoryObj.name} tools | ToolPhi`;
  const description = categoryObj.description;

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

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { category } = await params;

  const categoryObj = categories.find((c) => c.id === category);

  if (!categoryObj) {
    return notFound();
  }

  const categoryTools = tools.filter(
    (tool) => tool.category === categoryObj.id
  );

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: "0 16px 40px",
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <p
          style={{
            fontSize: 14,
            color: "#777",
            marginBottom: 4,
          }}
        >
          Category
        </p>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          {categoryObj.name}
        </h1>
        {categoryObj.description && (
          <p style={{ color: "#555" }}>{categoryObj.description}</p>
        )}
      </header>

      {categoryTools.length === 0 ? (
        <p style={{ color: "#777", fontSize: 14 }}>
          No tools found in this category yet.
        </p>
      ) : (
        <section>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            Tools in {categoryObj.name}
          </h2>
          <ul
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {categoryTools.map((tool) => (
              <li
                key={tool.slug}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 8,
                  padding: 16,
                  background: "#fff",
                }}
              >
                <Link
                  href={`/${tool.category}/${tool.slug}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    {tool.title}
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#555",
                      marginBottom: 8,
                    }}
                  >
                    {tool.description}
                  </p>
                  <span
                    style={{
                      fontSize: 13,
                      color: "#0366d6",
                    }}
                  >
                    Open tool →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div
        style={{
          marginTop: 32,
        }}
      >
        <Link href="/" style={{ color: "#0366d6" }}>
          ← Back to ToolPhi Home
        </Link>
      </div>
    </main>
  );
}
