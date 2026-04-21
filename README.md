# Family Command Center

A polished, tablet-friendly family organization app built with a full-stack architecture.

---

## 🧭 Project Structure

```
family-command-center/
│
├── frontend/        # React Native (Expo) app for Amazon Fire Tablets
├── backend/         # Java + Spring Boot REST API
└── README.md        # This file
```

---

## ✨ Features

- Chore tracking with points
- Parent-approved or instant reward redemptions
- Custom avatars and themes
- Professional, clean UI optimized for tablets
- PostgreSQL-backed data persistence

---

## 🛠️ Tech Stack

| Layer    | Tech                        |
| -------- | --------------------------- |
| Frontend | React Native + Expo         |
| Backend  | Java + Spring Boot          |
| Database | PostgreSQL                  |
| Hosting  | TBD (Local or Cloud-hosted) |

---

## 🚀 Getting Started

### Backend (Spring Boot)

```bash
cd backend
./gradlew run
```

Make sure PostgreSQL is running and `application.properties` is configured.

### Frontend (React Native with Expo)

```bash
cd frontend
npm install
npx expo start
```

Open in Expo Go or run on an Android emulator.

---

## 📦 Deployment Plans

- Tablet kiosk mode on Amazon Fire
- Admin panel hidden behind login
- Cloud deployment with Heroku or Render (WIP)

---

## 🙌 Contributors

**Kenneth Hayes** — Full-stack Developer & Visionary Dad

---

## 📜 License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2025 Kenneth Hayes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

This is the React Native / Expo client for the Family Command Center tablet app.

## Run Locally

```bash
npm install
npx expo start

## 📝Notes

- Designed for 7" Amazon Fire Tablets
- Uses custom tab bar, SVG icons, and Harry Potter–themed points screen
```
