# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## 🚀 RTL & Multi-language Best Practices

This app is built for both Arabic (RTL) and English (LTR) users. To ensure consistency and sustainability:

### 1. **Always use ThemedText for all text**

- ThemedText automatically applies correct text direction and alignment based on the current language (RTL for Arabic, LTR for English).
- Never use <Text> directly unless you have a special case.

### 2. **Always use ThemedView for all layouts**

- ThemedView supports a `row` prop: `<ThemedView row>...</ThemedView>`
- This will automatically set `flexDirection` to `row` or `row-reverse` based on the current language.
- Never use <View style={{ flexDirection: 'row' }}> directly.

### 3. **Never hardcode LTR styles**

- Do not use `textAlign: 'left'` or `flexDirection: 'row'` unless you are using the RTL utilities from `useRTLStyles`.

### 4. **All new UI code must use ThemedText and ThemedView**

- This ensures your app will always look correct in both Arabic and English, with no extra work.

### 5. **Code Review Rule**

- Reject any PR that does not use ThemedText or ThemedView for UI.

### Example Usage

```tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

<ThemedView row>
  <Icon />
  <ThemedText>مرحبا بك</ThemedText>
</ThemedView>;
```

## Get started

1. Install dependencies

   ```

   ```
