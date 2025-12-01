// app/[category]/page.tsx
import Link from "next/link";
import { categories, tools, ToolCategory } from "../../data/tools";
import { notFound } from "next/navigation";

interface Props {
  params: { category: ToolCategory };
}

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.id }));
}

export function generateMetadata({ params }: Props) {
  const category = categories.find((c) => c.id === params.category);
  if (!category) return {};

  return {
    title: `${category.name} | ToolPhi`,
    description: category.description,
  };
}

export default function CategoryPage({ params }: Props) {
  const category = categories.find((c) => c.id === params.category);
  if (!category) return notFound();

  const categoryTools = tools.filter((t) => t.category === category.id);

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>{category.name}</h1>
      <p style={{ color: "#666", marginBottom: 16 }}>{category.description}</p>

      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {categoryTools.map((tool) => (
          <li key={tool.slug} style={{ marginBottom: 10 }}>
            <Link href={`/${category.id}/${tool.slug}`} style={{ color: "#0366d6", fontSize: 16 }}>
              {tool.title}
            </Link>
            <p style={{ color: "#777", fontSize: 14, margin: "2px 0 0" }}>{tool.description}</p>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: 24 }}>
        <Link href="/" style={{ color: "#0366d6" }}>
          ← Back to ToolPhi Home
        </Link>
      </p>
    </main>
  );
}
