const SIZE_UNITS = ["B", "KB", "MB", "GB"]

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${SIZE_UNITS[i]}`
}

export function formatPageCount(count: number): string {
  return count === 1 ? "1 page" : `${count} pages`
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
