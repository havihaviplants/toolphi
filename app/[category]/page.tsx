// app/[category]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { categories } from "../../data/categories";
import { tools } from "../../data/tools";

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

export function generateStaticParams() {
  return categories.map((cat) => ({
    category: cat.id,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // ✅ Next 16: params는 Promise
  const { category } = await params;

  const categoryObj = categories.find((c) => c.id === category);

  if (!categoryObj) {
    return notFound();
  }

  const categoryTools = tools.filter((t) => t.category === categoryObj.id);

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: "0 16px 40px",
      }}
    >
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {categoryObj.name}
      </h1>
      <p style={{ color: "#555", marginBottom: 24 }}>
        {categoryObj.description}
      </p>

      {categoryTools.length === 0 ? (
        <p>No tools in this category yet.</p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gap: 16,
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
              <h2 style={{ fontSize: 20, marginBottom: 4 }}>
                <Link
                  href={`/${categoryObj.id}/${tool.slug}`}
                  style={{
                    textDecoration: "none",
                    color: "#111",
                  }}
                >
                  {tool.title}
                </Link>
              </h2>
              <p style={{ margin: 0, color: "#555" }}>{tool.description}</p>
            </li>
          ))}
        </ul>
      )}

      <p style={{ marginTop: 32 }}>
        <Link href="/" style={{ color: "#0366d6" }}>
          ← Back to ToolPhi Home
        </Link>
      </p>
    </main>
  );
}
