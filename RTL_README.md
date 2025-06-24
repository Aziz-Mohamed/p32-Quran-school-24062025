# 🔄 RTL (Right-to-Left) Layout Support

This Quran School app now supports Right-to-Left (RTL) layouts for Arabic language with automatic detection and comprehensive styling utilities.

## 📁 File Structure

```
├── hooks/
│   ├── useRTL.ts              # RTL initialization and detection
│   └── useRTLStyles.ts        # RTL-aware styling utilities
├── components/
│   ├── LanguageSwitcher.tsx   # RTL-aware language switcher
│   ├── I18nExample.tsx        # RTL-aware i18n example
│   └── RTLExample.tsx         # Comprehensive RTL examples
└── app/
    └── _layout.tsx            # RTL initialization
```

## 🚀 Setup

The RTL system is automatically initialized in `app/_layout.tsx` and includes:

- **Automatic RTL detection** based on device locale
- **Dynamic layout switching** when language changes
- **Comprehensive styling utilities** for RTL-aware components
- **Proper text direction** and alignment handling

## 📝 Usage

### Basic RTL Detection

```tsx
import { useRTLStyles } from "@/hooks/useRTLStyles";

function MyComponent() {
  const { isRTL, rtlStyles } = useRTLStyles();

  return (
    <View style={[styles.container, rtlStyles.row]}>
      <Text style={rtlStyles.textDirection}>{isRTL ? "مرحبا" : "Hello"}</Text>
    </View>
  );
}
```

### RTL-Aware Styling

```tsx
import { useRTLStyles } from "@/hooks/useRTLStyles";

function RTLComponent() {
  const { rtlStyles } = useRTLStyles();

  return (
    <View
      style={[
        styles.container,
        rtlStyles.marginStart(16), // marginLeft in LTR, marginRight in RTL
        rtlStyles.paddingEnd(20), // paddingRight in LTR, paddingLeft in RTL
        rtlStyles.borderStart(2, "#007AFF"), // borderLeft in LTR, borderRight in RTL
      ]}
    >
      <Text style={rtlStyles.textDirection}>
        Content with proper RTL support
      </Text>
    </View>
  );
}
```

## 🎨 Available RTL Utilities

### Text Direction

- `rtlStyles.textDirection` - Sets proper `writingDirection` and `textAlign`

### Flex Direction

- `rtlStyles.row` - `flexDirection: 'row'` in LTR, `'row-reverse'` in RTL
- `rtlStyles.rowReverse` - `flexDirection: 'row-reverse'` in LTR, `'row'` in RTL

### Margins

- `rtlStyles.marginStart(value)` - `marginLeft` in LTR, `marginRight` in RTL
- `rtlStyles.marginEnd(value)` - `marginRight` in LTR, `marginLeft` in RTL

### Padding

- `rtlStyles.paddingStart(value)` - `paddingLeft` in LTR, `paddingRight` in RTL
- `rtlStyles.paddingEnd(value)` - `paddingRight` in LTR, `paddingLeft` in RTL

### Borders

- `rtlStyles.borderStart(width, color)` - `borderLeft` in LTR, `borderRight` in RTL
- `rtlStyles.borderEnd(width, color)` - `borderRight` in LTR, `borderLeft` in RTL

## 🔧 Best Practices

### 1. Use RTL-Aware Utilities

Instead of hardcoded `marginLeft`/`marginRight`:

```tsx
// ❌ Avoid
<View style={{ marginLeft: 16 }}>

// ✅ Use
<View style={rtlStyles.marginStart(16)}>
```

### 2. Use Flex Direction for Layouts

Instead of manual positioning:

```tsx
// ❌ Avoid
<View style={{ flexDirection: 'row' }}>

// ✅ Use
<View style={rtlStyles.row}>
```

### 3. Proper Text Direction

Always set text direction for mixed content:

```tsx
// ✅ Good
<Text style={rtlStyles.textDirection}>Hello - مرحبا</Text>
```

### 4. Avoid Hardcoded Directions

```tsx
// ❌ Avoid
<View style={{ alignItems: 'flex-start' }}>

// ✅ Use
<View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
```

## 🎯 Features

- ✅ **Automatic RTL detection** based on device locale
- ✅ **Dynamic layout switching** when language changes
- ✅ **Comprehensive styling utilities** for all common patterns
- ✅ **Type-safe RTL styles** with proper TypeScript support
- ✅ **Performance optimized** with minimal re-renders
- ✅ **Easy to extend** for additional RTL patterns

## 🧪 Testing

To test the RTL functionality:

1. Run the app: `npm start`
2. Navigate to the "Explore" tab
3. Find the "🔄 RTL Layout Support" section
4. Switch to Arabic language using the language switcher
5. Observe how layouts automatically adjust for RTL
6. Test various RTL examples in the demo section

### Testing Checklist:

- [ ] Text alignment changes from left to right
- [ ] Icons and text reverse order in rows
- [ ] Margins and padding adjust correctly
- [ ] Borders appear on correct sides
- [ ] Mixed content (LTR + RTL) displays properly

## 🔄 How It Works

1. **Detection**: `useRTL.ts` detects if the device locale starts with 'ar'
2. **Initialization**: `I18nManager.forceRTL()` is called if needed
3. **Reload**: App reloads to apply RTL changes
4. **Styling**: `useRTLStyles.ts` provides utilities that adapt to RTL state
5. **Components**: All components use RTL-aware styling automatically

## 📱 Platform Support

- ✅ **iOS** - Full RTL support with native layout engine
- ✅ **Android** - Full RTL support with native layout engine
- ✅ **Web** - Full RTL support with CSS direction properties

The RTL system works seamlessly across all platforms and automatically adapts to the user's language preferences.
