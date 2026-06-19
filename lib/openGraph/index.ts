export { extractOpenGraph } from "@/lib/preview/opengraph";
export type { OpenGraphMetadata } from "@/lib/preview/types";
export type { PreviewResult as PreviewEngineResult } from "@/lib/preview/types";

/** @deprecated Use extractOpenGraph from @/lib/preview/opengraph */
export async function fetchOpenGraph(url: string) {
  const { extractOpenGraph } = await import("@/lib/preview/opengraph");
  const result = await extractOpenGraph(url);
  if (!result.success || !result.data) {
    return { success: false as const, error: result.error };
  }
  return {
    success: true as const,
    title: result.data.title,
    image: result.data.image,
    description: result.data.description,
  };
}
