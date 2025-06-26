import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { normalize } from "@/utils/normalize";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  experience: string;
  education: string;
  address: string;
  emergencyContact: string;
  bio: string;
}

export default function AddTeacherScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    experience: "",
    education: "",
    address: "",
    emergencyContact: "",
    bio: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const subjects = [
    "Quran Studies",
    "Islamic Studies",
    "Arabic Language",
    "Tajweed",
    "Islamic History",
    "Islamic Ethics",
    "Hadith Studies",
    "Fiqh (Islamic Jurisprudence)",
  ];

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.experience.trim())
      newErrors.experience = "Experience is required";
    if (!formData.education.trim())
      newErrors.education = "Education is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Experience validation
    const experience = parseInt(formData.experience);
    if (
      formData.experience &&
      (isNaN(experience) || experience < 0 || experience > 50)
    ) {
      newErrors.experience = "Experience must be between 0 and 50 years";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Here you would typically save to your database
      Alert.alert("Success", "Teacher has been added successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    }
  };

  const FormField: React.FC<{
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    error?: string;
    keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
    multiline?: boolean;
    numberOfLines?: number;
  }> = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    keyboardType = "default",
    multiline = false,
    numberOfLines = 1,
  }) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.textInput,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
            color: colors.textPrimary,
          },
          multiline && { height: numberOfLines * 24 + 16 },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: colors.primaryBackground }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Add New Teacher
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color={colors.accentOrange} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Personal Information
            </Text>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <FormField
                label="First Name"
                value={formData.firstName}
                onChangeText={(text) => updateFormData("firstName", text)}
                placeholder="Enter first name"
                error={errors.firstName}
              />
            </View>
            <View style={styles.halfWidth}>
              <FormField
                label="Last Name"
                value={formData.lastName}
                onChangeText={(text) => updateFormData("lastName", text)}
                placeholder="Enter last name"
                error={errors.lastName}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <FormField
                label="Email Address"
                value={formData.email}
                onChangeText={(text) => updateFormData("email", text)}
                placeholder="Enter email address"
                error={errors.email}
                keyboardType="email-address"
              />
            </View>
            <View style={styles.halfWidth}>
              <FormField
                label="Phone Number"
                value={formData.phone}
                onChangeText={(text) => updateFormData("phone", text)}
                placeholder="Enter phone number"
                error={errors.phone}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Professional Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="school" size={20} color={colors.accentOrange} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Professional Information
            </Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
              Subject
            </Text>
            <View
              style={[
                styles.pickerContainer,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.pickerText,
                  {
                    color: formData.subject
                      ? colors.textPrimary
                      : colors.textSecondary,
                  },
                ]}
              >
                {formData.subject || "Select subject"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.textSecondary}
              />
            </View>
            {errors.subject && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.subject}
              </Text>
            )}
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <FormField
                label="Years of Experience"
                value={formData.experience}
                onChangeText={(text) => updateFormData("experience", text)}
                placeholder="Enter years of experience"
                error={errors.experience}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <FormField
                label="Education Level"
                value={formData.education}
                onChangeText={(text) => updateFormData("education", text)}
                placeholder="e.g., Bachelor's, Master's"
                error={errors.education}
              />
            </View>
          </View>
        </View>

        {/* Contact Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color={colors.accentOrange} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Contact Information
            </Text>
          </View>

          <FormField
            label="Address"
            value={formData.address}
            onChangeText={(text) => updateFormData("address", text)}
            placeholder="Enter full address"
            multiline
            numberOfLines={3}
          />

          <FormField
            label="Emergency Contact"
            value={formData.emergencyContact}
            onChangeText={(text) => updateFormData("emergencyContact", text)}
            placeholder="Enter emergency contact details"
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Additional Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="information-circle"
              size={20}
              color={colors.accentOrange}
            />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Additional Information
            </Text>
          </View>

          <FormField
            label="Bio/About"
            value={formData.bio}
            onChangeText={(text) => updateFormData("bio", text)}
            placeholder="Tell us about the teacher's background, qualifications, and teaching philosophy"
            multiline
            numberOfLines={4}
          />
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View
        style={[
          styles.footer,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.accentOrange },
          ]}
          onPress={handleSubmit}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>Add Teacher</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingHorizontal: normalize(24),
    paddingVertical: normalize(16),
    borderBottomWidth: normalize(1),
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: normalize(8),
  },
  title: {
    fontSize: normalize(20),
    fontWeight: "600",
  },
  placeholder: {
    width: normalize(40),
  },
  content: {
    flex: 1,
    padding: normalize(24),
  },
  section: {
    marginBottom: normalize(32),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: normalize(20),
  },
  sectionTitle: {
    fontSize: normalize(18),
    fontWeight: "600",
    marginLeft: normalize(12),
  },
  row: {
    flexDirection: "row",
    gap: normalize(16),
  },
  halfWidth: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: normalize(20),
  },
  fieldLabel: {
    fontSize: normalize(14),
    fontWeight: "600",
    marginBottom: normalize(8),
  },
  textInput: {
    borderWidth: normalize(1),
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    fontSize: normalize(16),
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: normalize(1),
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
  },
  pickerText: {
    fontSize: normalize(16),
  },
  errorText: {
    fontSize: normalize(12),
    marginTop: normalize(4),
  },
  footer: {
    padding: normalize(24),
    borderTopWidth: normalize(1),
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: normalize(16),
    borderRadius: normalize(12),
    gap: normalize(8),
  },
  submitButtonText: {
    color: "#fff",
    fontSize: normalize(16),
    fontWeight: "600",
  },
});
