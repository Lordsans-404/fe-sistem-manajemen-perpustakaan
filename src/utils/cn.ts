/**
 * Safely combines class names into a single space-separated string.
 * Supports strings, arrays, and objects (with boolean flags).
 */
export function cn(
  ...classes: (string | undefined | null | boolean | Record<string, boolean>)[]
): string {
  const result: string[] = []

  for (const item of classes) {
    if (!item) continue

    if (typeof item === 'string') {
      result.push(item.trim())
    } else if (Array.isArray(item)) {
      result.push(cn(...item))
    } else if (typeof item === 'object') {
      for (const [key, value] of Object.entries(item)) {
        if (value) {
          result.push(key.trim())
        }
      }
    }
  }

  return result.filter(Boolean).join(' ')
}
