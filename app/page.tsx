// app/page.tsx
import Link from "next/link";
import { categories } from "../data/categories";
import { tools } from "../data/tools";

export const metadata = {
  title: "ToolPhi — Online Tools & Calculators Hub",
  description: "ToolPhi is a hub of niche online tools and calculators for business, finance, and more.",
};

export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: 960,
        margin: "40px auto",
        padding: "0 16px 40px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>ToolPhi</h1>
        <p style={{ color: "#555", maxWidth: 620 }}>
          A focused hub of niche tools and calculators. Start with one problem, 
          discover a chain of tools tailored for your workflow.
        </p>
      </header>

      {categories.map((cat) => {
        const catTools = tools.filter((t) => t.category === cat.id);
        return (
          <section key={cat.id} style={{ marginBottom: 32 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <h2 style={{ fontSize: 20 }}>{cat.name}</h2>
              <Link
                href={`/${cat.id}`}
                style={{ fontSize: 14, color: "#0366d6" }}
              >
                View all →
              </Link>
            </div>
            <p style={{ color: "#777", marginBottom: 8 }}>{cat.description}</p>

            <ul style={{ listStyle: "none", paddingLeft: 0 }}>
              {catTools.length === 0 && (
                <li style={{ fontSize: 14, color: "#aaa" }}>
                  Tools coming soon in this category.
                </li>
              )}
              {catTools.slice(0, 4).map((tool) => (
                <li key={tool.slug} style={{ marginBottom: 6 }}>
                  <Link
                    href={`/${cat.id}/${tool.slug}`}
                    style={{ fontSize: 14, color: "#0366d6" }}
                  >
                    {tool.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
