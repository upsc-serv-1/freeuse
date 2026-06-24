# UPSC Mains Design System
**Premium iPad-First Application Design Guidelines**

Inspired by: Apple Fitness, Notion, Arc Browser, Linear, Things 3

---

## 🎨 Design Principles

1. **Liquid Glass Aesthetic** — Glassmorphism with soft blur, translucency, and light elevation
2. **Generous Whitespace** — Large padding, breathing room, uncluttered layouts
3. **Minimal Color Palette** — Subtle pastels, muted tones, avoiding harsh contrasts
4. **Elegant Typography** — Clean hierarchy, restrained use of font sizes
5. **Touch-Friendly** — Large hit targets, comfortable spacing for iPad interaction
6. **No Sidebar Navigation** — Dashboard-centric navigation, horizontal filters
7. **Unified Card System** — Consistent card patterns across all content types

---

## 🌈 Color Palette

### Background Colors
```css
/* Primary Background */
bg-slate-50                      /* #f8fafc - Base canvas */

/* Gradient Backgrounds */
bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30

/* Alternative Backgrounds */
bg-blue-50/20                    /* Subtle blue tint */
bg-indigo-50/30                  /* Subtle indigo tint */
```

### Liquid Glass Background Orbs
```css
/* Large diffused color orbs (fixed position, behind content) */
bg-blue-300/30 blur-[100px]      /* Top-left orb */
bg-purple-300/30 blur-[120px]    /* Top-right orb */
bg-emerald-300/30 blur-[140px]   /* Bottom-left orb */
bg-rose-200/30 blur-[100px]      /* Center-top orb */
```

**Implementation Pattern:**
```tsx
<div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
  <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-300/30 blur-[100px]" />
  <div className="absolute top-[30%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-300/30 blur-[120px]" />
  <div className="absolute bottom-[-20%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-emerald-300/30 blur-[140px]" />
  <div className="absolute top-[10%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-rose-200/30 blur-[100px]" />
</div>
```

### Glass Surfaces
```css
/* Card Background */
bg-white/70                      /* 70% white opacity */
bg-white/80                      /* 80% white opacity (headers) */
bg-white/90                      /* 90% white opacity (hover states) */
backdrop-blur-xl                 /* Strong blur effect */

/* Borders */
border-white/60                  /* Subtle glass border */
border-white/30                  /* Very subtle divider */
border-slate-100                 /* Opaque subtle border */
border-slate-200/80              /* Hover border */
```

### Semantic Colors

**Primary (Blue)** — Main actions, primary filters
```css
bg-blue-600                      /* #2563eb - Buttons, active states */
text-blue-700                    /* #1d4ed8 - Text on light backgrounds */
bg-blue-50                       /* #eff6ff - Subtle backgrounds */
bg-blue-100                      /* #dbeafe - Chips */
border-blue-600                  /* Active borders */
shadow-blue-200                  /* Colored shadows */
```

**Secondary (Indigo)** — Accents, secondary actions
```css
bg-indigo-600                    /* #4f46e5 */
text-indigo-700
bg-indigo-50/30
```

**Success (Emerald)** — PYQ badges, positive states
```css
bg-emerald-600                   /* #059669 */
text-emerald-700
bg-emerald-50
border-emerald-100
```

**Hierarchy Colors** — 5-layer taxonomy visualization
```css
/* Paper Level */
text-blue-600 / bg-blue-50 / border-blue-200

/* Subject Level */
text-purple-600 / bg-purple-50 / border-purple-200

/* Section Group Level */
text-amber-600 / bg-amber-50 / border-amber-200

/* Section Level */
text-emerald-600 / bg-emerald-50 / border-emerald-200

/* Sub-topic Level */
text-rose-600 / bg-rose-50 / border-rose-200
```

### Neutral Colors
```css
/* Text */
text-slate-900                   /* #0f172a - Headings */
text-slate-800                   /* #1e293b - Body text */
text-slate-700                   /* #334155 - Secondary text */
text-slate-600                   /* #475569 - Tertiary text */
text-slate-500                   /* #64748b - Muted text */
text-slate-400                   /* #94a3b8 - Placeholder, metadata */

/* Backgrounds */
bg-slate-100                     /* #f1f5f9 - Subtle fills */
bg-slate-200                     /* #e2e8f0 - Hover states */

/* Borders */
border-slate-100                 /* #f1f5f9 */
border-slate-200                 /* #e2e8f0 */
border-slate-300                 /* #cbd5e1 */
```

---

## 📐 Spacing System

### Container Padding
```css
px-6                             /* 24px - Standard horizontal padding */
px-8                             /* 32px - Dashboard button area */
py-3                             /* 12px - Compact vertical */
py-4                             /* 16px - Standard vertical */
py-5                             /* 20px - Generous vertical */
py-6                             /* 24px - Extra generous */
```

### Component Spacing
```css
space-y-3                        /* 12px - Tight vertical stack */
gap-1.5                          /* 6px - Very tight inline items */
gap-2                            /* 8px - Tight inline items */
gap-2.5                          /* 10px - Compact inline items */
gap-4                            /* 16px - Standard grid gap */
```

### Margins
```css
mb-2                             /* 8px - Compact bottom margin */
mb-2.5                           /* 10px */
mb-3                             /* 12px */
mt-0.5                           /* 2px - Subtle top margin */
```

---

## 🔤 Typography

### Font Stack
```css
font-sans                        /* System font stack (from Tailwind default) */
```

### Font Sizes
```css
/* Headings */
text-xl                          /* 20px - Page titles */
text-lg                          /* 18px - Section headings */

/* Body Text */
text-sm                          /* 14px - Standard body */
text-[13px]                      /* 13px - Compact body */
text-xs                          /* 12px - Small text */
text-[12px]                      /* 12px - Filter pills, buttons */
text-[11px]                      /* 11px - Metadata, chips */
text-[10px]                      /* 10px - Tiny labels, badges */

/* Line Heights */
leading-relaxed                  /* 1.625 - Body text */
leading-snug                     /* 1.375 - Compact text */
leading-tight                    /* 1.25 - Chip labels */
```

### Font Weights
```css
font-bold                        /* 700 - Headings, important labels */
font-semibold                    /* 600 - Buttons, active states */
font-medium                      /* 500 - Default body weight */
/* Regular (400) - Fallback */
```

### Text Styling Patterns
```css
/* Page Title */
text-xl font-bold text-slate-900

/* Subtitle/Count */
text-xs text-slate-500 mt-0.5

/* Card Title */
text-sm text-slate-800 leading-relaxed

/* Metadata */
text-[11px] text-slate-500 font-medium

/* Placeholder */
text-slate-400 italic text-[11px]

/* Button Text */
text-xs font-semibold (or text-[11px] for compact)

/* Badge/Chip */
text-[10px] font-bold uppercase tracking-widest
```

---

## 🎯 Border Radius System

### Cards & Containers
```css
rounded-2xl                      /* 16px - Large cards, modals */
rounded-xl                       /* 12px - Standard cards, inputs, compact cards */
rounded-[1.25rem]                /* 20px - Dashboard button */
```

### Interactive Elements
```css
rounded-full                     /* Pills, filter chips, badges */
rounded-lg                       /* 8px - Small buttons */
rounded-md                       /* 6px - Tiny badges */
```

---

## 💫 Shadows

### Elevation System
```css
/* Cards */
shadow-sm                        /* Default card elevation */
shadow-md                        /* Hover card elevation */
shadow-2xl                       /* Popovers, modals */

/* Colored Shadows (Active States) */
shadow-md shadow-blue-200        /* Active filter pills */
shadow-md shadow-emerald-200     /* Active PYQ toggle */

/* Custom Shadows */
shadow-[0_4px_16px_rgb(0,0,0,0.04)]  /* Dashboard button soft shadow */
```

---

## 🧊 Glassmorphism Recipe

**Standard Glass Card:**
```css
bg-white/70 
backdrop-blur-xl 
border border-white/60 
shadow-sm
```

**Glass Header/Sticky Bar:**
```css
bg-white/80 
backdrop-blur-xl 
border-b border-white/30 
shadow-sm
```

**Hover State:**
```css
hover:bg-white/90 
hover:border-slate-200/80 
hover:shadow-md
```

**Glass Button (Secondary):**
```css
bg-white/50 
backdrop-blur-xl 
border border-white/60 
shadow-[0_4px_16px_rgb(0,0,0,0.04)]
hover:bg-white/70
```

---

## 🎴 Component Patterns

### Cards

**Question Card (Compact - 2-column grid)**
```tsx
<div className="group rounded-xl backdrop-blur-xl bg-white/70 border border-white/60 hover:border-slate-200/80 hover:bg-white/90 shadow-sm hover:shadow-md transition-all duration-200 p-3.5 flex flex-col">
  {/* Metadata */}
  <div className="flex items-center gap-1.5 flex-wrap mb-2">
    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
      GS2
    </span>
    <span className="text-slate-400 text-[10px]">·</span>
    <span className="text-slate-500 text-[10px] font-medium">Polity</span>
    <span className="ml-auto text-slate-400 text-[10px] font-medium">250w</span>
  </div>
  
  {/* Question */}
  <p className="text-slate-800 text-[13px] leading-snug mb-2.5 flex-1">
    Question text here...
  </p>
  
  {/* Footer */}
  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-2.5">
    <FileText className="w-2.5 h-2.5" />
    <span>UPSC Official 2022</span>
  </div>
  
  {/* Actions */}
  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100/80">
    <button className="flex-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-semibold">
      View Answer
    </button>
  </div>
</div>
```

**Dashboard Card**
```tsx
<div className="group rounded-3xl p-8 backdrop-blur-2xl bg-white/60 border border-white/50 hover:border-white/70 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer">
  {/* Icon centered */}
  <div className="flex items-center justify-center mb-6">
    <Icon className="w-12 h-12 text-blue-600" />
  </div>
  
  {/* Title */}
  <h3 className="text-lg font-bold text-slate-900 mb-2">Feature Name</h3>
  
  {/* Description */}
  <p className="text-sm text-slate-600 leading-relaxed">Description text</p>
</div>
```

### Buttons

**Primary Button**
```css
bg-blue-600 
text-white 
px-4 py-1.5 (or px-3 py-1.5 for compact)
rounded-xl (or rounded-lg for compact)
text-xs font-semibold (or text-[11px])
hover:bg-blue-700 
transition-colors
```

**Secondary Glass Button**
```css
bg-white/50 
backdrop-blur-xl 
border border-white/60 
px-5 py-2.5 
rounded-[1.25rem] 
text-slate-700 
font-semibold 
hover:bg-white/70 
transition-all
shadow-[0_4px_16px_rgb(0,0,0,0.04)]
```

**Icon Button**
```css
p-1.5 
rounded-lg 
bg-slate-100 
text-slate-500 
hover:bg-slate-200 
hover:text-slate-700 
transition-colors
```

### Filter Pills (Horizontal Bar)

**Inactive Pill**
```css
px-3.5 py-1.5 
rounded-full 
text-[12px] font-semibold 
bg-white/60 
text-slate-600 
border border-white/60 
hover:bg-white/80 
backdrop-blur-sm
transition-all
```

**Active Pill**
```css
px-3.5 py-1.5 
rounded-full 
text-[12px] font-semibold 
bg-blue-600 
text-white 
border border-blue-600 
shadow-md shadow-blue-200
```

### Badges & Chips

**Paper Badge** (Small solid badge)
```css
px-1.5 py-0.5 
rounded 
bg-slate-100 
text-slate-700 
text-[10px] font-bold
```

**PYQ Badge**
```css
px-2 py-0.5 
rounded-md 
bg-emerald-50 
text-emerald-700 
text-[10px] font-bold 
border border-emerald-100
```

**Hierarchy Chip** (Active filter breadcrumb)
```css
inline-flex items-center gap-1 
px-2 py-0.5 
rounded-full 
text-[11px] font-semibold 
border 
bg-blue-50 text-blue-700 border-blue-200
```

### Inputs

**Search Input**
```css
h-11 
rounded-xl 
bg-white/80 
shadow-sm 
text-sm 
border border-white/60
(Use Input component with icon)
```

### Dividers
```css
/* Vertical pill separator */
w-px h-4 bg-slate-200

/* Horizontal divider */
border-t border-slate-100/80 (or border-white/20)
```

---

## 🖼️ Layout Patterns

### Full-Page Container
```tsx
<div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
  {/* Sticky header */}
  <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/30 px-6 pt-4 pb-3 shadow-sm">
    {/* Header content */}
  </div>
  
  {/* Scrollable content */}
  <div className="px-6 py-5">
    <div className="max-w-7xl mx-auto">
      {/* Content */}
    </div>
  </div>
</div>
```

### 2-Column Grid (iPad Landscape)
```css
grid grid-cols-1 lg:grid-cols-2 gap-4
max-w-7xl mx-auto
```

### Dashboard Grid
```css
grid grid-cols-1 md:grid-cols-2 gap-6
max-w-6xl mx-auto
```

### Fixed Navigation
```tsx
{/* Fixed Dashboard button (stays above scrolling content) */}
<div className="absolute top-6 left-8 z-[100]">
  <button className="flex items-center gap-2 px-5 py-2.5 rounded-[1.25rem] bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_4px_16px_rgb(0,0,0,0.04)] hover:bg-white/70 transition-all font-semibold text-slate-700">
    <ChevronLeft className="w-5 h-5" />
    Dashboard
  </button>
</div>
```

---

## 🎭 Interactive States

### Transitions
```css
transition-all duration-200      /* Standard component transition */
transition-all duration-300      /* Slower, smoother (dashboard cards) */
transition-colors               /* Button color changes only */
```

### Hover States
```css
/* Cards */
hover:bg-white/90 
hover:border-slate-200/80 
hover:shadow-md

/* Buttons */
hover:bg-blue-700               /* Primary */
hover:bg-white/70               /* Glass */
hover:bg-slate-200              /* Icon buttons */

/* Filter Pills */
hover:bg-white/80

/* Dashboard Cards */
hover:scale-[1.02]
```

### Active States
```css
/* Use semantic active classes based on state */
bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200
```

### Focus States
```css
/* Rely on browser defaults or add: */
focus:outline-none focus:ring-2 focus:ring-blue-500/50
```

---

## 🎨 Portal Overlays (Modals, Popovers)

### Backdrop
```tsx
<div className="fixed inset-0 z-[9998] bg-black/10 backdrop-blur-[1px]" onClick={onClose} />
```

### Panel (Hierarchy Browser)
```tsx
<div 
  className="fixed z-[9999] rounded-2xl overflow-hidden shadow-2xl border border-white/40 backdrop-blur-2xl bg-white/90"
  style={{ top, left, maxWidth: "calc(100vw - 48px)" }}
>
  {/* Panel content */}
</div>
```

### Column Browser Pattern
```tsx
<div className="flex divide-x divide-slate-100 overflow-x-auto">
  {/* Each column */}
  <div className="flex flex-col min-w-0 flex-1 border-r border-white/20">
    {/* Column header */}
    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-blue-600 border-b border-white/20">
      Paper
    </div>
    {/* Scrollable items */}
    <div className="flex-1 overflow-y-auto max-h-64">
      {/* Items */}
    </div>
  </div>
</div>
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile-first approach */
grid-cols-1              /* Default: 1 column */
lg:grid-cols-2          /* Large (1024px+): 2 columns */
md:grid-cols-2          /* Medium (768px+): 2 columns (dashboard) */

/* Container max-widths */
max-w-4xl              /* Single-column content (1024px) */
max-w-6xl              /* Dashboard grid (1152px) */
max-w-7xl              /* 2-column question grid (1280px) */
```

---

## 🚫 Anti-Patterns (Avoid)

1. **No sidebars** — Use dashboard navigation
2. **No coaching institute style** — Avoid cluttered, information-heavy designs
3. **No harsh borders** — Use subtle glass borders (white/60, white/30)
4. **No bold primary colors everywhere** — Use muted pastels and glass
5. **No small hit targets** — Minimum 44×44px for touch
6. **No font sizes below 10px** — Maintain readability
7. **No flat designs** — Always include backdrop-blur, subtle shadows
8. **No tight layouts** — Generous padding and spacing

---

## ✅ Quick Reference Checklist

When creating a new screen/component:

- [ ] Background uses gradient: `bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30`
- [ ] Liquid glass orbs added to root layout (if new route)
- [ ] Cards use glass pattern: `bg-white/70 backdrop-blur-xl border border-white/60`
- [ ] Text hierarchy uses slate scale (900 → 400)
- [ ] Buttons use rounded-xl or rounded-full
- [ ] Spacing uses defined system (px-6, gap-4, etc.)
- [ ] Hover states add `hover:shadow-md` and `hover:bg-white/90`
- [ ] Touch targets are at least 44×44px
- [ ] Icons are from lucide-react
- [ ] Transitions use `transition-all duration-200`
- [ ] Fixed navigation button if subpage (Dashboard button)
- [ ] Sticky headers use `sticky top-0 z-50`

---

## 📦 Common Code Snippets

### Page Wrapper
```tsx
<div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
  {/* Content */}
</div>
```

### Sticky Header Bar
```tsx
<div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/30 px-6 pt-4 pb-3 shadow-sm">
  <h1 className="text-xl font-bold text-slate-900">Page Title</h1>
  <p className="text-xs text-slate-500 mt-0.5">Subtitle</p>
</div>
```

### Content Grid
```tsx
<div className="px-6 py-5">
  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
    {/* Cards */}
  </div>
</div>
```

---

**Last Updated:** June 5, 2026  
**Version:** 1.0
