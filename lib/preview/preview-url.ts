export function isStoredPreviewUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    url.includes("petal-previews") ||
    url.includes("/storage/v1/object/public/")
  );
}
