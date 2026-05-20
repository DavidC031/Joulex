---
name: Institutional Technical Dashboard
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#43474f'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#747780'
  outline-variant: '#c4c6d0'
  surface-tint: '#415f8f'
  primary: '#001430'
  on-primary: '#ffffff'
  primary-container: '#002855'
  on-primary-container: '#7490c3'
  inverse-primary: '#aac7fd'
  secondary: '#1c5fa8'
  on-secondary: '#ffffff'
  secondary-container: '#79b0ff'
  on-secondary-container: '#00427d'
  tertiary: '#280b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#491a00'
  on-tertiary-container: '#c77e59'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7fd'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#284775'
  secondary-fixed: '#d5e3ff'
  secondary-fixed-dim: '#a6c8ff'
  on-secondary-fixed: '#001c3b'
  on-secondary-fixed-variant: '#004787'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb692'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#703718'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is engineered for high-precision electrical monitoring within academic and industrial environments. The brand personality is authoritative, reliable, and strictly professional, prioritizing data integrity over decorative flair. 

The visual style follows a **Corporate / Modern** aesthetic with a lean toward **Systematic Utility**. It utilizes a structured grid, high-contrast status signaling, and a clean, layered interface to ensure that complex electrical metrics remain legible at a glance. The goal is to evoke a sense of calibrated accuracy and academic rigor, providing users with a "mission control" experience for electrical data analysis.

## Colors

The palette is anchored by a core of "Deep Institutional Blues" to establish trust and technical authority. 

- **Primary & Secondary:** Dark Blue (#002855) is reserved for navigation, primary actions, and structural headers. Medium Blue (#00539C) acts as an accent for interactive elements and focused states.
- **Surface & Background:** A clean, neutral gray (#F8F9FA) is used for the main canvas to reduce eye strain during long monitoring sessions, with pure white used for card backgrounds to create clear content separation.
- **Semantic Status:** A strict traffic-light system is implemented for real-time monitoring. Green indicates nominal operation, Yellow/Orange signifies threshold warnings, and Red indicates critical failure or safety hazards. These colors must maintain high saturation to stand out against the blue and gray base.

## Typography

The design system utilizes **Inter** for all UI elements to ensure maximum legibility of alphanumeric technical strings. Inter’s tall x-height and systematic spacing make it ideal for data-heavy dashboards.

For specific numerical readouts—such as voltage levels, current frequency, or timestamps—a monospaced font (**JetBrains Mono**) is introduced to ensure that digit columns align perfectly in tables and gauges. 

- **Headlines:** Use Bold weights to establish clear hierarchy between different monitoring sections.
- **Data Labels:** Use the `label-caps` style for small descriptors (e.g., "RMS VOLTAGE") to distinguish metadata from actual values.
- **Responsive Note:** On mobile devices, `display-lg` should scale down to 32px to prevent horizontal overflow in technical reports.

## Layout & Spacing

The layout is built on a **12-column fluid grid** for desktop, optimized for side-by-side data visualization. 

- **Grid Strategy:** Use a 24px gutter between primary dashboard cards. For internal card content, follow an 8px base unit (8, 16, 24, 32) to maintain a tight, information-dense rhythm.
- **Mobile Reflow:** On mobile, the 12-column grid collapses into a single column. Information-heavy tables should be replaced with summary cards or horizontal-scroll overflow containers to maintain data integrity.
- **Density:** This design system supports a "Compact" mode for expert users, reducing vertical padding by 25% to fit more rows of data on a single screen.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows. This keeps the interface feeling "flat" and engineered, like a hardware display.

- **Level 0 (Canvas):** Neutral Gray (#F8F9FA).
- **Level 1 (Cards/Tables):** Pure White with a 1px solid border (#DEE2E6). This is the default container for all metrics.
- **Level 2 (Modals/Popovers):** Pure White with a subtle, tight shadow (0px 4px 12px rgba(0,0,0,0.08)) to indicate temporary interaction.
- **Depth Markers:** Use subtle inset shadows for input fields and data entry zones to suggest "tactile" interactivity within the technical layout.

## Shapes

The design system utilizes **Soft** geometry (4px default radius). This provides a professional balance—sharp enough to feel precise and technical, but slightly rounded to feel modern and accessible.

- **Small Elements (Checkboxes, Tooltips):** 2px radius.
- **Standard Elements (Buttons, Inputs, Cards):** 4px radius.
- **Gauges:** Circular elements should remain perfectly round to mimic analog electrical meters.

## Components

### Buttons
Primary buttons use the Medium Blue (#00539C) with white text. Secondary buttons use a transparent background with a 1px border of the same blue. Use "Ghost" buttons for auxiliary actions within tables to avoid visual clutter.

### Data Tables
Tables are the backbone of this system. Use zebra-striping (alternating light gray rows) for high readability. Headers should be sticky, using the Dark Blue (#002855) with white uppercase text.

### Metric Cards
Each card contains a single primary metric (e.g., "Current Draw"). Use a status "sparkline" or a 4px colored top-border to indicate the current safety status (Green, Yellow, Red) of that specific metric.

### Input Fields
Inputs should be clearly defined with a 1px border. In "Active" or "Focused" states, the border thickens to 2px in Medium Blue. Use monospaced fonts for numerical input fields to assist in precise entry.

### Gauges & Visuals
Gauges should utilize the semantic status colors for their arcs. For example, a needle in the red zone of a dial should turn the entire arc segment #DC3545. All visualizations must include text-based fallback values for accessibility.