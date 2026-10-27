# Upstairs Job Platform — "Ink + Acid Lime" Claymorphism Design System Export

This directory contains the drop-in design tokens, stylesheets, components, and configurations extracted from the **Upstairs Job Platform** frontend.

You can drop these files directly into any new or existing web project (Vanilla CSS, Tailwind v3, Tailwind v4, React, Next.js, Vite, etc.) to achieve the identical visual style, claymorphic 3D surfaces, typography, transitions, and scroll animations.

---

## Directory Overview

| File | Purpose | Framework / Env |
|---|---|---|
| `fonts.css` | Google Fonts import (`Nunito` + `DM Sans`) and global font-family rules | Any (HTML/CSS) |
| `tokens.css` | CSS Custom Properties (`:root`) for colors, shadows, radii, fonts, and easings | Pure CSS / Any |
| `components.css` | Standalone CSS classes (`.clay-card`, `.clay-btn`, `.clay-input`, `.clay-pill`, etc.) | Pure CSS / Any |
| `animations.css` | Keyframes (`pulse-soft`, `caret-blink`, `float-subtle`) + reduced-motion kill switch | Pure CSS / Any |
| `tailwind-v4-theme.css` | Complete `@theme` and `@utility` block for Tailwind CSS v4 | Tailwind CSS v4 |
| `tailwind.config.v3.js` | Config object extension for `theme.extend` | Tailwind CSS v3 |
| `motion.tsx` | Motion components: `<Reveal>`, `<Stagger>`, `<StaggerItem>`, and `EASE` curve | React + `motion` |
| `clay.tsx` | Clay components: `<ClayCard>`, `<ClayButton>`, `<ClayPill>` | React / TypeScript |

---

## Quick Start Options

### Option 1: Vanilla HTML & CSS (No Build Step or Bundler)
In your `<head>` or main stylesheet, import in this order:
```html
<link rel="stylesheet" href="fonts.css" />
<link rel="stylesheet" href="tokens.css" />
<link rel="stylesheet" href="components.css" />
<link rel="stylesheet" href="animations.css" />
```

Then write standard HTML:
```html
<!-- Clay Card with hover lift -->
<div class="clay-card clay-card-hover">
  <span class="clay-pill clay-pill-accent">FEATURED</span>
  <h2 style="margin-top: 1rem;">Candidate Dashboard</h2>
  <p class="text-clay-muted">Your assessment is underway.</p>
  <button class="clay-btn clay-btn-primary">Start Exam</button>
  <button class="clay-btn clay-btn-ghost">View Guidelines</button>
</div>

<!-- Clay Form Input -->
<input type="text" class="clay-input" placeholder="Enter your email address" />
```

---

### Option 2: Modern Tailwind CSS v4 Project
1. Copy `tailwind-v4-theme.css` into your project's main stylesheet (e.g. `src/index.css`).
2. That's it! All Tailwind classes, custom utilities (`clay-card`, `clay-btn-primary`, etc.), and `@theme` tokens are immediately active.

---

### Option 3: Tailwind CSS v3 Project
1. Import `fonts.css` into your CSS bundle.
2. Merge the configuration in `tailwind.config.v3.js` into your `tailwind.config.js` `theme.extend` object.
3. Import `components.css` into your CSS entry point to get the `.clay-*` classes.

---

### Option 4: React / Next.js / Vite with Motion
1. Install Motion:
   ```bash
   npm install motion
   ```
2. Wrap your application root in `<MotionConfig reducedMotion="user">` (handles accessibility automatically):
   ```tsx
   import { MotionConfig } from 'motion/react';

   export default function App({ children }: { children: React.ReactNode }) {
     return (
       <MotionConfig reducedMotion="user">
         {children}
       </MotionConfig>
     );
   }
   ```
3. Copy `motion.tsx` and `clay.tsx` into your components directory.
4. Use them anywhere in your UI:
   ```tsx
   import { ClayCard, ClayButton } from './clay';
   import { Reveal, Stagger, StaggerItem } from './motion';

   export function HeroSection() {
     return (
       <Stagger className="max-w-4xl mx-auto py-12">
         <StaggerItem>
           <h1 className="font-heading text-5xl font-black text-clay-text">
             Launch Your Engineering Career
           </h1>
         </StaggerItem>

         <StaggerItem>
           <ClayCard hover className="mt-8">
             <p className="text-clay-muted">Comprehensive evaluation pipeline.</p>
             <ClayButton variant="primary" className="mt-4">Apply Now</ClayButton>
           </ClayCard>
         </StaggerItem>
       </Stagger>
     );
   }
   ```

---

## Complete Documentation
For exhaustive documentation covering all font weights, exact typography scales by breakpoint, color contrast rules, animation timing graphs, and component catalogs, see:
- [DESIGN_SYSTEM_DOCUMENTATION.md](../DESIGN_SYSTEM_DOCUMENTATION.md)
