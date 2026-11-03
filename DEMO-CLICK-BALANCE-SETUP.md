# Demo Click Balance Setup

This project update adds an admin-only simulated balance for practice purposes.

## What happens
- A public visitor clicks an active advertisement.
- The browser sends a click event to `POST /api/ads/:id/click` and opens the ad's product website.
- The backend increments the ad click counter and records a demo amount of either $1 or $2 in `AdEvent.simulatedRevenue`.
- The admin Overview reads the total from `GET /api/ads/admin/demo-balance`.
- The balance is simulated only. It is not money held by Stripe, not an advertiser payment, and cannot be withdrawn.

## Files updated
- `server/routes/adRoutes.js`
- `client/src/services/api.js`
- `client/src/pages/Overview.jsx`
- `client/src/App.css`

## Apply
Merge the `client` and `server` folders into your existing project. Keep your `.env` file and existing credentials unchanged. Restart both frontend and backend.

## Important
This endpoint is a practice/demo counter, not a production advertising billing system. Do not use it to bill advertisers or represent the simulated balance as actual earnings. Production systems require verified ad network billing, click-quality validation, rate limiting, fraud prevention, and a compliant payment flow.
