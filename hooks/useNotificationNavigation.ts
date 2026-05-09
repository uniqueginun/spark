import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";

export function useNotificationNavigation() {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        if (data?.type === "event_message" && data?.event_id) {
          router.push({
            pathname: "/chat",
            params: {
              activityId: String(data.event_id),
            },
          });
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);
}
