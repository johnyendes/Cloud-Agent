import { create } from "zustand";
import { getLocalStorageItem, removeLocalStorageItem, setLocalStorageItem } from "@/lib/storage";

const TOKEN_KEY = "acb_access_token";

type AuthState = {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: getLocalStorageItem(TOKEN_KEY),
  setToken: (token) => {
    if (token) setLocalStorageItem(TOKEN_KEY, token);
    else removeLocalStorageItem(TOKEN_KEY);
    set({ token });
  },
  logout: () => {
    removeLocalStorageItem(TOKEN_KEY);
    set({ token: null });
  }
}));
