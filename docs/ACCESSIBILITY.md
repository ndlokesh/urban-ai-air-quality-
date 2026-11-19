# CleanBreath | Accessibility (A11y) & WCAG 2.1 AA Audit

CleanBreath is engineered from the ground up to be inclusive, high-contrast, and intuitive for older family members, individuals with visual impairments, and mobile-first users.

## WCAG 2.1 AA Compliance Checklist

| WCAG Criterion | CleanBreath Implementation | Status |
|---|---|:---:|
| **1.1.1 Non-text Content** | All SVG icons have `aria-hidden="true"` or accompanying text/title labels. Interactive icons have descriptive `aria-label` attributes. | ✅ Pass |
| **1.3.1 Info and Relationships** | Semantic HTML5 structure (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`). Form inputs have explicit labels and associated descriptions. | ✅ Pass |
| **1.4.1 Use of Color** | Air quality severity is never communicated through color alone. Every band pairs a color with numerical AQI, text category label, and explicit severity explanation. | ✅ Pass |
| **1.4.3 Contrast (Minimum)** | High-contrast palette: Text elements maintain a contrast ratio > 4.5:1 against their backgrounds (e.g. emerald-950 on emerald-50, rose-950 on rose-50, white on emerald-600). | ✅ Pass |
| **2.1.1 Keyboard Accessible** | Full keyboard navigation: Skip to main content link, visible focus rings (`focus-visible:ring-2 focus-visible:ring-emerald-500`), and `Space`/`Enter` keyboard event listeners on custom checkboxes. | ✅ Pass |
| **2.4.1 Bypass Blocks** | Hidden "Skip to main content" link at the top of the DOM for screen reader and keyboard users. | ✅ Pass |
| **2.4.4 Link Purpose** | All interactive buttons have descriptive text (e.g. "Use My Location", "Generate AI Action Plan", "Listen to Advisory"). | ✅ Pass |
| **4.1.2 Name, Role, Value** | Custom controls declare ARIA attributes (`role="checkbox"`, `aria-checked`, `role="region"`, `aria-label`). Dynamic updates use `aria-live="polite"`. | ✅ Pass |

---

## Assistive Technology Enhancements

### 1. Web Speech API Voice Advisory (Auditory Accessibility)
- Designed specifically for elderly relatives and non-literate community members.
- Tapping **"Listen to Advisory"** / **"सलाह सुनें"** reads out today's AQI severity, vulnerable household precautions, and ventilation instructions in crystal-clear English or Hindi.
- Supports pause, stop, and localized voice synthesis (`hi-IN` / `en-US`).

### 2. Large Touch Targets & Mobile Ergonomics
- All interactive controls have minimum touch targets of 44x44px.
- Lifestyle profile buttons feature generous padding, distinct active states, and clear checkmark indicators.

### 3. Screen Reader Announcements (`aria-live`)
- Live AQI updates and status changes are automatically announced politely to screen reader users without interrupting active speech.
- Critical error alerts utilize `aria-live="assertive"`.
