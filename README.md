# 🚗 EGHSELHA (إغسلها) — On-Demand Mobile Car Wash Platform

[![.NET 8.0](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-CC292B?logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/sql-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **EGHSELHA** is a modern, full-stack on-demand and scheduled mobile car wash and detailing platform. It connects vehicle owners with certified, mobile-equipped detailers who travel directly to the customer's parked location, eliminating the need to wait in line at traditional brick-and-mortar car washes.

---

## 📑 Table of Contents
- [Architecture Overview](#-architecture-overview)
- [Key Features](#-key-features)
  - [Customer Portal](#1-customer-portal)
  - [Technician Portal](#2-technician-portal)
  - [Backend & Pricing Engine](#3-backend--pricing-engine)
- [Pricing Formula & Business Rules](#-pricing-formula--business-rules)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [API Documentation](#-api-documentation)
- [Contributing & License](#-contributing--license)

---

## 🏛 Architecture Overview

EGHSELHA follows **Clean Architecture** and **Domain-Driven Design (DDD)** principles to separate concerns between business domain logic, data persistence, and API exposure:

```
├── WebCarWash.Domain           # Enterprise Entities, Value Objects & Domain Enums
├── WebCarWash.Application      # DTOs, Service Interfaces, Business Contracts
├── WebCarWash.Infrastructure   # EF Core DbContext, Configurations, Services, Migrations
├── WebCarWash.API              # ASP.NET Core Controllers, Middlewares, Dependency Injection
└── EGSELHA_Fontend             # React + Vite Frontend SPA (Customer & Technician Portals)
```

---

## 🌟 Key Features

### 1. Customer Portal
* **Interactive Home Landing Page (`CustomerHome.jsx`)**:
  * Real-time active wash tracker banner for in-progress bookings.
  * Hero quick-booking flow with 1-click garage car selection.
  * 4-Tier visual package cards with direct deep-linking to booking.
  * 3-Step service workflow explanation and subscription promotional banners.
* **Smart Booking Engine (`CustomerBookWash.jsx`)**:
  * Dynamic pricing calculator responding in real-time to vehicle size multipliers, add-ons, and subscription discounts.
  * Utility requirement validation (water/electricity mobile van dispatch).
  * Fast Track (on-demand within 5 km) vs. Scheduled time-slot picker.
  * Saved address selection or custom address creation with 1-click save.
* **Booking & Invoice Management (`CustomerBookBookings.jsx`)**:
  * Mandatory 200 EGP upfront deposit confirmation flow.
  * Live technician status indicators (`PENDING`, `DEPOSIT_PAID`, `DISPATCHED`, `ARRIVED`, `WASHING`, `COMPLETED`).
  * On-site upsell decision banner (Approve/Decline technician extra charge requests).
  * Electronic tax invoice viewer and printer modal.
* **Garage & Locations Manager (`CustomerProfile.jsx` & `CustomerVehicles.jsx`)**:
  * Vehicle registration with size categorization (Sedan, SUV, Truck/Van).
  * Saved parking locations and gate notes management.
  * Cascade deletion handling with instant database synchronization.
* **Review & Loyalty System (`CustomerReviews.jsx`)**:
  * Multi-metric feedback rating (Punctuality, Cleanliness, Professionalism).
  * Quality tags selection, technician tipping, and written feedback.
  * Automated +50 Loyalty Points award per completed review.

### 2. Technician Portal
* **Technician Dashboard (`Dashboard.jsx`)**:
  * Online/Offline toggle with real-time GPS coordinate broadcasting.
  * 45-second job offer countdown dispatch with acceptance and rejection.
  * Daily earnings counters and acceptance rate KPI widgets.
* **Job Execution & Verification (`JobDetails.jsx`)**:
  * Step-by-step workflow: `On The Way` ➔ `Arrived` ➔ `Start Wash` ➔ `Completed`.
  * Pre-wash and post-wash **PhotoQA** audit uploads.
  * On-site inspection extra-charge upsell proposals.
* **Earnings & Automated Payouts (`Earnings.jsx`)**:
  * Detailed breakdown of completed wash earnings and customer tips.
  * Instant bank / Instapay payout requests.

### 3. Backend & Pricing Engine
* **Entity Framework Core 8** with Microsoft SQL Server persistence.
* **Custom JSON Value Comparers** for collections (`SavedAddresses`, `EvidenceUrls`, `SelectedTags`).
* **Relational Cascade Constraints** protecting data integrity between customers, vehicles, bookings, payments, and reviews.
* Fully interactive **Swagger / OpenAPI** explorer.

---

## 💰 Pricing Formula & Business Rules

All prices follow the deterministic formula defined in the project specification:

$$\text{Final Price} = \Big[ \big(\text{Base Package Price} \times \text{Vehicle Multiplier}\big) + \text{Add-Ons Subtotal} + \big(\text{Distance Fee} \times \text{Surge Multiplier}\big) \Big] \times \text{Plan Discount}$$

### 1. Detailing Packages
| Package | Base Price | Duration | Utilities Required | Highlights |
| :--- | :--- | :--- | :--- | :--- |
| **Basic Wash** | **200 EGP** | 30 mins | Water | Snow Foam, Pressure Rinse, Glass & Tire Gloss |
| **Premium Wash** | **350 EGP** | 60 mins | None (Waterless/Eco) | Cabin Vacuum, Dashboard Dressing, Spray Wax Sealant |
| **Deep Clean** | **500 EGP** | 90 mins | Water + Electricity | Steam Upholstery Extraction, AC Sanitizing |
| **Ultimate Detail** | **700 EGP** | 140 mins | Water + Electricity + Garage | Clay Bar Decontamination, Machine Polish, 6-Mo Ceramic |

### 2. Vehicle Size Multipliers
* **Sedan**: `1.0×` (Standard base price)
* **SUV / Crossover**: `1.25×` (+25%)
* **Truck / Van**: `1.50×` (+50%)

### 3. Optional Extra Add-Ons
* **Engine Bay Steam Cleaning**: `+150 EGP`
* **Ozone Odor & Bacteria Elimination**: `+120 EGP`
* **Leather Deep Feed & UV Shield**: `+100 EGP`
* **Rain-X Hydrophobic Glass Coat**: `+80 EGP`

### 4. Subscription & Plan Discounts
* **Fast Track / Scheduled (One-Time)**: `0%` discount
* **Weekly Subscription**: `10%` discount
* **Monthly Subscription**: `15%` discount
* **Mandatory Upfront Deposit**: `200 EGP` (applied against total bill upon completion)

---

## 🛠 Technology Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router 6](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Responsive Vanilla CSS & Modern Design System

### Backend
- **Framework**: [ASP.NET Core 8.0 Web API](https://learn.microsoft.com/aspnet/core)
- **ORM**: [Entity Framework Core 8.0](https://learn.microsoft.com/ef/core)
- **Database**: [Microsoft SQL Server](https://www.microsoft.com/sql-server)
- **Documentation**: [Swagger / Swashbuckle](https://swagger.io/)

---

## 📁 Project Structure

```bash
EGHSELHA/
├── EGHSELHA Solution/
│   └── EGHSELHA/                     # Domain Class Library
├── EGSELHA_Fontend/
│   ├── src/
│   │   ├── component/                # Reusable UI Components (PageTitle, Topbar, Sidebar)
│   │   ├── context/                  # CustomerContext & TechnicianContext
│   │   ├── layouts/                  # CustomerLayout & TechnicianLayout
│   │   ├── pages/
│   │   │   ├── customer/             # Home, BookWash, Bookings, Profile, Reviews, Vehicles
│   │   │   └── technician/           # Dashboard, JobDetails, Earnings, Jobs, Profile
│   │   ├── routes/                   # AppRoutes (Central Route Mapping)
│   │   └── services/                 # customerApi.js & technicianApi.js
│   ├── package.json
│   └── vite.config.js
├── WebCarWash/
│   ├── WebCarWash.API/               # Controllers, Middlewares, Program.cs
│   ├── WebCarWash.Application/       # DTOs, Business Interfaces
│   ├── WebCarWash.Domain/            # Entities, Domain Enums
│   ├── WebCarWash.Infrastructure/    # DbContext, Entity Configurations, Services
│   └── WebCarWash.sln                # Visual Studio .NET Solution
├── run-all.bat                       # One-click startup script for Backend & Frontend
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18.0 or newer)
- [Microsoft SQL Server](https://www.microsoft.com/sql-server) (LocalDB, Express, or Developer Edition)

### 1. Database Configuration
In `WebCarWash/WebCarWash.API/appsettings.json`, verify your SQL Server connection string:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=WebCarWashDb;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```
*Note: The database `WebCarWashDb` and seed data are automatically initialized on first run via `DbInitializer.cs`.*

### 2. One-Click Launch (Windows)
Double-click `run-all.bat` or run in terminal:
```powershell
.\run-all.bat
```
This automatically launches both the .NET API backend and the Vite frontend dev server.

### 3. Manual Launch

#### Backend API:
```bash
cd WebCarWash/WebCarWash.API
dotnet restore
dotnet build
dotnet run
```
*Backend runs on: `http://localhost:58300` (Swagger: `http://localhost:58300/swagger`)*

#### Frontend SPA:
```bash
cd EGSELHA_Fontend
npm install
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

---

## 📡 API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/Customers/profile` | Get customer profile, wallet, points, saved addresses |
| **PUT** | `/api/Customers/profile` | Update customer personal information |
| **GET** | `/api/Customers/vehicles` | List all registered garage vehicles |
| **POST** | `/api/Customers/vehicles` | Register a new vehicle |
| **DELETE** | `/api/Customers/vehicles/{id}` | Delete a vehicle and cascade clean its bookings |
| **GET** | `/api/Customers/bookings` | Retrieve customer booking history |
| **POST** | `/api/Customers/bookings` | Create a new wash booking |
| **GET** | `/api/Customers/bookings/{id}` | Get full details of a single booking |
| **POST** | `/api/Customers/bookings/{id}/deposit` | Pay mandatory 200 EGP upfront deposit |
| **POST** | `/api/Customers/upsells/{id}/decision` | Approve or decline inspection extra charge |
| **GET** | `/api/Customers/reviews` | Retrieve all customer submitted reviews |
| **POST** | `/api/Customers/bookings/{id}/reviews` | Submit star rating, tags, comment, and tip |
| **POST** | `/api/Customers/bookings/{id}/disputes` | Open customer quality dispute |
| **POST** | `/api/Customers/addresses` | Add a saved parking address |
| **DELETE** | `/api/Customers/addresses` | Remove a saved parking address |

---

## 👥 Authors & License

Developed with ❤️ as part of the **EGHSELHA Mobile Detailing Project**.

Licensed under the [MIT License](LICENSE).
