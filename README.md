# NexaStock Inventory Management System

NexaStock is a web and Android inventory app for managing products, categories, customers, orders, and stock. The React frontend and Express API are hosted together on Render, with MongoDB as the database.

## Submission links

- **Live web app:** https://nexastock-inventory-g4xy.onrender.com/
- **Backend API base URL:** https://nexastock-inventory-g4xy.onrender.com/api
- **API health check:** https://nexastock-inventory-g4xy.onrender.com/api/health
- **Source repository:** https://github.com/muhammedadhynan/smart-inventory/tree/nexastock-deploy
- **Release APK:** Build it from `frontend/android/app/build/outputs/apk/release/app-release.apk` and attach the APK file separately to the submission. The APK and signing key are not committed to this repository.

> The GitHub repository is private. Add the company reviewer as a repository collaborator before submitting the repository link, or provide access using the method requested by the company. Keep the repository private unless you intentionally choose to make the source public.

## Main features

- Sign up and sign in with role-based access.
- Dashboard summary, recent orders, and low-stock alerts.
- Create, edit, search, and deactivate products and categories.
- Manage customers and orders.
- Track incoming and outgoing stock with transaction records.
- Generate invoices with barcode information.
- Responsive React web app and Capacitor Android app.

## Technology

- Frontend: React, Vite, Capacitor
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Authentication: JSON Web Tokens (JWT) and bcrypt password hashing
- Hosting: Render

## Project layout

```text
backend/
  config/       MongoDB connection
  controllers/  API request handling
  middleware/   Authentication and role checks
  models/       Mongoose data models
  routes/       Express API routes
  server.js     API server and built frontend hosting
frontend/
  src/          React application
  public/       App icons and PWA assets
  android/      Capacitor Android project
render.yaml     Render Blueprint configuration
docs/
  API.md        API endpoint documentation
  DATABASE.md   Database structure and ER-style diagram
```

## Local setup on Windows

Install Node.js (LTS), Git, and MongoDB access (MongoDB Atlas is recommended). In PowerShell, open the project folder and install dependencies:

```powershell
cd "C:\Users\<your-Windows-name>\Desktop\smart inventory"
npm --prefix backend ci
npm --prefix frontend ci
```

Create `backend/.env` with your own local values:

```env
MONGO_URI=mongodb+srv://<database-user>:<database-password>@<cluster>/<database-name>?retryWrites=true&w=majority
JWT_SECRET=<a-long-random-secret-created-for-local-development>
PORT=5000
NODE_ENV=development
```

Replace the placeholders locally. Never commit `backend/.env`, database passwords, or JWT secrets. MongoDB transactions are used for orders and stock changes, so the MongoDB server must support transactions (MongoDB Atlas does).

Start the backend in one PowerShell window:

```powershell
cd "C:\Users\<your-Windows-name>\Desktop\smart inventory\backend"
npm start
```

Start the frontend in a second PowerShell window:

```powershell
cd "C:\Users\<your-Windows-name>\Desktop\smart inventory\frontend"
npm run dev
```

Open the local Vite URL shown in the terminal, usually `http://localhost:5173`. Vite proxies `/api` to the local backend at `http://localhost:5000`.

## Render hosting and Android API address

Render builds the frontend and serves it from the Express backend at the same HTTPS domain. The Android frontend build uses:

```text
VITE_API_ROOT=https://nexastock-inventory-g4xy.onrender.com/api
```

The production database URI and JWT secret are configured in Render environment settings. Do not place these secrets in frontend files or the Android APK.

## Android installation

1. Copy the release APK to the Android phone (USB, Quick Share, or a private file-sharing service).
2. Open the APK on the phone and allow installation from that source if Android asks.
3. Install and open NexaStock, then sign in.

The release APK is signed with a private key. Keep the `.p12` signing file and its password backed up securely. They are required to sign future updates and must not be uploaded to GitHub or shared publicly. A release-signed APK cannot update an app installed with the debug signing key; uninstall the debug build first if Android reports a signature conflict. Inventory data is stored in the hosted database, but uninstalling clears the local app session.

## Roles and access

Newly registered accounts receive the `user` role by default. Product, category, customer, order, and stock-management endpoints are restricted to `admin` and `manager`. Dashboard and sign-in access require a valid account. An authorized administrator must assign management roles.

## Further documentation

- [Codebxo submission checklist](SUBMISSION.md)
- [API documentation](docs/API.md)
- [Database structure and ER-style diagram](docs/DATABASE.md)
- [Demo recording steps](docs/DEMO-RECORDING.md)


