# Dashboard PRD: FinDash 

## 1. Overall Aesthetic
- **Vibe:** Dark modern, neon-accented, clean, and highly analytical.
- **Theme:** True dark mode with high-contrast, vibrantly colored data visualizations.
- **Style:** Subtle glassmorphism and soft elevations, avoiding flat, lifeless grays. Provides a premium "cyber-analytical" feel without feeling clunky.

## 2. Color Scheme
- **App Background:** `#1A1C24` (Deep dark blue/gray)
- **Card/Surface Background:** `#22252E` (Elevated dark gray, provides contrast from background)
- **Primary Text:** `#FFFFFF` (Pure white for high readability on key metrics and titles)
- **Secondary Text:** `#A0AEC0` (Cool gray for subtitles, axis labels, and inactive menu items)
- **Primary Accent (Buttons/Gradients):** Pink to Purple gradient (approx. `#EC4899` to `#8B5CF6`) - used for primary CTAs like "View Details".
- **Secondary Accent:** Neon Blue `#3B82F6` (Used for "Settings" button and active indicators/bar charts).
- **Positive Trend/Accents:** Success Green `#10B981`
- **Negative Trend/Accents:** Alert Red `#EF4444`
- **Chart Palette:** Neon Yellow `#FBBF24`, Neon Blue `#3B82F6`, Sunset Orange `#F97316`, Vibrant Purple `#A855F7`, Success Green `#10B981`.

## 3. Typography
- **Primary Font Family:** `Inter` or `Plus Jakarta Sans` for clean, highly legible numeric and UI rendering.
- **Hierarchy:**
  - **H1 (Main Metrics):** 28px - 32px, `SemiBold` (e.g., "$168.5K")
  - **H2 (Card Titles):** 16px - 18px, `Medium` or `SemiBold` (e.g., "Congratulations Jhon", "Total Orders")
  - **H3 (Section Headers):** 14px, `Medium` (e.g., "Order Status", "Sales & Views")
  - **Body (Standard text):** 13px - 14px, `Regular`
  - **Small (Badges, trends):** 12px, `Medium` (e.g., "+24%")

## 4. Corner Radius, Shadows, Borders, & Depth
- **Corner Radius (Border Radius):**
  - Metric Cards & Main Panels: `16px` (Soft, modern rounding)
  - Buttons & Small Badges: `8px`
  - Inner chart elements (Bar charts): `4px - 6px`
- **Shadows & Depth:** 
  - Flat aesthetic with very subtle soft shadows (`box-shadow: 0 4px 20px rgba(0,0,0,0.2)`) to lift cards off the base background.
- **Borders:** Minimal to no borders. Separation is achieved through background color contrast (`#1A1C24` vs `#22252E`).

## 5. Spacing, Grid System, & Layout Principles
- **Layout Structure:** Fixed Left Sidebar (~260px width), Top Navbar (~70px height), and a fluid Main Content Area.
- **Grid System:** 12-column responsive grid.
  - Top row: 1 large card (approx. 4 columns wide) + 4 smaller metric cards (approx. 2 columns wide each).
  - Middle row: 1 medium card for "Order Status" (approx. 4 columns wide) + 1 large card for "Sales & Views" (approx. 8 columns wide).
- **Spacing (Gaps and Padding):**
  - Standard gap between cards: `24px`
  - Inner card padding: `24px` (Provides breathing room for data).

---

## 6. Components Catalog

### 1. Sidebar Navigation
- **Style:** Dark background matching the main app.
- **Elements:** 
  - Logo (multi-colored fluid overlap shapes) + Text ("Maxton").
  - Collapsible menu categories ("Dashboard", "UI Elements", "Forms & Tables", "Pages").
- **Hover/Active States:** Active item ("eCommerce") has a subtle semi-transparent background pill or highlight. Inactive items are muted gray. Icons match text color.

### 2. Top Navigation Bar
- **Elements:**
  - Hamburger menu icon.
  - Universal Search bar (pill-shaped, extremely subtle dark gray background, `<Search>` icon inside).
  - Utility icons (Language flag, checkmark, grid apps, notifications with red badge `5`, cart with red badge `8`).
  - User Avatar (Circular).

### 3. Welcome / Hero Card
- **Component Name:** `WelcomeBannerCard`
- **Elements:**
  - Greeting title with emoji 🎉.
  - Subtext ("You are the best seller...").
  - Highlighted primary metric ("$168.5K") with subtitle ("58% of sales target").
  - Primary CTA Button ("View Details") featuring a vibrant Pink-to-Purple linear gradient.
  - Illustration: A brightly colored 3D/flat vector gift box.

### 4. Mini Metric Cards (KPI Cards)
- **Component Name:** `SparklineMetricCard`
- **Elements:**
  - Top row: Circular icon background (subtle tint of icon color), Icon (Cart, Dollar, Eye, Box). Trend badge (+24%, -35%) in Green/Red with up/down arrows.
  - Middle: Sturdy numeric value (e.g., "248k") and label ("Total Orders").
  - Bottom: Sparkline chart (Line chart or Bar chart) without axes, using a vibrant color and a fade-to-transparent gradient fill below the line.

### 5. Order Status Donut Chart
- **Component Name:** `DonutDiagnosticCard`
- **Elements:**
  - Multi-segmented donut chart (Red, Purple, Orange, Blue, Green) with noticeable gaps/strokes between segments.
  - Center text displaying primary percentage ("68%") and label ("Total Sales").
  - Card header with a "more options" (three dots) icon.

### 6. Sales & Views Bar Chart
- **Component Name:** `ComparativeBarChart`
- **Elements:**
  - Grouped bar chart (two bars per month: Orange and Blue).
  - Rounded tops on bars.
  - Clean X and Y axes with muted grid lines (horizontal only, very low opacity).
  - Legend at the bottom center.

---

## 7. Style Guide (Ready-to-use)

### Tokens
```css
/* Colors */
--bg-app: #1A1C24;
--bg-card: #22252E;
--bg-input: #2A2D35;

--text-primary: #FFFFFF;
--text-secondary: #A0AEC0;

--accent-primary-from: #EC4899;
--accent-primary-to: #8B5CF6;
--accent-secondary: #3B82F6;

--chart-yellow: #FBBF24;
--chart-green: #10B981;
--chart-blue: #3B82F6;
--chart-orange: #F97316;
--chart-red: #EF4444;
--chart-purple: #A855F7;

/* Radii */
--radius-card: 16px;
--radius-btn: 8px;
```

### Variants
- **Primary Button:** `background: linear-gradient(to right, var(--accent-primary-from), var(--accent-primary-to)); color: white; border-radius: 8px; font-weight: 600; padding: 8px 16px;`
- **Secondary / Action Button (Settings):** `background: var(--accent-secondary); color: white; border-radius: 8px;`

---

## 8. Technical & Implementation Notes

- **Frontend Tech Stack:** 
  - Framework: React (Next.js or Vite).
  - Styling: Tailwind CSS (ideal for rapid dark-mode UI and utility classes).
  - Components: Radix UI or Shadcn UI as a headless base to ensure accessibility, heavily customized to fit this dark theme.
- **Charting Library:** `Recharts` or `Chart.js` (react-chartjs-2). For the sparklines, Recharts is highly recommended due to simple API for gradients under line charts (`<defs>` with `linearGradient`).
- **Dark Mode Confirmation:** This is a strictly dark-themed layout. If light mode is needed later, the CSS variable structure should be inverted (App bg becomes `#F3F4F6`, Card bg becomes `#FFFFFF`), but the vibrant charts should remain.
- **Animations:** 
  - Use `Framer Motion`. 
  - Add smooth upward entrance animations (`y: 20, opacity: 0` to `y: 0, opacity: 1`) for the cards upon initial load.
  - Hovering over metric cards should slightly elevate them or brighten the card's background (`hover:bg-[#282B36]`).
  - Bar charts and line charts should animate their paths/heights on load.

## 9. Future Enhancements / Inspirations
- **Glassmorphism:** To push it slightly more modern, add a very subtle backdrop-blur to the sidebar or top navigation upon scrolling.
- **Interactive Tooltips:** Ensure all charts have beautifully styled, fast customized tooltips using standard glassmorphism treatments (`backdrop-blur-md bg-black/50`).
- **Micro-interactions:** When clicking the "View Details" gradient button, use a subtle ripple effect or a scale-down animation (`hover:scale-105 active:scale-95`).
