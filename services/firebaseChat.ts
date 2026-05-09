import apiClient from "@/api/client";
import { auth, db } from "@/firebase";
import { signInWithCustomToken } from "firebase/auth";
import { onDisconnect, ref, remove, set } from "firebase/database";

export async function loginToFirebase() {
  const response = await apiClient.post("/firebase/token");

  await signInWithCustomToken(auth, response.data.token);
}

export async function loadEventMessages(eventId: number) {
  const response = await apiClient.get(`/events/${eventId}/messages?limit=50`);

  return response.data.data;
}

export async function sendMessage(eventId: number, body: string) {
  const response = await apiClient.post(`/events/${eventId}/messages`, {
    body,
  });

  return response.data.data;
}

let typingTimeout: ReturnType<typeof setTimeout> | null = null;

export function sendTypingStatus(eventId: number, user: any) {
  const uid = `user_${user.id}`;
  const path = `/event_chats/${eventId}/typing/${uid}`;

  const typingRef = ref(db, path);

  set(typingRef, {
    user_id: user.id,
    name: user.first_name,
    updated_at: Date.now(),
  });

  onDisconnect(typingRef).remove();

  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }

  typingTimeout = setTimeout(() => {
    remove(typingRef);
  }, 1000);
}
