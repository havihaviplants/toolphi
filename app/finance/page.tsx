// app/finance/page.tsx
import Link from "next/link";
import { tools } from "../../data/tools";

export const metadata = {
  title: "Finance Tools | ToolPhi",
  description: "마진, 수익, 대출, 세금 등 재무 관련 툴 모음.",
};

export default function FinancePage() {
  const financeTools = tools.filter((t) => t.category === "finance");

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Finance Tools</h1>
      <p style={{ color: "#666", marginBottom: 16 }}>마진, 수익, 대출, 세금 등 재무 관련 툴을 모았습니다.</p>

      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {financeTools.map((tool) => (
          <li key={tool.slug} style={{ marginBottom: 10 }}>
            <Link href={`/finance/${tool.slug}`} style={{ color: "#0366d6", fontSize: 16 }}>
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
