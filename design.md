## Overview

This design system rests on a warm, human canvas (`{colors.canvas}` — #F7F4EB), offering a striking contrast to traditional clinical approaches. Visual energy comes not from industrial rigidity, but from the expressiveness of the **Clash Display** typography and a vibrant palette inspired by summer sunsets (sand, terracotta, ocean). The system is designed to feel "alive," relying heavily on fluid animations ("wow" effect) that accompany scrolling and interaction.

Architectural contrast is the interface's signature: the overall structure (images, cards, sections) retains strict, sharp angles (`{rounded.none}`), while direct interaction elements (CTAs, buttons) are softened with a slight radius (`{rounded.sm}`) to invite touch. Depth is managed through very soft, floating drop shadows, creating the illusion that elements are elegantly levitating above the cream background.

**Key Characteristics:**
- A cream canvas (`{colors.canvas}` — #F7F4EB) replaces pure white to reduce eye strain and inject warmth. Main text is never pure black, but rather a deep brown/grey (`{colors.ink}`).
- Expressive headlines in **Clash Display** for maximum impact, paired with the geometric, modern readability of **Satoshi** for body copy.
- Color used as a narrative accent: terracotta (`{colors.sunset}`) drives action, balanced by surprising touches of deep blue (`{colors.ocean}`).
- Hybrid architecture: 0px border-radius for structural blocks and images, but soft rounded corners (8px) for buttons.
- Elegant elevation: no harsh borders, but diffuse drop shadows (`{shadows.floating}`) to lift major cards off the background.
- Motion as a core material: entrance and hover animations are integral to the DNA (the "wow" effect).

## Colors

### Brand & Accent
- **Sunset Terracotta** (`{colors.sunset}` — #E86A47): The primary action and accent color. Warm and vibrant, it draws the eye and is used on primary CTAs and highlighted elements.
- **Ocean Blue** (`{colors.ocean}` — #2A7B88): The contrast color. This deep blue provides a refreshing breath among the warm tones. Used sparingly for tags, hover states, or secondary graphic elements to create visual surprise.

### Surface
- **Canvas Cream** (`{colors.canvas}` — #F7F4EB): The default floor across all pages. A bright, organic sand/cream shade.
- **Surface Sand** (`{colors.surface-sand}` — #E3D5C8): Used for card backgrounds, secondary sections, or to create gentle contrast blocks without breaking the overall warmth.
- **Surface Light** (`{colors.surface-light}` — #FFFFFF): Pure white, used exceptionally and only as an overlay (e.g., floating cards) to maximize the contrast of soft shadows.

### Text
- **Ink Warm** (`{colors.ink}` — #2C221B): Replaces pure black. A very dark brown that ensures optimal accessibility contrast while remaining soft on the eyes.
- **Body Neutral** (`{colors.body}` — #5A4C40): For long paragraphs. A tone slightly lighter than Ink to establish reading hierarchy.
- **Muted** (`{colors.muted}` — #8B7E74): For metadata, captions, dates, and footers.

## Typography

### Font Family
The system relies on a sharp typographic duo to balance expressiveness and functionality:
- **Clash Display** (Display): Used for headlines (H1, H2, H3). Its unique proportions and bold presence provide a confident, warm atmosphere.
- **Satoshi** (Sans-serif): Used for running text, buttons, and UI. Its clean geometry ensures flawless readability.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 72px | 600 (Semibold) | 1.05 | -1px | Hero h1, striking keywords (Clash Display) |
| `{typography.display-lg}` | 56px | 600 (Semibold) | 1.1 | -0.5px | Section heads (H2) |
| `{typography.display-md}` | 40px | 500 (Medium) | 1.15 | 0 | Sub-section heads, large pull quotes |
| `{typography.title-lg}` | 24px | 700 (Bold) | 1.3 | 0 | Card titles (Satoshi or Clash depending on context) |
| `{typography.body-lg}` | 18px | 400 (Regular) | 1.6 | 0 | Lead paragraphs / Intros (Satoshi) |
| `{typography.body-md}` | 16px | 400 (Regular) | 1.5 | 0 | Default running body (Satoshi) |
| `{typography.button}` | 16px | 500 (Medium) | 1.0 | 0.5px | Button labels, slightly letterspaced |
| `{typography.caption}` | 14px | 400 (Regular) | 1.4 | 0 | Captions, fine print, legal text |

## Layout & Motion

### Spacing System
The spacing system prioritizes breathing room. Elements are never crowded.
- **Tokens:** `{spacing.xs}` 8px · `{spacing.sm}` 16px · `{spacing.md}` 24px · `{spacing.lg}` 48px · `{spacing.xl}` 80px · `{spacing.section}` 120px.
- **Section padding:** A generous `{spacing.section}` (120px) separates major content bands to let the atmosphere settle.

### Motion & Animations ("Wow Effect")
Animation is not decorative; it is the site's breathing mechanism.
- **Default Easing:** `cubic-bezier(0.25, 1, 0.5, 1)` (Fluid deceleration, feeling natural and organic).
- **Fade & Reveal:** Cards and typography gently drift upward (Y: 30px to 0) while fading in as the user scrolls (Scroll Reveal).
- **Image Hovers:** A slow, fluid internal zoom on the image (scale 1.05) over 600ms, without breaking out of its container (`overflow: hidden`).

## Elevation & Depth

The design rejects harsh drop shadows in favor of an elegant levitation system.

| Level | Treatment | Use |
|---|---|---|
| `{shadow.none}` | No shadow | Standard sections, text, flat images. |
| `{shadow.soft}` | `0 4px 12px rgba(44, 34, 27, 0.04)` | Secondary cards, search bars. |
| `{shadow.floating}` | `0 12px 40px rgba(44, 34, 27, 0.08)` | Primary CTAs, featured images, dropdowns. Creates the illusion that the element is "floating" above the sand. |

## Shapes

Shape contrast is strictly binary to guide the user's understanding of the interface.

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | The foundations: images, text blocks, large cards. The raw architectural feel. |
| `{rounded.sm}` | 8px | Interaction only: Reserved exclusively for buttons (CTAs), input fields, and tags. Visually signals "clickable." |

## Components

### Buttons
**`button-primary`** — The main CTA. Background `{colors.sunset}` (Terracotta), pure white text, rounded `{rounded.sm}` (8px). Features the `{shadow.floating}` shadow. On hover, the shadow intensifies slightly and the button lifts 2px (`transform: translateY(-2px)`).

**`button-secondary`** — Secondary button. Transparent background or `{colors.surface-sand}` background, text `{colors.ink}`, rounded `{rounded.sm}`.

### Cards & Containers
**`story-card`** — Content card. Edges are sharp (`{rounded.none}`). The image occupies the top half. On card hover, the image undergoes a very slow internal zoom for the "wow" effect, and the entire card smoothly inherits the `{shadow.floating}` shadow.

**`image-reveal`** — Image container with an entrance mask. Images do not appear instantly; they are revealed by a sliding block (swipe effect) utilizing the palette's colors when entering the viewport.

## Do's and Don'ts

### Do
- Use the cream canvas (`{colors.canvas}`) heavily to let the content breathe.
- Animate the appearance of key elements on scroll using smooth easing curves.
- Play with the dramatic size contrast between massive Clash Display headlines and Satoshi body copy.
- Keep structural corners sharp (0px) on layouts and images to maintain an elegant, editorial architecture.

### Don't
- Don't use pure black (#000000) or pure white (#FFFFFF) as a full page background. It will destroy the warm atmosphere.
- Don't round the corners of images or structural cards. Border-radius is strictly reserved for clickable elements (CTAs).
- Don't use harsh, sharp, or overly opaque shadows. Shadows must look like diffuse summer light.
- Don't clutter the UI with outlines or hairlines. Separate sections using whitespace (`{spacing.section}`) or subtle background color shifts (Sand vs. Cream).
