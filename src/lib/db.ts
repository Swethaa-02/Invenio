export interface Idea {
  id: string;
  title: string;
  desc: string;
  category: "AI" | "Core Platform" | "Web3" | "Spatial UI" | "General";
  score: number;
  status: "Draft" | "Research" | "Prototype" | "Ready";
  date: string;
  details: string;
  x: number;
  y: number;
}

// Initial seed data for the platform
const DEFAULT_IDEAS: Idea[] = [
  {
    id: "IDE-01",
    title: "Vector Embeddings Context Cache",
    desc: "Cache mechanisms for localized prompt embeddings to decrease LLM retrieval latencies.",
    category: "AI",
    score: 9.4,
    status: "Prototype",
    date: "1 day ago",
    details: "By saving frequently-accessed token sequence embeds in a memory cache, we decrease the retrieval latency of our retrieval-augmented generation engine by over 45%. Compiles directly to client JS.",
    x: 480,
    y: 80,
  },
  {
    id: "IDE-02",
    title: "Decentralized File Sync",
    desc: "Transactional binary diff logging supporting multi-peer database synchronization.",
    category: "Core Platform",
    score: 8.9,
    status: "Research",
    date: "2 days ago",
    details: "A custom delta replication model utilizing Merkle clocks to log database actions offline. Upon reconnecting, transactions reconcile with zero authority bottleneck.",
    x: 100,
    y: 120,
  },
  {
    id: "IDE-03",
    title: "Apple Vision Gesture Binding",
    desc: "Framer Motion gesture handlers mimicking spatial hand trackings for dashboard widgets.",
    category: "Spatial UI",
    score: 7.6,
    status: "Draft",
    date: "3 days ago",
    details: "Binding specific WebGL pointer events to hand trackers using standard visionOS hooks. Enables smooth panning, scaling, and widget placement inside immersive space.",
    x: 220,
    y: 340,
  },
  {
    id: "IDE-04",
    title: "Solana Smart Contract Logging",
    desc: "An on-chain log collection router indexing transaction histories to IPFS databases.",
    category: "Web3",
    score: 8.2,
    status: "Research",
    date: "5 days ago",
    details: "Collects transaction logs from specified programs on Solana, hashes files, and posts reference records on-chain. Provides auditable, decentralized proof of R&D data history.",
    x: 600,
    y: 300,
  },
  {
    id: "IDE-05",
    title: "Client-side WASM SQLite Compiler",
    desc: "Building portable SQLite builds running directly within browser background threads.",
    category: "Core Platform",
    score: 9.5,
    status: "Ready",
    date: "1 week ago",
    details: "Compiled SQLite using WebAssembly, linking directly into shared worker contexts. Offers 10x faster local query processing compared to classic IndexedDB configurations.",
    x: 120,
    y: 320,
  },
  {
    id: "IDE-06",
    title: "Dynamic Agent Query Planner",
    desc: "Self-improving prompt routing planner distributing processing queries across LLMs.",
    category: "AI",
    score: 8.1,
    status: "Prototype",
    date: "1 week ago",
    details: "Evaluates incoming user request tokens and assigns the routing destination (e.g. cheap endpoint vs deep reasoning node). Decreases overall token usage costs.",
    x: 520,
    y: 280,
  },
];

// In-Memory store using Node global object to persist across hot-reloads
interface CustomGlobal {
  inMemoryIdeas?: Idea[];
  inMemoryTheme?: string;
}

const customGlobal = global as typeof global & CustomGlobal;

if (!customGlobal.inMemoryIdeas) {
  customGlobal.inMemoryIdeas = [...DEFAULT_IDEAS];
}

if (!customGlobal.inMemoryTheme) {
  customGlobal.inMemoryTheme = "cyan";
}

export const db = {
  getIdeas: (): Idea[] => {
    return customGlobal.inMemoryIdeas || [];
  },

  addIdea: (idea: Omit<Idea, "id" | "date">): Idea => {
    const id = `IDE-${String(Math.floor(Math.random() * 900) + 100)}`;
    const newIdea: Idea = {
      ...idea,
      id,
      date: "Just now",
    };
    customGlobal.inMemoryIdeas = [...(customGlobal.inMemoryIdeas || []), newIdea];
    return newIdea;
  },

  updateIdea: (id: string, fields: Partial<Omit<Idea, "id">>): boolean => {
    const ideas = customGlobal.inMemoryIdeas || [];
    const idx = ideas.findIndex((item) => item.id === id);
    if (idx === -1) return false;

    ideas[idx] = {
      ...ideas[idx],
      ...fields,
    };
    customGlobal.inMemoryIdeas = [...ideas];
    return true;
  },

  deleteIdea: (id: string): boolean => {
    const ideas = customGlobal.inMemoryIdeas || [];
    const initialLength = ideas.length;
    customGlobal.inMemoryIdeas = ideas.filter((item) => item.id !== id);
    return customGlobal.inMemoryIdeas.length < initialLength;
  },

  setIdeas: (newIdeas: Idea[]) => {
    customGlobal.inMemoryIdeas = [...newIdeas];
  },

  resetIdeas: () => {
    customGlobal.inMemoryIdeas = [...DEFAULT_IDEAS];
  },

  // Theme support
  getTheme: (): string => {
    return customGlobal.inMemoryTheme || "cyan";
  },

  setTheme: (theme: string) => {
    customGlobal.inMemoryTheme = theme;
  }
};
