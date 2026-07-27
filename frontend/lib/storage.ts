// Local storage persistence helper for zero data loss
export interface LocalJournalEntry {
  id: number;
  title: string;
  reflection: string;
  mood: string;
  emoji: string;
  highlight?: string;
  emotional_checkin?: string;
  lesson_learned?: string;
  gratitude?: string;
  tomorrow_focus?: string;
  memory_note?: string;
  is_pinned?: boolean;
  ai_reflection?: string;
  created_at: string;
  updated_at: string;
  is_local_only?: boolean;
}

const STORAGE_KEY = "genz_growth_local_entries";

export function getLocalEntries(): LocalJournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read local entries:", e);
    return [];
  }
}

export function saveLocalEntry(entry: LocalJournalEntry): LocalJournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getLocalEntries();
    const updated = [entry, ...existing.filter((e) => e.id !== entry.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save local entry:", e);
    return [];
  }
}

export function syncLocalEntries(serverEntries: LocalJournalEntry[]): LocalJournalEntry[] {
  if (typeof window === "undefined") return serverEntries;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serverEntries));
    return serverEntries;
  } catch (e) {
    return serverEntries;
  }
}
