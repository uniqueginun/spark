import apiClient from "@/api/client";
import { Interest } from "@/app/(onboarding)/select-interests";
import { User } from "@/store/useHomeStore";
import { Onboarding } from "@/store/useOnboardingStore";
import { AxiosError } from "axios";

export const completeOnboarding = async (
  onboarding: Onboarding,
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post<{ message: string }>(
      "/onboarding",
      onboarding,
    );
    return response.data;
  } catch (error) {
    console.error((error as AxiosError).response?.data);
    throw error;
  }
};

export const fetchInterests = async (): Promise<Interest[]> => {
  const response = await apiClient.get("/interests");
  return response.data.interests as Interest[];
};

export const fetchCurrentUser = async (
  email: string,
): Promise<{ user: User }> => {
  const response = await apiClient.get<{ user: User }>(
    `/current-user?email=${email}`,
  );
  return response.data;
};
