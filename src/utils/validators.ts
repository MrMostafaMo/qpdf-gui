export function isValidPageRange(input: string): boolean {
  if (!input.trim()) return false
  const parts = input.split(",").map((s) => s.trim())
  for (const part of parts) {
    if (/^[1-9]\d*$/.test(part)) continue
    if (/^[1-9]\d*\s*-\s*[1-9]\d*$/.test(part)) continue
    return false
  }
  return true
}

export function isValidPdfPath(path: string): boolean {
  return path.toLowerCase().endsWith(".pdf")
}

export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0
}
