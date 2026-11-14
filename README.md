# BookingPro — Next-Gen Service & Appointment Platform

Built from: Complete Product Design Specification & Wireframe Sets

## Tech Stack
- **Framework**: Pure HTML5 + CSS3 + Vanilla JavaScript (No build step required)
- **Styling**: Custom Master Design System (`css/design-system.css`), Single-Source Header (`css/header.css`), 3D Motion System (`css/landing-3d.css`)
- **Shared Layout Engine**: Native Web Components (`<site-header>` and `<site-footer>`) with zero CORS restrictions on `file:///`
- **Typography**: Display: *Plus Jakarta Sans* | Body: *Inter*
- **Color Theme**: Bespoke Human Palette (Warm Alabaster `#fbfbfa`, Deep Ink `#111827`, Heritage Forest Emerald `#0d5c46`, Warm Amber `#b45309`) — Zero AI Purple/Indigo Tropes

## Getting Started

Because this project is built on pure web standards, you can run it immediately without any build tools:

```bash
# Option 1: Open index.html directly in any browser
double click index.html

# Option 2: Run via any lightweight static server
npx serve .
# or
python -m http.server 3000
```

Open [http://localhost:3000](http://localhost:3000) or open `index.html` directly in your browser.

## Project Structure

```
frontend/
├── index.html                     # Full 3D Interactive Landing Page (No team section; Contact built)
├── login.html                     # Unified Login with 1-click Demo Role Selectors
├── register.html                  # Role-based Registration with Live Password Strength Meter
├── css/
│   ├── design-system.css          # Design Tokens, Fluid Typography, Palette, Elevation & Utilities
│   ├── header.css                 # Single Source of Truth Header & Footer Styles
│   └── landing-3d.css             # 3D Transforms, Bento Grid, and Contact Section
├── js/
│   ├── site-header.js             # Native Web Component <site-header>
│   ├── site-footer.js             # Native Web Component <site-footer>
│   └── landing-3d.js              # 3D Mouse Tracking Tilt, Stats Counter, Contact Form Validation
├── customer/
│   ├── browse-shops.html          # Browse & Filter Verified Providers
│   ├── provider-details.html      # Shop View, Services Catalog & Reviews
│   ├── select-service.html        # Interactive Booking & Payment Configuration
│   ├── confirm-appointment.html   # QR Booking Pass & Receipt
│   ├── my-bookings.html           # Active Bookings & Countdown
│   ├── booking-history.html       # Completed Appointments & Invoice Archive
│   ├── feedback.html              # 5-Star Rating & Review Submission
│   ├── cancel-appointment.html    # Policy-guided Cancellation & Refund Calculation
│   ├── profile.html               # Customer Profile & Alert Preferences
│   ├── change-password.html       # Password Reset
│   └── forgot-password.html       # Email PIN Recovery
├── provider/
│   ├── dashboard.html             # Provider Console, Revenue Charts & Today's Queue
│   ├── appointments.html          # Calendar & Walk-In Manager
│   ├── services.html              # Services Catalog & Pricing Editor
│   ├── shop-profile.html          # Storefront Profile & Weekly Hours Schedule
│   ├── time-slots.html            # Smart Slot Duration & Capacity Configurator
│   ├── revenue.html               # Earnings & Payout Ledger
│   └── ratings.html               # Reputation Score & Client Reply Center
└── admin/
    ├── dashboard.html             # Platform Master Console & GMV Growth
    ├── categories.html            # Taxonomy & Platform Fee Config
    ├── provider-requests.html     # Onboarding Queue & Document Badges
    ├── provider-request-details.html # Legal Dossier Inspection
    ├── provider-list.html         # Verified Providers Directory & Status
    ├── user-list.html             # Registered Customer Registry
    ├── booking-list.html          # Master Bookings Ledger & Dispute Flags
    ├── booking-details.html       # Granular Lifecycle Audit Trail
    ├── reports.html               # Executive Analytics & Leaderboards
    ├── manage-accounts.html       # Admin Staff Roles & 2FA
    └── edit-user.html             # Administrative Profile Corrections
```

## Design Decisions & Quality Highlights
- **100% Single Source of Truth**: Header and Footer are defined once as native Web Components (`<site-header>` and `<site-footer>`) and injected across every page with exact pixel parity.
- **Genuine 3D Experience**: Rebuilt landing page with CSS 3D transforms (`perspective`, `transform-style: preserve-3d`), inertia mouse tracking tilt on device mockups, and layered floating glass cards.
- **Custom Design Language**: Asymmetrical bento grids, editorial typography scales, rich multi-layered shadows, and authentic human copy replace generic repeated card layouts.
- **Team Section Removed / Contact Section Built**: The team section was completely eliminated from layout, anchors, and sitemap per instructions. A full-featured split contact section with validated interactive forms was created.
- **1-Click Demo Login Testing**: The login screen includes instant 1-click test pills for "Customer", "Provider", and "Admin" roles to make platform demonstration effortless.
