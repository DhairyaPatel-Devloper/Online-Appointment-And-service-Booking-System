<p align="center">
  <img src="https://img.shields.io/badge/BookWith.tech-Online%20Booking-0d5c46?style=for-the-badge&logoColor=white" alt="BookWith.tech" />
</p>

<h1 align="center">📅 Online Appointment & Service Booking System</h1>

<p align="center">
  <strong>A modern, full-featured platform for booking appointments with verified local service providers.</strong><br/>
  Built for customers, providers, and administrators — all in one place.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Bootstrap_5-7952B3?style=flat-square&logo=bootstrap&logoColor=white" />
  <img src="https://img.shields.io/badge/Web_Components-29ABE2?style=flat-square&logo=webcomponents.org&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/DhairyaPatel-Devloper/Online-Appointment-And-service-Booking-System?style=flat-square&color=0d5c46" />
  <img src="https://img.shields.io/github/last-commit/DhairyaPatel-Devloper/Online-Appointment-And-service-Booking-System?style=flat-square&color=b45309" />
  <img src="https://img.shields.io/github/repo-size/DhairyaPatel-Devloper/Online-Appointment-And-service-Booking-System?style=flat-square" />
</p>

---

## ✨ What is BookWith.tech?

**BookWith.tech** is a complete online appointment and service booking platform that connects **customers** with **verified local service providers** — salons, clinics, dental offices, home specialists, and more.

> 🟢 **Direct calendar access** · See upfront transparent pricing · Confirm your slot in 30 seconds

<br/>

## 🎯 Key Features

<table>
<tr>
<td width="33%" valign="top">

### 👤 Customer Portal
- 🔍 Browse & filter verified providers
- 📅 Real-time appointment booking
- ⭐ Ratings & review system
- 📋 Booking history & invoices
- 🔐 Secure auth & profile management
- 📱 Fully responsive design

</td>
<td width="33%" valign="top">

### 🏪 Provider Dashboard
- 📊 Revenue analytics & charts
- 🗓️ Calendar & walk-in management
- 💈 Services catalog & pricing editor
- ⏰ Smart time slot configurator
- 🏠 Storefront profile & hours
- ⭐ Reputation score & replies

</td>
<td width="33%" valign="top">

### 🛡️ Admin Console
- 📈 Platform GMV & growth metrics
- ✅ Provider onboarding & verification
- 👥 User & provider management
- 📋 Master bookings ledger
- 📊 Executive analytics & reports
- 🔑 Staff roles & access control

</td>
</tr>
</table>

<br/>

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Design System** | Custom tokens, fluid typography, bespoke color palette |
| **Layout Engine** | Native Web Components (`<site-header>`, `<site-footer>`) |
| **Backend** | Supabase (PostgreSQL + Auth + Real-time) |
| **Typography** | Plus Jakarta Sans (Display) · Inter (Body) |
| **Icons** | Bootstrap Icons |
| **3D Effects** | CSS 3D Transforms with mouse-tracking tilt |

<br/>

## 🎨 Design Philosophy

| Aspect | Approach |
|--------|----------|
| 🏗️ **Architecture** | Single Source of Truth — header/footer defined once, injected everywhere via Web Components |
| 🎭 **Visual Identity** | Warm Alabaster `#fbfbfa`, Deep Ink `#111827`, Heritage Forest `#0d5c46`, Warm Amber `#b45309` |
| 📐 **Layout** | Asymmetrical bento grids, editorial typography scales, multi-layered elevation system |
| ✨ **Landing Page** | Full 3D interactive experience with perspective transforms and floating glass cards |
| ⚡ **Demo Mode** | 1-click role pills on login (Customer / Provider / Admin) for instant platform testing |

<br/>

## 🚀 Getting Started

No build tools needed — it's pure web standards.

```bash
# Option 1: Open directly
open index.html

# Option 2: Run via static server
npx serve .
# or
python -m http.server 3000
```

Then visit [http://localhost:3000](http://localhost:3000)

### Environment Setup

Copy the example env file and add your Supabase credentials:

```bash
cp .env.example .env
```

<br/>

## 📁 Project Structure

```
bookwith.tech/
│
├── index.html                  → 3D Interactive Landing Page
├── login.html                  → Unified Login with Demo Role Selectors
├── register.html               → Role-based Registration + Live Password Strength
│
├── css/
│   ├── design-system.css       → Design Tokens, Palette, Typography, Utilities
│   ├── header.css              → Header & Footer Styles (Single Source)
│   └── landing-3d.css          → 3D Transforms, Bento Grid, Contact Section
│
├── js/
│   ├── site-header.js          → <site-header> Web Component
│   ├── site-footer.js          → <site-footer> Web Component
│   ├── landing-3d.js           → 3D Tilt, Stats Counter, Contact Validation
│   ├── supabase-client.js      → Supabase Connection
│   ├── api-service.js          → API Abstraction Layer
│   └── services/               → Auth, Booking, Feedback, Provider, Slot, User, Admin
│
├── customer/                   → 11 Customer-facing Pages
│   ├── browse-shops.html       → Browse & Filter Providers
│   ├── provider-details.html   → Shop View, Services & Reviews
│   ├── select-service.html     → Booking & Payment Config
│   ├── my-bookings.html        → Active Bookings & Countdown
│   ├── booking-history.html    → Past Appointments & Invoices
│   └── ...                     → Profile, Feedback, Password, Cancellation
│
├── provider/                   → 9 Provider Dashboard Pages
│   ├── dashboard.html          → Revenue Charts & Today's Queue
│   ├── appointments.html       → Calendar & Walk-In Manager
│   ├── services.html           → Catalog & Pricing Editor
│   ├── time-slots.html         → Smart Slot Configurator
│   └── ...                     → Shop Profile, Revenue, Ratings
│
└── admin/                      → 13 Admin Console Pages
    ├── dashboard.html          → Platform Overview & GMV Growth
    ├── provider-requests.html  → Onboarding Queue & Verification
    ├── user-list.html          → Customer Registry
    ├── reports.html            → Executive Analytics
    └── ...                     → Bookings, Categories, Accounts
```

<br/>

## 🔐 Three User Roles

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  👤 Customer │────▶│  🏪 Provider      │◀────│  🛡️ Admin        │
│             │     │                  │     │                 │
│ • Browse    │     │ • Manage Services│     │ • Verify Provs  │
│ • Book      │     │ • View Calendar  │     │ • Monitor GMV   │
│ • Review    │     │ • Track Revenue  │     │ • Run Reports   │
│ • Pay       │     │ • Reply Reviews  │     │ • Manage Users  │
└─────────────┘     └──────────────────┘     └─────────────────┘
```

<br/>

## 📄 License

This project is developed as part of the **Web Technology (01CE1306)** course at **Marwadi University**, Faculty of Engineering and Technology, Department of Computer Engineering.

---

<p align="center">
  Made with ❤️ by <strong>Dhairya R Dadhaniya</strong>
</p>
