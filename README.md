# SwiftRoute

SwiftRoute is a React Native delivery driver and customer app built with Expo Router, Expo Location, and WatermelonDB. It includes driver route tracking, delivery stop management, background location logging, and a user-facing map for pending deliveries.

## Features

- Driver app with active trip selection
- Background location updates using `expo-task-manager` and `expo-location`
- Delivery stop marking and status updates
- Off-route detection based on map route coordinates
- Driver map with route drawing and clustered stop markers
- Local database storage using `@nozbe/watermelondb`
- Authentication flow support via Redux state

## Tech stack

- Expo SDK 54
- React Native 0.81
- Expo Router
- TypeScript
- WatermelonDB
- Redux Toolkit + Redux Persist
- React Query
- React Native Maps + Directions
- NativeWind + Gluestack UI

## Prerequisites

- Node.js 18+ or compatible
- npm or Yarn
- Expo CLI installed globally: `npm install -g expo-cli`
- Android Studio / Xcode for native device/emulator testing

## Setup

1. Clone the repo

   ```bash
   git clone https://github.com/sonu-shashank1290/SwiftRoute.git
   cd SwiftRoute
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the Expo development server

   ```bash
   npm run start
   ```

## Running

- Open on Android emulator/device:
  ```bash
  npm run android
  ```
- Open on iOS simulator/device:
  ```bash
  npm run ios
  ```
- Open on web:
  ```bash
  npm run web
  ```

## Project structure

- `app/` — Expo Router screens and layouts
  - `(driver)/` — driver-facing screens
  - `(user)/` — customer-facing screens
  - `(auth)/login.tsx` — auth flow
- `components/` — reusable UI components
- `hooks/` — custom hooks for driver/user data and live location
- `location/` — location and background task logic
- `storage/` — WatermelonDB database and data models
- `store/` — Redux slices and store configuration
- `types/` — TypeScript data models
- `constants/` — app constants and utilities

## Notes

- `storage/seed.ts` seeds the local database with sample trips, users, and deliveries.
- `components/driver/TripMap.tsx` handles route rendering and limits Google Maps waypoints to avoid API limits.
- Background location tasks are defined in `location/backgroundTask.ts` and registered with Expo Task Manager.

## Troubleshooting

- If route drawing fails, verify `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` is set in your environment.
- If background location does not work on iOS, ensure the required `UIBackgroundModes` keys are configured.
- For Android emulator route simulation, use Expo and the Android Device Manager route simulator.

## License

This project is private.
