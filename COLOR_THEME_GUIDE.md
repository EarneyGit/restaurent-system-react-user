# Restaurant System - Yellow + Black + White + Grey Theme Guide

## Brand Colors

The site now uses a **Yellow + Black + White + Grey** color scheme with `#febc06` as the primary brand color.

## Color Palette

### Primary Yellow (`#febc06`)
```css
brand-yellow-50:  #fffbeb (Lightest - backgrounds)
brand-yellow-100: #fff6d6
brand-yellow-200: #ffedad
brand-yellow-300: #fee485
brand-yellow-400: #fedb5c
brand-yellow-600: #febc06 (Primary - main brand color)
brand-yellow-700: #e5a905 (Hover states)
brand-yellow-700: #cc9604 (Active/pressed states)
brand-yellow-800: #996f03
brand-yellow-900: #664a02 (Darkest)
```

### Black Variants
```css
brand-black:       #000000 (Primary black)
brand-black-soft:  #1a1a1a (Soft black for text)
brand-black-light: #2d2d2d (Light black for borders)
```

### Grey Scale
```css
brand-grey-50:  #f9fafb (Lightest backgrounds)
brand-grey-100: #f3f4f6 (Backgrounds)
brand-grey-200: #e5e7eb (Borders)
brand-grey-300: #d1d5db (Disabled states)
brand-grey-400: #9ca3af (Placeholder text)
brand-grey-500: #6b7280 (Secondary text)
brand-grey-600: #4b5563 (Body text)
brand-grey-700: #374151 (Headings)
brand-grey-800: #1f2937 (Dark text)
brand-grey-900: #111827 (Darkest)
```

## Usage Guidelines

### Primary Actions (Buttons, Links, CTAs)
```tsx
// Primary buttons - use yellow-700
className="bg-yellow-700 text-white hover:bg-yellow-700"

// Or using brand colors
className="bg-brand-yellow-700 text-white hover:bg-brand-yellow-700"
```

### Secondary Actions
```tsx
// Secondary buttons - use black or grey
className="bg-black text-white hover:bg-brand-black-soft"
className="bg-brand-grey-100 text-brand-grey-900 hover:bg-brand-grey-200"
```

### Text Colors
```tsx
// Headings
className="text-gray-900" or "text-brand-black"

// Body text
className="text-gray-600" or "text-brand-grey-600"

// Muted text
className="text-gray-500" or "text-brand-grey-500"
```

### Backgrounds
```tsx
// Page background
className="bg-gray-50" or "bg-white"

// Card backgrounds
className="bg-white border border-gray-200"

// Highlighted sections
className="bg-yellow-50" or "bg-brand-yellow-50"
```

### Borders and Dividers
```tsx
// Default borders
className="border border-gray-200"

// Focused/active borders
className="border-yellow-600 ring-yellow-600"
```

### Badges and Tags
```tsx
// Success/positive
className="bg-yellow-100 text-yellow-800"

// Neutral
className="bg-gray-100 text-gray-800"

// Warning (if needed)
className="bg-yellow-50 text-yellow-700"
```

## Special Components

### Glow Effects
The theme includes custom glow effects using the yellow color:

```tsx
// Animated pulse glow
className="animate-pulse-glow"

// Static glow effect
className="glow-effect"
```

## Tailwind Configuration

The theme is configured in `tailwind.config.ts`:

```typescript
colors: {
  // Brand Colors - Primary theme
  brand: {
    yellow: { ... },  // Full yellow palette
    black: { ... },   // Black variants
    grey: { ... }     // Grey scale
  },
  // Simplified primary color
  primary: {
    DEFAULT: '#febc06',
    foreground: '#000000'
  }
}
```

## Examples from CheckoutPage

### Primary Button
```tsx
<button className="w-full bg-yellow-700 text-white py-3 rounded-xl font-semibold hover:bg-yellow-700">
  Place Order
</button>
```

### Payment Method Selection
```tsx
<button className={`p-3 rounded-xl border-2 ${
  isSelected
    ? "border-yellow-600 bg-yellow-50 text-yellow-700"
    : "border-gray-200 hover:border-yellow-300 text-gray-600"
}`}>
```

### Success/Savings Display
```tsx
<div className="text-yellow-700">
  You saved £10.00!
</div>
```

### Form Inputs
```tsx
<input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
```

## Migration Guide

If you need to update existing components:

1. **Replace green with yellow:**
   - `green-600` → `yellow-700`
   - `green-700` → `yellow-700`
   - `green-50` → `yellow-50`
   - etc.

2. **Update focus states:**
   - `focus:ring-green-500` → `focus:ring-yellow-600`
   - `focus:border-green-500` → `focus:border-yellow-600`

3. **Update hover states:**
   - `hover:bg-green-700` → `hover:bg-yellow-700`
   - `hover:text-green-600` → `hover:text-yellow-700`

4. **Use brand colors for consistency:**
   ```tsx
   // Instead of
   className="bg-yellow-700"
   
   // You can also use
   className="bg-brand-yellow"
   ```

## Color Accessibility

- **Yellow on White**: Ensure text uses `yellow-700` or darker for sufficient contrast
- **White on Yellow**: Use `yellow-700` or darker backgrounds for white text
- **Black on Yellow**: Always accessible, use for important text
- **Grey on White**: Use `grey-600` or darker for body text

## Best Practices

1. **Consistency**: Always use the same yellow shade for primary actions (`yellow-700`)
2. **Hierarchy**: Use color intensity to show importance:
   - Primary: Yellow
   - Secondary: Black/Grey
   - Tertiary: Light Grey
3. **Spacing**: Give colored elements breathing room with appropriate padding/margins
4. **Contrast**: Maintain WCAG AA standards for text contrast
5. **States**: Always provide clear hover, focus, and active states

## Quick Reference

| Element Type | Color Class | Example |
|--------------|-------------|---------|
| Primary Button | `bg-yellow-700 text-white hover:bg-yellow-700` | CTA buttons |
| Secondary Button | `bg-gray-100 text-gray-900 hover:bg-gray-200` | Cancel buttons |
| Link | `text-yellow-700 hover:text-yellow-700` | Text links |
| Heading | `text-gray-900` or `text-black` | H1, H2, H3 |
| Body Text | `text-gray-600` | Paragraphs |
| Muted Text | `text-gray-500` | Helper text |
| Border | `border-gray-200` | Dividers |
| Focus Ring | `ring-yellow-600` | Form inputs |
| Success | `text-yellow-700` | Savings, discounts |
| Badge | `bg-yellow-100 text-yellow-800` | Tags, labels |

## Notes

- The CheckoutPage.tsx has already been fully updated to use the new yellow theme
- All glow effects now use yellow (`#febc06`)
- The primary color in Tailwind is set to `#febc06`
- Legacy `foodyman.green` color is maintained for backward compatibility but should be migrated

