# System Design Write-up — Last-Mile Delivery Tracker

## 1. Rate Calculation Engine

The rate calculation engine is designed to be fully admin-configurable with zero hardcoded pricing logic. It lives in `rateCalculationService.js` and is invoked both for charge previews and actual order creation, guaranteeing the quoted price always matches the billed price.

The flow works as follows: given package dimensions, the engine first computes the **volumetric weight** using the standard courier-industry formula `(Length × Breadth × Height) / 5000`. It then compares this against the **actual weight** and bills on whichever is higher — this reflects real-world logistics practice, since bulky-but-light packages consume as much truck space as heavier ones.

Next, the engine determines whether the shipment is **intra-zone** or **inter-zone** by comparing the detected pickup and drop zone IDs. It then queries the `RateCard` collection filtered by `orderType` (B2B or B2C) — each order type maintains an entirely separate rate card, since B2B and B2C shipments have different cost structures and volume assumptions. Depending on the intra/inter-zone determination, either `intraZoneRatePerKg` or `interZoneRatePerKg` is selected.

The final charge is computed as: `baseCharge + (billedWeight × ratePerKg) + (codSurcharge if COD)`. Because every numeric input (`baseCharge`, both per-kg rates, `codSurcharge`) is stored in the database and managed through admin-only CRUD endpoints, business teams can adjust pricing without any code deployment. This separation of pricing *data* from calculation *logic* is the core design principle here.

## 2. Zone Detection Approach

Rather than requiring precise geo-coordinates (which would need a paid geocoding API and add external dependency/cost), zone detection uses a **lightweight substring-matching approach**. Each `Zone` document stores a `name` and an array of `areas` (locality names, e.g., ["Kanpur", "Kanpur Nagar"]). When an order is created, the pickup and drop address strings are checked against every zone's `areas` array using a case-insensitive substring match — the first zone whose area name appears within the address string is selected.

This design was chosen for three reasons: (1) it requires no third-party API keys, keeping the system fully self-contained and free to run; (2) it gives the admin complete control over what constitutes a "zone" — arbitrary business-defined regions rather than being locked into postal codes; and (3) it is fast and deterministic, avoiding external network calls during the checkout flow. The trade-off is that address quality matters — if a user's address string never mentions a configured area name, zone detection fails gracefully with a clear error message asking the admin to configure the missing zone, rather than silently guessing.

## 3. Auto-Assignment Logic

Agent assignment is decoupled from order creation, callable either automatically or manually by the admin, via a single `assignmentService.js`. The `autoAssignAgent` function queries the `Agent` collection filtered by `zone` (matching the order's pickup zone) and `isAvailable: true`. The first matching agent is selected and immediately flagged unavailable, preventing double-booking under concurrent requests.

This zone-based filtering models a realistic constraint: delivery agents are typically stationed in and responsible for a specific service area, so it makes no sense to assign a Lucknow-based agent to a Kanpur pickup. The `Agent` schema also stores an optional `currentLocation` (lat/lng) field, which is a deliberate extensibility hook — the current implementation picks the first available agent in-zone, but the schema supports upgrading to true nearest-neighbor distance calculation (e.g., using the Haversine formula) without any migration, simply by sorting the zone-filtered agent list by distance before selection.

## 4. Failed Delivery Handling

When a delivery attempt fails, the agent or admin calls the status-update endpoint with `status: "Failed"` and a `failureReason`. This immediately triggers an email notification to the customer (via `notificationService.js`, wrapped in try/catch so a notification failure never breaks the order flow) and is permanently recorded in `OrderStatusHistory`.

The customer can then call the `/reschedule` endpoint with a new `rescheduledDate`. This endpoint enforces a guard clause — only orders currently in `Failed` status can be rescheduled — preventing accidental reschedule of active or already-delivered orders. On reschedule, the system calls `reassignAgent`, which frees the previously assigned agent (`isAvailable: true`) and runs the same zone-based auto-assignment logic to find a new agent for the next attempt. The order status transitions to `Rescheduled`, and this transition, like every other status change, is written to the immutable `OrderStatusHistory` collection with the acting user's ID, role, and a timestamp — ensuring a complete, tamper-proof audit trail of exactly what happened, when, and by whom, throughout the entire lifecycle of a delivery, including failure and recovery paths.

## Summary

Across all four areas, the guiding design principle is **separation of configuration from logic**: zones, rate cards, and agent availability are all data the admin controls, while the calculation, detection, and assignment algorithms remain fixed, tested, and predictable. This keeps the system flexible for real-world operational changes (new zones, new pricing, more agents) without requiring code changes or redeployment.