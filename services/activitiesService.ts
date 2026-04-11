import apiClient from "@/api/client";
import { Activity, ActivityDetails } from "@/app/(tabs)/(home)/index";

export const fetchActivities = async (
  interestId: number,
  searchQuery: string,
  locationRadius: number,
  userLatitude: number,
  userLongitude: number,
): Promise<Activity[]> => {
  const response = await apiClient.get<{ activities: Activity[] }>(
    "/activities",
    {
      params: {
        interestId,
        searchQuery,
        locationRadius,
        userLatitude,
        userLongitude,
      },
    },
  );
  return response.data.activities as Activity[];
};

export const fetchActivityById = async (
  id: string,
): Promise<ActivityDetails> => {
  const response = await apiClient.get<{ activity: ActivityDetails }>(
    `/activities/${id}`,
  );
  return response.data.activity as ActivityDetails;
};
