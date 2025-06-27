import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Card from "@/components/ui/Card";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useRTLStyles } from "@/hooks/useRTLStyles";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTranslation } from "@/hooks/useTranslation";
import { normalize } from "@/utils/normalize";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock student data (in real app, this would come from API/database)
const mockStudentData = {
  id: "1",
  firstName: "Ahmed",
  lastName: "Hassan",
  grade: "Grade 2",
  parentName: "Mohammed Hassan",
  parentPhone: "+966 50 123 4567",
  parentEmail: "mohammed.hassan@email.com",
  address: "123 Al-Riyadh Street, Riyadh, Saudi Arabia",
};

export default function AdminStudentsEdit() {
  const router = useRouter();
  const { t } = useTranslation();
  const { rtlStyles } = useRTLStyles();
  const { id } = useLocalSearchParams();
  const surface = useThemeColor("surface");
  const textPrimary = useThemeColor("textPrimary");
  const textSecondary = useThemeColor("textSecondary");
  const error = useThemeColor("error");
  const border = useThemeColor("border");
  const accentOrange = useThemeColor("accentOrange");

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading student data
    setTimeout(() => {
      setFormData(mockStudentData);
      setIsLoading(false);
    }, 500);
  }, [id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t("admin.students.validation.firstNameRequired");
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t("admin.students.validation.lastNameRequired");
    }

    if (!formData.grade.trim()) {
      newErrors.grade = t("admin.students.validation.gradeRequired");
    }

    if (!formData.parentName.trim()) {
      newErrors.parentName = t("admin.students.validation.parentNameRequired");
    }

    if (!formData.parentPhone.trim()) {
      newErrors.parentPhone = t(
        "admin.students.validation.parentPhoneRequired"
      );
    }

    if (
      formData.parentEmail.trim() &&
      !/\S+@\S+\.\S+/.test(formData.parentEmail)
    ) {
      newErrors.parentEmail = t("admin.students.validation.invalidEmail");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      Alert.alert("Success", t("admin.students.studentUpdatedSuccess"), [
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <Ionicons name="school" size={normalize(48)} color={accentOrange} />
          <ThemedText
            type="default"
            style={[
              styles.loadingText,
              { color: textSecondary },
              rtlStyles.textDirection,
            ]}
          >
            {t("admin.students.loadingStudentData")}
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={[styles.header, rtlStyles.row]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={normalize(24)}
              color={textPrimary}
            />
          </TouchableOpacity>
          <ThemedText
            type="subtitle"
            style={[styles.headerTitle, rtlStyles.textDirection]}
          >
            {t("admin.students.editStudent")}
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
            <ThemedView style={[styles.sectionHeader, rtlStyles.row]}>
              <Ionicons
                name="person"
                size={normalize(20)}
                color={accentOrange}
              />
              <ThemedText
                type="subtitle"
                style={[styles.sectionTitle, rtlStyles.textDirection]}
              >
                {t("admin.students.studentInformation")}
              </ThemedText>
            </ThemedView>

            <ThemedView style={[styles.inputRow, rtlStyles.row]}>
              <ThemedView
                style={[
                  styles.inputContainer,
                  { flex: 1, ...rtlStyles.marginEnd(normalize(8)) },
                ]}
              >
                <ThemedText
                  type="default"
                  style={[
                    styles.inputLabel,
                    { color: textSecondary },
                    rtlStyles.textDirection,
                  ]}
                >
                  {t("admin.students.fields.firstName")} *
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: surface,
                      color: textPrimary,
                      borderColor: errors.firstName ? error : border,
                    },
                    rtlStyles.textDirection,
                  ]}
                  placeholder={t("admin.students.placeholders.firstName")}
                  placeholderTextColor={textSecondary}
                  value={formData.firstName}
                  onChangeText={(value) =>
                    handleInputChange("firstName", value)
                  }
                />
                {errors.firstName && (
                  <ThemedText
                    type="default"
                    style={[
                      styles.errorText,
                      { color: error },
                      rtlStyles.textDirection,
                    ]}
                  >
                    {errors.firstName}
                  </ThemedText>
                )}
              </ThemedView>

              <ThemedView
                style={[
                  styles.inputContainer,
                  { flex: 1, ...rtlStyles.marginStart(normalize(8)) },
                ]}
              >
                <ThemedText
                  type="default"
                  style={[
                    styles.inputLabel,
                    { color: textSecondary },
                    rtlStyles.textDirection,
                  ]}
                >
                  {t("admin.students.fields.lastName")} *
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: surface,
                      color: textPrimary,
                      borderColor: errors.lastName ? error : border,
                    },
                    rtlStyles.textDirection,
                  ]}
                  placeholder={t("admin.students.placeholders.lastName")}
                  placeholderTextColor={textSecondary}
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange("lastName", value)}
                />
                {errors.lastName && (
                  <ThemedText
                    type="default"
                    style={[
                      styles.errorText,
                      { color: error },
                      rtlStyles.textDirection,
                    ]}
                  >
                    {errors.lastName}
                  </ThemedText>
                )}
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText
                type="default"
                style={[
                  styles.inputLabel,
                  { color: textSecondary },
                  rtlStyles.textDirection,
                ]}
              >
                {t("admin.students.fields.grade")} *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: surface,
                    color: textPrimary,
                    borderColor: errors.grade ? error : border,
                  },
                  rtlStyles.textDirection,
                ]}
                placeholder={t("admin.students.placeholders.grade")}
                placeholderTextColor={textSecondary}
                value={formData.grade}
                onChangeText={(value) => handleInputChange("grade", value)}
              />
              {errors.grade && (
                <ThemedText
                  type="default"
                  style={[
                    styles.errorText,
                    { color: error },
                    rtlStyles.textDirection,
                  ]}
                >
                  {errors.grade}
                </ThemedText>
              )}
            </ThemedView>
          </Card>

          {/* Parent Information Section */}
          <Card style={styles.section}>
            <ThemedView style={[styles.sectionHeader, rtlStyles.row]}>
              <Ionicons
                name="people"
                size={normalize(20)}
                color={accentOrange}
              />
              <ThemedText
                type="subtitle"
                style={[styles.sectionTitle, rtlStyles.textDirection]}
              >
                {t("admin.students.contactInformation")}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText
                type="default"
                style={[
                  styles.inputLabel,
                  { color: textSecondary },
                  rtlStyles.textDirection,
                ]}
              >
                {t("admin.students.fields.parentName")} *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: surface,
                    color: textPrimary,
                    borderColor: errors.parentName ? error : border,
                  },
                  rtlStyles.textDirection,
                ]}
                placeholder={t("admin.students.placeholders.parentName")}
                placeholderTextColor={textSecondary}
                value={formData.parentName}
                onChangeText={(value) => handleInputChange("parentName", value)}
              />
              {errors.parentName && (
                <ThemedText
                  type="default"
                  style={[
                    styles.errorText,
                    { color: error },
                    rtlStyles.textDirection,
                  ]}
                >
                  {errors.parentName}
                </ThemedText>
              )}
            </ThemedView>

            <ThemedView style={[styles.inputRow, rtlStyles.row]}>
              <ThemedView
                style={[
                  styles.inputContainer,
                  { flex: 1, ...rtlStyles.marginEnd(normalize(8)) },
                ]}
              >
                <ThemedText
                  type="default"
                  style={[
                    styles.inputLabel,
                    { color: textSecondary },
                    rtlStyles.textDirection,
                  ]}
                >
                  {t("admin.students.fields.parentPhone")} *
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: surface,
                      color: textPrimary,
                      borderColor: errors.parentPhone ? error : border,
                    },
                    rtlStyles.textDirection,
                  ]}
                  placeholder={t("admin.students.placeholders.parentPhone")}
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
                    style={[
                      styles.errorText,
                      { color: error },
                      rtlStyles.textDirection,
                    ]}
                  >
                    {errors.parentPhone}
                  </ThemedText>
                )}
              </ThemedView>

              <ThemedView
                style={[
                  styles.inputContainer,
                  { flex: 1, ...rtlStyles.marginStart(normalize(8)) },
                ]}
              >
                <ThemedText
                  type="default"
                  style={[
                    styles.inputLabel,
                    { color: textSecondary },
                    rtlStyles.textDirection,
                  ]}
                >
                  {t("admin.students.fields.parentEmail")}
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: surface,
                      color: textPrimary,
                      borderColor: errors.parentEmail ? error : border,
                    },
                    rtlStyles.textDirection,
                  ]}
                  placeholder={t("admin.students.placeholders.parentEmail")}
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
                    style={[
                      styles.errorText,
                      { color: error },
                      rtlStyles.textDirection,
                    ]}
                  >
                    {errors.parentEmail}
                  </ThemedText>
                )}
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText
                type="default"
                style={[
                  styles.inputLabel,
                  { color: textSecondary },
                  rtlStyles.textDirection,
                ]}
              >
                {t("admin.students.fields.address")}
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: surface,
                    color: textPrimary,
                    borderColor: border,
                  },
                  rtlStyles.textDirection,
                ]}
                placeholder={t("admin.students.placeholders.address")}
                placeholderTextColor={textSecondary}
                value={formData.address}
                onChangeText={(value) => handleInputChange("address", value)}
                multiline
                numberOfLines={3}
              />
            </ThemedView>
          </Card>

          {/* Submit Button */}
          <PrimaryButton
            title={t("common.save")}
            onPress={handleSubmit}
            style={styles.submitButton}
          />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: normalize(40),
  },
  loadingText: {
    marginTop: normalize(16),
    textAlign: "center",
  },
  header: {
    alignItems: "center",
    paddingHorizontal: normalize(20),
    paddingTop: normalize(20),
    paddingBottom: normalize(16),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: normalize(40),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: normalize(20),
    paddingBottom: normalize(100),
  },
  section: {
    marginBottom: normalize(24),
  },
  sectionHeader: {
    alignItems: "center",
    marginBottom: normalize(20),
  },
  sectionTitle: {
    marginLeft: normalize(12),
  },
  inputRow: {
    marginBottom: normalize(16),
  },
  inputContainer: {
    marginBottom: normalize(16),
  },
  inputLabel: {
    marginBottom: normalize(8),
    fontSize: normalize(14),
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
    fontSize: normalize(12),
    marginTop: normalize(4),
  },
  submitButton: {
    marginTop: normalize(16),
    marginBottom: normalize(32),
  },
});
