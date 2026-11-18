---
version: 3.0
name: AlumniTracker-Clubhouse-MIS-Design-System
source_reference: https://getdesign.md/design-md/joinclubhouse?category=media-consumer&page=2
description: A warm, community-first university alumni platform modeled after Clubhouse (joinclubhouse) and anchored in Istanbul University Management Information Systems (MIS / YBS) emblem colors. Combines dark espresso hero/footer bands (#2B2924), warm Clubhouse paper (#F1EFE6), MIS Canary Yellow (#F8E71C), MIS Sky Blue (#5EC2E6), MIS Forest Green (#0B7A3B), squircle real portrait avatars (border-radius 38%), and rotating Istanbul University & Faculty of Economics campus photography.
---

# 🎨 Design System Specification — Alumni Tracker (`design.md`)

> **Selected Reference:** [**Clubhouse `DESIGN.md`**](https://getdesign.md/design-md/joinclubhouse?category=media-consumer&page=2) (`joinclubhouse`)  
> **Department Palette:** **Istanbul University — MIS (YBS) 2021 Emblem** (Sky Blue, Forest Green, Canary Yellow, Ink Black)  
> **School Theme:** **İstanbul Üniversitesi • İktisat Fakültesi • Yönetim Bilişim Sistemleri (YBS)**

---

## 1. Visual Theme & Atmosphere

- **Warm Community Paper (`#F1EFE6`):** Clubhouse's signature warm cream-parchment floor (`#F1EFE6`) replaces cold sterile white/gray SaaS backgrounds, creating an inviting academic community feel.
- **Dark Espresso Anchors (`#2B2924`):** Deep warm charcoal-espresso header, hero stage (layered over rotating İÜ & İktisat campus photos), and footer.
- **MIS 2021 Emblem Colors:**
  - **MIS Canary Yellow (`#F8E71C`):** Hero keyword highlight + Clubhouse-style full-width Yellow community statement band (paired strictly with `#0A0A0A` Ink Black text).
  - **MIS Sky Blue (`#5EC2E6` / Accessible `#0284C7`):** Interactive focus states, technology/department tags, and primary directory accents.
  - **MIS Forest Green (`#0B7A3B`):** Active status dots, employment outcomes, and positive badges.
  - **MIS Ink Black (`#0A0A0A`):** Crisp outlines, button bottom-borders (`3px solid #0A0A0A`), and high-contrast typography.
- **Real Portraits — Zero Initial Squares:** Every alumnus card displays a **real portrait photograph** (`server/public/img/avatars/avatar-*.jpg`) inside a **Clubhouse Squircle** (`border-radius: 38%`) — eliminating generic colored initial boxes.

---

## 2. Color Palette & Roles

| Token | Hex | Origin | Functional Role |
| :--- | :--- | :--- | :--- |
| `--espresso` | `#2B2924` | Clubhouse Dark Band | Top navigation, dark hero backdrop, footer |
| `--paper` | `#F1EFE6` | Clubhouse Warm Paper | Global page canvas for directory, jobs, and reading bands |
| `--taupe` | `#A69783` | Clubhouse Stone Band | Editorial campus showcase band |
| `--mis-yellow` | `#F8E71C` | MIS Emblem (`I` & `2`) | Hero accent typography & full-width community highlight band |
| `--mis-blue` | `#5EC2E6` | MIS Emblem (`M` & `1`) | Department accent, focus rings, subtle avatar rings |
| `--mis-blue-700` | `#0284C7` | Accessible MIS Blue | Primary links & accessible action buttons |
| `--mis-green` | `#0B7A3B` | MIS Emblem (`S` & `2`) | Active/online indicators, employment rate & offer badges |
| `--mis-ink` | `#0A0A0A` | MIS Emblem (`0` & Ant) | Primary headings, tactile pill borders, text on Yellow |
| `--surface` | `#FFFFFF` | Clean Card Floor | Directory cards, modals, room preview, tactile buttons |
| `--hairline` | `#DFDCD2` | Warm Card Border | `1px` borders on `#FFFFFF` cards over `#F1EFE6` paper |
| `--muted` | `#6E6A61` | Warm Muted Ink | Secondary metadata, company/department subtext |

---

## 3. Typography Rules & Hierarchy

- **Display / Hero Headings:** `'Plus Jakarta Sans', 'Inter', sans-serif` — Bold (`800`), tight tracking (`-0.03em`), uppercase/editorial impact on hero (`44px–58px`).
- **Body & UI:** `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` — Clean, warm, scannable (`14px–16px`).
- **Numeric Precision:** `font-variant-numeric: tabular-nums;` on all graduation years, KPI counters, and `min_wage_multiplier`.

---

## 4. Component Stylings (Clubhouse Signature)

- **Squircle Portrait Avatars:** `border-radius: 38%; object-fit: cover;` (52×52px in directory cards, 64×64px in room/spotlight previews, circular `50%` in the hero portrait matrix).
- **Tactile Pill Buttons:** `border-radius: 9999px; border: 1.5px solid #0A0A0A; border-bottom-width: 3px;` — crisp tactile press feel without heavy drop shadows.
- **Directory & Job Cards:** `#FFFFFF` surface on `#F1EFE6` warm paper, `1px solid #DFDCD2`, `border-radius: 18px`, clean typography without emoji clutter.
- **Rotating Campus Background:** Hero background smoothly cycles through real **İstanbul Üniversitesi, İktisat Fakültesi & YBS** photographs (`main-gate.jpg`, `iktisat-gate.jpg`, `iktisat-library.jpg`, `iktisat-classroom.jpg`, `campus-2013.jpg`, `beyazit-square.jpg`) behind a dark `#2B2924` editorial scrim.
