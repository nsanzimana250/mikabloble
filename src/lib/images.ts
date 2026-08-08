const STORAGE_PUBLIC_PATH = "/storage/v1/object/public/";

export function getOptimizedImageUrl(source: string, width: number, quality = 75): string {
  if (!source) return "/placeholder.svg";
  try {
    const url = new URL(source);
    if (!url.hostname.endsWith(".supabase.co") || !url.pathname.includes(STORAGE_PUBLIC_PATH)) return source;
    url.pathname = url.pathname.replace(STORAGE_PUBLIC_PATH, "/storage/v1/render/image/public/");
    url.searchParams.set("width", String(width));
    url.searchParams.set("quality", String(quality));
    url.searchParams.set("resize", "contain");
    return url.toString();
  } catch {
    return source;
  }
}
