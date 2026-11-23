# Winnie4 Mobile Frontend

Cross-platform mobile client for **Winnie4**, a modern Nigerian intercity car-sharing and transport platform built with React Native, Expo, and TypeScript.

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Expo Go](https://expo.dev/go) app installed on your physical iOS/Android device, or an Android Emulator / iOS Simulator.

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Set your `EXPO_PUBLIC_API_URL` to point to your backend API.
> **Note for Physical Devices & Android Emulator**:
> - If testing on a **physical device** over Wi-Fi, use your computer's local LAN IP (e.g. `http://192.168.1.50:8000`). Physical phones cannot resolve `localhost`.
> - If testing on the standard **Android Emulator**, use `http://10.0.2.2:8000`.
> - If testing on **iOS Simulator**, use `http://localhost:8000`.

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Application
```bash
npx expo start
```
- Press `a` in the terminal to launch the Android emulator.
- Press `i` to launch the iOS simulator.
- Scan the QR code with the **Expo Go** app on your physical phone.

---

## Tech Stack & Architecture

- **Framework**: React Native with Expo (Managed Workflow, TypeScript)
- **Navigation**: React Navigation (Native Stack + Bottom Tabs with dynamic Passenger/Driver role switching)
- **State Management**: Zustand (`src/store/authStore.ts`) for authentication and session; TanStack React Query (`src/hooks/`) for server caching
- **Secure Token Storage**: `expo-secure-store`
- **Networking**: Centralized Axios client (`src/api/client.ts`) with Bearer token injection and 401 unauthorization handling
- **Payment Integration**: Squad by GTCO & Paystack (in-app WebView checkout and verification)
