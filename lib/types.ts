export type Platform =
  | "youtube"
  | "instagram"
  | "tiktok"
  | "x"
  | "linkedin"
  | "medium"
  | "website";

export type PreviewStatus =
  | "pending"
  | "processing"
  | "completed"
  | "fallback"
  | "failed";

export type PetalStatus = "inbox" | "viewed" | "archived";

export interface Petal {
  id: string;
  user_id: string;
  url: string;
  title: string;
  note: string | null;
  platform: Platform;
  preview_url: string | null;
  created_at: string;
  viewed: boolean;
  status: PetalStatus;
  theme: string | null;
  preview_status: PreviewStatus;
  description?: string | null;
}

export interface PetalPreview {
  id: string;
  petal_id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  source: "opengraph" | "playwright" | "fallback" | "youtube" | "extension";
  created_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  petal_count: number;
  created_at: string;
}

export interface GardenTopic {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  petal_count: number;
  growth_level: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  is_pro: boolean;
  created_at: string;
}

export interface TodayStats {
  petals_saved: number;
  minutes_to_watch: number;
  top_themes: { name: string; count: number }[];
  recent_collections: Collection[];
}

export interface SearchFilters {
  platform?: Platform;
  date_from?: string;
  date_to?: string;
  viewed?: boolean;
  status?: PetalStatus;
  theme?: string;
  query?: string;
  limit?: number;
  offset?: number;
}

export type InboxAction =
  | { action: "mark_viewed" }
  | { action: "archive" }
  | { action: "add_note"; note: string }
  | { action: "move_to_collection"; collection_id: string }
  | { action: "move_to_garden"; theme: string };

export interface CreatePetalInput {
  url: string;
  title?: string;
  note?: string;
  platform?: Platform;
  theme?: string;
}
