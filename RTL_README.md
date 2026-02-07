# RTL (Right-to-Left) Support Guide

This document provides comprehensive guidance for implementing RTL support in the Quran School app.

## 🌟 Overview

Our app supports both LTR (Left-to-Right) and RTL (Right-to-Left) layouts to accommodate Arabic and English languages. The RTL system is designed to be sustainable and easy to use throughout the development process.

## 🛠️ Core Components

### 1. RTL Hooks

#### `useRTL()` - Basic RTL Detection

```typescript
import { useRTL } from "@/hooks/useRTL";

// Automatically detects and applies RTL based on device locale
useRTL();
```

#### `useRTLStyles()` - RTL Style Utilities

```typescript
import { useRTLStyles } from "@/hooks/useRTLStyles";

const { isRTL, rtlStyles } = useRTLStyles();
```

### 2. Available RTL Style Utilities

#### Text Direction

```typescript
// Apply RTL text direction
<ThemedText style={[styles.text, rtlStyles.textDirection]}>
  {content}
</ThemedText>

// Text alignment utilities
<ThemedText style={[styles.text, rtlStyles.textStart]}>Start aligned</ThemedText>
<ThemedText style={[styles.text, rtlStyles.textEnd]}>End aligned</ThemedText>
<ThemedText style={[styles.text, rtlStyles.textCenter]}>Center aligned</ThemedText>
```

#### Layout Direction

```typescript
// Row direction (reverses in RTL)
<ThemedView style={[styles.container, rtlStyles.row]}>
  <Icon />
  <Text />
</ThemedView>

// Reverse row direction
<ThemedView style={[styles.container, rtlStyles.rowReverse]}>
  <Icon />
  <Text />
</ThemedView>
```

#### Spacing (Logical Properties)

```typescript
// Margin utilities
<View style={[styles.item, rtlStyles.marginStart(16)]}>Item with start margin</View>
<View style={[styles.item, rtlStyles.marginEnd(16)]}>Item with end margin</View>

// Padding utilities
<View style={[styles.container, rtlStyles.paddingStart(20)]}>Container with start padding</View>
<View style={[styles.container, rtlStyles.paddingEnd(20)]}>Container with end padding</View>
```

#### Alignment

```typescript
// Alignment utilities
<View style={[styles.container, rtlStyles.alignStart]}>Start aligned content</View>
<View style={[styles.container, rtlStyles.alignEnd]}>End aligned content</View>
<View style={[styles.container, rtlStyles.justifyStart]}>Start justified content</View>
<View style={[styles.container, rtlStyles.justifyEnd]}>End justified content</View>
```

#### Borders

```typescript
// Border utilities
<View style={[styles.card, rtlStyles.borderStart(1, "#ccc")]}>Card with start border</View>
<View style={[styles.card, rtlStyles.borderEnd(1, "#ccc")]}>Card with end border</View>
```

#### Positioning

```typescript
// Position utilities
<View style={[styles.absolute, rtlStyles.positionStart(16)]}>Positioned at start</View>
<View style={[styles.absolute, rtlStyles.positionEnd(16)]}>Positioned at end</View>
```

## 🎨 Design System Integration

### Colors

Always use the Colors system for consistency:

```typescript
import { Colors } from "@/constants/Colors";

// Use theme-aware colors
backgroundColor: Colors.light.card, // or Colors.dark.card
color: Colors.light.textPrimary, // or Colors.dark.textPrimary
```

### Typography

Use the normalize utility for consistent sizing:

```typescript
import { normalize } from "@/utils/normalize";

fontSize: normalize(16),
padding: normalize(20),
```

### Components

Use themed components for consistency:

```typescript
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
```

## 📱 Implementation Examples

### 1. Navigation Buttons

```typescript
const NavigationButton = ({ icon, title, onPress }) => {
  const { rtlStyles } = useRTLStyles();

  return (
    <TouchableOpacity style={[styles.button, rtlStyles.row]} onPress={onPress}>
      <ThemedText style={styles.icon}>{icon}</ThemedText>
      <ThemedText style={[styles.title, rtlStyles.textDirection]}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
};
```

### 2. Card Layout

```typescript
const Card = ({ image, title, subtitle }) => {
  const { rtlStyles } = useRTLStyles();

  return (
    <ThemedView style={styles.card}>
      <ThemedView style={[styles.content, rtlStyles.row]}>
        <Image source={image} style={styles.image} />
        <ThemedView style={styles.textContainer}>
          <ThemedText style={[styles.title, rtlStyles.textDirection]}>
            {title}
          </ThemedText>
          <ThemedText style={[styles.subtitle, rtlStyles.textDirection]}>
            {subtitle}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};
```

### 3. Form Fields

```typescript
const FormField = ({ label, value, onChangeText }) => {
  const { rtlStyles } = useRTLStyles();

  return (
    <ThemedView style={styles.fieldContainer}>
      <ThemedText style={[styles.label, rtlStyles.textDirection]}>
        {label}
      </ThemedText>
      <TextInput
        style={[styles.input, rtlStyles.textDirection]}
        value={value}
        onChangeText={onChangeText}
        textAlign={rtlStyles.textDirection.textAlign}
      />
    </ThemedView>
  );
};
```

## 🔄 Language Switching

The language switching system automatically handles RTL changes:

```typescript
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// The component automatically:
// 1. Changes the language
// 2. Updates RTL layout
// 3. Reloads the app to apply changes
<LanguageSwitcher />;
```

## 🧪 Testing RTL

### Development Testing

1. Use the language switcher to test RTL layout
2. Check text alignment and flow
3. Verify icon positions and navigation
4. Test form inputs and buttons

### Common Issues to Check

- Text alignment (should be right-aligned in Arabic)
- Icon positions (should mirror in RTL)
- Navigation flow (should flow right-to-left)
- Margins and padding (should use logical properties)
- Button order in horizontal groups

## 📋 Best Practices

### ✅ Do's

- Always use `rtlStyles` utilities for layout
- Use logical properties (start/end instead of left/right)
- Test both LTR and RTL layouts
- Use themed components for consistency
- Apply `textDirection` to all text elements

### ❌ Don'ts

- Don't use hardcoded `left`/`right` properties
- Don't assume text alignment
- Don't forget to test RTL layout
- Don't use absolute positioning without RTL consideration

## 🔧 Troubleshooting

### RTL Not Working

1. Check if `I18nManager.isRTL` is set correctly
2. Verify language is set to Arabic
3. Ensure app was reloaded after language change
4. Check console for RTL initialization logs

### Layout Issues

1. Verify all text elements have `rtlStyles.textDirection`
2. Check that containers use appropriate RTL utilities
3. Ensure margins/padding use logical properties
4. Test with different content lengths

### Performance

1. RTL utilities are optimized for performance
2. Avoid creating new style objects in render
3. Use style arrays efficiently
4. Cache RTL styles when possible

## 📚 Additional Resources

- [React Native RTL Documentation](https://reactnative.dev/docs/0.71/right-to-left)
- [CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [RTL Design Patterns](https://material.io/design/usability/bidirectionality.html)

---

**Remember**: RTL support is not just about text direction - it's about creating a complete mirrored experience that feels natural to Arabic-speaking users. Always test your implementations in both LTR and RTL modes.
