# Medical Consultation Platform - Frontend

This repository houses the Next.js frontend application for the Medical Consultation Platform. It includes a multi-step onboarding wizard, role-based functional dashboards, and a real-time chat interface.

## 🚀 Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit & RTK Query
- **Form Handling**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **WebSockets**: Socket.io Client

---

## 💻 Local Setup Instructions

### 1. Prerequisites
- **Node.js**: v18 or explicitly v22+
- The **Backend API** must be running locally to supply data and handle authentication.

### 2. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 3. Environment Setup (Optional for Local)
By default, the application is configured to fall back to `http://localhost:4001` if no environment variable is provided. 

However, if your backend runs on a different port or you wish to deploy, create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL="http://localhost:4001"
```

### 4. Running the Development Server
Start the Next.js local environment:
```bash
npm run dev
```

The client will be running at [http://localhost:3000](http://localhost:3000).

---

## 🧭 Navigation & Features

- **`/login`**: Authenticates users using Redux Toolkit to hydrate the global state.
- **`/onboarding`**: A resilient 3-step wizard for patients to complete their medical profile. Drafts are auto-saved to the database on each step completion using `framer-motion` for slide transitions.
- **`/dashboard`**: A dynamic layout that securely branches based on the authenticated user's `Role` (Patient vs. Doctor views).
- **`/chat/[userId]`**: A real-time WebSocket connection to communicate securely. 

---

## 📜 Available Scripts

- `npm run dev` - Starts the Next.js development server.
- `npm run build` - Generates an optimized production build.
- `npm start` - Starts a Node.js server to serve the production build locally.
- `npm run lint` - Runs the strict Next.js ESLint configuration.
