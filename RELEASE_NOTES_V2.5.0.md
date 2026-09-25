# Developer Release & Deployment Notes — Portfolio v2.5.0

**Release Date**: September 25, 2026  
**Target Environment**: Production ([`https://abhinavranjan.qzz.io/`](https://abhinavranjan.qzz.io/))  
**Primary Maintainer**: AR. Abhinav Ranjan (ar.abhinavranjan)

---

## 1. Release Overview & Key Features

### 📅 Dedicated 1-on-1 Appointment Booking System
- **Standalone Page**: Introduced [`frontend/html/appointment.html`](file:///c:/Users/DeveloperAbhinav/Downloads/abhinavranjan-main%20%281%29/abhinavranjan-main/frontend/html/appointment.html) for booking consultations, audits, research discussions, and mentorship sessions.
- **4 Dispatch Methods**:
  1. **WhatsApp Instant**: Constructs a compact encoded request string (`Appointment Request; Name: ...; Phone: ...; Email: ...; Date: ...; Reason: ...; Notes: ...`).
  2. **Telegram Fast**: Formats compact query payloads directed to `@abhinav_ranjan`.
  3. **Email Request**: Constructs structured body copy via `mailto:` protocol.
  4. **Website Submission API**: Submits payload to Netlify Function `/api/saveContact` with WhatsApp fallback.

### 🎨 Centered UI Callout Containers
- Updated callout sections across [`index.html`](file:///c:/Users/DeveloperAbhinav/Downloads/abhinavranjan-main%20%281%29/abhinavranjan-main/index.html), [`about.html`](file:///c:/Users/DeveloperAbhinav/Downloads/abhinavranjan-main%20%281%29/abhinavranjan-main/frontend/html/about.html), [`biography.html`](file:///c:/Users/DeveloperAbhinav/Downloads/abhinavranjan-main%20%281%29/abhinavranjan-main/frontend/html/biography.html), and [`contact.html`](file:///c:/Users/DeveloperAbhinav/Downloads/abhinavranjan-main%20%281%29/abhinavranjan-main/frontend/html/contact.html).
- Replaced inline header icons with centered top badge circles (`54px x 54px`, `rgba(99, 102, 241, 0.15)` background).
- Enforced flex alignment (`flex-direction: column`, `align-items: center`, `text-align: center`).

### 🔍 Search & AI Machine-Readable Schemas (SEO, GEO, SXO)
- Added dual entity name resolution (`AR. Abhinav Ranjan` and `Abhinav Ranjan`).
- Integrated `ContactPage`, `Service`, and `ReserveAction` JSON-LD structured data on `contact.html` and `appointment.html`.
- Updated machine index [`llms-full.txt`](file:///c:/Users/DeveloperAbhinav/Downloads/abhinavranjan-main%20%281%29/abhinavranjan-main/llms-full.txt) and [`sitemap.xml`](file:///c:/Users/DeveloperAbhinav/Downloads/abhinavranjan-main%20%281%29/abhinavranjan-main/sitemap.xml) with `lastmod` set to `2026-09-25`.

---

## 2. Modified & Created Files Summary

| File | Type | Purpose |
| :--- | :--- | :--- |
| [`frontend/html/appointment.html`](file:///c:/Users/DeveloperAbhinav/Downloads/abhinavranjan-main%20%281%29/abhinavranjan-main/frontend/html/appointment.html) | Created | Standalone appointment booking page |
| [`frontend/html/contact.html`](file:///c:/Users/DeveloperAbhinav/Downloads/abhinavranjan-main%20%281%29/abhinavranjan-main/frontend/html/contact.html) | Modified | Replaced full form with callout card & added JSON-LD graph |
| [`frontend/logic/contact_handler.js`](file:///c:/Users/DeveloperAbhinav/Downloads/abhinavranjan-main%20%281%29/abhinavranjan-main/frontend/logic/contact_handler.js) | Modified | Updated form handler validation, button logic & message format |
| [`frontend/css/styles.css`](file:///c:/Users/DeveloperAbhinav/Downloads/abhinavranjan-main%20%281%29/abhinavranjan-main/frontend/css/styles.css) | Modified | Added `.btn` flex gap, icon spacing, and appointment card styles |
| [`frontend/logic/footer_v105.js`](file:///c:/Users/DeveloperAbhinav/Downloads/abhinavranjan-main%20%281%29/abhinavranjan-main/frontend/logic/footer_v105.js) | Modified | Added "Book Appointment" link to navigation list |
| [`index.html`](file:///c:/Users/DeveloperAbhinav/Downloads/abhinavranjan-main%20%281%29/abhinavranjan-main/index.html) | Modified | Centered callout card container and button |
| [`frontend/html/about.html`](file:///c:/Users/DeveloperAbhinav/Downloads/abhinavranjan-main%20%281%29/abhinavranjan-main/frontend/html/about.html) | Modified | Centered appointment callout card container |
| [`frontend/html/biography.html`](file:///c:/Users/DeveloperAbhinav/Downloads/abhinavranjan-main%20%281%29/abhinavranjan-main/frontend/html/biography.html) | Modified | Centered appointment callout card container |
| [`sitemap.xml`](file:///c:/Users/DeveloperAbhinav/Downloads/abhinavranjan-main%20%281%29/abhinavranjan-main/sitemap.xml) | Modified | Registered `appointment.html` and updated `lastmod` dates |
| [`llms-full.txt`](file:///c:/Users/DeveloperAbhinav/Downloads/abhinavranjan-main%20%281%29/abhinavranjan-main/llms-full.txt) | Modified | Indexed appointment booking section & URLs for AI models |

---

## 3. Pre-Deployment Verification Checklist

- [x] **Navigation Links**: Header & Footer links correctly resolve relative paths across subdirectories.
- [x] **Form Logic**: WhatsApp, Telegram, Email, and Web API handlers function independently without script blocking.
- [x] **Structured Data**: JSON-LD syntax verified for `Person`, `ContactPage`, `Service`, and `ReserveAction`.
- [x] **Mobile Responsiveness**: Verified on mobile viewports with iOS datetime picker dark mode compatibility.
- [x] **Sitemap Indexing**: `sitemap.xml` updated and valid for Search Console submission.
