import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { supabase } from "../../lib/supabaseClient";
import Colors from "../../constants/colors";
import { RootStackParamList } from "../../navigation/AppNavigator";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "ChatWithRider"
>;

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  ride_id: string;
  message: string;
  created_at: string;
};

type Rider = {
  id: string;
  first_name: string;
  last_name: string;
};

export default function ChatWithRider({
  route,
  navigation,
}: Props) {
  const { rideId } = route.params;

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [rider, setRider] =
    useState<Rider | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [messageText, setMessageText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  // ==========================================
  // GET CURRENT DRIVER
  // ==========================================

  const getCurrentUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error(
        "Unable to get the current user."
      );
    }

    setCurrentUserId(user.id);

    return user.id;
  };

  // ==========================================
  // LOAD RIDER
  // ==========================================

  const loadRider = async (driverId: string) => {
    console.log(
      "LOADING RIDER FOR RIDE:",
      rideId
    );

    // ==========================================
    // FIRST: GET RIDE
    // ==========================================

    const {
      data: ride,
      error: rideError,
    } = await supabase
      .from("rides")
      .select(`
        id,
        driver_id,
        rider_id
      `)
      .eq("id", rideId)
      .eq("driver_id", driverId)
      .maybeSingle();

    if (rideError) {
      console.error(
        "RIDE ERROR:",
        rideError
      );

      throw new Error(
        rideError.message
      );
    }

    if (!ride) {
      console.log(
        "NO RIDE FOUND USING DRIVER ID"
      );

      setRider(null);

      return null;
    }

    console.log(
      "RIDE FOUND:",
      ride
    );

    // ==========================================
    // GET RIDER ID FROM RIDE
    // ==========================================

    let riderId = ride.rider_id;

    // ==========================================
    // IF NO RIDER ID, CHECK BOOKINGS
    // ==========================================

    if (!riderId) {
      console.log(
        "NO RIDER ID ON RIDE. CHECKING BOOKINGS..."
      );

      const {
        data: bookingData,
        error: bookingError,
      } = await supabase
        .from("bookings")
        .select(`
          rider_id,
          seats_booked
        `)
        .eq("ride_id", rideId)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (bookingError) {
        console.error(
          "BOOKING ERROR:",
          bookingError
        );
      }

      if (bookingData) {
        console.log(
          "BOOKING FOUND:",
          bookingData
        );

        riderId = bookingData.rider_id;
      }
    }

    // ==========================================
    // NO RIDER
    // ==========================================

    if (!riderId) {
      console.log(
        "NO RIDER FOUND FOR THIS RIDE"
      );

      setRider(null);

      return null;
    }

    console.log(
      "RIDER ID:",
      riderId
    );

    // ==========================================
    // GET RIDER PROFILE
    // ==========================================

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name
      `)
      .eq("id", riderId)
      .maybeSingle();

    if (profileError) {
      console.error(
        "PROFILE ERROR:",
        profileError
      );

      throw new Error(
        profileError.message
      );
    }

    if (!profile) {
      console.log(
        "NO RIDER PROFILE FOUND"
      );

      setRider(null);

      return null;
    }

    console.log(
      "RIDER PROFILE FOUND:",
      profile
    );

    setRider(profile);

    return profile.id;
  };

  // ==========================================
  // LOAD MESSAGES
  // ==========================================

  const loadMessages = async (
    driverId: string,
    riderId: string
  ) => {
    console.log(
      "LOADING CHAT MESSAGES..."
    );

    const {
      data,
      error,
    } = await supabase
      .from("messages")
      .select(`
        id,
        sender_id,
        receiver_id,
        ride_id,
        message,
        created_at
      `)
      .eq("ride_id", rideId)
      .or(
        `and(sender_id.eq.${driverId},receiver_id.eq.${riderId}),and(sender_id.eq.${riderId},receiver_id.eq.${driverId})`
      )
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "MESSAGES ERROR:",
        error
      );

      throw new Error(
        error.message
      );
    }

    setMessages(data ?? []);
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  const loadChat = async () => {
    try {
      setLoading(true);

      console.log(
        "=============================="
      );

      console.log(
        "OPENING CHAT FOR RIDE:",
        rideId
      );

      console.log(
        "=============================="
      );

      const driverId =
        await getCurrentUser();

      const riderId =
        await loadRider(driverId);

      if (riderId) {
        await loadMessages(
          driverId,
          riderId
        );
      } else {
        setMessages([]);
      }
    } catch (error: any) {
      console.log(
        "CHAT LOADING ERROR:",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChat();
  }, [rideId]);

  // ==========================================
  // REALTIME MESSAGES
  // ==========================================

  useEffect(() => {
    if (
      !currentUserId ||
      !rider?.id
    ) {
      return;
    }

    const channel =
      supabase
        .channel(
          `chat-with-rider-${rideId}`
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `ride_id=eq.${rideId}`,
          },
          (payload) => {
            const newMessage =
              payload.new as Message;

            const isCorrectConversation =
              (
                newMessage.sender_id ===
                  currentUserId &&
                newMessage.receiver_id ===
                  rider.id
              ) ||
              (
                newMessage.sender_id ===
                  rider.id &&
                newMessage.receiver_id ===
                  currentUserId
              );

            if (!isCorrectConversation) {
              return;
            }

            setMessages(
              (currentMessages) => {
                const alreadyExists =
                  currentMessages.some(
                    (message) =>
                      message.id ===
                      newMessage.id
                  );

                if (alreadyExists) {
                  return currentMessages;
                }

                return [
                  ...currentMessages,
                  newMessage,
                ];
              }
            );
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [
    currentUserId,
    rider?.id,
    rideId,
  ]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage = async () => {
    const text =
      messageText.trim();

    if (
      !text ||
      !currentUserId ||
      !rider?.id ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);

      const {
        error,
      } = await supabase
        .from("messages")
        .insert({
          sender_id:
            currentUserId,

          receiver_id:
            rider.id,

          ride_id:
            rideId,

          message:
            text,
        });

      if (error) {
        throw new Error(
          error.message
        );
      }

      setMessageText("");
    } catch (error: any) {
      console.log(
        "SEND MESSAGE ERROR:",
        error.message
      );
    } finally {
      setSending(false);
    }
  };

  // ==========================================
  // MESSAGE ITEM
  // ==========================================

  const renderMessage = ({
    item,
  }: {
    item: Message;
  }) => {
    const isDriver =
      item.sender_id ===
      currentUserId;

    return (
      <View
        style={[
          styles.messageContainer,

          isDriver
            ? styles.driverMessageContainer
            : styles.riderMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,

            isDriver
              ? styles.driverMessageBubble
              : styles.riderMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,

              isDriver
                ? styles.driverMessageText
                : styles.riderMessageText,
            ]}
          >
            {item.message}
          </Text>
        </View>
      </View>
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={Colors.driver}
        />

        <Text
          style={styles.loadingText}
        >
          Loading chat...
        </Text>
      </View>
    );
  }

  // ==========================================
  // NO RIDER
  // ==========================================

  if (!rider) {
    return (
      <View
        style={styles.container}
      >
        <View
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }
            style={
              styles.backButton
            }
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors.white}
            />
          </TouchableOpacity>

          <Text
            style={
              styles.headerTitle
            }
          >
            Chat with Rider
          </Text>
        </View>

        <View
          style={
            styles.emptyContainer
          }
        >
          <Ionicons
            name="person-outline"
            size={60}
            color={Colors.secondary}
          />

          <Text
            style={
              styles.emptyTitle
            }
          >
            No Rider Found
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            This ride does not
            currently have a rider.
          </Text>
        </View>
      </View>
    );
  }

  // ==========================================
  // RIDER NAME
  // ==========================================

  const riderName =
    `${rider.first_name ?? ""} ${
      rider.last_name ?? ""
    }`.trim() || "Rider";

  // ==========================================
  // MAIN SCREEN
  // ==========================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
      keyboardVerticalOffset={
        Platform.OS === "ios"
          ? 90
          : 0
      }
    >
      {/* HEADER */}

      <View
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
          style={
            styles.backButton
          }
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors.white}
          />
        </TouchableOpacity>

        <View
          style={
            styles.headerPerson
          }
        >
          <View
            style={
              styles.headerAvatar
            }
          >
            <Ionicons
              name="person"
              size={20}
              color={Colors.driver}
            />
          </View>

          <View>
            <Text
              style={
                styles.headerTitle
              }
            >
              {riderName}
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }
            >
              Rider
            </Text>
          </View>
        </View>
      </View>

      {/* MESSAGES */}

      <FlatList
        data={messages}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={
          renderMessage
        }
        contentContainerStyle={
          messages.length === 0
            ? styles.emptyMessagesContainer
            : styles.messagesContainer
        }
        showsVerticalScrollIndicator={
          false
        }
        ListEmptyComponent={
          <View
            style={
              styles.emptyChat
            }
          >
            <Ionicons
              name="chatbubble-outline"
              size={50}
              color={Colors.secondary}
            />

            <Text
              style={
                styles.emptyChatTitle
              }
            >
              Start the conversation
            </Text>

            <Text
              style={
                styles.emptyChatText
              }
            >
              Send a message to{" "}
              {riderName}.
            </Text>
          </View>
        }
      />

      {/* MESSAGE INPUT */}

      <View
        style={
          styles.inputContainer
        }
      >
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={
            setMessageText
          }
          placeholder="Type a message..."
          placeholderTextColor={
            Colors.textSecondary
          }
          multiline
        />

        <TouchableOpacity
          style={[
            styles.sendButton,

            (!messageText.trim() ||
              sending) &&
              styles.sendButtonDisabled,
          ]}
          onPress={
            sendMessage
          }
          disabled={
            !messageText.trim() ||
            sending
          }
        >
          {sending ? (
            <ActivityIndicator
              size="small"
              color={Colors.white}
            />
          ) : (
            <Ionicons
              name="send"
              size={20}
              color={Colors.white}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      Colors.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent:
      "center",
    alignItems:
      "center",
    backgroundColor:
      Colors.background,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: Colors.textSecondary,
  },

  header: {
    flexDirection:
      "row",
    alignItems:
      "center",
    backgroundColor:
      Colors.driver,
    paddingHorizontal:
      16,
    paddingTop: 50,
    paddingBottom: 16,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent:
      "center",
    alignItems:
      "center",
    marginRight: 10,
  },

  headerPerson: {
    flexDirection:
      "row",
    alignItems:
      "center",
  },

  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor:
      Colors.white,
    justifyContent:
      "center",
    alignItems:
      "center",
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },

  headerSubtitle: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.8,
    marginTop: 2,
  },

  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },

  emptyMessagesContainer: {
    flexGrow: 1,
    justifyContent:
      "center",
    padding: 16,
  },

  messageContainer: {
    marginBottom: 10,
    width: "100%",
  },

  driverMessageContainer: {
    alignItems:
      "flex-end",
  },

  riderMessageContainer: {
    alignItems:
      "flex-start",
  },

  messageBubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },

  driverMessageBubble: {
    backgroundColor:
      Colors.driver,
    borderBottomRightRadius: 4,
  },

  riderMessageBubble: {
    backgroundColor:
      "#E3E8ED",
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },

  driverMessageText: {
    color: Colors.white,
  },

  riderMessageText: {
    color: Colors.textPrimary,
  },

  emptyContainer: {
    flex: 1,
    justifyContent:
      "center",
    alignItems:
      "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 16,
  },

  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },

  emptyChat: {
    alignItems:
      "center",
  },

  emptyChatTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 14,
  },

  emptyChatText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
  },

  inputContainer: {
    flexDirection:
      "row",
    alignItems:
      "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor:
      Colors.white,
    borderTopWidth: 1,
    borderTopColor:
      Colors.border,
  },

  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor:
      Colors.background,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color:
      Colors.textPrimary,
    fontSize: 15,
    marginRight: 8,
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor:
      Colors.driver,
    justifyContent:
      "center",
    alignItems:
      "center",
  },

  sendButtonDisabled: {
    opacity: 0.5,
  },
});