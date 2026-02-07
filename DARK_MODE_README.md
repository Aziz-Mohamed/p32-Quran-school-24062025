# 🌒 Dark Mode Implementation Guide

Your app now supports automatic dark mode that follows the user's device settings! Here's how to use it:

## ✅ What's Already Implemented

1. **`hooks/useColorScheme.ts`** - Automatically detects device theme
2. **`hooks/useThemeColor.ts`** - Connects to your color system
3. **`components/ThemedText.tsx`** - Auto-themed text component
4. **`components/ThemedView.tsx`** - Auto-themed view component
5. **`constants/Colors.ts`** - Complete light/dark color palette

## 🎨 How to Use Dark Mode

### Basic Usage in Components

```tsx
import { useThemeColor } from "@/hooks/useThemeColor";

export default function MyComponent() {
  const backgroundColor = useThemeColor("surface");
  const textColor = useThemeColor("textPrimary");
  const primaryColor = useThemeColor("primary");

  return (
    <View style={{ backgroundColor, padding: 16 }}>
      <Text style={{ color: textColor }}>Hello, Dark Mode!</Text>
      <TouchableOpacity style={{ backgroundColor: primaryColor }}>
        <Text style={{ color: "#FFFFFF" }}>Button</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Using Themed Components

```tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function MyComponent() {
  return (
    <ThemedView style={{ padding: 16 }}>
      <ThemedText type="title">Welcome!</ThemedText>
      <ThemedText type="subtitle">This is auto-themed</ThemedText>
      <ThemedText>Regular text that adapts to theme</ThemedText>
    </ThemedView>
  );
}
```

## 🎯 Available Color Keys

Use these keys with `useThemeColor()`:

- `primary` - Main brand color
- `secondary` - Secondary brand color
- `accent` - Accent/highlight color
- `background` - Main background
- `surface` - Card/surface background
- `textPrimary` - Primary text color
- `textSecondary` - Secondary text color
- `success` - Success state color
- `warning` - Warning state color
- `error` - Error state color
- `border` - Border color
- `card` - Card background color

## 🔧 Testing Dark Mode

### On Device/Simulator

1. **iOS**: Settings → Display & Brightness → Dark
2. **Android**: Settings → Display → Dark theme
3. **Expo Go**: Shake device → Toggle appearance

### Development Override (Optional)

If you want to force a specific theme during development, modify `useThemeColor.ts`:

```tsx
export function useThemeColor(colorName: keyof typeof Colors.light) {
  // Force theme override during development
  const theme = "dark"; // or 'light'
  return Colors[theme][colorName];
}
```

## 📱 Demo Component

Check out `components/DarkModeDemo.tsx` for a complete example showing:

- How to use themed components
- Color palette preview
- Interactive elements
- Best practices

## 🎨 Color System

Your `constants/Colors.ts` includes:

**Light Mode:**

- Clean, bright interface
- Dark text on light backgrounds
- Emerald green primary (#1D976C)

**Dark Mode:**

- True black background (#121212)
- Light text on dark backgrounds
- Brighter emerald primary (#31d78a)

## 🚀 Best Practices

1. **Always use `useThemeColor()`** instead of hardcoded colors
2. **Use `ThemedText` and `ThemedView`** for consistent theming
3. **Test both themes** during development
4. **Consider contrast ratios** for accessibility
5. **Use semantic color names** (primary, success, error) rather than visual names

## 🔄 Migration from Old System

If you have existing components using the old `lightColor`/`darkColor` props:

**Before:**

```tsx
<ThemedText lightColor="#000" darkColor="#fff">
  Text
</ThemedText>
```

**After:**

```tsx
<ThemedText>Text</ThemedText>
```

The new system automatically handles theme switching based on your `Colors.ts` definitions.

---

🎉 **Your app now supports beautiful dark mode that automatically adapts to user preferences!**
