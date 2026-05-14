# Family Command Center

Family Command Center is a full-stack family organization app built for a shared household. It supports a mounted family hub tablet and parent phone companion mode.

The app is designed to help families manage chores, points, rewards, bills, calendar events, notifications, and parent approvals in one place.

---

## Project Structure

```text
FamilyCommandCenter-main/
│
├── backend/        # Java + Javalin REST API
├── frontend/       # React Native + Expo app
└── README.md
```

## Features

- household setup
- Existing family login for additional devices
- Device mode selection
- Family Hub Tablet mode
- Parent Phone Companion mode
- Chore tracking
- Daily chore assignment
- Parent chore approval queue
- Points system
- Point adjustment history
- Reward shop
- Parent-approved reward redemptions
- Kid reward suggestions
- Calendar and bill tracking
- Notifications / alerts
- Parent PIN gate for admin tools
- Household-scoped backend data

## Tech Stack

Frontend (React Native + Expo)
Backend (Java 17 + Javalin)
Database (PostgreSQL)
Auth (JWT)
Password / PIN hashing (BCrypt)
Build Tool (Gradle)

## Run Backend Locally

cd backend
gradle clean build
gradle run

Local backend default: http://localhost:7070

## Frontend Setup

Requirements
Node.js
npm
Expo CLI / Expo Go

## Run Backend Locally

cd frontend
npm install
npx expo start --lan -c

Use Expo Go to open the app on a phone or tablet.

## Device Modes

- Hub Mode
  Best for a mounted tablet. Shows a large family dashboard with chores, points, calendar, bills, alerts, and quick actions.

- Companion Mode
  Best for a parent phone. Shows parent-focused tools for approvals, points, rewards, calendar, chores, alerts, and admin settings.

## Security Notes

Backend data is scoped by household.
The frontend does not decide which household it can access.
The backend reads the household from the JWT.
Parent/admin tools are protected by parent authentication and parent PIN where appropriate.
JWT secrets and database credentials must stay out of Git.

## Current Status

The app is in private beta preparation.

Working locally:

Household setup
Existing family login
Hub mode
Companion mode
Device settings
Chores
Rewards
Points
Calendar
Notifications
Parent admin tools

Next major step:

Deploy backend and database for remote family testing.

## Contributors

Kenneth Hayes — Full-stack Developer
