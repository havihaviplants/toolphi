// app/finance/store-profit/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Store Profit Calculator | ToolPhi",
  description: "매출, 원가, 고정비를 기반으로 자영업 순이익과 수익률을 계산합니다.",
};

export default function StoreProfitPage() {
  return (
    <main style={{ maxWidth: 800, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>Store Profit Calculator</h1>
      <p style={{ color: "#666", marginBottom: 16 }}>
        여기에는 나중에 실제 계산기 폼과 로직이 들어갑니다. 지금은 라우팅 테스트용 플레이스홀더입니다.
      </p>

      <div
        style={{
          padding: 20,
          border: "1px solid #ddd",
          borderRadius: 8,
          marginBottom: 24,
          background: "#fafafa",
        }}
      >
        <p style={{ color: "#999" }}>수익 계산 로직은 이후 단계에서 구현합니다.</p>
      </div>

      <p style={{ marginTop: 24 }}>
        <Link href="/finance" style={{ color: "#0366d6" }}>
          ← Back to Finance Tools
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
