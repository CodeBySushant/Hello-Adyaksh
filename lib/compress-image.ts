/**
 * compressImage
 * Compresses an image File using the Canvas API before uploading.
 * Videos are returned as-is (no compression).
 *
 * @param file        - Original File object
 * @param maxWidth    - Max width in px (default 1920)
 * @param maxHeight   - Max height in px (default 1080)
 * @param quality     - JPEG quality 0-1 (default 0.82)
 * @param maxSizeMB   - Target max size in MB (default 1.5)
 * @returns           - Compressed File object
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.82,
  maxSizeMB = 1.5
): Promise<File> {
  // Skip compression for non-images
  if (!file.type.startsWith("image/")) return file

  // Skip GIFs — canvas strips animation
  if (file.type === "image/gif") return file

  // Already small enough — skip
  if (file.size <= maxSizeMB * 1024 * 1024) return file

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      // Calculate new dimensions keeping aspect ratio
      let { width, height } = img

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Canvas context unavailable"))
        return
      }

      // White background for transparent PNGs converted to JPEG
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      // Always output as JPEG for best compression
      // Keep PNG only if file is PNG and already small
      const outputType = file.type === "image/png" ? "image/png" : "image/jpeg"
      const ext = outputType === "image/png" ? "png" : "jpg"

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Compression failed"))
            return
          }

          // Build new filename with correct extension
          const baseName = file.name.replace(/\.[^.]+$/, "")
          const compressedFile = new File([blob], `${baseName}.${ext}`, {
            type: outputType,
            lastModified: Date.now(),
          })

          resolve(compressedFile)
        },
        outputType,
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image"))
    }

    img.src = url
  })
}

/**
 * formatBytes
 * Human-readable file size string.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * getCompressionSavings
 * Returns a human-readable string showing how much was saved.
 */
export function getCompressionSavings(original: File, compressed: File): string {
  const saved = original.size - compressed.size
  if (saved <= 0) return ""
  const pct = Math.round((saved / original.size) * 100)
  return `Compressed ${formatBytes(original.size)} → ${formatBytes(compressed.size)} (${pct}% smaller)`
}