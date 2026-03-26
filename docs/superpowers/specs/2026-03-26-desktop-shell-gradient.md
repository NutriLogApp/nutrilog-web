# Desktop App Shell + Gradient Consistency — Design Spec

**Date:** 2026-03-26
**Status:** Approved

## Overview

Add a visible app container on desktop so the mobile-first layout looks intentional on wide screens. Revert the hero gradient to edge-to-edge (no border-radius). Add the same gradient to ProfileHero for visual consistency.

## 1. Desktop App Shell

**Where:** `AppLayout.tsx` — wraps all authenticated pages.

**Behavior:**
- On screens wider than 512px: the `<Outlet>` content renders inside a centered container with rounded corners and a shadow, sitting on a slightly darker background.
- On mobile (<=512px): no visual change. The shell is invisible — content fills the screen as before.

**Breakpoint:** Use a custom CSS media query `@media (min-width: 513px)` — NOT Tailwind's `md:` (which is 768px). We want the shell to appear as soon as the screen is wider than the app's max-width.

**Shell container CSS (desktop only):**
- `max-width: 512px`
- `margin: 0 auto`
- `border-radius: 24px`
- `box-shadow: var(--shadow-shell)`
- `overflow: hidden`
- `min-height: 100dvh` (dynamic viewport height for mobile Safari compatibility)
- `background: var(--bg-page)` (same as current page bg)

**New CSS variables in `index.css`:**

| Variable | `:root` (light) | `prefers-color-scheme: dark` / `.force-dark` | `.force-light` |
|----------|-----------------|----------------------------------------------|----------------|
| `--bg-shell-outer` | `#e4e7ed` | `#060810` | `#e4e7ed` |
| `--shadow-shell` | `0 4px 40px rgba(0,0,0,0.08)` | `0 4px 40px rgba(0,0,0,0.3)` | `0 4px 40px rgba(0,0,0,0.08)` |

These must be set in all three dark-mode blocks (`:root`, `@media prefers-color-scheme: dark`, `html.force-dark`, `html.force-light`) to match the existing CSS variable pattern.

**Outer background:** Applied to the outermost `AppLayout` div. On desktop, this background is visible in the areas flanking the centered shell. On mobile, the shell fills the screen so the outer bg is never visible.

**Implementation approach:**
- The `max-w-lg mx-auto` currently on individual pages moves to `AppLayout`. All pages should have their `max-w-lg mx-auto` wrappers removed since AppLayout handles it.
- The `AppLayout` outer div gets the shell-outer background on desktop.
- The inner content div gets the shell styling (radius, shadow, overflow hidden).

**Fixed-position elements:**
- **NavBar:** Uses `fixed bottom-0 inset-x-0` with `max-w-lg mx-auto`. It already aligns to 512px width, matching the shell. On desktop, it visually sits at the viewport bottom — this is acceptable since the shell has `min-height: 100dvh` so the NavBar aligns with the shell's bottom edge. The bottom `border-radius` of the shell is effectively hidden behind the NavBar.
- **Modals** (Modal.tsx, ConfirmDialog.tsx): Use `fixed inset-0` and will cover the full viewport. This is intentional — dimming the whole screen is standard UX.
- **Toasts** (queryConfig.ts): Positioned at `fixed bottom: 120px; left: 50%`. Will center in the viewport, which aligns with the shell since the shell is also centered.
- **OnboardingQuiz:** Uses `fixed inset-0` as a full-screen overlay. Intentionally escapes the shell.

## 2. HeroSection — Revert to Edge-to-Edge

**File:** `src/components/home/HeroSection.tsx`

Remove the `borderRadius` and `margin` that were added in the previous fix. The gradient should span the full width of the content area. On desktop, the shell container's `overflow: hidden` + `border-radius: 24px` will clip the top corners of the gradient naturally.

**Result:**
- Mobile: gradient goes edge-to-edge (same as original design)
- Desktop: gradient goes edge-to-edge within the shell, with the shell's top corners rounding it

Also remove the duplicate `paddingBottom` from `HomePage.tsx` line 64 — AppLayout already provides bottom padding.

## 3. ProfileHero — Add Theme Gradient

**File:** `src/components/profile/ProfileHero.tsx`

Add the same theme gradient background to the ProfileHero wrapper div. Currently the div has `className="relative px-5 pt-10 pb-4 text-center"` with no background.

**Change:** Add inline style:
```
background: linear-gradient(135deg,
  color-mix(in srgb, var(--theme-start) 14%, transparent),
  color-mix(in srgb, var(--theme-end) 8%, transparent))
```

This matches the HomePage hero gradient exactly. The avatar, name, and username sit on top of the gradient.

## 4. Pages NOT Changed (gradients)

- **TrendsPage** — no gradient. Data-heavy page, gradient would compete with chart colors.
- **ContestPage** — no gradient. Different page pattern.
- **SettingsPage** — no gradient. Utility page.

## Files Affected

| File | Change |
|------|--------|
| `src/components/AppLayout.tsx` | Add desktop shell container with media query, move max-w-lg here |
| `src/index.css` | Add `--bg-shell-outer` and `--shadow-shell` variables (all theme blocks) |
| `src/components/home/HeroSection.tsx` | Remove `borderRadius` and `margin` from gradient div |
| `src/components/profile/ProfileHero.tsx` | Add theme gradient background |
| `src/pages/HomePage.tsx` | Remove `max-w-lg mx-auto` and duplicate `paddingBottom` |
| `src/pages/ProfilePage.tsx` | Remove `max-w-lg mx-auto` |
| `src/pages/TrendsPage.tsx` | Remove `max-w-lg mx-auto` |
| `src/pages/ContestPage.tsx` | Remove `max-w-lg mx-auto` (3 instances) |
| `src/pages/AdminPage.tsx` | Remove `max-w-lg mx-auto` |
| `src/pages/SettingsPage.tsx` | Remove `max-w-lg mx-auto` |
| `src/pages/GroupLeaderboardPage.tsx` | Remove `max-w-lg mx-auto` |
| `src/pages/CreateGroupPage.tsx` | Remove `max-w-lg mx-auto` |

## Dark Mode

- Shell shadow adapts via `--shadow-shell` variable (light: 0.08 opacity, dark: 0.3 opacity)
- Outer background adapts via `--bg-shell-outer` variable
- All gradients use `var(--theme-start)` and `var(--theme-end)` which already adapt per theme
- Variables set in all three CSS paths (`:root`, `prefers-color-scheme: dark`, `.force-dark`, `.force-light`)

## RTL Support

No RTL impact. The shell is horizontally centered. Gradients are direction-agnostic.
