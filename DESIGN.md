# Design System

This document outlines the core tokens and styles used across the booking chatbot application to maintain a cohesive, modern SaaS aesthetic.

## Typography

- **Primary Font**: `Inter` (sans-serif) — used for all body copy and UI elements.
- **Display Font**: `Outfit` (sans-serif) — used for headings (`h1` - `h6`) and numbers/metrics.
- **Scale**:
  - `text-xs`: 0.75rem (12px)
  - `text-sm`: 0.875rem (14px)
  - `text-base`: 1rem (16px)
  - `text-lg`: 1.125rem (18px)
  - `text-xl`: 1.25rem (20px)
  - `text-2xl`: 1.5rem (24px)
  - `text-3xl`: 1.875rem (30px)

## Color Palette

### Brand Colors

- **Primary**: `#4F46E5` (Indigo 600) — Main CTA, active states, user chat bubbles.
- **Primary Hover**: `#4338CA` (Indigo 700)
- **Primary Light**: `#EEF2FF` (Indigo 50) — Subtle backgrounds for active/selected items.

### Neutrals (Slate scale)

- **Background App**: `#F8FAFC` (Slate 50) — The main body background.
- **Background Surface**: `#FFFFFF` (White) — Cards, modals, chat container.
- **Border Light**: `#E2E8F0` (Slate 200) — Dividers, default input borders.
- **Border Hover**: `#CBD5E1` (Slate 300)
- **Text Primary**: `#0F172A` (Slate 900) — Main headings, primary content.
- **Text Secondary**: `#64748B` (Slate 500) — Labels, subtext, empty states.
- **Text Tertiary**: `#94A3B8` (Slate 400) — Placeholder text, disabled text.
- **Dark Surface**: `#0F172A` (Slate 900) — Sidebar background, Auth split screen.

### Semantics

- **Success**: `#10B981` (Emerald 500)
- **Success Bg**: `#ECFDF5` (Emerald 50)
- **Warning**: `#F59E0B` (Amber 500)
- **Warning Bg**: `#FFFBEB` (Amber 50)
- **Danger**: `#EF4444` (Red 500)
- **Danger Bg**: `#FEF2F2` (Red 50)

## Spacing System

Base unit is `4px` (`0.25rem`).

- `space-1`: 0.25rem (4px)
- `space-2`: 0.5rem (8px)
- `space-3`: 0.75rem (12px)
- `space-4`: 1rem (16px)
- `space-6`: 1.5rem (24px)
- `space-8`: 2rem (32px)
- `space-12`: 3rem (48px)

## Shadows & Elevations

- **shadow-sm**: `0 1px 2px 0 rgb(0 0 0 / 0.05)` — Inputs, subtle cards.
- **shadow-md**: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` — Hover states, dropdowns.
- **shadow-lg**: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` — Modals, main chat floating container.

## Border Radius

- **radius-sm**: `0.25rem` (4px)
- **radius-md**: `0.5rem` (8px) — Buttons, inputs.
- **radius-lg**: `0.75rem` (12px) — Inner cards, table containers.
- **radius-xl**: `1rem` (16px)
- **radius-2xl**: `1.5rem` (24px) — Main wrapper cards (e.g., chat container).
- **radius-full**: `9999px` — Pills, avatars.

## Component Primitives

- **`.btn-primary`**: Indigo gradient/solid, white text, radius-md, shadow-sm.
- **`.btn-secondary`**: White background, slate border, dark text, radius-md.
- **`.btn-ghost`**: Transparent background, dark text, subtle hover.
- **`.btn-destructive`**: Red background, white text, radius-md.
- **`.card`**: White background, light border, radius-lg, shadow-sm.
- **`.badge`**: Small pill-shaped indicator with semantic coloring.
- **`.input-base`**: Slate-50 background changing to White on focus, with Indigo focus ring.
