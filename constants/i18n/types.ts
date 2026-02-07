// Type definitions for i18n translations
export interface TranslationKeys {
  home: {
    welcome: string;
    title: string;
    subtitle: string;
    getStarted: string;
    explore: string;
    selectRole: string;
  };
  navigation: {
    home: string;
    explore: string;
    lessons: string;
    profile: string;
    student: string;
    teacher: string;
    parent: string;
    admin: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    next: string;
    previous: string;
    finish: string;
    back: string;
    add: string;
    search: string;
    noResults: string;
    tryAdjustingSearch: string;
    required: string;
  };
  lessons: {
    title: string;
    noLessons: string;
    startLesson: string;
    continueLesson: string;
    lessonComplete: string;
    progress: string;
  };
  settings: {
    title: string;
    language: string;
    theme: string;
    notifications: string;
    about: string;
    version: string;
  };
  auth: {
    login: string;
    register: string;
    logout: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    signIn: string;
    signUp: string;
  };
  admin: {
    students: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
      noStudentsFound: string;
      addFirstStudent: string;
      addNewStudent: string;
      editStudent: string;
      studentDetails: string;
      studentInformation: string;
      contactInformation: string;
      trophyCabinet: string;
      loadingStudentData: string;
      studentAddedSuccess: string;
      studentUpdatedSuccess: string;
      fields: {
        firstName: string;
        lastName: string;
        grade: string;
        parentName: string;
        parentPhone: string;
        parentEmail: string;
        address: string;
        joinDate: string;
      };
      placeholders: {
        firstName: string;
        lastName: string;
        grade: string;
        parentName: string;
        parentPhone: string;
        parentEmail: string;
        address: string;
      };
      validation: {
        firstNameRequired: string;
        lastNameRequired: string;
        gradeRequired: string;
        parentNameRequired: string;
        parentPhoneRequired: string;
        invalidEmail: string;
      };
      metrics: {
        attendance: string;
        recitingRate: string;
        trophies: string;
      };
      achievements: {
        firstLesson: string;
        firstLessonDesc: string;
        perfectAttendance: string;
        perfectAttendanceDesc: string;
        fastLearner: string;
        fastLearnerDesc: string;
      };
    };
  };
}

// Helper type for nested translation keys
export type NestedKeyOf<T> = {
  [K in keyof T & (string | number)]: T[K] extends object
    ? `${K}.${NestedKeyOf<T[K]>}`
    : `${K}`;
}[keyof T & (string | number)];
