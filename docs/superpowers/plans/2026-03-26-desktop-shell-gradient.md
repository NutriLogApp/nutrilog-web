# Desktop App Shell + Gradient Consistency — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a visible centered app shell on desktop screens, revert hero gradient to edge-to-edge, and add the theme gradient to ProfileHero.

**Architecture:** Modify `AppLayout.tsx` to wrap content in a max-width shell with rounded corners and shadow on screens wider than 512px. Move `max-w-lg mx-auto` from individual pages to the layout. Add CSS variables for the outer background and shell shadow.

**Tech Stack:** React 19, TypeScript, CSS custom properties, `@media` query (standard CSS in `index.css`)

**Spec:** `docs/superpowers/specs/2026-03-26-desktop-shell-gradient.md`

---

## File Structure

### Modified Files
| File | Change |
|------|--------|
| `src/index.css` | Add `--bg-shell-outer` and `--shadow-shell` CSS variables to all theme blocks |
| `src/components/AppLayout.tsx` | Add desktop shell container with inner/outer divs and media query class |
| `src/components/home/HeroSection.tsx` | Remove `borderRadius` and `margin` from gradient div |
| `src/components/profile/ProfileHero.tsx` | Add theme gradient background |
| `src/pages/HomePage.tsx` | Remove `max-w-lg mx-auto` wrapper and duplicate `paddingBottom` |
| `src/pages/ProfilePage.tsx` | Remove `max-w-lg mx-auto` from wrapper div |
| `src/pages/TrendsPage.tsx` | Remove `max-w-lg mx-auto` from wrapper div |
| `src/pages/ContestPage.tsx` | Remove `max-w-lg mx-auto` from 3 wrapper divs |
| `src/pages/AdminPage.tsx` | Remove `max-w-lg mx-auto` from wrapper div |
| `src/pages/SettingsPage.tsx` | Remove `max-w-lg mx-auto` from wrapper div |
| `src/pages/GroupLeaderboardPage.tsx` | Remove `max-w-lg mx-auto` from wrapper div |
| `src/pages/CreateGroupPage.tsx` | Remove `max-w-lg mx-auto` from wrapper div |

---

## Task 1: CSS Variables — Shell Outer Background + Shadow

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add variables to `:root` block**

In `src/index.css`, add after `--ring-track` (line ~28) and before the closing `}`:

```css
--bg-shell-outer: #e4e7ed;
--shadow-shell: 0 4px 40px rgba(0,0,0,0.08);
```

- [ ] **Step 2: Add variables to `@media (prefers-color-scheme: dark)` block**

In the `html:not(.force-light)` block (~line 33-48), add before the closing `}`:

```css
--bg-shell-outer: #060810;
--shadow-shell: 0 4px 40px rgba(0,0,0,0.3);
```

- [ ] **Step 3: Add variables to `html.force-dark` block**

In the `html.force-dark` block (~line 50-67), add before the closing `}`:

```css
--bg-shell-outer: #060810;
--shadow-shell: 0 4px 40px rgba(0,0,0,0.3);
```

- [ ] **Step 4: Add the desktop shell CSS class**

After the `.glass-card-sm` block (~line 101), add:

```css
/* ========== Desktop App Shell ========== */
@media (min-width: 513px) {
  .app-shell-outer {
    background-color: var(--bg-shell-outer);
  }
  .app-shell-inner {
    max-width: 512px;
    margin: 0 auto;
    border-radius: 24px;
    box-shadow: var(--shadow-shell);
    overflow: hidden;
    background-color: var(--bg-page);
  }
}
```

Note: `html.force-light` does NOT need `--bg-shell-outer` or `--shadow-shell` because it inherits from `:root`.

- [ ] **Step 5: Verify CSS loads**

Run: `cd /Users/rrozen/personal/app/nutrilog-web && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/index.css
git commit -m "feat: add desktop shell CSS variables and media query classes"
```

---

## Task 2: AppLayout — Desktop Shell Container

**Files:**
- Modify: `src/components/AppLayout.tsx`

- [ ] **Step 1: Rewrite AppLayout with shell wrapper**

Replace the entire file with:

```tsx
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

export default function AppLayout() {
  return (
    <div className="app-shell-outer min-h-screen" style={{ backgroundColor: "var(--bg-page)", color: "var(--text-primary)" }}>
      <div className="app-shell-inner min-h-dvh" style={{ paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))" }}>
        <Outlet />
      </div>
      <NavBar />
    </div>
  );
}
```

Key changes:
- Outer div gets `app-shell-outer` class (sets darker bg on desktop)
- Inner div gets `app-shell-inner` class (max-width, radius, shadow on desktop)
- `min-h-dvh` on inner div (dynamic viewport height)
- `paddingBottom` moved to inner div (content area)
- `min-h-screen` on outer div keeps full viewport coverage
- NavBar stays outside the inner div (it's fixed-position and self-constrains with `max-w-lg mx-auto`)

- [ ] **Step 2: Verify it builds**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/AppLayout.tsx
git commit -m "feat: add desktop app shell container to AppLayout"
```

---

## Task 3: Remove `max-w-lg mx-auto` From All Pages

**Files:**
- Modify: `src/pages/HomePage.tsx:64`
- Modify: `src/pages/ProfilePage.tsx:38`
- Modify: `src/pages/TrendsPage.tsx:74`
- Modify: `src/pages/ContestPage.tsx:27,50,71`
- Modify: `src/pages/AdminPage.tsx:31`
- Modify: `src/pages/SettingsPage.tsx:105`
- Modify: `src/pages/GroupLeaderboardPage.tsx:19`
- Modify: `src/pages/CreateGroupPage.tsx:25`

- [ ] **Step 1: HomePage — remove max-w-lg and duplicate paddingBottom**

In `src/pages/HomePage.tsx` line 64, change:
```tsx
<div className="max-w-lg mx-auto" style={{ paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))" }}>
```
To:
```tsx
<div>
```

The `paddingBottom` is now handled by AppLayout's inner div. The `max-w-lg mx-auto` is now handled by the shell.

- [ ] **Step 2: ProfilePage — remove max-w-lg**

In `src/pages/ProfilePage.tsx` line 38, change:
```tsx
<div className="max-w-lg mx-auto pb-8">
```
To:
```tsx
<div className="pb-8">
```

- [ ] **Step 3: TrendsPage — remove max-w-lg**

In `src/pages/TrendsPage.tsx` line 74, change:
```tsx
<div className="px-5 pt-8 pb-4 max-w-lg mx-auto">
```
To:
```tsx
<div className="px-5 pt-8 pb-4">
```

- [ ] **Step 4: ContestPage — remove max-w-lg from 3 divs**

In `src/pages/ContestPage.tsx`:

Line 27: change `"px-5 pt-8 pb-4 max-w-lg mx-auto flex flex-col items-center justify-center"` to `"px-5 pt-8 pb-4 flex flex-col items-center justify-center"`

Line 50: same change.

Line 71: change `"px-5 pt-8 pb-4 max-w-lg mx-auto"` to `"px-5 pt-8 pb-4"`

- [ ] **Step 5: AdminPage — remove max-w-lg**

In `src/pages/AdminPage.tsx` line 31, change:
```tsx
<div className="px-5 pt-8 pb-8 max-w-lg mx-auto">
```
To:
```tsx
<div className="px-5 pt-8 pb-8">
```

- [ ] **Step 6: SettingsPage — remove max-w-lg**

In `src/pages/SettingsPage.tsx` line 105, change:
```tsx
<div className="pb-8 max-w-lg mx-auto">
```
To:
```tsx
<div className="pb-8">
```

- [ ] **Step 7: GroupLeaderboardPage — remove max-w-lg**

In `src/pages/GroupLeaderboardPage.tsx` line 19, change:
```tsx
<div className="px-5 pt-6 pb-4 max-w-lg mx-auto space-y-5">
```
To:
```tsx
<div className="px-5 pt-6 pb-4 space-y-5">
```

- [ ] **Step 8: CreateGroupPage — remove max-w-lg**

In `src/pages/CreateGroupPage.tsx` line 25, change:
```tsx
<div className="px-5 pt-6 pb-4 max-w-lg mx-auto space-y-5">
```
To:
```tsx
<div className="px-5 pt-6 pb-4 space-y-5">
```

- [ ] **Step 9: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds with no errors.

- [ ] **Step 10: Commit**

```bash
git add src/pages/HomePage.tsx src/pages/ProfilePage.tsx src/pages/TrendsPage.tsx src/pages/ContestPage.tsx src/pages/AdminPage.tsx src/pages/SettingsPage.tsx src/pages/GroupLeaderboardPage.tsx src/pages/CreateGroupPage.tsx
git commit -m "refactor: remove per-page max-w-lg (now in AppLayout shell)"
```

---

## Task 4: HeroSection — Revert Gradient to Edge-to-Edge

**Files:**
- Modify: `src/components/home/HeroSection.tsx:46-48`

- [ ] **Step 1: Remove borderRadius and margin from gradient div**

In `src/components/home/HeroSection.tsx`, the style object on the outer div (~line 46) currently has:
```typescript
background: `linear-gradient(...)`,
padding: "16px 16px 12px",
borderRadius: "var(--radius)",
margin: "0 16px",
```

Remove `borderRadius` and `margin` lines so it becomes:
```typescript
style={{
  background: `linear-gradient(135deg, color-mix(in srgb, var(--theme-start) 14%, transparent), color-mix(in srgb, var(--theme-end) 8%, transparent))`,
  padding: "16px 16px 12px",
}}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/home/HeroSection.tsx
git commit -m "fix: revert hero gradient to edge-to-edge (shell handles rounding)"
```

---

## Task 5: ProfileHero — Add Theme Gradient

**Files:**
- Modify: `src/components/profile/ProfileHero.tsx:33`

- [ ] **Step 1: Add gradient background to ProfileHero wrapper**

In `src/components/profile/ProfileHero.tsx` line 33, change:
```tsx
<div className="relative px-5 pt-10 pb-4 text-center">
```
To:
```tsx
<div
  className="relative px-5 pt-10 pb-4 text-center"
  style={{
    background: `linear-gradient(135deg, color-mix(in srgb, var(--theme-start) 14%, transparent), color-mix(in srgb, var(--theme-end) 8%, transparent))`,
  }}
>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/profile/ProfileHero.tsx
git commit -m "feat: add theme gradient background to ProfileHero"
```

---

## Task 6: Verification

- [ ] **Step 1: TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 2: Build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 3: Lint**

Run: `npm run lint 2>&1 | tail -10`
Expected: No new lint errors (pre-existing ones in TrendsPage/SettingsPage are OK).

- [ ] **Step 4: Tests**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 5: Visual verification**

Run: `npm run dev`

Verify on desktop (wide window):
1. App appears in a centered container with rounded corners and shadow
2. Background outside the container is slightly darker
3. HomePage hero gradient goes edge-to-edge, clipped by shell's top corners
4. Profile page hero has the same gradient behind avatar/name
5. NavBar aligns with the shell width
6. All pages (Trends, Contest, Admin, Settings) fit within the shell
7. Modals still overlay the full viewport

Verify on mobile (narrow window or phone):
1. No visible shell — app fills the screen as before
2. Hero gradient goes edge-to-edge
3. Everything looks the same as before the change

- [ ] **Step 6: Dark mode verification**

Toggle dark mode. Verify:
- Shell shadow is stronger (more visible)
- Outer background is darker than app background
- Gradient adapts to current theme

---

## Notes for Implementer

### Key Pattern
The shell uses standard CSS classes (`.app-shell-outer`, `.app-shell-inner`) behind a `@media (min-width: 513px)` query. On mobile, these classes have no effect — no styles are applied. This means zero mobile impact.

### Why 513px, not Tailwind `md:`
Tailwind's `md:` breakpoint is 768px. We want the shell to appear as soon as the viewport exceeds the app's max-width (512px). Using 513px means the shell activates exactly when the content would start looking stretched.

### NavBar positioning
NavBar uses `fixed bottom-0 inset-x-0` with its own `max-w-lg mx-auto`. It stays viewport-fixed but width-aligned with the shell. This is intentional — a fixed NavBar inside `overflow: hidden` would cause scrolling issues.

### LoginPage / PendingPage
These render outside `AppLayout` (different routes in App.tsx), so they are unaffected by the shell. LoginPage has its own `mx-auto` which is correct — it's not wrapped in the shell.

### CSS variable inheritance
`:root` sets light defaults. `force-light` inherits from `:root` automatically, so it doesn't need explicit `--bg-shell-outer` or `--shadow-shell`. Only `@media prefers-color-scheme: dark` and `.force-dark` need dark overrides.
