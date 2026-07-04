# Last-Mile Delivery Tracker

A full-stack delivery management platform where customers and admins can create orders with auto-calculated charges, agents are assigned intelligently, and customers are notified at every step of the delivery journey.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT Authentication
- **Frontend:** React (Vite), Axios, React Router
- **Notifications:** Nodemailer

## Project Structure

last-mile-delivery-tracker/
├── backend/          # Express API, MongoDB models, business logic
└── frontend/         # React application

## Setup Guide

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (free tier)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (copy from `.env.example`) and fill in:

PORT=5000
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<any random secret string>
JWT_EXPIRE=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your gmail>
SMTP_PASS=<your gmail app password>
SMTP_FROM=Delivery Tracker your_email@gmail.com
FRONTEND_URL=http://localhost:5173

Run the server:
```bash
npm run dev
```
Server runs on `http://localhost:5000` (or PORT specified).

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:5173`.

## Environment Variables (.env.example)

See `backend/.env.example` for the full list of required variables.

## API Documentation

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|--------------|
| POST | `/api/auth/register` | Public | Register a new user (customer/agent/admin) |
| POST | `/api/auth/login` | Public | Login and receive JWT token |

### Zones (Admin)
| Method | Endpoint | Access | Description |
|--------|----------|--------|--------------|
| GET | `/api/zones` | Authenticated | List all zones |
| POST | `/api/zones` | Admin | Create a zone with areas |
| PUT | `/api/zones/:id` | Admin | Update a zone |
| DELETE | `/api/zones/:id` | Admin | Delete a zone |

### Rate Cards (Admin)
| Method | Endpoint | Access | Description |
|--------|----------|--------|--------------|
| GET | `/api/rate-cards` | Authenticated | List rate cards |
| POST | `/api/rate-cards` | Admin | Create rate card (B2B/B2C rates + COD surcharge) |
| PUT | `/api/rate-cards/:id` | Admin | Update a rate card |

### Agents (Admin)
| Method | Endpoint | Access | Description |
|--------|----------|--------|--------------|
| GET | `/api/agents` | Admin | List all agents |
| POST | `/api/agents` | Admin | Create agent profile (linked to a User + Zone) |
| PUT | `/api/agents/:id/availability` | Agent/Admin | Toggle agent availability |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|--------------|
| POST | `/api/orders/preview-charge` | Authenticated | Preview charge before confirming |
| POST | `/api/orders` | Authenticated | Create an order |
| GET | `/api/orders` | Authenticated | List orders (customer sees own; admin sees all, filterable by `?status`, `?zone`, `?agent`) |
| GET | `/api/orders/:id/timeline` | Authenticated | Full immutable status history |
| PUT | `/api/orders/:id/assign` | Admin | Assign agent manually or auto-assign |
| PUT | `/api/orders/:id/status` | Agent/Admin | Update order status |
| PUT | `/api/orders/:id/reschedule` | Authenticated | Reschedule a failed delivery |
| PUT | `/api/orders/:id/override` | Admin | Admin override of order status |

## Database Schema

- **User:** name, email, password (hashed), phone, role (customer/agent/admin)
- **Zone:** name, areas[] (list of localities mapped to this zone)
- **RateCard:** orderType (B2B/B2C), intraZoneRatePerKg, interZoneRatePerKg, baseCharge, codSurcharge
- **Agent:** user (ref User), zone (ref Zone), isAvailable, currentLocation
- **Order:** customer, pickup/drop address & zone, dimensions, actualWeight, volumetricWeight, billedWeight, orderType, paymentType, charge, status, assignedAgent, rescheduledDate, failureReason
- **OrderStatusHistory:** order (ref), status, changedBy (ref User), actorRole, timestamp, note — **immutable**, no updates allowed once created

## Rate Calculation Logic

1. **Zone Detection:** Pickup and drop addresses are matched against configured zone `areas[]` (case-insensitive substring match) to determine pickup zone and drop zone.
2. **Volumetric Weight:** `(Length × Breadth × Height) / 5000`
3. **Billed Weight:** `max(actualWeight, volumetricWeight)`
4. **Rate Lookup:** The correct RateCard is fetched based on `orderType` (B2B or B2C). If pickup zone === drop zone, `intraZoneRatePerKg` is used; otherwise `interZoneRatePerKg`.
5. **Charge Formula:** `baseCharge + (billedWeight × ratePerKg) + (codSurcharge if paymentType === "COD")`

All rates are admin-configurable via the RateCard collection — nothing is hardcoded.

## Auto-Assignment Logic

When an order is created or needs (re)assignment, the system queries all `Agent` documents where `zone === pickupZone` and `isAvailable === true`. The first available agent is assigned and marked unavailable. On failed delivery + reschedule, the previous agent is freed (`isAvailable: true`) and a new agent is auto-assigned from the same zone.

## Failed Delivery & Reschedule Flow

1. Agent/Admin marks an order as `Failed` with a `failureReason`.
2. Customer receives an email notification.
3. Customer calls `/reschedule` with a `rescheduledDate`.
4. Order status becomes `Rescheduled`, and a new agent is auto-assigned for the new attempt.
5. Every transition is logged immutably in `OrderStatusHistory`.

## Deployed Application

- Backend: `<Render URL - add after deployment>`
- Frontend: `<Vercel URL - add after deployment>`

## Author

Archana Agrahari