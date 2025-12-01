// app/[category]/[slug]/page.tsx
import Link from "next/link";
import { categories, tools, ToolCategory } from "../../../data/tools";
import { notFound } from "next/navigation";

interface Props {
  params: { category: ToolCategory; slug: string };
}

export function generateStaticParams() {
  return tools.map((tool) => ({
    category: tool.category,
    slug: tool.slug,
  }));
}

export function generateMetadata({ params }: Props) {
  const tool = tools.find((t) => t.category === params.category && t.slug === params.slug);
  if (!tool) return {};

  const category = categories.find((c) => c.id === tool.category);

  return {
    title: `${tool.title} | ${category?.name ?? "ToolPhi"}`,
    description: tool.description,
  };
}

export default function ToolPage({ params }: Props) {
  const tool = tools.find((t) => t.category === params.category && t.slug === params.slug);
  const category = categories.find((c) => c.id === params.category);

  if (!tool || !category) return notFound();

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>{tool.title}</h1>
      <p style={{ color: "#666", marginBottom: 16 }}>{tool.description}</p>

      <div
        style={{
          padding: 20,
          border: "1px solid #ddd",
          borderRadius: 8,
          marginBottom: 24,
          background: "#fafafa",
        }}
      >
        <p style={{ color: "#999" }}>
          이 페이지는 툴 본문이 들어갈 자리입니다. 나중에 실제 계산기 UI/로직을 여기에 구현하면 됩니다.
        </p>
      </div>

      <p style={{ marginTop: 24 }}>
        <Link href={`/${category.id}`} style={{ color: "#0366d6" }}>
          ← Back to {category.name}
        </Link>
      </p>
      <p>
        <Link href="/" style={{ color: "#0366d6" }}>
          ← Back to ToolPhi Home
        </Link>
      </p>
    </main>
  );
}
