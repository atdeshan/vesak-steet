/**
 * Returns the URL for a lantern video file.
 *
 * If `NEXT_PUBLIC_VIDEO_BASE_URL` is set (production), videos load from
 * that base — typically a Cloudflare R2 / Bunny / S3 bucket.
 * If not set (local dev), videos load from `/public/lanterns/`.
 */
export function getVideoUrl(filename: string): string {
  const base = process.env.NEXT_PUBLIC_VIDEO_BASE_URL?.replace(/\/$/, '') ?? '';
  if (!base) return `/lanterns/${filename}`;
  return `${base}/${filename}`;
}
