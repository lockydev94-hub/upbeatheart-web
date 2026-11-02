/**
 * Cloudinary URL utilities
 *
 * Injects Cloudinary's built-in transformation parameters into an existing
 * upload URL so we always serve a pre-resized, optimised image rather than
 * the raw full-resolution file.
 *
 * Works by inserting a transformation string between
 *   /upload/          and
 *   v<version>/...
 * which is exactly how Cloudinary expects chained transformations.
 *
 * Input:  https://res.cloudinary.com/boc8bvoc/image/upload/v123/folder/id.png
 * Output: https://res.cloudinary.com/boc8bvoc/image/upload/w_400,c_fit,f_auto,q_auto/v123/folder/id.png
 */
export function cloudinaryResize(
  url: string | undefined | null,
  width: number,
  height?: number,
  /** 'fill' crops to exact dimensions (good for covers); 'fit' preserves aspect ratio */
  mode: 'fill' | 'fit' = 'fit',
): string {
  if (!url || !url.includes('res.cloudinary.com')) return url || ''

  const crop = mode === 'fill' ? 'c_fill,g_auto' : 'c_fit'
  const transform = height
    ? `w_${width},h_${height},${crop},f_auto,q_auto`
    : `w_${width},${crop},f_auto,q_auto`

  // Insert transform after /upload/
  return url.replace('/upload/', `/upload/${transform}/`)
}

/**
 * Cloudinary face-aware portrait crop.
 * Uses g_face gravity so Cloudinary detects and centres the face automatically.
 * Perfect for doctor/team photos that are portrait orientation.
 *
 * @param url     - Raw Cloudinary upload URL
 * @param width   - Output width in px
 * @param height  - Output height in px (use portrait ratio, e.g. 3:4)
 * @param zoom    - Face zoom factor (default 0.75 = face + shoulders visible)
 */
export function cloudinaryPortrait(
  url: string | undefined | null,
  width: number,
  height: number,
  zoom = 0.75,
): string {
  if (!url || !url.includes('res.cloudinary.com')) return url || ''
  const transform = `w_${width},h_${height},c_fill,g_face,z_${zoom},f_auto,q_auto`
  return url.replace('/upload/', `/upload/${transform}/`)
}

/** Pre-sized variants for specific use cases */
export const cld = {
  /** Navbar logo: max 320px wide */
  logo:        (url?: string | null) => cloudinaryResize(url, 320),
  /** Favicon / small icon: 64×64 */
  favicon:     (url?: string | null) => cloudinaryResize(url, 64, 64),
  /**
   * Doctor / review avatar for a round badge.
   * Sources are 3:4 portraits (admin crops doctor photos to 600×800), so a
   * plain square fit returns a non-filling image and CSS then centre-crops,
   * which can slice the head off. g_face keeps the face in frame.
   */
  avatarSm:    (url?: string | null) => cloudinaryPortrait(url, 88, 88, 0.7),
  /** Round avatar rendered at ~56px (blog / campaign author strip) */
  avatarMd:    (url?: string | null) => cloudinaryPortrait(url, 128, 128, 0.7),
  /** Doctor avatar large (about page): 400×400 */
  avatarLg:    (url?: string | null) => cloudinaryPortrait(url, 400, 400, 0.7),
  /** OG image: 1200×630 */
  og:          (url?: string | null) => cloudinaryResize(url, 1200, 630),
  /** Blog / campaign cover: 800px wide */
  cover:       (url?: string | null) => cloudinaryResize(url, 800),
  /** Thumbnail: 400×300 */
  thumb:       (url?: string | null) => cloudinaryResize(url, 400, 300),
  /** Gallery photo: 600px wide */
  gallery:     (url?: string | null) => cloudinaryResize(url, 600),
  /** Doctor hero portrait (4:5 ratio, face-aware): renders at 112-128px wide × 140-168px tall */
  doctorHero:  (url?: string | null) => cloudinaryPortrait(url, 256, 320, 0.65),
  /** Doctor avatar large about page (face-aware): 400×530px */
  doctorAbout: (url?: string | null) => cloudinaryPortrait(url, 400, 530, 0.72),
}
