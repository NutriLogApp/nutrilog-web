const shimmerStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, var(--bg-input) 25%, color-mix(in srgb, var(--bg-input) 60%, transparent) 50%, var(--bg-input) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  borderRadius: 12,
};

function Block({ w, h, style }: { w: string; h: number; style?: React.CSSProperties }) {
  return <div style={{ width: w, height: h, ...shimmerStyle, ...style }} />;
}

export default function HomePageSkeleton() {
  return (
    <div>
      {/* CalorieSummary skeleton */}
      <div
        style={{
          padding: "calc(16px + env(safe-area-inset-top, 0px)) 16px 12px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          <Block w="100px" h={28} />
        </div>
        <Block w="160px" h={44} />
        <Block w="120px" h={14} />
        <Block w="100%" h={4} style={{ borderRadius: 9999 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <Block w="60px" h={14} />
          <Block w="60px" h={14} />
          <Block w="60px" h={14} />
          <Block w="60px" h={14} />
        </div>
      </div>

      {/* QuickActions skeleton */}
      <div style={{ display: "flex", gap: 10, padding: "8px 16px" }}>
        <Block w="50%" h={44} />
        <Block w="50%" h={44} />
      </div>

      {/* EntryList skeleton */}
      <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: 12, borderRadius: 12, background: "var(--bg-input)" }}>
            <Block w="34px" h={14} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <Block w="70%" h={14} />
              <Block w="40%" h={10} />
            </div>
            <Block w="50px" h={14} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
