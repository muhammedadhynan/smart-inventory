# NexaStock frontend

This folder contains the React + Vite web app and the Capacitor Android project.

For complete project setup, environment variables, deployment, and Android installation instructions, see the repository [README](../README.md).

## Run the web frontend locally

From PowerShell:

```powershell
cd "C:\Users\<your-Windows-name>\Desktop\smart inventory\frontend"
npm ci
npm run dev
```

The local Vite development server proxies `/api` calls to `http://localhost:5000`. Start the backend separately; follow the root README for the backend setup.

## Build the Android web assets

The production Android build reads `VITE_API_ROOT` from `.env.android.local`. Keep its value pointed at the hosted HTTPS API for normal phone use. Never place database credentials or JWT secrets in frontend environment files.

```powershell
npm run android:sync
```

The signed release APK and release-signing key are created locally and are not included in this repository. See the root README for APK installation and signing-key handling.

