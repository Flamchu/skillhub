# SkillHub Design System & Styling Guide

This document defines the complete design system for SkillHub, ensuring consistent and professional styling across all components and pages.

## 🎨 Color System

### Semantic Colors (Background & Layout)

| Color                  | Usage                                             | Class                 | CSS Variable                    |
| ---------------------- | ------------------------------------------------- | --------------------- | ------------------------------- |
| **Background Default** | Main page background                              | `bg-background`       | `var(--color-background)`       |
| **Background Alt**     | Secondary backgrounds (dashboards, listing pages) | `bg-background-alt`   | `var(--color-background-alt)`   |
| **Background Muted**   | Subtle backgrounds, disabled states               | `bg-background-muted` | `var(--color-background-muted)` |

### Surface Colors (Cards & Components)

| Color                | Usage                                | Class                 | CSS Variable                    |
| -------------------- | ------------------------------------ | --------------------- | ------------------------------- |
| **Surface Default**  | Cards, modals, form containers       | `bg-surface`          | `var(--color-surface)`          |
| **Surface Elevated** | Prominent cards, dropdowns           | `bg-surface-elevated` | `var(--color-surface-elevated)` |
| **Surface Muted**    | Input backgrounds, subtle containers | `bg-surface-muted`    | `var(--color-surface-muted)`    |
| **Surface Hover**    | Interactive element hover states     | `bg-surface-hover`    | `var(--color-surface-hover)`    |
| **Surface Pressed**  | Active/pressed states                | `bg-surface-pressed`  | `var(--color-surface-pressed)`  |

### Text Colors (Foreground)

| Color                   | Usage                       | Class                      | CSS Variable                       |
| ----------------------- | --------------------------- | -------------------------- | ---------------------------------- |
| **Foreground Default**  | Primary text, headings      | `text-foreground`          | `var(--color-foreground)`          |
| **Foreground Alt**      | Secondary text, subheadings | `text-foreground-alt`      | `var(--color-foreground-alt)`      |
| **Foreground Muted**    | Descriptive text, metadata  | `text-foreground-muted`    | `var(--color-foreground-muted)`    |
| **Foreground Subtle**   | Placeholder text, icons     | `text-foreground-subtle`   | `var(--color-foreground-subtle)`   |
| **Foreground Disabled** | Disabled text               | `text-foreground-disabled` | `var(--color-foreground-disabled)` |

### Border Colors

| Color              | Usage                             | Class                   | CSS Variable                  |
| ------------------ | --------------------------------- | ----------------------- | ----------------------------- |
| **Border Default** | Standard borders, input borders   | `border-border`         | `var(--color-border)`         |
| **Border Divider** | Section dividers, card separators | `border-border-divider` | `var(--color-border-divider)` |
| **Border Strong**  | Emphasized borders                | `border-border-strong`  | `var(--color-border-strong)`  |
| **Border Focus**   | Focus states                      | `border-border-focus`   | `var(--color-border-focus)`   |

### Brand Colors

#### Primary (Professional Blue)

- **Usage**: Main actions, links, primary buttons, navigation highlights
- **Classes**: `bg-primary`, `text-primary`, `border-primary`
- **Variants**: `primary-50` through `primary-900`
- **Main**: `hsl(217 91% 60%)`

#### Success (Professional Green)

- **Usage**: Success messages, completed states, positive indicators
- **Classes**: `bg-success`, `text-success`, `border-success`
- **Variants**: `success-50` through `success-900`
- **Main**: `hsl(142 76% 36%)`

#### Warning (Professional Amber)

- **Usage**: Warning messages, caution states, star ratings
- **Classes**: `bg-warning`, `text-warning`, `border-warning`
- **Variants**: `warning-50` through `warning-900`
- **Main**: `hsl(43 96% 56%)`

#### Danger (Professional Red)

- **Usage**: Error messages, destructive actions, delete buttons
- **Classes**: `bg-danger`, `text-danger`, `border-danger`
- **Variants**: `danger-50` through `danger-900`
- **Main**: `hsl(0 84% 60%)`

#### Info (Professional Cyan)

- **Usage**: Informational content, neutral notifications
- **Classes**: `bg-info`, `text-info`, `border-info`
- **Variants**: `info-50` through `info-900`
- **Main**: `hsl(195 100% 50%)`

## 📐 Border Radius System

**Recommendation**: Use consistently small, slightly rounded corners for a professional appearance.

### Standard Radius Values

| Radius   | Value    | Usage                                     | Class          |
| -------- | -------- | ----------------------------------------- | -------------- |
| **XS**   | `2px`    | Very subtle rounding                      | `rounded-xs`   |
| **SM**   | `4px`    | **RECOMMENDED DEFAULT** - Buttons, inputs | `rounded-sm`   |
| **MD**   | `6px`    | Cards, larger elements                    | `rounded-md`   |
| **LG**   | `8px`    | Large cards, modals                       | `rounded-lg`   |
| **Full** | `9999px` | Pills, badges, avatars                    | `rounded-full` |

### Semantic Aliases (Pre-configured)

| Element     | Recommended Class | Actual Radius   | Usage                |
| ----------- | ----------------- | --------------- | -------------------- |
| **Buttons** | `rounded-button`  | `6px` (md)      | All button elements  |
| **Cards**   | `rounded-card`    | `8px` (lg)      | Card containers      |
| **Inputs**  | `rounded-input`   | `6px` (md)      | Form inputs, selects |
| **Badges**  | `rounded-badge`   | `9999px` (full) | Status badges, pills |

### **🎯 Recommended Standard**: Use `rounded-sm` (4px) for most elements

For consistency and a professional look, prefer:

- **Buttons**: `rounded-sm` or `rounded-button`
- **Cards**: `rounded-sm` or `rounded-md`
- **Inputs**: `rounded-sm` or `rounded-input`
- **Small elements**: `rounded-sm`

## 🔳 Shadow System

| Shadow | Usage             | Class       | CSS Variable       |
| ------ | ----------------- | ----------- | ------------------ |
| **XS** | Subtle elevation  | `shadow-xs` | `var(--shadow-xs)` |
| **SM** | Standard cards    | `shadow-sm` | `var(--shadow-sm)` |
| **MD** | Elevated elements | `shadow-md` | `var(--shadow-md)` |
| **LG** | Prominent cards   | `shadow-lg` | `var(--shadow-lg)` |
| **XL** | Modals, overlays  | `shadow-xl` | `var(--shadow-xl)` |

## 🏗️ Component Patterns

### Button Styling

```tsx
// Primary action button
<button className="px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary-600 transition-colors shadow-sm">
  Primary Action
</button>

// Secondary button
<button className="px-4 py-2 bg-surface border border-border text-foreground rounded-sm hover:bg-surface-hover transition-colors">
  Secondary Action
</button>

// Danger button
<button className="px-4 py-2 bg-danger text-danger-foreground rounded-sm hover:bg-danger-600 transition-colors shadow-sm">
  Delete
</button>
```

### Card Styling

```tsx
// Standard card
<div className="bg-surface border border-border rounded-sm shadow-sm p-6">
  {/* Card content */}
</div>

// Elevated card
<div className="bg-surface-elevated border border-border rounded-md shadow-md p-6 hover:shadow-lg transition-shadow">
  {/* Card content */}
</div>
```

### Form Input Styling

```tsx
// Standard input
<input className="w-full px-3 py-2 bg-surface-muted border border-border rounded-sm text-foreground placeholder:text-foreground-subtle focus:border-border-focus focus:ring-2 focus:ring-primary-100 outline-none transition-all" />

// Error state
<input className="w-full px-3 py-2 bg-surface-muted border border-danger rounded-sm text-foreground focus:border-danger focus:ring-2 focus:ring-danger-100 outline-none" />
```

## 🎭 Dark Mode Support

All colors automatically adapt using CSS custom properties and the `light-dark()` function. No additional classes needed - the system handles light/dark mode transitions automatically.

## 🚀 Best Practices

### Color Usage

1. **Use semantic colors first**: Always prefer `background`, `surface`, `foreground` over hardcoded colors
2. **Brand colors for actions**: Use `primary` for main actions, `success`/`danger`/`warning` for states
3. **Consistent text hierarchy**:
   - `text-foreground` for headings
   - `text-foreground-alt` for subheadings
   - `text-foreground-muted` for body text
   - `text-foreground-subtle` for metadata

### Border Radius Recommendations

1. **Be consistent**: Pick one radius and stick with it across similar elements
2. **Recommended default**: `rounded-sm` (4px) for professional appearance
3. **Use semantic aliases**: `rounded-button`, `rounded-card`, etc.
4. **Avoid mixing**: Don't mix `rounded-lg` and `rounded-sm` on the same page without purpose

### Component Hierarchy

1. **Backgrounds**: `background` → `background-alt` → `surface` → `surface-elevated`
2. **Text importance**: `foreground` → `foreground-alt` → `foreground-muted` → `foreground-subtle`
3. **Interactive states**: `hover:bg-surface-hover` → `active:bg-surface-pressed`

## ⚠️ What to Avoid

❌ **Don't use hardcoded Tailwind colors**:

```tsx
// ❌ Bad
<div className="bg-gray-100 text-gray-900 border-gray-300">

// ✅ Good
<div className="bg-background-alt text-foreground border-border">
```

❌ **Don't mix border radius sizes randomly**:

```tsx
// ❌ Bad - inconsistent
<button className="rounded-lg">Button 1</button>
<button className="rounded-sm">Button 2</button>

// ✅ Good - consistent
<button className="rounded-sm">Button 1</button>
<button className="rounded-sm">Button 2</button>
```

❌ **Don't skip semantic meaning**:

```tsx
// ❌ Bad - unclear intent
<div className="text-red-600">Error message</div>

// ✅ Good - semantic
<div className="text-danger">Error message</div>
```

## 🔧 Quick Reference

### Most Common Classes

**Backgrounds**: `bg-background`, `bg-background-alt`, `bg-surface` **Text**: `text-foreground`, `text-foreground-muted`, `text-primary` **Borders**: `border-border`, `rounded-sm`, `shadow-sm` **Interactive**: `hover:bg-surface-hover`, `focus:border-border-focus`

This system ensures SkillHub maintains a professional, consistent, and accessible design across all components and pages.
