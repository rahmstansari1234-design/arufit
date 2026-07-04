import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DisappearingMode } from "./backend.d";
import type {
  AppState,
  ChatSettings,
  ThemeSettings,
  UserProfile,
} from "./types";

interface AppStore extends AppState {
  setTheme: (theme: Partial<ThemeSettings>) => void;
  setChatSettings: (settings: Partial<ChatSettings>) => void;
  setUser: (user: UserProfile | null) => void;
  setAuthenticated: (value: boolean) => void;
  setUnreadNotifications: (count: number) => void;
  setUnreadMessages: (count: number) => void;
  setLoading: (value: boolean) => void;
  incrementUnreadNotifications: () => void;
  incrementUnreadMessages: () => void;
  resetUnreadNotifications: () => void;
  resetUnreadMessages: () => void;
}

const defaultTheme: ThemeSettings = {
  mode: "system",
  accentColor: "#4CAF7D",
  fontSize: "medium",
  reducedMotion: false,
};

const defaultChatSettings: ChatSettings = {
  wallpaper: undefined,
  bubbleColorSent: undefined,
  bubbleColorReceived: undefined,
  chatName: undefined,
  isMuted: false,
  muteUntil: undefined,
  disappearingMode: DisappearingMode.off,
  isArchived: false,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: defaultTheme,
      chatSettings: defaultChatSettings,
      user: null,
      isAuthenticated: false,
      unreadNotifications: 0,
      unreadMessages: 0,
      isLoading: true,

      setTheme: (theme) =>
        set((state) => ({ theme: { ...state.theme, ...theme } })),

      setChatSettings: (settings) =>
        set((state) => ({
          chatSettings: { ...state.chatSettings, ...settings },
        })),

      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setUnreadNotifications: (unreadNotifications) =>
        set({ unreadNotifications }),
      setUnreadMessages: (unreadMessages) => set({ unreadMessages }),
      setLoading: (isLoading) => set({ isLoading }),

      incrementUnreadNotifications: () =>
        set((state) => ({
          unreadNotifications: state.unreadNotifications + 1,
        })),

      incrementUnreadMessages: () =>
        set((state) => ({ unreadMessages: state.unreadMessages + 1 })),

      resetUnreadNotifications: () => set({ unreadNotifications: 0 }),
      resetUnreadMessages: () => set({ unreadMessages: 0 }),
    }),
    {
      name: "arufit-store",
      partialize: (state) => ({
        theme: state.theme,
        chatSettings: state.chatSettings,
      }),
    },
  ),
);
