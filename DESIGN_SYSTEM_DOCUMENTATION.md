# Design System Documentation
## Upstairs Job Platform — "Ink + Acid Lime" Claymorphism Design Language v2

> **Inspection date:** 2026-10-11
> **Source directory:** `d:\Upstairs Techno\Upstairs_Job\frontend\`
> **Technology stack:** React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + Motion (Framer Motion v13)
> **Purpose:** Read-only reference for reproducing the visual system in another project.

---

## Table of Contents

1. [Project Design Overview](#1-project-design-overview)
2. [Font Families and Font Sources](#2-font-families-and-font-sources)
3. [Complete Typography Scale](#3-complete-typography-scale)
4. [Page-Specific Typography](#4-page-specific-typography)
5. [Component Typography](#5-component-typography)
6. [Color Palette](#6-color-palette)
7. [Global CSS and Design Tokens](#7-global-css-and-design-tokens)
8. [Animation Inventory](#8-animation-inventory)
9. [Animation Timing and Easing](#9-animation-timing-and-easing)
10. [Hover and Interaction Effects](#10-hover-and-interaction-effects)
11. [Scroll-Triggered Animations](#11-scroll-triggered-animations)
12. [Responsive Behavior](#12-responsive-behavior)
13. [Animation Dependencies](#13-animation-dependencies)
14. [Source File Paths](#14-source-file-paths)
15. [Reuse Instructions](#15-reuse-instructions)

---

## 1. Project Design Overview

The design language is called **"Ink + Acid Lime" Claymorphism**. Documented in-code as:

> *"Claymorphism is the SHAPE language (soft 3D shadows), not the hue. v2 re-bases the accent off indigo onto acid lime with an ink base on warm paper. Lime is a LIGHT color: it is used only as a FILL with ink text on top — never as text on paper. Deep lime (--color-accent-dark) is the only lime safe as text/links."*

**Key character traits:**

| Trait | Implementation |
|---|---|
| Background | Warm paper `#F7F5F0` — not sterile white |
| Cards | White `#FFFFFF` surfaces with soft 3D clay shadows and inset highlights |
| Accent | Acid Lime `#B6F03C` — fills only; deep lime `#3D5300` for text |
| Text | Near-black ink `#16181D` |
| Shape language | Rounded corners (1.25rem / 20px default), soft multi-layer box-shadows |
| Motion | Smooth "clay settle" easing `cubic-bezier(0.22, 1, 0.36, 1)` (easeOutExpo-ish) |
| Reduced motion | Both CSS and JS guards implemented |

---

## 2. Font Families and Font Sources

### Import Statement (exact, from `src/index.css` line 1)

```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=DM+Sans:wght@400;500;700&display=swap');
```

### Font Family Tokens (defined in `@theme` block)

```css
--font-heading: 'Nunito', ui-sans-serif, system-ui, sans-serif;
--font-body:    'DM Sans',  ui-sans-serif, system-ui, sans-serif;
```

### Font Details

| Role | Family | Provider | Weights Loaded | Used On |
|---|---|---|---|---|
| **Heading** | Nunito | Google Fonts | 700, 800, 900 | `h1`, `h2`, `h3`, `h4`, buttons, nav logo, footer nav headers |
| **Body** | DM Sans | Google Fonts | 400, 500, 700 | All body text, paragraphs, labels, muted text, inputs |
| **Mono** | System monospace (browser default) | n/a | n/a | Code blocks, timer, filename labels, option prefixes |

### Font Application Rules (from `src/index.css`)

```css
html {
  font-family: var(--font-body);   /* DM Sans — global default */
}

h1, h2, h3, h4 {
  font-family: var(--font-heading); /* Nunito — heading elements */
}
```

Buttons additionally use `font-family: var(--font-heading)` via the `clay-btn` utility.

**Note:** `h5` and `h6` are NOT explicitly overridden; they inherit the body font.

---

## 3. Complete Typography Scale

All values extracted directly from source. Tailwind v4 default rem base: `1rem = 16px`.

### Heading Scale

| Element | Tailwind Class | px (approx) | rem | Weight | Line Height | Font |
|---|---|---|---|---|---|---|
| H1 Hero (mobile) | `text-4xl` | 36px | 2.25rem | 900 (font-black) | 1.1 explicit | Nunito |
| H1 Hero (md) | `md:text-5xl` | 48px | 3rem | 900 | 1.1 | Nunito |
| H1 Hero (lg) | `lg:text-6xl` | 60px | 3.75rem | 900 | 1.1 | Nunito |
| H1 Interior pages | `text-3xl` | 30px | 1.875rem | 900 (font-black) | default | Nunito |
| H1 Register page | `text-4xl` | 36px | 2.25rem | 900 | tracking-tight | Nunito |
| H2 Section headings | `text-3xl` | 30px | 1.875rem | 800 (font-extrabold) | tracking-tight | Nunito |
| H2 Section (md) | `md:text-4xl` | 36px | 2.25rem | 800 | tracking-tight | Nunito |
| H2 Card/Dashboard | `text-xl` | 20px | 1.25rem | 900 (font-black) | default | Nunito |
| H2 Footer nav | `text-xs` | 12px | 0.75rem | 800 | default | Nunito |
| H3 Card headings | `text-lg` | 18px | 1.125rem | 800 (font-extrabold) | default | Nunito |
| H3 Outcome cards | `text-base` | 16px | 1rem | 800 | default | Nunito |
| H3 Detail labels | `text-xs` | 12px | 0.75rem | 700 (font-bold) | default | DM Sans |

### Body Text Scale

| Element | Tailwind Class | px | rem | Weight | Line Height | Font |
|---|---|---|---|---|---|---|
| Body large | `text-lg` | 18px | 1.125rem | 400 | leading-8 (2rem) | DM Sans |
| Body base | `text-base` | 16px | 1rem | 400 | leading-7 (1.75rem) | DM Sans |
| Body small | `text-sm` | 14px | 0.875rem | 400 | leading-relaxed (~1.625) | DM Sans |
| Caption / label | `text-xs` | 12px | 0.75rem | 400-700 | default | DM Sans |
| Micro text | `text-[11px]` | 11px | 0.6875rem | 400 | italic | DM Sans |
| Very small | `text-[10px]` | 10px | 0.625rem | 700 | default | DM Sans |

### Special Text Styles

| Usage | Classes | Effect |
|---|---|---|
| Accent underline on hero brand name | `text-accent-dark` + SVG underline | Deep lime + custom SVG curved underline |
| Section eyebrow labels | `text-xs font-bold uppercase tracking-wider text-accent-dark` | 12px, bold, all-caps, lime |
| Step/badge labels | `text-xs font-extrabold` + bg colors | 12px, 800 weight |
| Mono code / timer | `font-mono text-[13px] leading-6` | System mono, 13px, 24px line-height |
| Timer urgent | `font-mono text-lg font-semibold tabular-nums` | 18px, 600 weight, tabular |
| Nav logo pill | `font-heading text-base font-extrabold tracking-tight text-accent-dark` | 16px Nunito, 800 weight |
| Footer copyright | `text-xs text-clay-muted` | 12px, muted ink |

---

## 4. Page-Specific Typography

### HomePage (`src/pages/HomePage.tsx`)

| Element | Classes | Notes |
|---|---|---|
| H1 hero | `font-heading text-4xl font-black leading-[1.1] tracking-tight text-clay-text md:text-5xl lg:text-6xl` | 3 breakpoints |
| Hero eyebrow badge | `text-xs font-black uppercase tracking-wider text-teal-800` | Teal badge (not lime) |
| Hero body | `text-base leading-7 text-clay-muted md:text-lg` | Responsive |
| Section eyebrow | `text-xs font-bold uppercase tracking-wider text-accent-dark` | Lime, all-caps |
| Section H2 | `font-heading text-3xl font-extrabold tracking-tight text-clay-text md:text-4xl` | Responsive |
| Section subtext | `text-base text-clay-muted` | 16px muted |
| Pipeline card H3 | `font-heading text-lg font-extrabold text-clay-text` | 18px Nunito |
| Pipeline card body | `text-sm leading-relaxed text-clay-muted` | 14px |
| Job title H2 | `font-heading text-2xl font-black text-clay-text sm:text-3xl` | 24-30px Nunito |
| Detail card H3 | `text-xs font-bold text-clay-muted` | 12px, muted label |
| Detail card value | `font-heading text-base font-bold text-clay-text` | 16px Nunito |
| CTA H2 | `font-heading text-2xl font-black tracking-tight text-clay-text sm:text-3xl` | 24-30px |
| CTA body | `text-sm text-clay-muted leading-relaxed` | 14px |

### LoginPage (`src/auth/LoginPage.tsx`)

| Element | Classes |
|---|---|
| H1 | `font-heading text-3xl font-extrabold text-clay-text` |
| Subtitle | `text-sm text-clay-muted` |
| Form labels | `text-sm font-bold text-clay-text` |
| Error message | `text-sm font-medium text-clay-danger` |
| Help links | `font-bold text-accent-dark hover:underline` |

### RegisterPage (`src/auth/RegisterPage.tsx`)

| Element | Classes |
|---|---|
| H1 left column | `font-heading text-4xl font-black tracking-tight text-clay-text` |
| Left subtext | `text-lg leading-8 text-clay-muted` |
| Form H2 | `font-heading text-xl font-extrabold text-clay-text` |
| Form subtitle | `text-sm text-clay-muted` |
| Form labels | `text-sm font-bold text-clay-text` |

### ApplicationFormPage (`src/pages/ApplicationFormPage.tsx`)

| Element | Classes |
|---|---|
| H1 | `font-heading text-3xl font-black text-clay-text` |
| Eyebrow | `text-xs font-bold uppercase tracking-wider text-accent-dark` |
| Step H2 | `font-heading text-lg font-bold text-clay-text` |
| Form labels | `text-xs font-bold uppercase text-clay-muted` (all-caps micro labels) |
| Inputs | `rounded-xl border border-clay-line bg-white px-3.5 py-2.5 text-sm` |

### DashboardPage (`src/pages/DashboardPage.tsx`)

| Element | Classes |
|---|---|
| H1 | `font-heading text-3xl font-black text-clay-text` |
| Pipeline H2 | `text-lg font-bold text-slate-800 tracking-tight` |
| Round card labels | `text-xs font-bold uppercase tracking-wider text-slate-400` |
| Round card titles | `font-bold text-slate-900` |
| Schedule eyebrow | `text-xs font-bold uppercase tracking-wide text-accent-dark` |
| Schedule value | `text-lg font-bold text-clay-text` |

### Round1Page / Exam UI (`src/rounds/r1/Round1Page.tsx`)

| Element | Classes |
|---|---|
| Sticky H1 | `text-xl font-bold` (DM Sans — no font-heading override) |
| Timer | `font-mono text-lg font-semibold tabular-nums` |
| Timer low time | + `bg-red-100 text-red-700` |
| Question text | `font-medium text-clay-text` |
| Option label | `text-sm` |
| Option letter | `font-mono text-clay-muted` |

---

## 5. Component Typography

### Navigation Bar (`src/shared/Layout.tsx`)

| Element | Classes |
|---|---|
| Logo pill link | `clay-pill font-heading text-base font-extrabold tracking-tight text-accent-dark` |
| Nav links | `text-sm font-medium text-clay-muted transition-colors hover:text-accent-dark` |
| Nav CTA buttons | `clay-btn clay-btn-primary px-4 py-2 text-xs` |
| Logout button | `text-sm font-medium text-clay-danger hover:text-clay-danger-dark` |
| Login link | `text-sm font-semibold text-clay-muted hover:text-clay-text` |

### Footer (`src/shared/Footer.tsx`)

| Element | Classes |
|---|---|
| Logo pill | `clay-pill font-heading text-base font-extrabold tracking-tight text-accent-dark` |
| Description | `text-sm leading-6 text-clay-muted` |
| Nav section H2 | `font-heading text-xs font-extrabold uppercase tracking-wide text-clay-text` |
| Nav links | `text-sm text-clay-muted transition-colors hover:text-accent-dark` |
| External link | `text-xs font-bold text-accent-dark hover:underline` |
| Copyright | `text-xs text-clay-muted` |

### ClayButton (`src/shared/clay.tsx`)

```
clay-btn clay-btn-primary px-5 py-3 text-sm   (standard)
clay-btn clay-btn-ghost   px-5 py-3 text-sm
clay-btn clay-btn-primary px-4 py-2 text-xs   (small nav variant)
```

Button font: Nunito 700 (via `clay-btn` utility).

### Clay Pill (`clay-pill` utility)

```css
font-size: 0.75rem;   /* 12px */
font-weight: 700;
```

### Status Badges

```
inline-flex items-center gap-1.5 rounded-full bg-{color}-100 px-2.5 py-0.5 text-xs font-bold text-{color}-800
```

---

## 6. Color Palette

### Core Palette (from `@theme` in `src/index.css`)

| Token | Hex | Usage |
|---|---|---|
| `--color-clay-bg` | `#F7F5F0` | Page background — warm paper |
| `--color-clay-surface` | `#FFFFFF` | Card/input background |
| `--color-clay-text` | `#16181D` | Primary text — ink |
| `--color-clay-muted` | `#5A5E68` | Secondary text — AA on paper |
| `--color-clay-line` | `#E7E3DA` | Borders, dividers |

### Accent — Acid Lime

| Token | Hex | Rule |
|---|---|---|
| `--color-accent` | `#B6F03C` | Fill only — never text. Buttons, highlights |
| `--color-accent-bright` | `#C7F85A` | Lime hover state |
| `--color-accent-light` | `#ECFBC8` | Pale lime tint fills |
| `--color-accent-dark` | `#3D5300` | ONLY lime safe as text (AA on paper) |

### State Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-clay-success` | `#B6F03C` | Success = lime |
| `--color-clay-warning` | `#E8A317` | Timer, warnings = amber |
| `--color-clay-danger` | `#E11D48` | Errors, danger |
| `--color-clay-danger-dark` | `#BE123C` | Danger hover |

### Code Editor Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-code-bg` | `#0E0F13` | Monaco editor dark surface |
| `--color-code-fg` | `#E8E6DF` | Editor text |

### Tailwind Built-in Colors (used directly in JSX, not in @theme)

| Color group | Usage context |
|---|---|
| `teal-500/600/700/800` | Hero badge, course button, teal outcome card |
| `emerald-50/100/200/600/700/800` | Success states, passed badges |
| `amber-50/100/200/300/800/900/950` | Warning banners, fresher disclaimer |
| `rose-200/500/600/700` | Error states |
| `blue-200/500` | Internship card |
| `purple-200/900` | VidyaSetu card |
| `indigo-600/700` | Round 2/4 action buttons |
| `slate-50/100/200/400/600/700/800/900` | Neutral backgrounds, pipeline cards |

---

## 7. Global CSS and Design Tokens

### CSS Custom Properties (`@theme` block in `src/index.css`)

```css
@theme {
  /* Surfaces */
  --color-clay-bg:          #F7F5F0;
  --color-clay-surface:     #FFFFFF;
  --color-clay-text:        #16181D;
  --color-clay-muted:       #5A5E68;
  --color-clay-line:        #E7E3DA;

  /* Accent */
  --color-accent:           #B6F03C;
  --color-accent-bright:    #C7F85A;
  --color-accent-light:     #ECFBC8;
  --color-accent-dark:      #3D5300;

  /* States */
  --color-clay-success:     #B6F03C;
  --color-clay-warning:     #E8A317;
  --color-clay-danger:      #E11D48;
  --color-clay-danger-dark: #BE123C;

  /* Code */
  --color-code-bg:          #0E0F13;
  --color-code-fg:          #E8E6DF;

  /* Fonts */
  --font-heading: 'Nunito', ui-sans-serif, system-ui, sans-serif;
  --font-body:    'DM Sans',  ui-sans-serif, system-ui, sans-serif;

  /* Animations */
  --animate-pulse-soft: pulse-soft 2.5s ease-in-out infinite;
}
```

### Custom Utility Classes

| Utility | Purpose |
|---|---|
| `clay-card` | Card: `border-radius: 1.25rem`, 3-layer box-shadow, white bg |
| `clay-card-hover` | Hover lift: `translateY(-4px)` + deeper shadow |
| `clay-btn` | Button base: flex, gap, 1.25rem radius, Nunito 700 |
| `clay-btn-primary` | Lime fill button with 3D shadow |
| `clay-btn-ghost` | White button with deep lime text |
| `clay-input` | Input: 1rem radius, 2px border, inset shadow, lime focus ring |
| `clay-pill` | Pill badge: full radius, 12px, bold 700 |
| `code-caret` | Blinking lime terminal cursor |

### Border Radii

| Context | Value |
|---|---|
| Cards, buttons, pill | `1.25rem` (20px) |
| Inputs (`clay-input`) | `1rem` (16px) |
| Status badges | `9999px` (fully rounded) |
| Pipeline cards | `0.75rem` — `rounded-xl` |
| Skill tags, step chips | `0.5rem` — `rounded-lg` |

### Container Widths

| Token | Value | Used for |
|---|---|---|
| `max-w-md` | ~448px | Auth pages |
| `max-w-3xl` | ~768px | Exam/status pages |
| `max-w-4xl` | ~896px | Forms |
| `max-w-5xl` | ~1024px | Dashboard, sections |
| `max-w-6xl` | ~1152px | Hero, footer |
| Horizontal padding | `px-6` (24px) | All sections |

### Global Browser Overrides

```css
::selection {
  background-color: rgba(182, 240, 60, 0.30);
  color: var(--color-clay-text);
}

html {
  caret-color: var(--color-clay-text);
  scrollbar-color: var(--color-accent) var(--color-clay-bg);
}
```

---

## 8. Animation Inventory

### CSS Keyframe Animations (`src/index.css`)

#### `pulse-soft` — Lime Glow Pulse

```css
@keyframes pulse-soft {
  0%, 100% { box-shadow: 0 0 0 0 rgba(182, 240, 60, 0.55); }
  50%       { box-shadow: 0 0 0 6px rgba(182, 240, 60, 0); }
}
```

| Property | Value |
|---|---|
| Duration | `2.5s` |
| Easing | `ease-in-out` |
| Iteration | `infinite` |
| Effect | Expanding lime glow ring |

#### `caret-blink` — Terminal Cursor

```css
@keyframes caret-blink {
  0%, 45%  { opacity: 1; }
  50%, 95% { opacity: 0; }
  100%     { opacity: 1; }
}
```

| Property | Value |
|---|---|
| Duration | `1.1s` |
| Timing | `steps(1)` — instant snap |
| Iteration | `infinite` |
| Used by | `.code-caret` utility |

---

### JavaScript / Motion Animations

All wrapped by `<MotionConfig reducedMotion="user">` in `App.tsx`.

#### Signature Easing Curve (used everywhere)

```ts
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
```

#### A1 — Hero Code Preview Card Entrance

| Property | Value |
|---|---|
| File | `src/pages/HomePage.tsx` L113–118 |
| Trigger | Page load |
| Initial | `opacity: 0, y: 30, rotate: -1.5deg` |
| Final | `opacity: 1, y: 0, rotate: 0deg` |
| Duration | `700ms` |
| Delay | `150ms` |
| Easing | `[0.22, 1, 0.36, 1]` |
| Reduced motion | `rotate` forced to 0 |

#### A2 — Floating Badge ("100% Fresher Focused")

| Property | Value |
|---|---|
| File | `src/pages/HomePage.tsx` L153–158 |
| Trigger | Always (loops) |
| Animation | `y: [0, -5, 0]` |
| Duration | `3200ms` |
| Easing | `easeInOut` |
| Iteration | `Infinity` |
| Reduced motion | Disabled entirely |

#### A3 — `<Reveal>` Fade + Rise on Scroll

| Property | Value |
|---|---|
| File | `src/shared/motion.tsx` L22–33 |
| Trigger | Element enters viewport |
| Viewport margin | `-80px` |
| Once | `true` |
| Initial | `opacity: 0, y: 24` |
| Final | `opacity: 1, y: 0` |
| Duration | `550ms` |
| Easing | `[0.22, 1, 0.36, 1]` |
| Delay | Configurable prop (default 0) |

#### A4 — `<Stagger>` + `<StaggerItem>` Staggered Entrance

| Property | Value |
|---|---|
| File | `src/shared/motion.tsx` L36–47 |
| Trigger | Container enters viewport |
| Viewport margin | `-60px` |
| Once | `true` |
| Stagger interval | `80ms` per child |
| Initial delay | `40ms` |
| Per-item: Initial | `opacity: 0, y: 20` |
| Per-item: Final | `opacity: 1, y: 0` |
| Per-item duration | `500ms` |
| Per-item easing | `[0.22, 1, 0.36, 1]` |

#### A5 — Page Transition

| Property | Value |
|---|---|
| File | `src/shared/Layout.tsx` L77–87 |
| Trigger | Route navigation |
| Mode | `wait` (exit before enter) |
| Enter: Initial | `opacity: 0, y: 8` |
| Enter: Animate | `opacity: 1, y: 0` |
| Exit | `opacity: 0, y: -8` |
| Duration | `250ms` |
| Easing | `[0.22, 1, 0.36, 1]` |

---

## 9. Animation Timing and Easing Summary

| Animation | Duration | Delay | Easing | Repeat |
|---|---|---|---|---|
| Hero card entrance | 700ms | 150ms | `[0.22, 1, 0.36, 1]` | Once |
| Floating badge y-loop | 3200ms | 0 | `easeInOut` | Infinite |
| `Reveal` fade+rise | 550ms | 0 (configurable) | `[0.22, 1, 0.36, 1]` | Once |
| `StaggerItem` | 500ms | 40ms + 80ms×n | `[0.22, 1, 0.36, 1]` | Once |
| Page transition in | 250ms | 0 | `[0.22, 1, 0.36, 1]` | Per nav |
| Page transition out | 250ms | 0 | `[0.22, 1, 0.36, 1]` | Per nav |
| `pulse-soft` glow | 2500ms | 0 | `ease-in-out` | Infinite |
| `caret-blink` | 1100ms | 0 | `steps(1)` | Infinite |
| Tailwind `animate-pulse` | 2000ms | 0 | `ease-in-out` | Infinite |
| Card CSS hover | 200ms | 0 | `ease-out` | Per hover |
| Button CSS hover | 150ms (transform) / 200ms (shadow) | 0 | `ease-out` | Per hover |
| Input CSS focus | 150ms | 0 | `ease-out` | Per focus |

### The Signature Easing Curve

```css
cubic-bezier(0.22, 1, 0.36, 1)
```

Matches `easeOutExpo`. Use this for all entrance and exit animations.

---

## 10. Hover and Interaction Effects

### Card Hover (`.clay-card-hover`)

```
Default:  translateY(0),   shadow: 0 8px 24px rgba(22,24,29,0.09)
:hover:   translateY(-4px), shadow: 0 14px 36px rgba(22,24,29,0.14)
Transition: box-shadow 200ms ease-out, transform 200ms ease-out
```

### Primary Button (`.clay-btn-primary`)

```
Default:  bg #B6F03C,   shadow: 0 6px 18px rgba(22,24,29,0.18)
:hover:   bg #C7F85A, translateY(-2px), shadow: 0 10px 26px
:active:  scale(0.97)
:focus-visible: outline 3px solid #16181D, offset 2px
Transition: transform 150ms ease-out, box-shadow/bg 200ms ease-out
```

### Ghost Button (`.clay-btn-ghost`)

```
Default:  translateY(0),   shadow: 0 4px 12px rgba(22,24,29,0.08)
:hover:   translateY(-2px), shadow: 0 8px 20px rgba(22,24,29,0.12)
:active:  scale(0.97)
```

### Input (`.clay-input`)

```
Default:  border 2px solid rgba(22,24,29,0.12), inset shadow
:focus:   border-color #3D5300, + 0 0 0 4px rgba(182,240,60,0.35) ring
Transition: border-color 150ms ease-out, box-shadow 150ms ease-out
```

### Navigation Links

```
transition-colors hover:text-accent-dark
(Tailwind default: 150ms ease-in-out, color only)
```

---

## 11. Scroll-Triggered Animations

Uses Motion's `whileInView`. No AOS, no manual Intersection Observer.

### `<Reveal>` — used on:
- "How the Hiring Assessment Works" section heading
- "Your Journey Doesn't End" section heading
- Bottom CTA `<ClayCard>` on HomePage
- Various H2 blocks across pages

### `<Stagger>` + `<StaggerItem>` — used on:
- Hero left column (badge, H1, body, disclaimer, CTA buttons)
- Outcomes grid (5 outcome cards)

### Viewport Settings

| Component | margin | once |
|---|---|---|
| `<Reveal>` | `-80px` | `true` |
| `<Stagger>` | `-60px` | `true` |

**No parallax effects.**
**No scroll-position-dependent transforms** (no `useScroll`, no `useTransform`).

---

## 12. Responsive Behavior

### Breakpoints (Tailwind v4 defaults)

| Prefix | Min-width | Device |
|---|---|---|
| (none) | 0px | Mobile-first base |
| `sm:` | 640px | Large phones / small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |

### Responsive Typography

| Element | Mobile | sm/md | lg |
|---|---|---|---|
| H1 hero | 36px | 48px | 60px |
| H2 sections | 30px | 36px | — |
| Hero body | 16px | 18px | — |
| Job title H2 | 24px | 30px | — |

### Responsive Layout

| Section | Mobile | md+ |
|---|---|---|
| Hero | 1 col | `grid-cols-[1.2fr_0.9fr]` |
| Register | 1 col | `grid-cols-[1fr_440px]` |
| Footer | 1 col | 4-col |
| Pipeline | 1 col | 4 cols |
| Outcome cards | 1 col | 2 col → 3 col |

### Reduced Motion Guards

**CSS (affects CSS animations and transitions):**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**JavaScript (affects Motion JS-driven transforms):**

```tsx
/* App.tsx */
<MotionConfig reducedMotion="user">
  {/* app */}
</MotionConfig>

/* HomePage.tsx */
const reduce = useReducedMotion();
// rotate: reduce ? 0 : -1.5
// animate={reduce ? {} : { y: [0, -5, 0] }}
```

> Both guards must be present. The CSS rule cannot reach Motion's JS transforms.

---

## 13. Animation Dependencies

| Package | Version | Role |
|---|---|---|
| `motion` | `^13.2.0` | Animation library (Framer Motion rebranded) |

### Imports

```ts
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { useReducedMotion } from 'motion/react';
import { type Variants } from 'motion/react';
```

### Not present in this project

- GSAP, AOS, Anime.js, Lottie, React Spring — none installed
- Custom Intersection Observer code — not present
- CSS `@scroll-timeline` — not used

---

## 14. Source File Paths

| File | Purpose |
|---|---|
| `frontend/src/index.css` | All tokens, utilities, keyframes, global styles |
| `frontend/index.html` | Font meta, SEO |
| `frontend/src/App.tsx` | `MotionConfig` root wrapper |
| `frontend/src/shared/clay.tsx` | `ClayCard`, `ClayButton` components |
| `frontend/src/shared/motion.tsx` | `Reveal`, `Stagger`, `StaggerItem` animation wrappers |
| `frontend/src/shared/Layout.tsx` | Page transitions, nav bar |
| `frontend/src/pages/HomePage.tsx` | Hero animations, Stagger/Reveal usage |
| `frontend/src/shared/Footer.tsx` | Footer typography |
| `frontend/src/auth/LoginPage.tsx` | Login form, clay-card, clay-input |
| `frontend/src/auth/RegisterPage.tsx` | Register form, two-column layout |
| `frontend/src/pages/ApplicationFormPage.tsx` | Multi-step form, progress tabs |
| `frontend/src/pages/DashboardPage.tsx` | Pipeline cards, dashboard grid |
| `frontend/src/rounds/r1/Round1Page.tsx` | Exam UI, sticky timer |
| `frontend/package.json` | Dependency versions |

---

## 15. Reuse Instructions

### Step 1 — Install fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
```

### Step 2 — Copy design-system-export CSS files

See `design-system-export/` folder next to this file.

### Step 3 — Install Motion

```bash
npm install motion
```

### Step 4 — Copy Motion wrapper components

- `src/shared/motion.tsx` → `Reveal`, `Stagger`, `StaggerItem`
- `src/shared/clay.tsx` → `ClayCard`, `ClayButton`

Remove or replace `react-router-dom` imports in `clay.tsx` if not using React Router.

### Step 5 — Add MotionConfig root wrapper

```tsx
import { MotionConfig } from 'motion/react';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      {/* your app */}
    </MotionConfig>
  );
}
```

### Step 6 — Tailwind v4 vs v3

- **Tailwind v4**: Copy the `@theme` block from `index.css` directly.
- **Tailwind v3**: Use `design-system-export/tailwind.config.v3.js` instead.

### Step 7 — Verify both reduced-motion guards are present

1. `<MotionConfig reducedMotion="user">` in React root.
2. CSS `prefers-reduced-motion` media query from `animations.css`.

---

## Appendix — Items Requiring Browser Inspection

| Item | Note |
|---|---|
| Exact monospace font rendered | Browser/OS dependent |
| Default line heights (no `leading-*`) | Browser default ~1.5 |
| Tailwind `transition-colors` exact duration | Default: `150ms ease-in-out` |
| Tailwind `animate-pulse` values | Default: `opacity 1→0.5→1, 2s ease-in-out infinite` |
| `shadow-sm/md/lg` exact pixel values | Tailwind v4 defaults |
