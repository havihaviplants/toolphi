// app/page.tsx
import Link from "next/link";
import { categories, tools } from "../data/tools";

export const metadata = {
  title: "ToolPhi — Online Tools & Calculators Hub",
  description:
    "ToolPhi offers niche online tools and calculators for finance, business, health, and more. Fast. Accurate. Free.",
};

export default function HomePage() {
  const toolsByCategory = categories.map((cat) => ({
    ...cat,
    tools: tools.filter((t) => t.category === cat.id).slice(0, 5),
  }));

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>ToolPhi</h1>
      <p style={{ color: "#666", marginBottom: 16 }}>Niche Online Tools & Calculators Hub</p>
      <p style={{ color: "#444", marginBottom: 32 }}>
        Finance · Business · Health 카테고리 기반 웹툴 허브입니다. 앞으로 매일 새로운 웹툴이 추가될 예정입니다.
      </p>

      {toolsByCategory.map((cat) => (
        <section key={cat.id} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, marginBottom: 4 }}>{cat.name}</h2>
          <p style={{ color: "#777", marginBottom: 8 }}>{cat.description}</p>
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {cat.tools.map((tool) => (
              <li key={tool.slug} style={{ marginBottom: 4 }}>
                <Link href={`/${cat.id}/${tool.slug}`} style={{ color: "#0366d6", textDecoration: "none" }}>
                  {tool.title}
                </Link>{" "}
                <span style={{ color: "#999", fontSize: 13 }}>(예정)</span>
              </li>
            ))}
          </ul>
          <Link href={`/${cat.id}`} style={{ color: "#0366d6", fontSize: 14 }}>
            {cat.name} 전체 보기 →
          </Link>
        </section>
      ))}
    </main>
  );
}
