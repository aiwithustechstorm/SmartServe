<p align="center">
  <img src="frontend/public/logo.png" alt="SmartServe Logo" width="180" />
</p>

<h1 align="center">SmartServe — Campus Dining Solutions</h1>

<p align="center">
  <b>AI Maestros • TechStorm 2026</b><br/>
  A full-stack smart canteen management system for college campuses
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Flask-3.x-000?logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Auth-orange?logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [Team](#-team)

---

## 🎯 Overview

**SmartServe** is a modern campus canteen ordering platform that allows students to browse menus, place orders, and track order status in real time — while canteen admins manage food items and process orders through a dedicated dashboard.

Built as a full-stack application with a **Flask REST API** backend powered by **Supabase (PostgreSQL)** and a **React 19** frontend with smooth animations, light-themed UI, and responsive design.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│          React 19 + Vite + Framer Motion                │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐  │
│  │ Student  │  │  Admin   │  │  Shared Components    │  │
│  │  Panel   │  │  Panel   │  │  (Cart, Toast, Food)  │  │
│  └────┬─────┘  └────┬─────┘  └───────────┬───────────┘  │
│       │              │                    │              │
│       └──────────────┴────────────────────┘              │
│                      │                                   │
│              Axios + JWT Interceptor                     │
└──────────────────────┬──────────────────────────────────┘
                       │  REST API (JSON)
                       ▼
┌──────────────────────────────────────────────────────────┐
│                      BACKEND                             │
│              Flask 3.x + Flask-JWT-Extended               │
│                                                          │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐              │
│  │  Auth   │  │  Food    │  │   Order    │   Routes     │
│  │ Routes  │  │  Routes  │  │   Routes   │   (Blueprint)│
│  └────┬────┘  └────┬─────┘  └─────┬──────┘              │
│       │             │              │                     │
│  ┌────┴─────────────┴──────────────┴──────┐              │
│  │          Services Layer                │              │
│  │  auth_service · food_service ·         │              │
│  │  order_service                         │              │
│  └────────────────┬───────────────────────┘              │
│                   │                                      │
│  ┌────────────────┴───────────────────────┐              │
│  │     Marshmallow Schemas (Validation)   │              │
│  └────────────────┬───────────────────────┘              │
│                   │                                      │
│  ┌────────────────┴───────────────────────┐              │
│  │     Decorators (admin_required, etc.)  │              │
│  └────────────────────────────────────────┘              │
└──────────────────────┬───────────────────────────────────┘
                       │  Supabase Python Client
                       ▼
┌──────────────────────────────────────────────────────────┐
│                    DATABASE                               │
│            Supabase (PostgreSQL)                          │
│                                                          │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌─────────────┐    │
│  │ users  │  │ foods  │  │ orders │  │ order_items  │    │
│  └────────┘  └────────┘  └────┬───┘  └──────┬───────┘    │
│                               │              │           │
│          Row Level Security + UUID Primary Keys          │
│          Indexes on user_id, status, order_id, category  │
└──────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2 | UI framework with hooks & context |
| **Vite** | 8.x | Lightning-fast build tool & dev server |
| **React Router** | 7.x | Client-side routing with protected routes |
| **Axios** | 1.13 | HTTP client with JWT interceptors |
| **Framer Motion** | 12.x | Smooth page transitions & animations |
| **React Icons** | 5.x | Icon library (Heroicons set) |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Flask** | 3.x | Lightweight Python web framework |
| **Flask-JWT-Extended** | 4.6+ | JWT-based authentication & role claims |
| **Flask-CORS** | 4.x | Cross-origin resource sharing |
| **Supabase Python** | 2.x | Supabase client for PostgreSQL access |
| **Marshmallow** | 3.20+ | Request validation & schema enforcement |
| **python-dotenv** | 1.x | Environment variable management |

### Database & Infrastructure

| Technology | Purpose |
|---|---|
| **Supabase** | Hosted PostgreSQL with Row Level Security |
| **PostgreSQL** | Relational database (UUID primary keys) |
| **JWT (HS256)** | Stateless authentication tokens |
| **OTP-based Auth** | Passwordless login flow |

---

## 📁 Project Structure

```
aiwithus_Techstorm/
│
├── backend/
│   ├── app.py                   # Flask app factory & error handlers
│   ├── config.py                # Environment-based configuration
│   ├── extensions.py            # JWT, CORS, Supabase client init
│   ├── requirements.txt         # Python dependencies
│   ├── supabase_schema.sql      # Database schema (run in Supabase SQL Editor)
│   ├── .env.example             # Environment variable template
│   │
│   ├── models/
│   │   └── schemas.py           # Marshmallow validation schemas
│   │
│   ├── routes/
│   │   ├── auth_routes.py       # /api/auth/* — register, login, verify-otp
│   │   ├── food_routes.py       # /api/foods/* — CRUD for food items
│   │   └── order_routes.py      # /api/orders/* — place, list, update status
│   │
│   ├── services/
│   │   ├── auth_service.py      # User registration, OTP generation, JWT
│   │   ├── food_service.py      # Food catalogue operations
│   │   └── order_service.py     # Order placement, status transitions
│   │
│   └── utils/
│       ├── decorators.py        # @admin_required, @role_required
│       └── responses.py         # Standardised JSON response helpers
│
├── frontend/
│   ├── index.html               # Entry HTML with favicon
│   ├── package.json             # Node dependencies & scripts
│   ├── vite.config.js           # Vite configuration
│   │
│   ├── public/
│   │   └── logo.png             # SmartServe logo
│   │
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Root component with router
│       ├── index.css            # Global CSS variables & light theme
│       │
│       ├── context/
│       │   ├── AuthContext.jsx   # Auth state, OTP flow, JWT parsing
│       │   └── CartContext.jsx   # Shopping cart state management
│       │
│       ├── hooks/
│       │   └── useFetch.js      # Generic data-fetching hook
│       │
│       ├── services/
│       │   └── api.js           # Axios instance, API wrappers, token mgmt
│       │
│       ├── routes/
│       │   ├── index.jsx        # Route definitions
│       │   └── ProtectedRoute.jsx # Auth & role guard
│       │
│       ├── layouts/
│       │   ├── UserLayout.jsx   # Student layout with navbar & cart
│       │   └── AdminLayout.jsx  # Admin layout with sidebar nav
│       │
│       ├── components/
│       │   ├── FoodCard.jsx     # Menu item card with add-to-cart
│       │   ├── CartDrawer.jsx   # Slide-out cart drawer
│       │   └── Toast.jsx        # Notification toast component
│       │
│       └── pages/
│           ├── Landing.jsx      # Public landing page
│           ├── Login.jsx        # Student OTP login
│           ├── AdminLogin.jsx   # Admin OTP login with role check
│           ├── Register.jsx     # New user registration
│           ├── Menu.jsx         # Food menu with search & filter
│           ├── Checkout.jsx     # Cart review & place order
│           ├── Orders.jsx       # Student order tracking
│           ├── AdminDashboard.jsx # Admin analytics overview
│           ├── AdminFoods.jsx   # Admin food CRUD management
│           └── AdminOrders.jsx  # Admin order status management
│
└── README.md
```

---

## 🗄 Database Schema

```
┌──────────────┐       ┌──────────────┐
│    users     │       │    foods     │
├──────────────┤       ├──────────────┤
│ id (PK,UUID) │       │ id (PK,UUID) │
│ name         │       │ name         │
│ email (UQ)   │       │ price        │
│ phone        │       │ category     │
│ role         │       │ is_available │
│ created_at   │       │ image_url    │
└──────┬───────┘       │ created_at   │
       │               └──────┬───────┘
       │ 1:N                  │ 1:N
       ▼                      ▼
┌──────────────┐       ┌───────────────┐
│   orders     │       │  order_items  │
├──────────────┤       ├───────────────┤
│ id (PK,UUID) │◄──────│ id (PK,UUID)  │
│ user_id (FK) │  1:N  │ order_id (FK) │
│ status       │       │ food_id  (FK) │
│ total_price  │       │ quantity      │
│ created_at   │       │ price         │
└──────────────┘       └───────────────┘

Status flow:  pending → preparing → ready → completed
```

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | — | Register new user (name, email, phone) |
| `POST` | `/login` | — | Send OTP to email |
| `POST` | `/verify-otp` | — | Verify OTP → receive JWT |

### Foods (`/api/foods`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | — | List available food items |
| `GET` | `/?all=true` | — | List all items (admin use) |
| `POST` | `/` | Admin | Create new food item |
| `PUT` | `/:id` | Admin | Update food item |
| `DELETE` | `/:id` | Admin | Delete food item |

### Orders (`/api/orders`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/` | User | Place a new order |
| `GET` | `/user` | User | Get authenticated user's orders |
| `GET` | `/admin` | Admin | Get all orders with user details |
| `PATCH` | `/:id` | Admin | Update order status |

### Common Response Format

```json
{
  "success": true,
  "message": "Success",
  "data": { ... }
}
```

---

## ✨ Features

### 🎓 Student Panel
- **Browse Menu** — search by name, filter by category
- **Smart Cart** — add/remove items, quantity controls, slide-out drawer
- **Place Orders** — server-side price calculation to prevent tampering
- **Track Orders** — real-time status with visual progress bar
- **OTP Login** — passwordless, secure authentication

### 🔐 Admin Panel
- **Dashboard** — overview of orders and menu stats
- **Food Management** — add, edit, delete, toggle availability
- **Order Management** — view all orders, advance status with one click
- **Role-Based Access** — separate admin login with role verification
- **User Details** — see who placed each order (name, email, phone)

### 🎨 UI/UX
- **Light Theme** — clean navy accent (#1B3A5C) on white
- **Responsive Design** — works on desktop and mobile
- **Smooth Animations** — Framer Motion page transitions
- **Status Colors** — pending (amber), preparing (orange), ready (green), completed (green)
- **SmartServe Branding** — logo throughout the application

### 🔒 Security
- **JWT Authentication** — stateless, expiring tokens with role claims
- **Password-less** — OTP-based auth (no passwords stored)
- **Server-side Validation** — Marshmallow schema enforcement
- **Server-side Price Calculation** — prevents client-side price tampering
- **Status Transition Validation** — enforced order lifecycle
- **Row Level Security** — enabled at database level

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.11+
- **Node.js** 18+
- **Supabase** account ([supabase.com](https://supabase.com))

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/aiwithus_Techstorm.git
cd aiwithus_Techstorm
```

### 2. Set Up the Database

1. Create a new project on [Supabase](https://supabase.com)
2. Open the **SQL Editor**
3. Paste and run the contents of `backend/supabase_schema.sql`

### 3. Set Up the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate     # macOS/Linux
# venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase URL, key, and secrets

# Start the server
python app.py
```

The API server runs at **http://localhost:5000**

### 4. Set Up the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend runs at **http://localhost:5173**

### 5. Create an Admin Account

```bash
# Register a user first through the app, then promote via API:
cd backend && source venv/bin/activate
python -c "
from dotenv import load_dotenv; load_dotenv()
import os
from supabase import create_client
sb = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))
sb.table('users').update({'role': 'admin'}).eq('email', 'your-email@example.com').execute()
print('Done — user promoted to admin')
"
```

---

## ⚙️ Environment Variables

Create a `backend/.env` file with:

```env
# Flask
SECRET_KEY=your-flask-secret-key
FLASK_DEBUG=True

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key

# JWT
JWT_SECRET_KEY=your-jwt-secret-key
JWT_EXPIRY_HOURS=24

# CORS
CORS_ORIGINS=*
```

> ⚠️ **Never commit your `.env` file.** The `.env.example` template is provided as reference.

---

## 🖼 Screenshots

> *Add screenshots of your Landing page, Menu, Checkout, Admin Dashboard, and Admin Orders here.*

| Landing | FrontPage | Menu | Cart | Checkout | Order History | Admin Dashboard | Admin Controls | Admin Order Manage |
|----------|------------|--------|--------|------------|----------------|------------------|------------------|--------------------|
| <img src="https://github.com/aiwithustechstorm/SmartServe/blob/main/Landing%20Page.png?raw=true" width="200"/> | 
<img src="https://github.com/aiwithustechstorm/SmartServe/blob/main/Front%20Page.png?raw=true" width="200"/> | 
<img src="https://github.com/aiwithustechstorm/SmartServe/blob/main/menu.png?raw=true" width="200"/> | 
<img src="https://github.com/aiwithustechstorm/SmartServe/blob/main/Cart.png?raw=true" width="200"/> | 
<img src="https://github.com/aiwithustechstorm/SmartServe/blob/main/Checkout.png?raw=true" width="200"/> | 
<img src="https://github.com/aiwithustechstorm/SmartServe/blob/main/Order.png?raw=true" width="200"/> | 
<img src="https://github.com/aiwithustechstorm/SmartServe/blob/main/Admin%20Dash.png?raw=true" width="200"/> | 
<img src="https://github.com/aiwithustechstorm/SmartServe/blob/main/Admin%20control.png?raw=true" width="200"/> | 
<img src="https://github.com/aiwithustechstorm/SmartServe/blob/main/Admin%20Manage%20Order.png?raw=true" width="200"/> |
---

## 👥 Team

<table>
  <tr>
    <td align="center">
      <b>AI_With_Us</b><br/>
      TechStorm 2026<br/>
      <a href="mailto:aiwithustechstorm2026@gmail.com">aiwithustechstorm2026@gmail.com</a>
    </td>
  </tr>
</table>

---

<p align="center">
  Built with ❤️ by <b>AI_With_Uss</b>for JGTechStorm 2026
</p>
