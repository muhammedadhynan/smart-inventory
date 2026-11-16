# NexaStock submission checklist

Use this checklist when submitting NexaStock to Codebxo. The links and documents below are ready; the APK file and short demo video must be attached separately.

1. **Source code repository:** https://github.com/muhammedadhynan/smart-inventory/tree/nexastock-deploy  
   The repository is private. Give the company reviewer access before submission.
2. **Live web application:** https://nexastock-inventory-g4xy.onrender.com/
3. **Android APK:** Attach `frontend/android/app/build/outputs/apk/release/app-release.apk` from the project folder. Include the APK file itself in the company submission.
4. **Backend API:** https://nexastock-inventory-g4xy.onrender.com/api  
   Health check: https://nexastock-inventory-g4xy.onrender.com/api/health
5. **Database structure / ER-style diagram:** [docs/DATABASE.md](docs/DATABASE.md)
6. **API documentation:** [docs/API.md](docs/API.md)
7. **Installation and setup README:** [README.md](README.md)
8. **Short screen recording:** Record a 1–2 minute walkthrough and attach its MP4. Follow [docs/DEMO-RECORDING.md](docs/DEMO-RECORDING.md).

## Before uploading

- Confirm the company reviewer can open the private repository.
- Make sure the APK installs and opens on an Android phone.
- Play the recording once to check that the app is readable and no password or private customer information is visible.
- Never include `.env` files, database credentials, JWT secrets, the `.p12` signing key, or its password in the submission.

