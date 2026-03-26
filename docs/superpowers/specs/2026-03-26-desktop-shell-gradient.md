# Desktop App Shell + Gradient Consistency — Design Spec

**Date:** 2026-03-26
**Status:** Approved

## Overview

Add a visible app container on desktop so the mobile-first layout looks intentional on wide screens. Revert the hero gradient to edge-to-edge (no border-radius). Add the same gradient to ProfileHero for visual consistency.

## 1. Desktop App Shell

**Where:** `AppLayout.tsx` — wraps all authenticated pages.

**Behavior:**
- On screens wider than 512px (`max-w-lg`): the `<Outlet>` content renders inside a centered container with rounded corners and a shadow, sitting on a slightly darker background.
- On mobile (<=512px): no visual change. The shell is invisible — content fills the screen as before.

**Shell container CSS (desktop only, via media query or Tailwind `md:` breakpoint):**
- `max-width: 512px`
- `margin: 0 auto`
- `border-radius: 24px`
- `box-shadow: 0 4px 40px rgba(0,0,0,0.08)`
- `overflow: hidden`
- `min-height: 100vh` (so the shell always fills the viewport height)
- `background: var(--bg-page)` (same as current page bg)

**Outer background (the area outside the shell):**
- New CSS variable `--bg-shell-outer` added to `:root` in `index.css`
- Light mode: `#e4e7ed` — slightly darker/cooler than `--bg-page` (#f2f4f7)
- Dark mode: `#060810` — slightly darker than dark `--bg-page` (#0b0e14)
- Applied to `body` or the outermost `AppLayout` div via media query

**Implementation approach:**
- The `max-w-lg mx-auto` currently on individual pages (HomePage, ProfilePage) moves to `AppLayout`. Individual pages no longer need their own max-width wrapper.
- The `AppLayout` outer div gets the shell-outer background on desktop.
- The inner content div gets the shell styling (radius, shadow, overflow hidden).

**NavBar:** Already positioned `fixed bottom-0 inset-x-0` with `max-w-lg mx-auto`. It should stay within the shell visually. Since the NavBar already uses `max-w-lg`, it will align with the shell container naturally.

## 2. HeroSection — Revert to Edge-to-Edge

**File:** `src/components/home/HeroSection.tsx`

Remove the `borderRadius` and `margin` that were added in the previous fix. The gradient should span the full width of the content area. On desktop, the shell container's `overflow: hidden` + `border-radius: 24px` will clip the top corners of the gradient naturally.

**Result:**
- Mobile: gradient goes edge-to-edge (same as original design)
- Desktop: gradient goes edge-to-edge within the shell, with the shell's top corners rounding it

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

## 4. Pages NOT Changed

- **TrendsPage** — no gradient. Data-heavy page, gradient would compete with chart colors.
- **ContestPage** — no gradient. Different page pattern.
- **SettingsPage** — no gradient. Utility page.

## Files Affected

| File | Change |
|------|--------|
| `src/components/AppLayout.tsx` | Add desktop shell container with media query |
| `src/index.css` | Add `--bg-shell-outer` variable (light + dark) |
| `src/components/home/HeroSection.tsx` | Remove `borderRadius` and `margin` from gradient div |
| `src/components/profile/ProfileHero.tsx` | Add theme gradient background |
| `src/pages/HomePage.tsx` | Remove `max-w-lg mx-auto` (moved to AppLayout) |
| `src/pages/ProfilePage.tsx` | Remove `max-w-lg mx-auto` (moved to AppLayout) |

## Dark Mode

- Shell shadow in dark mode: `0 4px 40px rgba(0,0,0,0.3)` (stronger shadow since background is darker)
- Outer background adapts via `--bg-shell-outer` variable
- All gradients use `var(--theme-start)` and `var(--theme-end)` which already adapt per theme

## RTL Support

No RTL impact. The shell is horizontally centered. Gradients are direction-agnostic.
