import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  supabase,
} from "../../lib/supabaseClient";

import Colors from "../../constants/colors";


export default function ChatWithDriver({
  route,
  navigation,
}: any) {

  const {
    rideId,
  } = route.params;


  const [messages, setMessages] = useState<any[]>([]);

  const [newMessage, setNewMessage] =
    useState("");

 const [userId, setUserId] = useState<string | null>(null);

  const [driverId, setDriverId] =
    useState(null);

  const [driverName, setDriverName] =
    useState("Driver");

  const [loading, setLoading] =
    useState(true);


  // ==================================================
  // LOAD CHAT
  // ==================================================

  useEffect(() => {

    loadChat();

  }, [rideId]);


  const loadChat =
    async () => {

      try {

        setLoading(true);


        // ==================================================
        // GET CURRENT USER
        // ==================================================

        const {
          data: {
            user,
          },
          error: userError,
        } =
          await supabase.auth.getUser();


        if (
          userError ||
          !user
        ) {

          console.log(
            "Error getting current user:",
            userError
          );

          setLoading(false);

          return;

        }


        setUserId(
          user.id
        );


        // ==================================================
        // GET RIDE + DRIVER
        // ==================================================

        const {
          data: ride,
          error: rideError,
        } =
          await supabase
            .from("rides")
            .select(`
              id,
              driver_id
            `)
            .eq(
              "id",
              rideId
            )
            .single();


        if (rideError) {

          console.log(
            "Error loading ride:",
            rideError
          );

          setLoading(false);

          return;

        }


        if (!ride?.driver_id) {

          console.log(
            "No driver found for this ride."
          );

          setLoading(false);

          return;

        }


        setDriverId(
          ride.driver_id
        );


        // ==================================================
        // GET DRIVER PROFILE
        // ==================================================

        const {
          data: driverProfile,
          error: profileError,
        } =
          await supabase
            .from("profiles")
            .select(`
              first_name,
              last_name
            `)
            .eq(
              "id",
              ride.driver_id
            )
            .single();


        if (profileError) {

          console.log(
            "Error loading driver profile:",
            profileError
          );

        }


        if (driverProfile) {

          const fullName =
            `${driverProfile.first_name || ""} ${driverProfile.last_name || ""}`
              .trim();


          setDriverName(
            fullName ||
            "Driver"
          );

        }


        // ==================================================
        // LOAD MESSAGES FOR THIS RIDE
        // ==================================================

        const {
          data: messageData,
          error: messageError,
        } =
          await supabase
            .from("messages")
            .select("*")
            .eq(
              "ride_id",
              rideId
            )
            .order(
              "created_at",
              {
                ascending: true,
              }
            );


        if (messageError) {

          console.log(
            "Error loading messages:",
            messageError
          );

        } else {

          setMessages(
            messageData || []
          );

        }

      } catch (error) {

        console.log(
          "Chat loading error:",
          error
        );

      }


      setLoading(false);

    };


  // ==================================================
  // REAL-TIME MESSAGES
  // ==================================================

  useEffect(() => {

    if (
      !userId ||
      !driverId ||
      !rideId
    ) {

      return;

    }


    const channel =
      supabase
        .channel(
          `chat-driver-${rideId}-${userId}`
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

            const newMessageData =
              payload.new;


            // ==================================================
            // MAKE SURE MESSAGE BELONGS TO THIS CHAT
            // ==================================================

            const belongsToChat =
              (
                newMessageData.sender_id ===
                  userId &&
                newMessageData.receiver_id ===
                  driverId
              ) ||
              (
                newMessageData.sender_id ===
                  driverId &&
                newMessageData.receiver_id ===
                  userId
              );


            if (
              !belongsToChat
            ) {

              return;

            }


            setMessages(
              (
                currentMessages
              ) => {

                const alreadyExists =
                  currentMessages.some(
                    (
                      message
                    ) =>
                      message.id ===
                      newMessageData.id
                  );


                if (
                  alreadyExists
                ) {

                  return currentMessages;

                }


                return [
                  ...currentMessages,
                  newMessageData,
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
    userId,
    driverId,
    rideId,
  ]);


  // ==================================================
  // SEND MESSAGE
  // ==================================================

  const sendMessage =
    async () => {

      if (
        !newMessage.trim() ||
        !userId ||
        !driverId
      ) {

        return;

      }


      const messageText =
        newMessage.trim();


      setNewMessage("");


      const {
        error,
      } =
        await supabase
          .from("messages")
          .insert({

            sender_id:
              userId,

            receiver_id:
              driverId,

            ride_id:
              rideId,

            message:
              messageText,

          });


      if (error) {

        console.log(
          "Error sending message:",
          error
        );


        setNewMessage(
          messageText
        );

      }

    };


  // ==================================================
  // MESSAGE ITEM
  // ==================================================

  const renderMessage =
    ({
      item,
    }: any) => {

      const isMine =
        item.sender_id ===
        userId;


      return (

        <View
          style={[
            styles.messageContainer,

            isMine
              ? styles.myMessageContainer
              : styles.driverMessageContainer,
          ]}
        >

          <View
            style={[
              styles.messageBubble,

              isMine
                ? styles.myMessage
                : styles.driverMessage,
            ]}
          >

            <Text
              style={[
                styles.messageText,

                isMine &&
                  styles.myMessageText,
              ]}
            >
              {
                item.message
              }
            </Text>

          </View>

        </View>

      );

    };


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (

      <View
        style={
          styles.loadingContainer
        }
      >

        <ActivityIndicator
          size="large"
          color={
            Colors.rider
          }
        />

      </View>

    );

  }


  // ==================================================
  // SCREEN
  // ==================================================

  return (

    <KeyboardAvoidingView
      style={
        styles.container
      }

      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <View
        style={
          styles.header
        }
      >

        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }

          style={
            styles.backButtonContainer
          }

          activeOpacity={
            0.7
          }
        >

          <Ionicons
            name="arrow-back"
            size={24}
            color={
              Colors.rider
            }
          />

        </TouchableOpacity>


        <View
          style={
            styles.headerDriverIcon
          }
        >

          <Ionicons
            name="person-outline"
            size={20}
            color={
              Colors.rider
            }
          />

        </View>


        <View
          style={
            styles.headerTextContainer
          }
        >

          <Text
            style={
              styles.headerTitle
            }
          >
            {
              driverName
            }
          </Text>


          <Text
            style={
              styles.headerSubtitle
            }
          >
            Driver
          </Text>

        </View>

      </View>


      {/* ==================================================
          MESSAGES
      ================================================== */}

      <FlatList
        data={
          messages
        }

        keyExtractor={
          (item) =>
            item.id.toString()
        }

        renderItem={
          renderMessage
        }

        contentContainerStyle={
          styles.messagesList
        }

        showsVerticalScrollIndicator={
          false
        }

        ListEmptyComponent={

          <View
            style={
              styles.emptyContainer
            }
          >

            <View
              style={
                styles.emptyIcon
              }
            >

              <Ionicons
                name="chatbubble-outline"
                size={30}
                color={
                  Colors.rider
                }
              />

            </View>


            <Text
              style={
                styles.emptyTitle
              }
            >
              No messages yet
            </Text>


            <Text
              style={
                styles.emptyText
              }
            >
              Start a private conversation with your driver.
            </Text>

          </View>

        }

      />


      {/* ==================================================
          MESSAGE INPUT
      ================================================== */}

      <View
        style={
          styles.inputContainer
        }
      >

        <TextInput
          style={
            styles.input
          }

          placeholder="Type a message..."

          placeholderTextColor={
            Colors.textSecondary
          }

          value={
            newMessage
          }

          onChangeText={
            setNewMessage
          }

          multiline
        />


        <TouchableOpacity
          style={
            styles.sendButton
          }

          onPress={
            sendMessage
          }

          activeOpacity={
            0.8
          }
        >

          <Ionicons
            name="send"
            size={19}
            color={
              Colors.white
            }
          />

        </TouchableOpacity>

      </View>

    </KeyboardAvoidingView>

  );

}


// ==================================================
// STYLES
// ==================================================

const styles =
  StyleSheet.create({

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


    // ==================================================
    // HEADER
    // ==================================================

    header: {
      height: 90,
      backgroundColor:
        Colors.white,
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal: 16,
      paddingTop: 20,
      borderBottomWidth: 1,
      borderBottomColor:
        "#E5E5E5",
    },


    backButtonContainer: {
      width: 40,
      height: 40,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 8,
    },


    headerDriverIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        Colors.riderLight,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 11,
    },


    headerTextContainer: {
      flex: 1,
    },


    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color:
        Colors.textPrimary,
    },


    headerSubtitle: {
      fontSize: 13,
      color:
        Colors.textSecondary,
      marginTop: 2,
    },


    // ==================================================
    // MESSAGES
    // ==================================================

    messagesList: {
      padding: 15,
      flexGrow: 1,
      justifyContent:
        "flex-end",
    },


    messageContainer: {
      width: "100%",
      marginVertical: 5,
    },


    myMessageContainer: {
      alignItems:
        "flex-end",
    },


    driverMessageContainer: {
      alignItems:
        "flex-start",
    },


    messageBubble: {
      maxWidth: "78%",
      paddingHorizontal: 15,
      paddingVertical: 11,
      borderRadius: 18,
    },


    myMessage: {
      backgroundColor:
        Colors.rider,
      borderBottomRightRadius: 5,
    },


    driverMessage: {
      backgroundColor:
        "#E3E8ED",
      borderBottomLeftRadius: 5,
    },


    messageText: {
      fontSize: 15,
      color:
        Colors.textPrimary,
    },


    myMessageText: {
      color:
        Colors.white,
    },


    // ==================================================
    // EMPTY STATE
    // ==================================================

    emptyContainer: {
      alignItems:
        "center",
      justifyContent:
        "center",
      padding: 30,
    },


    emptyIcon: {
      width: 65,
      height: 65,
      borderRadius: 33,
      backgroundColor:
        Colors.riderLight,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginBottom: 12,
    },


    emptyTitle: {
      fontSize: 17,
      fontWeight: "600",
      color:
        Colors.textPrimary,
      marginBottom: 5,
    },


    emptyText: {
      fontSize: 14,
      color:
        Colors.textSecondary,
      textAlign:
        "center",
      lineHeight: 20,
    },


    // ==================================================
    // INPUT
    // ==================================================

    inputContainer: {
      flexDirection:
        "row",
      alignItems:
        "flex-end",
      backgroundColor:
        Colors.white,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor:
        "#E5E5E5",
    },


    input: {
      flex: 1,
      backgroundColor:
        Colors.background,
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      maxHeight: 100,
      fontSize: 15,
      color:
        Colors.textPrimary,
    },


    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor:
        Colors.rider,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginLeft: 8,
    },

  });