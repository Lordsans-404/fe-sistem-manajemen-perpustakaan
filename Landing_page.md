# Nebula Noir

> Midnight laboratory — black obsidian surfaces, deep cosmic violets, subtle electric-blue highlights, and floating pill-shaped interfaces.

**Theme:** dark

Nebula Noir combines luxury dark-mode aesthetics with modern SaaS minimalism. The interface is built around deep blacks, violet accents, and subtle blue highlights. Surfaces feel layered but lightweight through borders and glass effects rather than heavy shadows. Typography is spacious, refined, and editorial, creating a premium feeling similar to Linear, Vercel, Raycast, and modern AI startups.

---

# Colors

| Name            | Value                  | Role                 |
| --------------- | ---------------------- | -------------------- |
| Void Black      | `#07070A`              | Main page background |
| Obsidian        | `#111118`              | Surface background   |
| Midnight Blue   | `#171B2E`              | Elevated cards       |
| Deep Violet     | `#5B3DF5`              | Primary brand color  |
| Electric Indigo | `#7A5CFF`              | Hover state          |
| Neon Blue       | `#5EE6FF`              | Accent color         |
| Frost White     | `#F8FAFC`              | Primary text         |
| Slate Gray      | `#A1A1AA`              | Secondary text       |
| Muted Graphite  | `#27272A`              | Borders              |
| Aurora Glow     | `rgba(94,230,255,.15)` | Highlight glow       |

---

# Typography

## Primary Typeface

**Geist**

Fallbacks:

* Inter
* Söhne
* SF Pro Display

### Weights

| Weight | Usage            |
| ------ | ---------------- |
| 300    | Display Headings |
| 400    | Body Text        |
| 500    | Labels           |
| 600    | Buttons & CTAs   |

### Type Scale

| Role          | Size |
| ------------- | ---- |
| Caption       | 12px |
| Body Small    | 14px |
| Body          | 16px |
| Body Large    | 18px |
| Subheading    | 20px |
| Heading Small | 24px |
| Heading       | 32px |
| Heading Large | 40px |
| Display       | 48px |
| Hero Display  | 64px |

### Letter Spacing

| Size | Tracking |
| ---- | -------- |
| 12px | -0.2px   |
| 16px | -0.4px   |
| 24px | -0.6px   |
| 32px | -0.8px   |
| 48px | -1.4px   |
| 64px | -2px     |

---

# Layout

## Base Unit

8px

## Density

Comfortable

## Max Width

1200px

## Page Padding

64px desktop

24px tablet

16px mobile

## Section Gap

96px

## Component Gap

16px

## Card Padding

24px

---

# Border Radius

| Component   | Radius |
| ----------- | ------ |
| Buttons     | 9999px |
| Navbar      | 9999px |
| Badges      | 9999px |
| Inputs      | 12px   |
| Cards       | 24px   |
| Large Cards | 32px   |

---

# Surfaces

## Layer 0

Primary page canvas.

```css
background: #07070A;
```

## Layer 1

Default section surface.

```css
background: #111118;
```

## Layer 2

Elevated cards.

```css
background: #171B2E;
```

## Layer 3

Glass panels.

```css
background: rgba(255,255,255,.04);
backdrop-filter: blur(20px);
border: 1px solid rgba(255,255,255,.06);
```

---

# Components

## Floating Glass Navigation

### Role

Primary navigation.

### Style

* Height: 64px
* Radius: 9999px
* Glass effect
* Fixed top position
* Frost White text
* Deep Violet active states

```css
background: rgba(17,17,24,.8);
backdrop-filter: blur(20px);
border: 1px solid rgba(255,255,255,.06);
```

---

## Hero Headline

### Role

Primary landing page statement.

### Style

* 64px
* Weight 300
* Frost White
* Left aligned

Highlight words use gradient text.

```css
background: linear-gradient(
90deg,
#5B3DF5,
#5EE6FF
);
-webkit-background-clip:text;
color:transparent;
```

---

## Primary CTA Button

### Role

Main action button.

### Style

```css
background:#5B3DF5;
color:white;
border-radius:9999px;
padding:12px 20px;
font-weight:600;
```

Hover:

```css
background:#7A5CFF;
```

---

## Secondary CTA Button

### Role

Alternative action.

### Style

```css
background:transparent;
border:1px solid #27272A;
color:#F8FAFC;
```

Hover:

```css
background:rgba(255,255,255,.04);
```

---

## Feature Card

### Role

Feature showcase.

### Style

```css
background:#111118;
border:1px solid #27272A;
border-radius:24px;
```

Optional glow:

```css
box-shadow:
0 0 0 1px rgba(255,255,255,.03),
0 10px 40px rgba(91,61,245,.15);
```

---

## Badge

### Role

Feature tags.

### Style

```css
background:rgba(91,61,245,.15);
color:#7A5CFF;
border-radius:9999px;
```

---

## Metric Card

### Role

Analytics display.

### Elements

* Metric Value
* Metric Label
* Trend Indicator

Metric value:

```css
color:#5EE6FF;
font-size:40px;
font-weight:300;
```

---

## Input Field

### Style

```css
background:#111118;
border:1px solid #27272A;
border-radius:12px;
color:#F8FAFC;
```

Focus:

```css
border-color:#5B3DF5;
```

---

# Imagery

The visual language is abstract, futuristic, and technology-driven.

Preferred imagery:

* AI Neural Networks
* Abstract Mesh Gradients
* 3D Spheres
* Floating Glass Objects
* Space-inspired Shapes
* Digital Landscapes
* Particle Systems
* Aurora Light Effects

Avoid:

* Botanical Photography
* Nature Textures
* Product Packaging
* Lifestyle Photography
* Real-world Objects

---

# Motion

Animations should feel smooth and expensive.

### Duration

* Fast: 150ms
* Medium: 250ms
* Slow: 400ms

### Easing

```css
cubic-bezier(.16,1,.3,1)
```

---

# Do

* Use Deep Violet as primary brand color.
* Use Neon Blue only as accent.
* Prefer glass effects over heavy shadows.
* Keep typography lightweight.
* Use pill-shaped controls everywhere.
* Maintain large whitespace.

---

# Don't

* Do not use bright red, green, orange, or yellow.
* Do not use skeuomorphic effects.
* Do not use hard shadows.
* Do not use sharp button corners.
* Do not exceed font-weight 600.
* Do not clutter layouts with decorative elements.

---

# Design References

* Linear
* Vercel
* Raycast
* Warp
* Resend
* Stripe Dashboard

---

# Brand Keywords

Elegant

Futuristic

Premium

Technical

Minimal

Intelligent

Dark

Sophisticated

Confident
