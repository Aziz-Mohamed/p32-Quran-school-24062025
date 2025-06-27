import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Card from "@/components/ui/Card";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { normalize } from "@/utils/normalize";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminStudentsAdd() {
  const router = useRouter();
  const surface = useThemeColor("surface");
  const textPrimary = useThemeColor("textPrimary");
  const textSecondary = useThemeColor("textSecondary");
  const error = useThemeColor("error");
  const border = useThemeColor("border");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    grade: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    address: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.grade.trim()) {
      newErrors.grade = "Grade is required";
    }

    if (!formData.parentName.trim()) {
      newErrors.parentName = "Parent name is required";
    }

    if (!formData.parentPhone.trim()) {
      newErrors.parentPhone = "Parent phone is required";
    }

    if (
      formData.parentEmail.trim() &&
      !/\S+@\S+\.\S+/.test(formData.parentEmail)
    ) {
      newErrors.parentEmail = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      Alert.alert("Success", "Student added successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={normalize(24)}
              color={textPrimary}
            />
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.headerTitle}>
            Add New Student
          </ThemedText>
          <ThemedView style={styles.placeholder} />
        </ThemedView>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Student Information Section */}
          <Card style={styles.section}>
            <ThemedView style={styles.sectionHeader}>
              <Ionicons
                name="person"
                size={normalize(20)}
                color={useThemeColor("accentOrange")}
              />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Student Information
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.inputRow}>
              <ThemedView
                style={[
                  styles.inputContainer,
                  { flex: 1, marginRight: normalize(8) },
                ]}
              >
                <ThemedText
                  type="default"
                  style={[styles.inputLabel, { color: textSecondary }]}
                >
                  First Name *
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: surface,
                      color: textPrimary,
                      borderColor: errors.firstName ? error : border,
                    },
                  ]}
                  placeholder="Enter first name"
                  placeholderTextColor={textSecondary}
                  value={formData.firstName}
                  onChangeText={(value) =>
                    handleInputChange("firstName", value)
                  }
                />
                {errors.firstName && (
                  <ThemedText
                    type="default"
                    style={[styles.errorText, { color: error }]}
                  >
                    {errors.firstName}
                  </ThemedText>
                )}
              </ThemedView>

              <ThemedView
                style={[
                  styles.inputContainer,
                  { flex: 1, marginLeft: normalize(8) },
                ]}
              >
                <ThemedText
                  type="default"
                  style={[styles.inputLabel, { color: textSecondary }]}
                >
                  Last Name *
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: surface,
                      color: textPrimary,
                      borderColor: errors.lastName ? error : border,
                    },
                  ]}
                  placeholder="Enter last name"
                  placeholderTextColor={textSecondary}
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange("lastName", value)}
                />
                {errors.lastName && (
                  <ThemedText
                    type="default"
                    style={[styles.errorText, { color: error }]}
                  >
                    {errors.lastName}
                  </ThemedText>
                )}
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText
                type="default"
                style={[styles.inputLabel, { color: textSecondary }]}
              >
                Grade *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: surface,
                    color: textPrimary,
                    borderColor: errors.grade ? error : border,
                  },
                ]}
                placeholder="e.g., Grade 2"
                placeholderTextColor={textSecondary}
                value={formData.grade}
                onChangeText={(value) => handleInputChange("grade", value)}
              />
              {errors.grade && (
                <ThemedText
                  type="default"
                  style={[styles.errorText, { color: error }]}
                >
                  {errors.grade}
                </ThemedText>
              )}
            </ThemedView>
          </Card>

          {/* Parent Information Section */}
          <Card style={styles.section}>
            <ThemedView style={styles.sectionHeader}>
              <Ionicons
                name="people"
                size={normalize(20)}
                color={useThemeColor("accentOrange")}
              />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Parent Information
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText
                type="default"
                style={[styles.inputLabel, { color: textSecondary }]}
              >
                Parent Name *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: surface,
                    color: textPrimary,
                    borderColor: errors.parentName ? error : border,
                  },
                ]}
                placeholder="Enter parent name"
                placeholderTextColor={textSecondary}
                value={formData.parentName}
                onChangeText={(value) => handleInputChange("parentName", value)}
              />
              {errors.parentName && (
                <ThemedText
                  type="default"
                  style={[styles.errorText, { color: error }]}
                >
                  {errors.parentName}
                </ThemedText>
              )}
            </ThemedView>

            <ThemedView style={styles.inputRow}>
              <ThemedView
                style={[
                  styles.inputContainer,
                  { flex: 1, marginRight: normalize(8) },
                ]}
              >
                <ThemedText
                  type="default"
                  style={[styles.inputLabel, { color: textSecondary }]}
                >
                  Phone Number *
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: surface,
                      color: textPrimary,
                      borderColor: errors.parentPhone ? error : border,
                    },
                  ]}
                  placeholder="Enter phone number"
                  placeholderTextColor={textSecondary}
                  value={formData.parentPhone}
                  onChangeText={(value) =>
                    handleInputChange("parentPhone", value)
                  }
                  keyboardType="phone-pad"
                />
                {errors.parentPhone && (
                  <ThemedText
                    type="default"
                    style={[styles.errorText, { color: error }]}
                  >
                    {errors.parentPhone}
                  </ThemedText>
                )}
              </ThemedView>

              <ThemedView
                style={[
                  styles.inputContainer,
                  { flex: 1, marginLeft: normalize(8) },
                ]}
              >
                <ThemedText
                  type="default"
                  style={[styles.inputLabel, { color: textSecondary }]}
                >
                  Email
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: surface,
                      color: textPrimary,
                      borderColor: errors.parentEmail ? error : border,
                    },
                  ]}
                  placeholder="Enter email"
                  placeholderTextColor={textSecondary}
                  value={formData.parentEmail}
                  onChangeText={(value) =>
                    handleInputChange("parentEmail", value)
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.parentEmail && (
                  <ThemedText
                    type="default"
                    style={[styles.errorText, { color: error }]}
                  >
                    {errors.parentEmail}
                  </ThemedText>
                )}
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText
                type="default"
                style={[styles.inputLabel, { color: textSecondary }]}
              >
                Address
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: surface,
                    color: textPrimary,
                    borderColor: border,
                  },
                ]}
                placeholder="Enter address"
                placeholderTextColor={textSecondary}
                value={formData.address}
                onChangeText={(value) => handleInputChange("address", value)}
                multiline
                numberOfLines={3}
              />
            </ThemedView>
          </Card>

          {/* Action Buttons */}
          <ThemedView style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: surface }]}
              onPress={handleBack}
            >
              <ThemedText
                type="defaultSemiBold"
                style={[styles.cancelButtonText, { color: textSecondary }]}
              >
                Cancel
              </ThemedText>
            </TouchableOpacity>

            <PrimaryButton
              title="Add Student"
              onPress={handleSubmit}
              style={styles.submitButton}
            />
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: normalize(20),
  },
  placeholder: {
    width: normalize(40),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: normalize(20),
    paddingBottom: normalize(40),
  },
  section: {
    marginBottom: normalize(24),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: normalize(20),
  },
  sectionTitle: {
    marginLeft: normalize(12),
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: normalize(16),
  },
  inputContainer: {
    marginBottom: normalize(16),
  },
  inputLabel: {
    marginBottom: normalize(8),
  },
  input: {
    borderWidth: 1,
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    fontSize: normalize(16),
    fontWeight: "400",
    fontFamily: "System",
  },
  errorText: {
    marginTop: normalize(4),
  },
  buttonContainer: {
    flexDirection: "row",
    gap: normalize(12),
    marginTop: normalize(20),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: normalize(16),
    borderRadius: normalize(12),
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: normalize(16),
  },
  submitButton: {
    flex: 2,
  },
});
