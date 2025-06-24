# 🌐 Internationalization (i18n) Implementation

This Quran School app now supports multiple languages with a complete i18n setup using `i18next` and `react-i18next`.

## 📁 File Structure

```
├── constants/
│   └── i18n/
│       └── locales/
│           ├── en.json          # English translations
│           └── ar.json          # Arabic translations
├── hooks/
│   ├── useI18n.ts              # i18n initialization
│   └── useTranslation.ts       # Translation hook wrapper
└── components/
    ├── LanguageSwitcher.tsx    # Language toggle component
    └── I18nExample.tsx         # Example usage component
```

## 🚀 Setup

The i18n system is automatically initialized in `app/_layout.tsx` and includes:

- **Automatic language detection** based on device locale
- **Fallback to English** if translation is missing
- **Support for English and Arabic** languages
- **Language switcher component** for manual language changes

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

## 🎯 Features

- ✅ **Automatic language detection** based on device locale
- ✅ **Manual language switching** with UI component
- ✅ **Fallback language** (English) for missing translations
- ✅ **Type-safe translations** with JSON structure
- ✅ **RTL support** for Arabic language
- ✅ **Easy to extend** for additional languages

## 🧪 Testing

To test the i18n functionality:

1. Run the app: `npm start`
2. Navigate to the "Explore" tab
3. Find the "🌐 Internationalization (i18n)" section
4. Use the language switcher to toggle between English and Arabic
5. Observe how all text changes dynamically

The app will automatically detect your device's language on first launch and set the appropriate language.
