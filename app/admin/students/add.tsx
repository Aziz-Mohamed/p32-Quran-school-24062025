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
  age: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  emergencyContact: string;
  medicalInfo: string;
}

export default function AddStudentScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    age: "",
    grade: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    address: "",
    emergencyContact: "",
    medicalInfo: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const grades = [
    "Pre-K",
    "Kindergarten",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
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
    if (!formData.age.trim()) newErrors.age = "Age is required";
    if (!formData.grade.trim()) newErrors.grade = "Grade is required";
    if (!formData.parentName.trim())
      newErrors.parentName = "Parent name is required";
    if (!formData.parentPhone.trim())
      newErrors.parentPhone = "Parent phone is required";
    if (!formData.parentEmail.trim())
      newErrors.parentEmail = "Parent email is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.parentEmail && !emailRegex.test(formData.parentEmail)) {
      newErrors.parentEmail = "Please enter a valid email address";
    }

    // Age validation
    const age = parseInt(formData.age);
    if (formData.age && (isNaN(age) || age < 3 || age > 18)) {
      newErrors.age = "Age must be between 3 and 18";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Here you would typically save to your database
      Alert.alert("Success", "Student has been added successfully!", [
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
          multiline && {
            height: numberOfLines * normalize(24) + normalize(16),
          },
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={normalize(24)}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Add New Student
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Student Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="person"
              size={normalize(20)}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Student Information
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
                label="Age"
                value={formData.age}
                onChangeText={(text) => updateFormData("age", text)}
                placeholder="Enter age"
                error={errors.age}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <View style={styles.fieldContainer}>
                <Text
                  style={[styles.fieldLabel, { color: colors.textPrimary }]}
                >
                  Grade
                </Text>
                <View
                  style={[
                    styles.pickerContainer,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      {
                        color: formData.grade
                          ? colors.textPrimary
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {formData.grade || "Select grade"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={normalize(20)}
                    color={colors.textSecondary}
                  />
                </View>
                {errors.grade && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.grade}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Parent Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Parent Information
            </Text>
          </View>

          <FormField
            label="Parent/Guardian Name"
            value={formData.parentName}
            onChangeText={(text) => updateFormData("parentName", text)}
            placeholder="Enter parent name"
            error={errors.parentName}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <FormField
                label="Phone Number"
                value={formData.parentPhone}
                onChangeText={(text) => updateFormData("parentPhone", text)}
                placeholder="Enter phone number"
                error={errors.parentPhone}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.halfWidth}>
              <FormField
                label="Email Address"
                value={formData.parentEmail}
                onChangeText={(text) => updateFormData("parentEmail", text)}
                placeholder="Enter email address"
                error={errors.parentEmail}
                keyboardType="email-address"
              />
            </View>
          </View>

          <FormField
            label="Address"
            value={formData.address}
            onChangeText={(text) => updateFormData("address", text)}
            placeholder="Enter full address"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Additional Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="information-circle"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Additional Information
            </Text>
          </View>

          <FormField
            label="Emergency Contact"
            value={formData.emergencyContact}
            onChangeText={(text) => updateFormData("emergencyContact", text)}
            placeholder="Enter emergency contact details"
            multiline
            numberOfLines={2}
          />

          <FormField
            label="Medical Information"
            value={formData.medicalInfo}
            onChangeText={(text) => updateFormData("medicalInfo", text)}
            placeholder="Enter any medical conditions or allergies"
            multiline
            numberOfLines={3}
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
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>Add Student</Text>
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
    borderWidth: normalize(1) ,
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
