import { Interest } from "@/app/(onboarding)/select-interests";
import { fetchCurrentUser } from "@/services/onboardingService";
import { create } from "zustand";

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  image_url: string;
  onboarded: boolean;
  interests: Interest[];
  location: {
    city: string;
    principalSubdivision: string;
    countryName: string;
    longitude: number;
    latitude: number;
  };
};

type HomeState = {
  currentUser: User | null;
  getCurrentUser: (email: string) => Promise<User | null>;
};

export const useHomeStore = create<HomeState>((set, get) => ({
  currentUser: null,

  getCurrentUser: async (email: string) => {
    try {
      const { user } = await fetchCurrentUser(email);

      set({ currentUser: user });
      return user;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
}));
