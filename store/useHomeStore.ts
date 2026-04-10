import { create } from "zustand";

export type User = {
  id: string;
  name: string;
  email: string;
  image: string;
};

type HomeState = {
  currentUser: User | null;
  getCurrentUser: () => User | null;
  setCurrentUser: (user: User) => void;
};

export const useHomeStore = create<HomeState>((set, get) => ({
  currentUser: null,
  getCurrentUser: () => get().currentUser,
  setCurrentUser: (user: User) => set({ currentUser: user }),
}));
