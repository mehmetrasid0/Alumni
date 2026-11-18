# 🎨 Alumni Tracker — Brand Identity & Design System (`brand.md`)

> **Platform:** Alumni Tracker  
> **Institution:** Istanbul University — Faculty of Economics, Department of Management Information Systems (YBS)  
> **Design Tokens Source:** [`server/public/css/style.css`](./server/public/css/style.css)  
> **Main Documentation:** [⬅️ Return to `README.md`](./README.md)

---

## 1. 🏛️ Brand Essence & Institutional Positioning

**Alumni Tracker** is the digital alumni engagement, career networking, and institutional memory platform for **Istanbul University (YBS)**. Its visual language balances **historic academic prestige** (*"1453'ten Bugüne"*, Beyazıt Main Gate heritage) with **modern software clarity**.

- **Brand Name:** `Alumni Tracker` (rendered in the navbar wordmark as `AlumniTracker` with gold accent)
- **Primary Mark:** `🎓` / `İÜ` monogram badge on Gold (`--gold-500`) over Deep Navy (`--navy-900`)
- **Core Tagline:** *"Mezunlarımızla Geleceği Birlikte İnşa Ediyoruz"*
- **Brand Archetype:** Academic Heritage + Modern Utility — authoritative, trustworthy, warm, and accessible.

---

## 2. 🎨 Color Palette & Design Tokens

All core CSS variables are defined in `:root` inside [`server/public/css/style.css`](./server/public/css/style.css).

### 2.1 Primary Institutional Navy
Used for navigation chrome, dark hero backgrounds, headings, and primary structural contrast.

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `--navy-900` | `#0A1628` | Fixed top navbar background, deep hero base, dark overlays |
| `--navy-800` | `#122240` | Section headings (`h2`), elevated dark containers |
| `--navy-700` | `#1A3050` | Secondary dark surfaces, gradient stops |
| `--navy-600` | `#234266` | Subtle interactive dark accents |
| `--navy-500` | `#2C5A8C` | Links, secondary emphasis |

### 2.2 Heritage Gold
Used sparingly for high-value focal points: navbar bottom border, CTAs, section underlines, and hover highlights.

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `--gold-600` | `#A58520` | Pressed / dark gold states |
| `--gold-500` | `#BF9B30` | Primary CTA buttons (`.nav-cta`), navbar `2px` border, `.underline` accent |
| `--gold-400` | `#D4AF37` | Card hover borders, `404.html` hero border, badge borders |
| `--gold-300` | `#E0C068` | Light gold highlights on dark backgrounds |
| `--gold-100` | `#F5EDD6` | Soft gold tint surfaces |

### 2.3 Warm Neutrals & Canvas
Instead of sterile pure white `#FFFFFF` page backgrounds, the platform uses a warm academic parchment canvas (`--bg-main`) paired with crisp white cards (`--bg-card`).

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `--bg-main` | `#F2F0EB` | Global page background |
| `--bg-card` | `#FFFFFF` | Cards, modals, tables, and form containers |
| `--text-dark` | `#111827` | Primary body copy |
| `--text-mid` | `#374151` | Secondary labels and descriptions |
| `--text-light` | `#6B7280` | Metadata, timestamps, muted subtitles |
| `--border` | `#D1CCC3` | Default card and input borders |
| `--border-light` | `#E5E1D8` | Hairline dividers inside cards |

### 2.4 Semantic & Status Colors
Used for announcement categories, job/application pipeline badges, and system guardians (`404` / `5xx`).

| Semantic Role | Background | Foreground | Context |
| :--- | :--- | :--- | :--- |
| **Urgent / Error** | `#FEE2E2` | `#DC2626` | Urgent notices, 404/500 guardian badges |
| **Event / Warning** | `#FEF3C7` | `#D97706` | Alumni reunions, event tags |
| **Academic** | `#EDE9FE` | `#7C3AED` | Department & academic announcements |
| **Career / Info** | `#DBEAFE` | `#2563EB` | Job postings, career opportunities |
| **General / Neutral** | `#E2E8F0` | `#475569` | General bulletins |
| **Online / Active** | — | `#10B981` | Live status indicator dot |

---

## 3. 🔤 Typography

Fonts are loaded via Google Fonts in [`server/public/css/style.css`](./server/public/css/style.css):

- **Primary UI & Body Font:** `'IBM Plex Sans', -apple-system, sans-serif` (Weights: `400`, `500`, `600`, `700`; line-height `1.6`)
  - Chosen for crisp legibility in data tables, alumni directory cards, job ledgers, and forms.
- **Section & Academic Display Font:** `'Source Serif 4', serif` (Weights: `600`, `700`)
  - Used for `.section-title h2` (`1.75rem`) paired with a `36px × 3px` `--gold-500` underline bar.
- **Editorial & Error Hero Display Font:** `'Playfair Display', Georgia, serif`
  - Used for prominent feature cards (Historic Beyazıt Gate card) and high-impact error headlines (`404.html`).

---

## 4. 📐 Layout, Surfaces & Motion

- **Grid Container:** `.container` max-width `1140px`, horizontal padding `20px`.
- **Navbar:** Fixed `56px` height, `--navy-900` surface, `2px solid var(--gold-500)` bottom border, responsive mobile drawer toggle.
- **Cards & Elevation:**
  - Border: `1px solid var(--border)`
  - Radius: `12px` (cards), `24px` (featured error/modal hero panels), `50px` (pill badges)
  - Shadows: `--shadow-sm` (`0 1px 2px rgba(0,0,0,0.05)`), `--shadow-md` (`0 2px 8px rgba(0,0,0,0.08)`), `--shadow-lg` (`0 4px 16px rgba(0,0,0,0.1)`)
  - Interactive Hover: `transform: translateY(-4px)` with `--gold-400` border highlight (`--transition: 0.2s ease`).

---

## 5. 🖼️ Visual Assets & Imagery

- **Institutional Landmark:** [`server/public/img/iu_main_gate.jpg`](./server/public/img/iu_main_gate.jpg) — Historic Istanbul University Beyazıt Main Gate featured in the hero visual card with a dark navy overlay gradient and live badge.
- **Iconography:** Clean emoji semantic markers (`🎓`, `🏛️`, `💼`, `📢`, `📑`, `🩺`, `🛡️`) for zero-dependency cross-platform clarity.

---

## 6. 🗣️ Voice, Tone & Language Conventions

- **User-Facing Web UI (`server/public/*.html`):** Written primarily in **Turkish** (`lang="tr"`) with an encouraging, institutional, and community-oriented tone (e.g., *"Kariyer yolculuğunuzu takip edin, köklü İstanbul Üniversitesi ağınızla her zaman bağlantıda kalın."*).
- **Error Pages & Modals (`404.html`, In-Site Error Modal):** Never expose raw black-screen JSON to browser users. Errors are presented inside the branded Navy/Gold layout with clear Turkish explanations and direct recovery links (*Ana Sayfa*, *Mezun Rehberi*, *İş İlanları*).
- **Developer, API & Architecture Docs (`README.md`, `DDD.md`, Swagger):** Written in **English** (with Turkish domain terms noted where relevant) using precise technical terminology.

---

## 7. ✅ Brand Do's & Don'ts

| ✅ Do | ❌ Don't |
| :--- | :--- |
| Use `--navy-900` and `--gold-500` for primary brand hierarchy | Use neon/off-brand colors for primary buttons or headers |
| Keep `--bg-main` (`#F2F0EB`) as the warm canvas behind white cards | Overuse pure `#000000` backgrounds or harsh unstyled JSON in browser UIs |
| Pair `Source Serif 4` headings with `IBM Plex Sans` body copy | Mix unrelated display fonts across standard CRUD views |
| Maintain the `2px` gold navbar border and `36px` section underline | Remove institutional attribution (Istanbul University YBS) from footers |
