export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: "info" | "success" | "achievement";
  read: boolean;
  timestamp: string;
}

const NOTIF_KEY = "genz_growth_notifications";
const RITUAL_KEY_PREFIX = "genz_growth_ritual_";

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Notifications API
export function getNotifications(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (!raw) {
      // Default initial welcome notification for new users
      const initial: AppNotification[] = [
        {
          id: "welcome-1",
          title: "Welcome to GenZ Growth! 🌱",
          body: "Start your daily ritual by logging your first guided reflection or chatting with Nova AI.",
          type: "info",
          read: false,
          timestamp: new Date().toISOString(),
        },
      ];
      localStorage.setItem(NOTIF_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function addNotification(title: string, body: string, type: "info" | "success" | "achievement" = "info"): AppNotification[] {
  if (typeof window === "undefined") return [];
  const current = getNotifications();
  const newNotif: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title,
    body,
    type,
    read: false,
    timestamp: new Date().toISOString(),
  };
  const updated = [newNotif, ...current.slice(0, 19)]; // Keep up to 20
  localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("show_toast", { detail: newNotif }));
    window.dispatchEvent(new Event("notifications_updated"));
    
    // Optional native browser notification if enabled
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, { body, icon: "/favicon.ico" });
      } catch (e) {
        // ignore fallback
      }
    }
  }
  return updated;
}

export function requestBrowserNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return Promise.resolve(false);
  return Notification.requestPermission().then((permission) => permission === "granted");
}

export function markAllNotificationsRead(): AppNotification[] {
  if (typeof window === "undefined") return [];
  const current = getNotifications().map((n) => ({ ...n, read: true }));
  localStorage.setItem(NOTIF_KEY, JSON.stringify(current));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("notifications_updated"));
  }
  return current;
}

export function clearAllNotifications(): AppNotification[] {
  if (typeof window === "undefined") return [];
  localStorage.setItem(NOTIF_KEY, JSON.stringify([]));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("notifications_updated"));
  }
  return [];
}

// Daily Ritual API
export interface RitualState {
  reflectionDone: boolean;
  novaCheckinDone: boolean;
}

export function getTodayRitual(): RitualState {
  if (typeof window === "undefined") return { reflectionDone: false, novaCheckinDone: false };
  try {
    const key = RITUAL_KEY_PREFIX + getTodayKey();
    const raw = localStorage.getItem(key);
    if (!raw) return { reflectionDone: false, novaCheckinDone: false };
    return JSON.parse(raw);
  } catch (e) {
    return { reflectionDone: false, novaCheckinDone: false };
  }
}

function checkAndAwardFullRitualAchievement(state: RitualState) {
  if (state.reflectionDone && state.novaCheckinDone) {
    const achKey = `genz_growth_achieved_${getTodayKey()}`;
    if (typeof window !== "undefined" && !localStorage.getItem(achKey)) {
      localStorage.setItem(achKey, "done");
      setTimeout(() => {
        addNotification(
          "🎉 Daily Ritual Master (100%)",
          "Incredible! You completed both Guided Reflection and Nova AI Check-in today! +20 Bonus Tree Points!",
          "achievement"
        );
      }, 800);
    }
  }
}

export function markReflectionDone(): RitualState {
  if (typeof window === "undefined") return { reflectionDone: true, novaCheckinDone: false };
  const current = getTodayRitual();
  if (current.reflectionDone) return current;
  const updated = { ...current, reflectionDone: true };
  const key = RITUAL_KEY_PREFIX + getTodayKey();
  localStorage.setItem(key, JSON.stringify(updated));
  addNotification("Guided Reflection Saved! ✨", "You earned +15 points for your Life Tree today.", "success");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ritual_updated"));
  }
  checkAndAwardFullRitualAchievement(updated);
  return updated;
}

export function markNovaCheckinDone(): RitualState {
  if (typeof window === "undefined") return { reflectionDone: false, novaCheckinDone: true };
  const current = getTodayRitual();
  if (current.novaCheckinDone) return current;
  const updated = { ...current, novaCheckinDone: true };
  const key = RITUAL_KEY_PREFIX + getTodayKey();
  localStorage.setItem(key, JSON.stringify(updated));
  addNotification("Nova AI Check-in Complete 💬", "Great job connecting with Nova AI today! (+5 points)", "info");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ritual_updated"));
  }
  checkAndAwardFullRitualAchievement(updated);
  return updated;
}
