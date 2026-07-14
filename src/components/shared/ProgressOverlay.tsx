interface ProgressOverlayProps {
  loading: boolean
  message?: string
}

export function ProgressOverlay({
  loading,
  message = "Processing...",
}: ProgressOverlayProps) {
  if (!loading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
