import { colors } from "@/constants/colors";
import {
    loadEventMessages,
    loginToFirebase,
    sendMessage,
    sendTypingStatus,
} from "@/services/firebaseChat";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";

import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

import { db } from "@/firebase";
import { useHomeStore } from "@/store/useHomeStore";
import {
    onChildAdded,
    onValue,
    orderByChild,
    query,
    ref,
    startAt,
} from "firebase/database";

type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderImage: string;
  text: string;
  sentAt: string;
  isMine: boolean;
};

const LIST_PAD_H = 20;
const SCREEN_PAD_TOP_MESSAGES = 12;
const SCREEN_PAD_BOTTOM_LIST = 20;

const HEADER_HEIGHT = 72;

const formatNow = () =>
  new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [lastMessageId, setLastMessageId] = useState<number | null>(null);
  const { currentUser } = useHomeStore();
  const insets = useSafeAreaInsets();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const { activityId } = useLocalSearchParams();

  const typingText = useMemo(() => {
    if (!typingUsers.length) return "";
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing…`;
    if (typingUsers.length === 2)
      return `${typingUsers[0]} and ${typingUsers[1]} are typing…`;
    return `${typingUsers[0]}, ${typingUsers[1]} and others are typing…`;
  }, [typingUsers]);

  useEffect(() => {
    if (!activityId) {
      return;
    }

    const eventId = activityId;

    const path = `/event_chats/${eventId}/typing`;

    const typingRef = ref(db, path);

    const unsubscribe = onValue(
      typingRef,
      (snapshot) => {
        const data = snapshot.val() || {};

        const users = Object.values(data)
          .map((item: any) => item.name)
          .filter(Boolean);

        setTypingUsers(users);
      },
      (error) => {
        console.log("Typing listener error:", error.code, error.message);
      },
    );

    return () => {
      console.log("Typing listener removed:", path);
      unsubscribe();
    };
  }, [activityId, currentUser?.id]);

  const scrollToBottom = (animated = true) => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated });
    }, 50);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const tempId = `local-${Date.now()}`;
    const message: ChatMessage = {
      id: tempId,
      senderId: String(currentUser?.id ?? "anonymous"),
      senderName: "You",
      senderImage: currentUser?.image_url ?? "",
      text: trimmed,
      sentAt: formatNow(),
      isMine: true,
    };
    setMessages((prev) => [...prev, message]);
    setInput("");

    const newMessage = await sendMessage(+activityId!, trimmed);
    setMessages((prev) => [
      ...prev.filter((item) => item.id !== tempId),
      newMessage,
    ]);
  };

  useEffect(() => {
    async function load() {
      const data = await loadEventMessages(+activityId);
      setMessages(data);

      if (data.length > 0) {
        setLastMessageId(data[data.length - 1].id);
      }

      try {
        await loginToFirebase();
      } catch (error) {
        console.error("Firebase login failed:", error);
      }
    }
    load();
  }, [activityId]);

  useEffect(() => {
    if (!activityId || lastMessageId === null) return;

    const messagesRef = query(
      ref(db, `/event_chats/${activityId}/messages`),
      orderByChild("id"),
      startAt(lastMessageId + 1),
    );

    const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
      const message = snapshot.val();
      if (!message?.id) return;

      setMessages((prev) => {
        const exists = prev.some((item) => item.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });

      setLastMessageId((current) => {
        if (!current || message.id > current) return message.id;
        return current;
      });
    });

    return () => unsubscribe();
  }, [activityId, lastMessageId]);

  // FIX 2: Single scroll-to-bottom trigger instead of multiple conflicting ones.
  // onContentSizeChange fires reliably after every new message render.
  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages]);

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageRow,
        item.isMine ? styles.myMessageRow : styles.otherMessageRow,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.isMine ? styles.myMessageBubble : styles.otherMessageBubble,
        ]}
      >
        {!item.isMine && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );

  function generateRandomString(length = 100): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  return (
    // FIX 3: Root view no longer has paddingHorizontal — header & input are now full-width
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.chatHeader}>
          <Pressable
            hitSlop={12}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <AntDesign name="arrow-left" size={22} color="#fff" />
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.chatTitle}>Group Chat</Text>
            <Text style={styles.chatSubtitle}>Activity chat</Text>
          </View>

          <View style={styles.headerRightSpace} />
        </View>
      </SafeAreaView>

      {/* FIX 1: keyboardVerticalOffset accounts for the header so the list
          doesn't get pushed behind it. "padding" behavior used on both
          platforms — "height" can cause the list to shrink on Android. */}
      <KeyboardAvoidingView
        style={styles.keyboardColumn}
        behavior="padding"
        keyboardVerticalOffset={HEADER_HEIGHT + insets.top}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => String(item.id) + generateRandomString(20)}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          // FIX 2: Removed duplicate scrollToEnd from onContentSizeChange &
          // onLayout — both were fighting the useEffect scroll, causing jank.
        />

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <View style={styles.typingRow}>
            <Text style={styles.typingText}>{typingText}</Text>
          </View>
        )}

        <SafeAreaView edges={["bottom"]} style={styles.inputSafe}>
          <View style={styles.inputContainer}>
            <View style={styles.inputBox}>
              <TextInput
                value={input}
                onChangeText={(text) => {
                  setInput(text);
                  if (text.trim()) {
                    sendTypingStatus(Number(activityId), currentUser);
                  }
                }}
                placeholder="Type a message…"
                placeholderTextColor="rgba(255,255,255,0.45)"
                style={styles.textInput}
                multiline
                maxLength={500}
                // Keep keyboard open after send on Android
                blurOnSubmit={false}
              />

              <Pressable onPress={handleSend} style={styles.sendButton}>
                <Feather name="send" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    // FIX 3: Removed paddingHorizontal here — was clipping header & input bar
    backgroundColor: "#0B0D16",
  },

  headerSafe: {
    flexShrink: 0,
    zIndex: 1,
    elevation: 4,
    backgroundColor: "#0B0D16",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.12)",
    paddingTop: 20,
    // FIX 3: Horizontal padding lives here now, not on the root screen
    paddingHorizontal: LIST_PAD_H,
  },

  chatHeader: {
    paddingBottom: 12,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B0D16",
  },

  keyboardColumn: {
    flex: 1,
  },

  inputSafe: {
    flexShrink: 0,
    backgroundColor: "#0B0D16",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  headerTextContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  chatTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },

  chatSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.55)",
  },

  headerRightSpace: {
    width: 42,
    height: 42,
  },

  messagesList: {
    flex: 1,
    flexShrink: 1,
    backgroundColor: "#0B0D16",
  },

  messagesContent: {
    // FIX 3: Horizontal padding moved here so bubbles have breathing room
    paddingHorizontal: LIST_PAD_H,
    paddingTop: SCREEN_PAD_TOP_MESSAGES,
    paddingBottom: SCREEN_PAD_BOTTOM_LIST,
    gap: 10,
  },

  typingRow: {
    paddingHorizontal: LIST_PAD_H,
    paddingVertical: 4,
  },

  typingText: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.4)",
    fontStyle: "italic",
  },

  messageRow: { flexDirection: "row" },
  myMessageRow: { justifyContent: "flex-end" },
  otherMessageRow: { justifyContent: "flex-start" },

  messageBubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },

  myMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
  },

  otherMessageBubble: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderBottomLeftRadius: 6,
  },

  senderName: {
    marginBottom: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.55)",
  },

  messageText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "500",
    color: "#fff",
  },

  inputContainer: {
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 4 : 6,
    paddingHorizontal: LIST_PAD_H,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.12)",
    backgroundColor: "#0B0D16",
  },

  inputBox: {
    minHeight: 52,
    maxHeight: 120,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.14)",
  },

  textInput: {
    flex: 1,
    maxHeight: 90,
    paddingVertical: 9,
    fontSize: 15,
    lineHeight: 20,
    color: "#fff",
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
});
