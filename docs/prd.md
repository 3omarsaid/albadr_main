# Product Requirements Document (PRD) - Bio-AgriTech Platform

## [1] Project Overview

- **Project Name:** Bio-AgriTech E-commerce Platform
- **Project Type:** Progressive Web Application (PWA) - Mobile-First
- **Target Audience:** Farmers/Customers (B2C) and the Store Owner (Admin)
- **Core Language & UI:** **Strictly Arabic UI with RTL (Right-to-Left) Layout.** (Note to developers: Codebase and documentation are in English, but the user-facing interface MUST be Arabic RTL).
- **Primary Objectives:** Streamline the purchase of organic fertilizers, provide a seamless mobile-native experience for farmers, enable real-time order tracking, and deliver a comprehensive management dashboard for the owner.

---

## [2] Branding & Design System

- **Theme:** Modern Bio-AgriTech (A clean blend of agriculture and modern technology).
- **Primary Colors:** Organic Green (`#10B981`), Dark Earth Green (`#064E3B`).
- **Accent & Backgrounds:** Light Green (`#34D399`) for interactions, Off-White/Light Gray (`#F9FAFB`) for backgrounds.
- **Typography:** 'Cairo' or 'Tajawal' (Google Fonts). Headings H1: 32px (24px mobile), Body: 16px.
- **UI Library:** **shadcn/ui** (Configured for RTL using Tailwind CSS).

---

## [3] Tech Stack Architecture

| Component              | Technology                           | Rationale                                                                                             |
| :--------------------- | :----------------------------------- | :---------------------------------------------------------------------------------------------------- |
| **Frontend Framework** | Next.js 16 (App Router)              | Utilizing **Server Actions** for all data mutations and form submissions.                             |
| **UI Components**      | shadcn/ui + Tailwind CSS             | Accessible, customizable, and fast UI component integration.                                          |
| **Icons**              | Lucide React                         | Modern, responsive SVG icons (natively supported by shadcn).                                          |
| **State Management**   | Zustand                              | Lightweight, perfect for cart and local sessions.                                                     |
| **Database & Auth**    | Supabase (PostgreSQL)                | Strong relational data (Orders/Products), Real-time capabilities, Free tier.                          |
| **ORM**                | Prisma                               | Type-safe database queries and migrations.                                                            |
| **Maps**               | React-Leaflet + OpenStreetMap        | Free, accurate, no credit card required.                                                              |
| **Geocoding**          | Nominatim API                        | Free text-to-location search.                                                                         |
| **Notifications**      | Native Web Push API (`web-push` npm) | Fully native browser push notifications via Service Workers and VAPID keys (No Firebase/Third-party). |
| **Hosting**            | Vercel                               | Seamless Next.js deployment, optimal for Server Actions.                                              |
| **Storage**            | Supabase Storage                     | Secure hosting for product images.                                                                    |

---

## [4] Customer App Features (Mobile-First)

### 4.1 Home Page

- **Hero Banner:** Eye-catching promotional image (1200x400px) with a primary CTA.
- **Horizontal Categories:** Smooth scrollable category icons. Clicking filters the product grid.
- **Product Grid:** 2-column layout on mobile (4 on desktop). Cards (shadcn `Card`) include image, title, price, and a quick "Add to Cart" button.
- **Bottom Navigation Bar:** Sticky. Contains Home, Cart (with item count badge), My Orders, Profile.
- **Floating Action Button (FAB):** Sticky WhatsApp icon at the bottom-left (RTL) for instant support.

### 4.2 Product Details Page

- **Image Carousel:** Swipeable images (shadcn `Carousel`) with tap-to-zoom.
- **Product Info:** Title, Category Badge, rich text description.
- **Variant Selector:** shadcn `Select` or `ToggleGroup` for choosing sizes (e.g., "5 KG"). Dynamically updates the price.
- **Quantity Selector:** `+` / `-` buttons. Minimum value is 1.
- **Sticky Footer Bar:** Shows total calculated price alongside a large "Add to Cart" button. Triggers a shadcn `Toast` on success.

### 4.3 Cart Page

- **Line Items:** Image, name, variant size, unit price, quantity controls, and remove (trash) icon.
- **Order Summary:** Subtotal calculation. (Note: No delivery fees applied).
- **Checkout CTA:** Sticky bottom button "Proceed to Checkout". Displays empty state illustration if cart is empty.

### 4.4 Checkout & Map Integration (Powered by Server Actions)

- **User Details:** Mandatory inputs for Name and Phone Number (Validated via `zod` and shadcn `Form`).
- **Interactive Map (Leaflet):**
  - Draggable marker to pinpoint exact farm location.
  - "Use Current Location" button utilizing Geolocation API.
  - Search bar utilizing Nominatim API.
- **Checkout Action (Server Action):** Submitting the form triggers a Next.js Server Action to validate data, generate order ID, save to DB, and trigger a native Web Push Notification to the Admin.

### 4.5 My Orders Page

- **Order List:** Displays cards with Order ID, Date, Total Price, and Status Badge (Pending, Confirmed, Delivered, Cancelled).
- **Filters:** shadcn `Tabs` to filter orders by status.

### 4.6 Order Details & Tracking

- **Visual Stepper:** Vertical timeline connecting order states.
- **Delivery Info:** Static map showing the dropped pin with Lat/Lng.
- **Order Items Table:** shadcn `Table` listing purchased items.
- **Direct Communication:** Button to open WhatsApp pre-filled with the Order ID.

### 4.7 Profile Page

- **User Data:** Editable Name, read-only Phone Number.
- **Settings:** Toggle switch (shadcn `Switch`) to Enable/Disable Native Push Notifications. Prompts browser permission.

---

## [5] Admin Dashboard Features (Responsive Web)

### 5.1 Authentication

- **Login:** Email and Password authentication via Supabase Auth.

### 5.2 Overview Dashboard

- **KPI Cards:** shadcn `Card` components for Total Sales, Pending Orders, Total Customers.
- **Charts:** Utilizing shadcn built-in charts (Recharts) for Revenue Trends and Sales Distribution.

### 5.3 Order Management (Server Actions)

- **Data Table:** shadcn `DataTable` (TanStack Table) with sorting, filtering, and pagination.
- **Order Detail View:** Displays map location and customer details.
- **Status Updates:** shadcn `Select` to change order status. Submitting the change fires a Server Action which updates the DB and pushes a Native Web Notification to the customer's browser.

### 5.4 Product Management

- **Create/Edit Product:** shadcn `Form` with `zod` validation. Multi-image upload to Supabase Storage. Dynamic variants table for adding multiple sizes and prices.

---

## [6] Native Web Push Notifications System

- **Architecture:** Completely independent system utilizing the browser's Push API, a custom Service Worker (`sw.js`), and the backend `web-push` Node.js library.
- **VAPID Keys:** Public and Private keys generated to securely sign push messages from the Next.js Server Actions.
- **Subscription Flow:** Client accepts browser prompt -> Service worker generates subscription object (endpoint, p256dh, auth) -> Sent to database via Server Action.
- **Triggers:**
  - **To Admin:** New order placed (Executed inside the Checkout Server Action).
  - **To Customer:** Order status updated by Admin (Executed inside the Update Status Server Action).

---

## [7] Database Schema (Prisma)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Customer {
  id           String             @id @default(uuid())
  phoneNumber  String             @unique
  name         String
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt

  addresses    CustomerAddress[]
  orders       Order[]
  pushTokens   PushSubscription[]
}

model CustomerAddress {
  id           String    @id @default(uuid())
  customerId   String
  customer     Customer  @relation(fields: [customerId], references: [id], onDelete: Cascade)

  addressName  String
  latitude     Float
  longitude    Float
  addressText  String?
  isDefault    Boolean   @default(false)

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  orders       Order[]
}

model Product {
  id          String            @id @default(uuid())
  name        String
  description String            @db.Text
  category    String
  images      String[]
  isActive    Boolean           @default(true)

  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  variants    ProductVariant[]
}

model ProductVariant {
  id                String      @id @default(uuid())
  productId         String
  product           Product     @relation(fields: [productId], references: [id], onDelete: Cascade)

  size              String
  basePrice         Decimal     @db.Decimal(10, 2)
  discountPrice     Decimal?    @db.Decimal(10, 2)
  discountPercent   Float?

  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  orderItems        OrderItem[]
}

enum OrderStatus {
  PENDING
  CONFIRMED
  DELIVERED
  CANCELLED
}

model Order {
  id                String          @id @default(uuid())
  orderNumber       String          @unique

  customerId        String
  customer          Customer        @relation(fields: [customerId], references: [id])

  addressId         String
  address           CustomerAddress @relation(fields: [addressId], references: [id])

  totalPrice        Decimal         @db.Decimal(10, 2)
  status            OrderStatus     @default(PENDING)
  paymentMethod     String          @default("cash_on_delivery")

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  items             OrderItem[]
}

model OrderItem {
  id                String          @id @default(uuid())
  orderId           String
  order             Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)

  variantId         String
  variant           ProductVariant  @relation(fields: [variantId], references: [id])

  quantity          Int
  priceAtPurchase   Decimal         @db.Decimal(10, 2)

  createdAt         DateTime        @default(now())
}

model AdminUser {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  role         String   @default("admin")

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  pushTokens   PushSubscription[]
}

// Updated to store Native Web Push Subscription Object keys
model PushSubscription {
  id          String    @id @default(uuid())

  customerId  String?
  customer    Customer? @relation(fields: [customerId], references: [id], onDelete: Cascade)

  adminId     String?
  admin       AdminUser? @relation(fields: [adminId], references: [id], onDelete: Cascade)

  endpoint    String    @unique
  p256dh      String
  auth        String

  isActive    Boolean   @default(true)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
[8] Non-Functional Requirements
Performance: First Contentful Paint (FCP) < 1.5s, utilizing Next.js Server Components for zero bundle size where possible.

Security: Native Next.js 16 Server Actions inherently protect against CSRF.

PWA: Valid manifest.json, offline fallback page, and standalone display mode.
```
