# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, in this order:

1. **Real audience:** teachers, examiners and people reviewing a job application. They judge the design and build quality of the site as a portfolio piece.
2. **In-world audience (the fiction the site is written for):** owners of small businesses in Upper Austria (Steyr and surroundings: carpenters, cafés, hair salons, small shops). Usually not tech-savvy, often reading on a phone between customers. They want to know what a website costs, what they get, and whom to call.

## Product Purpose

"Ladenfenster" is a fictional web agency from Steyr that builds simple, fixed-price websites for local small businesses. The site is a practice / portfolio project: it shows that a calm, well-built, accessible marketing site can be made with plain HTML, CSS and JavaScript. Success means a reviewer sees careful craft (typography, spacing, accessibility, interaction detail) and the in-world visitor would understand the offer and prices without help.

## Positioning

Local, plain-spoken, fixed-price. The agency talks like the businesses it serves ("Habt's am 8. Dezember offen?"), says openly what it does not do, and shows prices up front. No stock photos, no jargon.

## Operating Context

Six pages: Start, Leistungen, Referenzen (three fictional case studies with a detail dialog), Pakete (three packages, a maintenance toggle that recalculates first-year cost, FAQ), Kontakt (mock form with live validation, sends nothing), Impressum (placeholder per § 5 ECG and § 25 MedienG). Published on GitHub Pages.

## Capabilities and Constraints

- Plain HTML/CSS/JS, no framework, no build step. Navigation and footer are duplicated in every HTML file.
- One stylesheet (`css/style.css`), one script (`js/main.js`).
- Copy is German (Austrian, de-AT) and addresses the visitor with "Sie".
- Content, page structure, prices and copy stay unless a concrete problem is found.
- Local preview via `server.ps1` on port 5500.

## Brand Commitments

- Apple-like restraint: calm, generous space, system font stack, a single accent colour, full dark mode.
- Light mode: warm cream canvas (`#f5f0e6`, never pure white), dark navy accent (`#1b2a44`), text in a very dark blue-grey (`#18202e`), warm-tinted neutrals and shadows.
- Dark mode: black canvas (`#000`), very dark grey cards (`#141414` / `#1e1e1e`), cream headings and primary button (`#efe3cc`, black text), muted cream body text (`#bdb19b`), navy surfaces (`#18284a`, cream text) for active nav, secondary buttons, pills, tiles and the switch; lighter navy for line icons, borders and focus rings (`#4467ae`, 3:1) and link text (`#6685c4`, 4.5:1). No translucent cream or blue-grey fills.
- Logo: a small shop-window mark with an awning in the accent colour (navy; lighter navy in dark mode).

## Evidence on Hand

All businesses, numbers, results, addresses and prices are invented and are labelled as such on the site (footer note, Referenzen intro, case results, contact placeholder note, Impressum banner). These labels must stay clearly visible. No real testimonials, clients or photos exist; none may be fabricated as real.

## Product Principles

1. Readable first: plain words, large enough type, nothing that needs zooming.
2. Honest about the fiction: every invented fact stays labelled.
3. Show, don't claim: CSS-built mockups demonstrate what a client site would look like.
4. Restraint over decoration: one accent colour, motion only where it explains something.

## Accessibility & Inclusion

No formal standard required. Working baseline: keyboard operable, visible focus, sufficient contrast in light and dark mode, respects `prefers-reduced-motion`, `prefers-reduced-transparency` and `prefers-contrast`.
