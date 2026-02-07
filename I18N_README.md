# 🌐 Internationalization (i18n) Implementation

This Quran School app supports multiple languages with a complete i18n setup using `i18next` and `react-i18next`.

## 📁 File Structure

```
├── constants/
│   └── i18n/
│       ├── locales/
│       │   ├── en.json          # English translations
│       │   └── ar.json          # Arabic translations
│       └── types.ts             # TypeScript type definitions
├── hooks/
│   ├── useI18n.ts              # i18n initialization
│   ├── useTranslation.ts       # Enhanced translation hook
│   ├── useRTL.ts               # RTL management
│   └── useRTLStyles.ts         # RTL styling utilities
└── components/
    ├── LanguageSwitcher.tsx    # Language toggle component
    └── I18nTest.tsx            # Test component for verification
```

## 🚀 Setup

The i18n system is automatically initialized in `app/_layout.tsx` and includes:

- **Automatic language detection** based on device locale
- **Fallback to English** if translation is missing
- **Support for English and Arabic** languages
- **Language switcher component** for manual language changes
- **TypeScript support** with type-safe translation keys
- **RTL support** for Arabic language with automatic layout switching

## 📝 Usage

### Basic Translation

```tsx
import { useTranslation } from "@/hooks/useTranslation";

function MyComponent() {
  const { t } = useTranslation();

  return <Text>{t("home.welcome")}</Text>;
}
```

### Language Switching

```tsx
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function SettingsScreen() {
  return (
    <View>
      <LanguageSwitcher />
    </View>
  );
}
```

### RTL Styling

```tsx
import { useRTLStyles } from "@/hooks/useRTLStyles";

function MyComponent() {
  const { isRTL, rtlStyles } = useRTLStyles();

  return (
    <View style={[styles.container, rtlStyles.row]}>
      <Text style={[styles.text, rtlStyles.textDirection]}>
        {t("common.loading")}
      </Text>
    </View>
  );
}
```

## 🌍 Available Translations

### Home Section

- `home.welcome` - Welcome message
- `home.title` - App title
- `home.subtitle` - App subtitle
- `home.getStarted` - Get started button
- `home.explore` - Explore button

### Navigation

- `navigation.home` - Home tab
- `navigation.explore` - Explore tab
- `navigation.lessons` - Lessons tab
- `navigation.profile` - Profile tab

### Common Actions

- `common.loading` - Loading text
- `common.error` - Error message
- `common.retry` - Retry button
- `common.cancel` - Cancel button
- `common.save` - Save button
- `common.delete` - Delete button
- `common.edit` - Edit button
- `common.close` - Close button
- `common.next` - Next button
- `common.previous` - Previous button
- `common.finish` - Finish button

### Lessons

- `lessons.title` - Lessons title
- `lessons.noLessons` - No lessons message
- `lessons.startLesson` - Start lesson button
- `lessons.continueLesson` - Continue lesson button
- `lessons.lessonComplete` - Lesson complete message
- `lessons.progress` - Progress text

### Settings

- `settings.title` - Settings title
- `settings.language` - Language setting
- `settings.theme` - Theme setting
- `settings.notifications` - Notifications setting
- `settings.about` - About section
- `settings.version` - Version text

### Authentication

- `auth.login` - Login text
- `auth.register` - Register text
- `auth.logout` - Logout text
- `auth.email` - Email field
- `auth.password` - Password field
- `auth.confirmPassword` - Confirm password field
- `auth.forgotPassword` - Forgot password link
- `auth.signIn` - Sign in button
- `auth.signUp` - Sign up button

### Admin Section

- `admin.students.*` - Complete student management translations
- `admin.students.fields.*` - Form field labels
- `admin.students.placeholders.*` - Input placeholders
- `admin.students.validation.*` - Validation messages
- `admin.students.metrics.*` - Performance metrics
- `admin.students.achievements.*` - Achievement descriptions

## 🔧 Adding New Languages

1. Create a new translation file in `constants/i18n/locales/` (e.g., `fr.json`)
2. Add the language to the resources in `hooks/useI18n.ts`:

```tsx
import fr from "../constants/i18n/locales/fr.json";

i18n.use(initReactI18next).init({
  // ... existing config
  resources: {
    en: { translation: en },
    ar: { translation: ar },
    fr: { translation: fr }, // Add new language
  },
  // ... rest of config
});
```

3. Update the `LanguageSwitcher` component to include the new language option
4. Update the TypeScript types in `constants/i18n/types.ts` if needed

## 🎯 Features

- ✅ **Automatic language detection** based on device locale
- ✅ **Manual language switching** with UI component
- ✅ **Fallback language** (English) for missing translations
- ✅ **Type-safe translations** with TypeScript support
- ✅ **RTL support** for Arabic language with automatic layout switching
- ✅ **Error handling** for missing translation keys
- ✅ **Language persistence** using AsyncStorage
- ✅ **Easy to extend** for additional languages

## 🧪 Testing

To test the i18n functionality:

1. Run the app: `npm start`
2. Navigate to any screen that uses translations
3. Use the `I18nTest` component to verify translations are working
4. Use the language switcher to toggle between English and Arabic
5. Observe how all text changes dynamically and RTL layout is applied

The app will automatically detect your device's language on first launch and set the appropriate language.

## 🔍 Troubleshooting

### Common Issues:

1. **Translations not showing**: Make sure `useI18n` is imported in `app/_layout.tsx`
2. **RTL not working**: Check that `expo-updates` is properly configured
3. **Type errors**: Ensure you're using the correct translation keys from the types file

### Debug Mode:

Enable debug mode in development by setting `debug: __DEV__` in the i18n configuration (already enabled).

## 📚 Dependencies

- `i18next` (v25.2.1) - Core i18n library
- `react-i18next` (v15.5.3) - React integration
- `expo-localization` (v16.1.5) - Device locale detection
- `@react-native-async-storage/async-storage` (v2.2.0) - Language persistence
