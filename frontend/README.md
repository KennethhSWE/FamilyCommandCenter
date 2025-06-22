# Frontend — Family Command Center

This is the React Native + Expo mobile client for the **Family Command Center** app, designed for use on 7" Amazon Fire Tablets.

---

## 📱 Features

- Daily chore list per child
- Custom reward redemption (instant or parent-approved)
- Tabbed layout with polished visuals
- Harry Potter–inspired points display
- SVG-based icons and custom assets
- Offline-friendly and optimized for home use

---

## 🧰 Tech Stack

| Purpose            | Technology             |
| ------------------ | ---------------------- |
| UI Framework       | React Native           |
| Runtime            | Expo (with Metro bundler) |
| Navigation         | `@react-navigation/bottom-tabs` |
| Styling            | StyleSheet API (inline) |
| Icon Support       | `react-native-svg` and custom assets |
| API Integration    | Axios → Spring Boot backend |
| Deployment Target  | Amazon Fire Tablet (7") |

---

## 🚀 Run Locally

### Prerequisites

- Node.js & npm
- Expo CLI: `npm install -g expo-cli`
- Android device (or emulator with Expo Go)

### Steps

```bash
cd frontend
npm install
npx expo start
```

Then scan the QR code with the **Expo Go** app on your Fire tablet or emulator.

---

## 📁 Directory Structure

```
frontend/
├── assets/          # Icons, logos, splash screens
├── components/      # Shared components like KidCard, ChoreListItem
├── screens/         # App tabs: Kids, Admin, Rewards, etc.
├── App.tsx          # Entry point
├── app/             # Expo Router layout & navigation
└── ...              # Other config and helpers
```

---

## 🔧 Environment Setup

This project uses `.env` or `.env.local` for future API key and environment-specific settings (coming soon).

---

## 🔄 Syncing with Backend

The frontend makes API calls to your local Spring Boot backend at:

```
http://192.168.0.x:7070/
```

Be sure your phone/tablet is on the same Wi-Fi as your backend server, and CORS is configured.

---

## 🧪 Testing & Debugging

- Use Expo Developer Tools in browser (`npx expo start`)
- Press `r` to reload, `j` to open debugger
- Use `console.log()` and Chrome DevTools for debugging

---

## 📦 Deployment Plans

- Lock tablet to this app via kiosk mode
- Build standalone APK for Amazon Fire
- Offline-first experience coming soon

---

## 👨‍👩‍👧‍👦 Author

Kenneth Hayes — Full-stack developer, engineer, and parent

---

## 📜 License

See root `README.md` or `LICENSE` file.
