/**
 * Image optimization utilities
 * Compression, thumbnail generation, and lazy loading
 */

/**
 * Compress image before upload
 */
export async function compressImage(
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.8
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()

            img.onload = () => {
                const canvas = document.createElement('canvas')
                let { width, height } = img

                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width
                        width = maxWidth
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height
                        height = maxHeight
                    }
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Canvas context not available'))
                    return
                }

                ctx.drawImage(img, 0, 0, width, height)

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob)
                        } else {
                            reject(new Error('Compression failed'))
                        }
                    },
                    file.type,
                    quality
                )
            }

            img.onerror = () => reject(new Error('Image load failed'))
            img.src = e.target?.result as string
        }

        reader.onerror = () => reject(new Error('File read failed'))
        reader.readAsDataURL(file)
    })
}

/**
 * Generate thumbnail from image
 */
export async function generateThumbnail(
    file: File,
    size: number = 200
): Promise<Blob> {
    return compressImage(file, size, size, 0.7)
}

/**
 * Get image dimensions
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()

            img.onload = () => {
                resolve({ width: img.width, height: img.height })
            }

            img.onerror = () => reject(new Error('Image load failed'))
            img.src = e.target?.result as string
        }

        reader.onerror = () => reject(new Error('File read failed'))
        reader.readAsDataURL(file)
    })
}

/**
 * Convert image to WebP format
 */
export async function convertToWebP(file: File, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()

            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Canvas context not available'))
                    return
                }

                ctx.drawImage(img, 0, 0)

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob)
                        } else {
                            reject(new Error('WebP conversion failed'))
                        }
                    },
                    'image/webp',
                    quality
                )
            }

            img.onerror = () => reject(new Error('Image load failed'))
            img.src = e.target?.result as string
        }

        reader.onerror = () => reject(new Error('File read failed'))
        reader.readAsDataURL(file)
    })
}

/**
 * Check if image exceeds size limit
 */
export function isImageTooLarge(file: File, maxSizeInMB: number = 10): boolean {
    const maxBytes = maxSizeInMB * 1024 * 1024
    return file.size > maxBytes
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
