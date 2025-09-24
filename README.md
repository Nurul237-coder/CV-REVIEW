# CV Review – Mockup (Sprint 1–2)

Brand-guided, responsive mockup with pages:
- `index.html` – Landing Page
- `upload.html` – Upload CV Page
- `analysis.html` – Snapshot Analysis Page
- `role-form.html` – Role-Specific Form (Sprint 2)
  
## Pages Added in Sprints 3–5
- `payment.html` – Payment Page (Sprint 4)
- `payment-success.html` – Payment Success Page (Sprint 4)
- `dashboard.html` – Application Tracker (Kanban) (Sprint 5)
- `benchmark.html` – Normal Curve Benchmark Detail (Sprint 5)

## Quick Start
- Open `index.html` in your browser.
- Flow: Landing → Upload CV → Scan → Role-Specific Form → Snapshot Analysis (free teaser with sub-scores) → CTA Premium.
  
### Sprint 3–5 flows
- Sprint 3 (Rewrite Engine): Analysis shows role-specific rewrite suggestions (1 free item; others locked) and a Preview CV card with Premium watermark.
- Sprint 4 (Monetization): Clicking Unlock opens Lock Modal → Payment Page → Payment Success.
- Sprint 5 (Retention): Dashboard (Kanban) and Benchmark pages are accessible directly via their HTML files.

## Tech
- HTML + CSS + vanilla JS (no build).
- Fonts: Inter, Roboto via Google Fonts.

## Brand
- Primary Blue `#2563EB` for CTA and main actions.
- Light Gray `#F3F4F6` background sections; White cards with `rounded-xl` and soft shadow.
- Text `#111827` for strong contrast.
- Accents: Green `#10B981`, Red `#EF4444`, Yellow `#FACC15`.

## Notes
- Upload supports PDF/DOC/DOCX; interactions are simulated for demo.
- Score defaults to 65/100 initially. In Sprint 2, the role form computes simple sub-scores from inputs and averages them for the total (mock logic), all passed via query string to `analysis.html`.
- Bell curve is a simple SVG with a red dot indicating user position.

## Sprint 2 – What’s New
- Role-Specific Form (`role-form.html`) with tabs for:
  - Scholarship: IPK, Awards/Achievements, Test Score (IELTS/TOEFL)
  - Career Switcher: Role Asal, Role Tujuan, Transferable Skills
  - Internship: Academic Projects, Organization/Volunteer Experience, Coursework Relevan
- Sub-score bars (0–100) for 3 categories per role on `analysis.html`.
- Role accent colors on sub-score bars:
  - Scholarship → Green `#10B981`
  - Career Switcher → Orange `#F97316`
  - Internship → Purple `#7C3AED`
- Premium box teaser with CTA: "Unlock Premium".

## Sprint 3 – What’s New
- Auto-Rewrite Suggestions on `analysis.html` with 1 free sample; other items locked with blur + lock icon.
- Preview CV (ATS-friendly) card with role accent and "Premium" watermark; Download button disabled when locked.

## Sprint 4 – What’s New (Monetization)
- Lock Screen Modal on `analysis.html` with benefits and CTAs (Unlock / Continue Free).
- `payment.html` with simple method selection and confirm button.
- `payment-success.html` with green checkmark and CTAs to view analysis/download.
- Unlock state stored in `localStorage.premiumUnlocked` and respected by `analysis.html` (locks removed, download enabled, premium title updated).

## Sprint 5 – What’s New (Retention)
- `dashboard.html` Kanban board (drag-and-drop), sidebar deadlines widget, and a CTA to improve CV (premium gating example).
- `benchmark.html` detailed normal curve with gradient stroke, percentile text, tabs for sub-scores, and a Premium unlock CTA.

## Tips & Navigation
- To test Premium unlock quickly: open `payment.html`, click "Bayar & Unlock" → you’ll be redirected to `payment-success.html`, then proceed to analysis via the button. This sets `localStorage.premiumUnlocked=1`.
- Open pages directly in the browser:
  - `index.html` → main flow
  - `analysis.html` → snapshot + rewrite + lock modal
  - `payment.html` / `payment-success.html` → monetization flow
  - `dashboard.html` → Kanban mock
  - `benchmark.html` → benchmark mock
