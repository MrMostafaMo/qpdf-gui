import { useLoadingStore } from "@/stores"

export function ProgressBar() {
  const loading = useLoadingStore((s) => s.loading)

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, height: "3px" }}>
      <div
        style={{
          height: "100%",
          background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)",
          backgroundSize: "200% 100%",
          opacity: loading ? 1 : 0,
          transition: "opacity 200ms ease",
          animation: loading ? "progress-shimmer 1.5s linear infinite" : "none",
        }}
      />
    </div>
  )
}
