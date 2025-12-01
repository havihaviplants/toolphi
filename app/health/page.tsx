// app/health/page.tsx
import Link from "next/link";
import { tools } from "../../data/tools";

export const metadata = {
  title: "Health Tools | ToolPhi",
  description: "BMI 등 건강 관련 계산기 툴 모음.",
};

export default function HealthPage() {
  const healthTools = tools.filter((t) => t.category === "health");

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Health Tools</h1>
      <p style={{ color: "#666", marginBottom: 16 }}>건강·체형 관련 툴을 모았습니다.</p>

      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {healthTools.map((tool) => (
          <li key={tool.slug} style={{ marginBottom: 10 }}>
            <Link href={`/health/${tool.slug}`} style={{ color: "#0366d6", fontSize: 16 }}>
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
