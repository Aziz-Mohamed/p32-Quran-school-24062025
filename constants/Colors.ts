/**
 * Modified Color Palette for Quran School App - Inspired by provided screenshots.
 * This palette aims for a modern, clean, and user-friendly aesthetic with a focus on
 * soft, inviting colors, card-based design, and clear readability, matching the examples.
 */

export const Colors = {
  light: {
    // Primary Background: The dominant, pure white from the app background.
    primaryBackground: "#FFFFFF",

    // Secondary Background / Surface: Slightly off-white for cards and subtle separation.
    // This is the background for most content blocks and cards.
    surface: "#F8F8F8", // A very subtle light gray

    // Primary Text: Dark gray for main headings and strong readability.
    textPrimary: "#333333",

    // Secondary Text: Medium gray for supporting text, descriptions, and less emphasized information.
    textSecondary: "#888888",

    // Accent Orange: Used for prominent buttons ("Join room", "Start lesson") and highlights.
    accentOrange: "#FF9800", // A vibrant, clear orange

    // Accent Teal/Aqua: Seen in abstract shapes, some icons, and progress elements.
    accentTeal: "#4DB6AC", // A calming, distinct teal

    // Card Backgrounds - Specific shades observed in the various cards:
    cardBackgroundLightOrange: "#FFFAF0", // For vocabulary intro, quiz card (background hint)
    cardBackgroundLightBlue: "#E0F2F7", // Example: "Al-A'raf" card body, some progress elements
    cardBackgroundMutedGreen: "#C8E6C9", // Example: "Maryam" chapter card
    cardBackgroundMutedPurple: "#E1BEE7", // Example: "Ibrahim" chapter card
    cardBackgroundMutedBlue: "#C5CAE9", // Example: "Adam" chapter card
    cardBackgroundMutedRedBrown: "#FFCDD2", // Example: "Salah" chapter card

    // Specific UI Elements:
    // This is for the distinct yellow-orange gradient seen on the "Lesson 1" card header
    gradientOrangeStart: "#FFD700", // Bright yellow
    gradientOrangeEnd: "#FFA07A",   // Light salmon

    // Borders/Dividers: A very subtle light gray for elegant separation.
    border: "#EEEEEE",

    // Functional Colors (Modified to fit the lighter, softer aesthetic):
    success: "#81C784", // Soft green for success, visible on light backgrounds
    warning: "#FFB74D", // Softer orange for warnings
    error: "#EF9A9A",   // Soft red for errors, not harsh

    // Locked/Disabled state overlay (often a semi-transparent dark shade)
    lockedOverlay: "rgba(0, 0, 0, 0.4)", // A common choice for locking elements visually
    lockedIcon: "#FFFFFF", // White padlock icon
  },

  dark: {
    // Dark mode colors are complementary and provide good contrast.
    // Primary Background: Deep dark gray, mimicking the app's clean feel in dark mode.
    primaryBackground: "#121212",

    // Secondary Background / Surface: Slightly lighter dark gray for cards and content.
    surface: "#1E1E1E",

    // Primary Text: Light gray/off-white for main text.
    textPrimary: "#E0E0E0",

    // Secondary Text: Muted light gray for supporting text.
    textSecondary: "#B0B0B0",

    // Accent Orange: Maintains visibility and warmth on dark backgrounds.
    accentOrange: "#FFC107", // A slightly brighter orange for dark mode

    // Accent Teal/Aqua: Remains vibrant in dark mode.
    accentTeal: "#26A69A", // A slightly deeper teal for dark mode

    // Card Backgrounds - Darker versions of the light mode palette
    cardBackgroundLightOrange: "#3A3020",
    cardBackgroundLightBlue: "#203040",
    cardBackgroundMutedGreen: "#253C26",
    cardBackgroundMutedPurple: "#3D2B3F",
    cardBackgroundMutedBlue: "#2B3245",
    cardBackgroundMutedRedBrown: "#4A2B2D",

    // Specific UI Elements:
    gradientOrangeStart: "#FFEB3B", // Brighter yellow for dark mode
    gradientOrangeEnd: "#FFAB40",   // Brighter salmon for dark mode

    // Borders/Dividers: Subtle dark gray for separation.
    border: "#303030",

    // Functional Colors:
    success: "#4CAF50", // Clearer green for dark mode
    warning: "#FF9800", // Standard orange for dark mode
    error: "#F44336",   // Clearer red for dark mode

    // Locked/Disabled state overlay
    lockedOverlay: "rgba(0, 0, 0, 0.6)",
    lockedIcon: "#CCCCCC", // Slightly darker white icon for contrast
  }
};

export default Colors;