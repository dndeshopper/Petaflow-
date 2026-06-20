import type {
  Collection,
  GardenTopic,
  Petal,
  SearchFilters,
  TodayStats,
  UserProfile,
} from "@/lib/types";

const DEMO_USER_ID = "demo-user-001";

export const DEMO_USER: UserProfile = {
  id: DEMO_USER_ID,
  email: "luca@petalflow.app",
  full_name: "Luca R.",
  avatar_url: null,
  is_pro: true,
  created_at: new Date().toISOString(),
};

function todayAt(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const daysAgo = (d: number) => {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date.toISOString();
};

const RAW_DEMO_PETALS = [
  {
    id: "p1",
    user_id: DEMO_USER_ID,
    url: "https://www.youtube.com/watch?v=example-ai",
    title: "Build AI Agents in 10 Minutes",
    note: null,
    platform: "youtube" as const,
    preview_url: null,
    created_at: todayAt(9, 42),
    viewed: false,
    theme: "AI / Automation",
    preview_status: "completed" as const,
  },
  {
    id: "p2",
    user_id: DEMO_USER_ID,
    url: "https://www.instagram.com/reel/desk-setup",
    title: "Minimal desk setup for deep work",
    note: null,
    platform: "instagram",
    preview_url: null,
    created_at: todayAt(10, 15),
    viewed: false,
    theme: "Productivity",
    preview_status: "completed",
  },
  {
    id: "p3",
    user_id: DEMO_USER_ID,
    url: "https://x.com/buildinpublic/status/123",
    title: "The best way to learn is to build in public.",
    note: "The best way to learn is to build in public.",
    platform: "x",
    preview_url: null,
    created_at: todayAt(11, 3),
    viewed: false,
    theme: "Mindset",
    preview_status: "fallback",
  },
  {
    id: "p4",
    user_id: DEMO_USER_ID,
    url: "https://medium.com/future-of-work-async",
    title: "The Future of Work is Async",
    note: null,
    platform: "medium",
    preview_url: null,
    created_at: todayAt(12, 21),
    viewed: true,
    theme: "Business",
    preview_status: "completed",
  },
  {
    id: "p5",
    user_id: DEMO_USER_ID,
    url: "https://www.tiktok.com/@user/productivity",
    title: "3 productivity tips that changed my life",
    note: null,
    platform: "tiktok",
    preview_url: null,
    created_at: todayAt(13, 47),
    viewed: false,
    theme: "Productivity",
    preview_status: "completed",
  },
  {
    id: "p6",
    user_id: DEMO_USER_ID,
    url: "https://example.com/milan-architecture",
    title: "Beautiful architecture in Milan",
    note: null,
    platform: "website",
    preview_url: null,
    created_at: todayAt(15, 10),
    viewed: false,
    theme: "Design",
    preview_status: "completed",
  },
  {
    id: "p7",
    user_id: DEMO_USER_ID,
    url: "https://www.youtube.com/watch?v=second-brain",
    title: "How to build a second brain with AI",
    note: null,
    platform: "youtube",
    preview_url: null,
    created_at: todayAt(16, 5),
    viewed: false,
    theme: "AI / Automation",
    preview_status: "completed" as const,
  },
] as const;

export const DEMO_PETALS: Petal[] = RAW_DEMO_PETALS.map((petal) => ({
  ...petal,
  status: petal.viewed ? ("viewed" as const) : ("inbox" as const),
}));

export const DEMO_COLLECTIONS: Collection[] = [
  {
    id: "c1",
    user_id: DEMO_USER_ID,
    name: "Project Splitto",
    description: "Splitto project references",
    color: "#A8D5B5",
    petal_count: 18,
    created_at: daysAgo(30),
  },
  {
    id: "c2",
    user_id: DEMO_USER_ID,
    name: "Inspiration",
    description: "Visual and creative inspiration",
    color: "#C4B5E0",
    petal_count: 32,
    created_at: daysAgo(20),
  },
  {
    id: "c3",
    user_id: DEMO_USER_ID,
    name: "Watch Later",
    description: "Videos to enjoy this weekend",
    color: "#D4C4A8",
    petal_count: 5,
    created_at: daysAgo(7),
  },
];

export const DEMO_GARDEN_TOPICS: GardenTopic[] = [
  { id: "g1", user_id: DEMO_USER_ID, name: "AI", slug: "ai", petal_count: 24, growth_level: 5, created_at: daysAgo(60) },
  { id: "g2", user_id: DEMO_USER_ID, name: "Marketing", slug: "marketing", petal_count: 15, growth_level: 4, created_at: daysAgo(45) },
  { id: "g3", user_id: DEMO_USER_ID, name: "Startups", slug: "startups", petal_count: 18, growth_level: 4, created_at: daysAgo(50) },
  { id: "g4", user_id: DEMO_USER_ID, name: "Fitness", slug: "fitness", petal_count: 6, growth_level: 2, created_at: daysAgo(30) },
  { id: "g5", user_id: DEMO_USER_ID, name: "Productivity", slug: "productivity", petal_count: 12, growth_level: 3, created_at: daysAgo(40) },
  { id: "g6", user_id: DEMO_USER_ID, name: "Design", slug: "design", petal_count: 9, growth_level: 3, created_at: daysAgo(35) },
];

let demoPetals = [...DEMO_PETALS];

function normalizePetal(petal: Petal): Petal {
  return {
    ...petal,
    status: petal.status ?? (petal.viewed ? "viewed" : "inbox"),
  };
}

function findDemoPetal(petalId: string): Petal {
  const petal = demoPetals.find((p) => p.id === petalId);
  if (!petal) throw new Error("Petal not found");
  return petal;
}

export function getDemoPetals(): Petal[] {
  return [...demoPetals]
    .map(normalizePetal)
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

export function addDemoPetal(petal: Omit<Petal, "id" | "created_at">): Petal {
  const newPetal: Petal = normalizePetal({
    ...petal,
    id: `p${Date.now()}`,
    created_at: new Date().toISOString(),
    status: petal.status ?? "inbox",
    viewed: petal.viewed ?? false,
  });
  demoPetals = [...demoPetals, newPetal];
  return newPetal;
}

export function getDemoInboxCount(): number {
  return getDemoPetals().filter((p) => p.status === "inbox").length;
}

export function markDemoPetalViewed(petalId: string): Petal {
  demoPetals = demoPetals.map((p) =>
    p.id === petalId ? { ...p, status: "viewed" as const, viewed: true } : p
  );
  return normalizePetal(findDemoPetal(petalId));
}

export function archiveDemoPetal(petalId: string): Petal {
  demoPetals = demoPetals.map((p) =>
    p.id === petalId ? { ...p, status: "archived" as const, viewed: true } : p
  );
  return normalizePetal(findDemoPetal(petalId));
}

export function addDemoPetalNote(petalId: string, note: string): Petal {
  demoPetals = demoPetals.map((p) =>
    p.id === petalId ? { ...p, note } : p
  );
  return normalizePetal(findDemoPetal(petalId));
}

export function moveDemoPetalToCollection(
  petalId: string,
  collectionId: string
): Petal {
  void collectionId;
  demoPetals = demoPetals.map((p) =>
    p.id === petalId ? { ...p, status: "viewed" as const, viewed: true } : p
  );
  return normalizePetal(findDemoPetal(petalId));
}

export function moveDemoPetalToGarden(petalId: string, theme: string): Petal {
  demoPetals = demoPetals.map((p) =>
    p.id === petalId
      ? { ...p, theme, status: "viewed" as const, viewed: true }
      : p
  );
  return normalizePetal(findDemoPetal(petalId));
}

export function setDemoPetalPreviewStatus(
  petalId: string,
  status: Petal["preview_status"]
): void {
  demoPetals = demoPetals.map((p) =>
    p.id === petalId ? { ...p, preview_status: status } : p
  );
}

export function updateDemoPetalTitle(petalId: string, title: string): void {
  demoPetals = demoPetals.map((p) =>
    p.id === petalId ? { ...p, title } : p
  );
}

export function saveDemoPreviewResult(
  petalId: string,
  result: {
    status: Petal["preview_status"];
    preview_url: string | null;
    title?: string;
    description?: string;
    source: "opengraph" | "playwright" | "fallback" | "youtube" | "extension";
  }
): void {
  demoPetals = demoPetals.map((p) =>
    p.id === petalId
      ? {
          ...p,
          preview_status: result.status,
          preview_url: result.preview_url,
          description: result.description ?? p.description,
          title: result.title ?? p.title,
        }
      : p
  );
}

export function searchDemoPetals(filters: SearchFilters): Petal[] {
  let results = getDemoPetals();

  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.url.toLowerCase().includes(q) ||
        p.note?.toLowerCase().includes(q) ||
        p.platform.includes(q) ||
        p.theme?.toLowerCase().includes(q)
    );
  }

  if (filters.platform) results = results.filter((p) => p.platform === filters.platform);
  if (filters.theme) results = results.filter((p) => p.theme === filters.theme);
  if (filters.viewed !== undefined) {
    results = results.filter((p) => p.viewed === filters.viewed);
  }
  if (filters.status) {
    results = results.filter((p) => p.status === filters.status);
  }
  if (filters.date_from) {
    const from = new Date(filters.date_from).getTime();
    results = results.filter((p) => new Date(p.created_at).getTime() >= from);
  }
  if (filters.date_to) {
    const to = new Date(filters.date_to).getTime();
    results = results.filter((p) => new Date(p.created_at).getTime() <= to);
  }

  return results;
}

export function getDemoTodayStats(): TodayStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayPetals = demoPetals.filter((p) => new Date(p.created_at) >= today);

  return {
    petals_saved: todayPetals.length,
    minutes_to_watch: 42,
    top_themes: [
      { name: "AI & Automation", count: 4 },
      { name: "Productivity", count: 2 },
      { name: "Design", count: 1 },
    ],
    recent_collections: DEMO_COLLECTIONS.slice(0, 2),
  };
}

export function getDemoInboxPetals(): Petal[] {
  return getDemoPetals().filter((p) => p.status === "inbox");
}

export const PETALFLOW_QUOTE = {
  text: "Every petal you save today is a seed for tomorrow.",
  author: "",
};

export function getDailyQuote() {
  return PETALFLOW_QUOTE;
}
