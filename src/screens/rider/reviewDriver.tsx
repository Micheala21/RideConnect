import React, {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import Colors from "../../constants/colors";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import {
  getReviewContext,
  submitRideReview,
  ReviewContext,
} from "../../services/reviewService";


// =====================================================
// NAVIGATION
// =====================================================

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    "ReviewDriver"
  >;


// =====================================================
// SCREEN
// =====================================================

function ReviewDriverScreen({
  navigation,
  route,
}: Props) {

  // ===================================================
  // RIDE ID
  // ===================================================

  const {
    rideId,
  } = route.params;


  // ===================================================
  // REVIEW CONTEXT
  // ===================================================

  const [
    reviewContext,
    setReviewContext,
  ] = useState<ReviewContext | null>(
    null,
  );


  // ===================================================
  // LOADING
  // ===================================================

  const [
    loading,
    setLoading,
  ] = useState(true);


  // ===================================================
  // SUBMITTING
  // ===================================================

  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  // ===================================================
  // RATING
  // ===================================================

  const [
    rating,
    setRating,
  ] = useState(0);


  // ===================================================
  // REVIEW
  // ===================================================

  const [
    reviewText,
    setReviewText,
  ] = useState("");


  // ===================================================
  // LOAD REVIEW CONTEXT
  // ===================================================

  useEffect(() => {

    loadReviewContext();

  }, [rideId]);


  const loadReviewContext =
    async () => {

      try {

        setLoading(true);


        const context =
          await getReviewContext(
            rideId,
          );


        setReviewContext(
          context,
        );


        // =============================================
        // EXISTING REVIEW
        // =============================================

        if (
          context.existingReview
        ) {

          setRating(
            context.existingReview.rating,
          );

          setReviewText(
            context.existingReview.review ||
              "",
          );

        }


      } catch (error) {

        console.error(
          "Review context error:",
          error,
        );


        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "Could not load the review.",
          [
            {
              text: "Go Back",
              onPress: () =>
                navigation.goBack(),
            },
          ],
        );


      } finally {

        setLoading(false);

      }

    };


  // ===================================================
  // SUBMIT REVIEW
  // ===================================================

  const handleSubmit =
    async () => {

      // ===============================================
      // CHECK RATING
      // ===============================================

      if (rating === 0) {

        Alert.alert(
          "Rating Required",
          "Please select a rating from 1 to 5 stars.",
        );

        return;

      }


      // ===============================================
      // CHECK EXISTING REVIEW
      // ===============================================

      if (
        reviewContext?.existingReview
      ) {

        Alert.alert(
          "Already Reviewed",
          "You have already reviewed this ride.",
        );

        return;

      }


      try {

        setSubmitting(true);


        await submitRideReview(
          rideId,
          rating,
          reviewText,
        );


        Alert.alert(
          "Review Submitted",
          "Thank you for reviewing your driver!",
          [
            {
              text: "Done",

              onPress: () => {

                navigation.goBack();

              },

            },
          ],
        );


      } catch (error) {

        console.error(
          "Submit review error:",
          error,
        );


        Alert.alert(
          "Could Not Submit Review",
          error instanceof Error
            ? error.message
            : "Something went wrong while submitting your review.",
        );


      } finally {

        setSubmitting(false);

      }

    };


  // ===================================================
  // LOADING SCREEN
  // ===================================================

  if (loading) {

    return (

      <SafeAreaView
        style={styles.container}
      >

        <View
          style={styles.loadingContainer}
        >

          <ActivityIndicator
            size="large"
            color={Colors.primary}
          />

          <Text
            style={styles.loadingText}
          >
            Loading review...
          </Text>

        </View>

      </SafeAreaView>

    );

  }


  // ===================================================
  // DRIVER NAME
  // ===================================================

  const driverName =
    reviewContext?.driverName ||
    "your driver";


  // ===================================================
  // EXISTING REVIEW
  // ===================================================

  const alreadyReviewed =
    !!reviewContext?.existingReview;


  // ===================================================
  // MAIN SCREEN
  // ===================================================

  return (

    <SafeAreaView
      style={styles.container}
    >

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >

        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* =========================================
              HEADER
          ========================================= */}

          <View
            style={styles.header}
          >

            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                navigation.goBack()
              }
              activeOpacity={0.8}
            >

              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors.textPrimary}
              />

            </TouchableOpacity>


            <Text
              style={styles.headerTitle}
            >
              Review Driver
            </Text>


            <View
              style={styles.headerSpacer}
            />

          </View>


          {/* =========================================
              DRIVER ICON
          ========================================= */}

          <View
            style={styles.driverIcon}
          >

            <Ionicons
              name="person"
              size={38}
              color={Colors.primary}
            />

          </View>


          {/* =========================================
              TITLE
          ========================================= */}

          <Text
            style={styles.title}
          >
            How was your ride?
          </Text>


          <Text
            style={styles.subtitle}
          >
            Rate your experience with{" "}
            <Text
              style={styles.driverName}
            >
              {driverName}
            </Text>
          </Text>


          {/* =========================================
              STAR RATING
          ========================================= */}

          <View
            style={styles.ratingContainer}
          >

            <Text
              style={styles.ratingLabel}
            >
              Your Rating
            </Text>


            <View
              style={styles.starsContainer}
            >

              {[1, 2, 3, 4, 5].map(
                star => (

                  <TouchableOpacity
                    key={star}
                    onPress={() =>
                      setRating(star)
                    }
                    disabled={
                      alreadyReviewed ||
                      submitting
                    }
                    activeOpacity={0.7}
                    style={styles.starButton}
                  >

                    <Ionicons
                      name={
                        star <= rating
                          ? "star"
                          : "star-outline"
                      }
                      size={42}
                      color={
                        star <= rating
                          ? "#F5B301"
                          : "#CFCFCF"
                      }
                    />

                  </TouchableOpacity>

                ),
              )}

            </View>


            {rating > 0 && (

              <Text
                style={styles.ratingText}
              >
                {rating === 1 &&
                  "Very Poor"}

                {rating === 2 &&
                  "Poor"}

                {rating === 3 &&
                  "Average"}

                {rating === 4 &&
                  "Good"}

                {rating === 5 &&
                  "Excellent"}

              </Text>

            )}

          </View>


          {/* =========================================
              COMMENT
          ========================================= */}

          <View
            style={styles.commentSection}
          >

            <Text
              style={styles.commentLabel}
            >
              Comment
            </Text>


            <Text
              style={styles.commentHint}
            >
              Tell us about your experience.
            </Text>


            <TextInput
              style={styles.commentInput}
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Write your review..."
              placeholderTextColor={
                Colors.textSecondary
              }
              multiline
              numberOfLines={5}
              maxLength={500}
              editable={
                !alreadyReviewed &&
                !submitting
              }
              textAlignVertical="top"
            />


            <Text
              style={styles.characterCount}
            >
              {reviewText.length}/500
            </Text>

          </View>


          {/* =========================================
              EXISTING REVIEW MESSAGE
          ========================================= */}

          {alreadyReviewed && (

            <View
              style={styles.alreadyReviewedBox}
            >

              <Ionicons
                name="checkmark-circle"
                size={22}
                color={Colors.primary}
              />

              <Text
                style={styles.alreadyReviewedText}
              >
                You have already reviewed this ride.
              </Text>

            </View>

          )}


          {/* =========================================
              SUBMIT BUTTON
          ========================================= */}

          {!alreadyReviewed && (

            <TouchableOpacity
              style={[
                styles.submitButton,
                submitting &&
                  styles.submitButtonDisabled,
              ]}
              onPress={
                handleSubmit
              }
              disabled={
                submitting
              }
              activeOpacity={0.8}
            >

              {submitting ? (

                <ActivityIndicator
                  size="small"
                  color={Colors.white}
                />

              ) : (

                <>

                  <Ionicons
                    name="star"
                    size={20}
                    color={Colors.white}
                  />

                  <Text
                    style={styles.submitButtonText}
                  >
                    Submit Review
                  </Text>

                </>

              )}

            </TouchableOpacity>

          )}


          {/* =========================================
              CANCEL
          ========================================= */}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() =>
              navigation.goBack()
            }
            disabled={submitting}
            activeOpacity={0.8}
          >

            <Text
              style={styles.cancelButtonText}
            >
              {alreadyReviewed
                ? "Go Back"
                : "Cancel"}
            </Text>

          </TouchableOpacity>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>

  );

}


// =====================================================
// DEFAULT EXPORT
// =====================================================

export default ReviewDriverScreen;


// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    // =================================================
    // CONTAINER
    // =================================================

    container: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },


    keyboardContainer: {
      flex: 1,
    },


    scrollContent: {
      paddingHorizontal: 22,

      paddingBottom: 35,
    },


    // =================================================
    // HEADER
    // =================================================

    header: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      paddingTop: 15,

      paddingBottom: 20,
    },


    backButton: {
      width: 44,
      height: 44,

      borderRadius: 22,

      backgroundColor:
        Colors.white,

      alignItems: "center",
      justifyContent: "center",

      elevation: 3,

      shadowOpacity: 0.1,

      shadowRadius: 4,

      shadowOffset: {
        width: 0,
        height: 2,
      },
    },


    headerTitle: {
      fontSize: 19,

      fontWeight: "700",

      color:
        Colors.textPrimary,
    },


    headerSpacer: {
      width: 44,
    },


    // =================================================
    // DRIVER ICON
    // =================================================

    driverIcon: {
      width: 80,
      height: 80,

      borderRadius: 40,

      backgroundColor:
        "#F1F1F1",

      alignSelf: "center",

      alignItems: "center",
      justifyContent: "center",

      marginTop: 15,

      marginBottom: 18,
    },


    // =================================================
    // TITLE
    // =================================================

    title: {
      fontSize: 26,

      fontWeight: "700",

      color:
        Colors.textPrimary,

      textAlign: "center",
    },


    subtitle: {
      fontSize: 15,

      color:
        Colors.textSecondary,

      textAlign: "center",

      lineHeight: 21,

      marginTop: 8,

      paddingHorizontal: 10,
    },


    driverName: {
      fontWeight: "700",

      color:
        Colors.textPrimary,
    },


    // =================================================
    // RATING
    // =================================================

    ratingContainer: {
      backgroundColor:
        Colors.white,

      borderRadius: 18,

      paddingVertical: 20,

      paddingHorizontal: 15,

      marginTop: 25,

      alignItems: "center",

      elevation: 2,

      shadowOpacity: 0.08,

      shadowRadius: 5,

      shadowOffset: {
        width: 0,
        height: 2,
      },
    },


    ratingLabel: {
      fontSize: 15,

      fontWeight: "700",

      color:
        Colors.textPrimary,

      marginBottom: 13,
    },


    starsContainer: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",
    },


    starButton: {
      paddingHorizontal: 3,
    },


    ratingText: {
      fontSize: 14,

      fontWeight: "600",

      color:
        Colors.primary,

      marginTop: 8,
    },


    // =================================================
    // COMMENT
    // =================================================

    commentSection: {
      marginTop: 22,
    },


    commentLabel: {
      fontSize: 16,

      fontWeight: "700",

      color:
        Colors.textPrimary,
    },


    commentHint: {
      fontSize: 13,

      color:
        Colors.textSecondary,

      marginTop: 4,

      marginBottom: 10,
    },


    commentInput: {
      minHeight: 130,

      backgroundColor:
        Colors.white,

      borderWidth: 1,

      borderColor:
        "#DDDDDD",

      borderRadius: 15,

      paddingHorizontal: 15,

      paddingTop: 14,

      paddingBottom: 14,

      fontSize: 14,

      color:
        Colors.textPrimary,
    },


    characterCount: {
      fontSize: 11,

      color:
        Colors.textSecondary,

      textAlign: "right",

      marginTop: 5,
    },


    // =================================================
    // ALREADY REVIEWED
    // =================================================

    alreadyReviewedBox: {
      flexDirection: "row",

      alignItems: "center",

      backgroundColor:
        "#F1F8F2",

      borderRadius: 13,

      paddingHorizontal: 14,

      paddingVertical: 13,

      marginTop: 20,
    },


    alreadyReviewedText: {
      flex: 1,

      fontSize: 13,

      color:
        Colors.textPrimary,

      marginLeft: 9,

      lineHeight: 19,
    },


    // =================================================
    // SUBMIT BUTTON
    // =================================================

    submitButton: {
      height: 52,

      borderRadius: 14,

      backgroundColor:
        Colors.primary,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      marginTop: 25,
    },


    submitButtonDisabled: {
      opacity: 0.7,
    },


    submitButtonText: {
      fontSize: 15,

      fontWeight: "700",

      color:
        Colors.white,

      marginLeft: 8,
    },


    // =================================================
    // CANCEL
    // =================================================

    cancelButton: {
      alignItems: "center",

      justifyContent: "center",

      paddingVertical: 15,

      marginTop: 5,
    },


    cancelButtonText: {
      fontSize: 14,

      fontWeight: "600",

      color:
        Colors.textSecondary,
    },


    // =================================================
    // LOADING
    // =================================================

    loadingContainer: {
      flex: 1,

      alignItems: "center",

      justifyContent: "center",
    },


    loadingText: {
      marginTop: 12,

      fontSize: 15,

      color:
        Colors.textSecondary,
    },

  });