# 🟩 Quran School App UI/UX Design System - Refined & Minimalist Approach

## 🌟 Vision
A timeless, elegant, and highly usable Quran school app that feels modern, friendly, and deeply accessible—designed to inspire learning and delight users of all agess is on the **minimum features for the simplest, most minimalist, and iconic subtle app experience with a low learning curve.** We commit to following best practices, modularity, and separation of concerns.

---

## 🎨 Color Palette
**Source:** All colors must be sourced directly from the `@Colors.ts` file provided (our custom, artistically refined palette).
**Functional Roles (Mapping to @Colors.ts):**
* **Backgrounds:**
    * **Light Mode:** `Colors.light.background` (soft, warm off-white) for general screen background.
    * **Dark Mode:** `Colors.dark.background` (rich, muted deep blue-gray) for general screen background.
* **Cards/Sections:**
    * **Light Mode:** `Colors.light.card` (clean off-white) or `Colors.light.surface` (slightly creamier off-white) for distinct sections and card backgrounds.
    * **Dark Mode:** `Colors.dark.card` (slightly lighter than background) or `Colors.dark.surface` for distinct sections and card backgrounds.
* **Primary Call-to-Action (CTAs) / Main Buttons:** `Colors.light.secondary` (refined, muted gold) in Light Mode, `Colors.dark.secondary` (soft, glowing antique gold) in Dark Mode. This provides a warm, inviting, and highly visible primary action.
* **Secondary Accent / Highlights & Icons:** `Colors.light.accent` (spiritual Deep Aquamarine/Teal) in Light Mode, `Colors.dark.accent` (vibrant Aquamarine) in Dark Mode. Used for subtle highlights, interactive icons, and secondary indicators.
* **Text:**
    * **Headings:** `Colors.light.textPrimary` (deep, rich charcoal gray) in Light Mode, `Colors.dark.textPrimary` (soft, legible off-white/cream) in Dark Mode.
    * **Body/Primary UI Text:** `Colors.light.textPrimary` in Light Mode, `Colors.dark.textPrimary` in Dark Mode.
    * **Secondary Info/Less Emphasized Text:** `Colors.light.textSecondary` (soft, warm slate gray) in Light Mode, `Colors.dark.textSecondary` (clear, muted light gray) in Dark Mode.
* **Functional (System) Colors:**
    * **Success:** `Colors.light.success` (calming green) / `Colors.dark.success` (clear green).
    * **Warning:** `Colors.light.warning` (warm, earthy orange) / `Colors.dark.warning` (glowing amber).
    * **Error:** `Colors.light.error` (grounded red) / `Colors.dark.error` (soft yet distinct red).
* **Borders:** `Colors.light.border` (very subtle, warm light gray) / `Colors.dark.border` (subtle, darker gray).

---

## 1. Typography
* **Headings (Titles, Major Sections):**
    * **Font:** Elegant, readable **serif font** (e.g., Noto Naskh Arabic for Arabic, Playfair Display or Merriweather for Latin script). Prioritize spiritual and timeless feel.
    * **Weight:** Bold (`700`).
    * **Size:** `Title (H1):` `24–32px`, `Subheading (H2):` `18–20px`.
* **Body/UI Text (Main content, labels, descriptions):**
    * **Font:** Clean, modern **sans-serif font** (e.g., Cairo for Arabic, Inter or Open Sans for Latin script). Focus on clarity and readability.
    * **Weight:** Regular (`400`).
    * **Size:** `Body:` `14–16px`, `Captions/Small Text:` `12px`.
* **Hierarchy:** Clear distinction in size and weight between headings, subheadings, and body text.
* **RTL Adaptation (Arabic Script):**
    * **Text Alignment:** All block-level text (`<p>`, `<h1>`, labels) `text-align: right;` by default.
    * **Line Height & Kerning:** Ensure generous line height (e.g., 1.5-1.6 times font size) for Arabic text to prevent cramping. Verify good kerning for selected Arabic fonts.

---

## 2. Components & Layout
* **Modularity & Separation of Concern:** All components should be self-contained and reusable.
* **Cards (for list items, sections, etc.):**
    * **Style:** Rounded corners (`16px`), subtle drop shadows (`0 4px 12px rgba(0, 0, 0, 0.08)`), generous padding (`16px` consistent internal padding).
    * **Background:** Use `Colors.light.card` or `Colors.dark.card` for distinct backgrounds.
    * **Content:** Always use `icon/illustration` (if applicable) + `bold serif title` (e.g., chapter name) + `regular sans-serif subtitle` (e.g., lesson description) for clarity.
    * **RTL Adaptation:** Content within cards must flow from Right-to-Left (icon on right, text flowing left).
* **Tabs:**
    * **Style:** Soft, pill-shaped with clear active/inactive states.
    * **Active State:** Background filled with `Colors.light.secondary` (gold/amber) or `Colors.dark.secondary`, with `Colors.light.textPrimary` (dark charcoal) or `Colors.dark.textPrimary` text.
    * **Inactive State:** Background transparent or subtle `Colors.light.background`/`Colors.dark.background`, with `Colors.light.textSecondary`/`Colors.dark.textSecondary` text.
    * **RTL Adaptation:** Tabs flow from Right-to-Left visually in Arabic mode.
* **Buttons (Primary CTAs):**
    * **Style:** Rounded corners (`8px`), filled with `Colors.light.secondary` (gold/amber) or `Colors.dark.secondary`.
    * **Text:** Bold sans-serif text (`Colors.light.textPrimary` or `Colors.dark.textPrimary`).
    * **Touch Targets:** Large, easy-to-tap touch area.
    * **RTL Adaptation:** If a button contains an icon and text, the icon position relative to the text must swap (e.g., icon on left of text moves to right of text in RTL). For horizontal groups of action buttons (e.g., "Cancel" | "Save"), their visual order should mirror.
* **Bottom Navigation (Mobile):**
    * **Style:** Floating, pill-shaped container at the bottom.
    * **Content:** Clear icons only (or with very small labels, optional for ultimate minimalism).
    * **Active State:** Distinctly highlighted using `Colors.light.secondary` (gold/amber) or `Colors.dark.secondary` for the icon/pill background.
    * **RTL Adaptation:** Icons and order of navigation items flow from Right-to-Left visually.
* **Switches & Toggles:**
    * **Style:** Modern, rounded design.
    * **States:** Clear `on/off` color states (e.g., `Colors.light.success` for 'on', `Colors.light.textSecondary` for 'off').
    * **Touch Targets:** Large, easy-to-toggle area.
    * **RTL Adaptation:** The visual "track" of the switch should mirror (i.e., fill from right to left).
* **Lists:**
    * **Style:** Primarily use **cards for individual list items**, ensuring clear visual separation and tappability.
    * **Content:** Each card should have `images/icons`, `bold serif titles` (for main item name), and `secondary sans-serif info` (for details/status).
    * **RTL Adaptation:** List item content (icons, text) must flow from Right-to-Left.

---

## 3. Spacing & Sizing
* **Whitespace:** Implement generous use of whitespace between elements, sections, and around content blocks for an uncluttered, serene, and elegant feel.
* **Padding:** Maintain consistent, uniform padding inside cards, buttons, sections, and text containers. Adhere to the `4px` grid system.
* **Touch Targets:** All interactive elements (buttons, icons, list items) must have large, easy-to-tap touch targets (minimum recommended `44x44px` area).
* **RTL Adaptation:** All spacing (padding, margin) must be defined using logical properties (e.g., `padding-inline-start`, `margin-inline-end`) to ensure automatic mirroring in RTL layouts.

---

## 4. Imagery & Icons
* **Illustrations:** Soft, friendly, and thematic illustrations (e.g., for chapter intros, lesson completion, achievement badges). They should complement the color palette and overall spiritual/child-friendly tone. Avoid sharp lines or overly complex details.
* **Icons:** Simple, line-based, and maintain absolute consistency in style (e.g., stroke weight, corner radius). Use your chosen icon library (Lucide, Phosphor) strictly.
* **RTL Adaptation:** Directional icons (arrows, chevrons, text alignment) **must mirror** when the app is in RTL mode. Review all icons for directional implications.

---

## 5. Accessibility
* **Contrast:** Ensure high contrast for all text and interactive elements (buttons, icons) against their backgrounds, adhering to WCAG 2.1 AA standards.
* **Tappability:** All interactive controls must be easily tappable by fingers of various sizes.
* **Font Size:** Respect user font scaling and accessibility settings, ensuring layouts adapt gracefully without text truncation or overlap.
* **RTL Accessibility:** Verify that all mirroring and text direction changes also maintain logical tab order and screen reader announcements for RTL users.

---

## 6. Implementation Tips
* **Global Theme:** Centralize `Colors`, `Typography`, and `Spacing` definitions in a global theme file for easy management and consistent application.
* **Reusable Components:** Build a comprehensive UI kit (e.g., `Card`, `Button`, `Tab`, `BottomNav`, `Switch`, `ListItemCard`) that strictly follows these design rules.
* **Consistent Layouts:** Utilize cards and sections as primary grouping mechanisms. Maintain generous whitespace. Use the `secondary` color from `@Colors.ts` for primary CTAs consistently.
* **Navigation Strategy:**
    * Mobile: Primarily use the floating, pill-shaped bottom navigation for core app sections.
    * Admin/Desktop: Consider a hamburger menu or horizontal tab navigation that adapts cleanly, maintaining minimalism.
* **Accessibility Testing:** Regularly test color contrast and tap targets throughout the development process. Conduct user testing with native Arabic speakers for RTL flow.

---

> **This document is the creative foundation for all new UI components, screens, and layouts in the Quran school app. Every design decision must reinforce clarity, friendliness, spiritual reverence, and timeless elegance, with paramount attention to the seamless experience for both LTR and RTL users.**