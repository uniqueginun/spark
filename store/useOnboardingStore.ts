import { create } from "zustand";

type Gender = "Male" | "Female" | "Other";

export type Onboarding = {
  profile: {
    first_name: string;
    last_name: string;
    age: number;
    gender: Gender;
    imageUrl: string;
    email: string;
  };

  interests: number[];

  location: {
    city: string;
    principalSubdivision: string;
    countryName: string;
    longitude: number;
    latitude: number;
  };
};

type OnboardingStore = {
  onboarding: Onboarding;
  setOnboarding: (onboarding: Onboarding) => void;
  resetOnboarding: () => void;
};

const initialOnboarding: Onboarding = {
  profile: {
    first_name: "",
    last_name: "",
    age: 0,
    gender: "Male",
    imageUrl: "",
    email: "",
  },
  interests: [],
  location: {
    city: "",
    principalSubdivision: "",
    countryName: "",
    latitude: 0,
    longitude: 0,
  },
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  onboarding: initialOnboarding,

  setOnboarding: (onboarding: Onboarding) => set({ onboarding }),
  resetOnboarding: () => set({ onboarding: initialOnboarding }),
}));
