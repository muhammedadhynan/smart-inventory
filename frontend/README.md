# Smart Inventory frontend

This is a React + Vite web interface for the existing Express API. It includes login and registration, a dashboard, products, categories, customers, and orders.

## Files

- `src/` — application screens, API helper, and styles.
- `vite.config.js` — sends `/api` requests to `http://localhost:5000` during development.
- `backend-routes/` — two route files needed because the current backend has product and category controllers but does not register those endpoints.

## Put the frontend in your project

The files in this deliverable are under:

`C:\Users\adhynan\Documents\Codex\2026-11-14\referenced-chatgpt-conversation-this-is-an\outputs\smart-inventory-frontend`

Copy the **contents** of that folder into:

`C:\Users\adhynan\Desktop\smart inventory\frontend`

Create the `frontend` folder if it does not already exist. Keep `backend` as a separate folder beside it.

## Connect the missing backend routes

The current `backend/server.js` registers authentication, stock, customer, order, and dashboard routes. Product and category controllers already exist, but their route files and registrations are missing. Copy:

- `backend-routes\productRoutes.js` to `C:\Users\adhynan\Desktop\smart inventory\backend\routes\productRoutes.js`
- `backend-routes\categoryRoutes.js` to `C:\Users\adhynan\Desktop\smart inventory\backend\routes\categoryRoutes.js`

Then add these imports in `backend/server.js` with the other route imports:

```js
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
```

Add these registrations with the other `app.use` API routes:

```js
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
```

This is the only backend change needed for the frontend sections. It does not replace or rewrite your working server.

## Start the app in PowerShell

Keep your backend terminal running. Open a second PowerShell window and run:

```powershell
cd "C:\Users\adhynan\Desktop\smart inventory\frontend"
npm install
npm run dev
```

Open the local address Vite prints, usually `http://localhost:5173`.

## Check the connection

1. Confirm the backend terminal says it is running on port 5000.
2. Open `http://localhost:5000/api/health`. It should show `success: true`.
3. Open `http://localhost:5173`, register or sign in, and check the dashboard.
4. If PowerShell reports `npm` is not recognized, install Node.js LTS, reopen PowerShell, and retry.

## Account access

The current backend creates self-registered accounts with the `user` role. The backend restricts product, category, customer, order, and stock management to `admin` and `manager` roles. Sign-in is available to existing accounts; an administrator must assign the appropriate role before management actions will work. The frontend does not let a user grant themselves elevated access.

The current order form creates an order with one product item at a time, matching the backend's `customerId`, `items: [{ productId, quantity }]`, and `notes` request shape.
