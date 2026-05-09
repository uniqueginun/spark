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

export type UpdateProfilePayload = {
  email: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  dob: string;
  gender: "male" | "female" | "other";
  avatar?: {
    uri: string;
    name: string;
    type: string;
  } | null;
};

export const updateProfile = async (
  payload: UpdateProfilePayload,
): Promise<{ message: string; user: User }> => {
  const formData = new FormData();
  formData.append("email", payload.email);
  formData.append("first_name", payload.first_name);
  formData.append("last_name", payload.last_name);
  formData.append("dob", payload.dob);
  formData.append("gender", payload.gender);

  if (payload.bio) {
    formData.append("bio", payload.bio);
  }

  if (payload.avatar) {
    formData.append("avatar", payload.avatar as unknown as Blob);
  }

  formData.append("_method", "PUT");

  const response = await apiClient.post<{ message: string; user: User }>(
    "/current-user/update-profile",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};
