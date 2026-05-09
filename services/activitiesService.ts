import apiClient from "@/api/client";
import { Activity, ActivityDetails } from "@/app/(tabs)/(home)/index";

/** Filter for activities the current user hosts (`GET /activities/hosted`). */
export type HostedActivityFilter = "coming" | "ended" | "canceled";

export type HostedActivitiesPage = {
  activities: Activity[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

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

/**
 * Paginated list of activities hosted by the user.
 * Backend: `GET /activities/hosted?email=&status=&page=&limit=`
 * Optional response fields: `total`, `has_more`.
 */
export const fetchHostedActivities = async (
  email: string,
  options: {
    status: HostedActivityFilter;
    page: number;
    pageSize: number;
  },
): Promise<HostedActivitiesPage> => {
  const { status, page, pageSize } = options;

  const { data } = await apiClient.get<{
    activities: Activity[];
    total?: number;
    has_more?: boolean;
  }>("/activities/hosted", {
    params: {
      email,
      status,
      page,
      limit: pageSize,
    },
  });

  const activities = data.activities ?? [];
  let hasMore: boolean;
  if (typeof data.has_more === "boolean") {
    hasMore = data.has_more;
  } else if (typeof data.total === "number") {
    hasMore = page * pageSize < data.total;
  } else {
    hasMore = activities.length >= pageSize;
  }

  return {
    activities,
    page,
    pageSize,
    total: data.total ?? activities.length,
    hasMore,
  };
};

export const fetchActivityById = async (
  id: string,
): Promise<ActivityDetails> => {
  const response = await apiClient.get<{ activity: ActivityDetails }>(
    `/activities/${id}`,
  );
  return response.data.activity as ActivityDetails;
};

export const toggleJoinActivity = async (activityId: number, email: string) => {
  const response = await apiClient.post<{ activity: ActivityDetails }>(
    `/activities/${activityId}/toggle-join`,
    {
      email,
    },
  );

  return response.data.activity;
};

export const cancelActivity = async (
  activityId: number,
): Promise<ActivityDetails> => {
  const response = await apiClient.post<{ activity: ActivityDetails }>(
    `/activities/${activityId}/cancel`,
  );

  return response.data.activity;
};

export const deleteActivity = async (activityId: number): Promise<void> => {
  await apiClient.delete(`/activities/${activityId}`);
};

export type CreateActivityPayload = {
  location: {
    latitude: number;
    longitude: number;
  };
  name: string;
  description: string;
  interestId: number;
  maxParticipants: number;
  startsAt: string;
  email: string;
};

export const createActivity = async (
  payload: CreateActivityPayload,
): Promise<ActivityDetails> => {
  const response = await apiClient.post<{ activity: ActivityDetails }>(
    "/activities",
    payload,
  );

  return response.data.activity;
};

export const favoriteActivity = async (activityId: number) => {
  const response = await apiClient.post<{ activity: ActivityDetails }>(
    `/activities/${activityId}/toggle-favorite`,
  );

  return response.data.activity;
};
