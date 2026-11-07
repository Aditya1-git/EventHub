# EventHub – Full Stack Event Management Platform

A modern, production-grade full-stack event discovery, registration, and administration platform built with the **MERN** stack (MongoDB, Express.js, React.js, Node.js) styled with **Tailwind CSS**.

---

## 🌟 Key Features

### 👤 Normal User Features
- **Modern Landing Page**: Dynamic Hero section, search bar, featured events, category filters, and value highlights.
- **Event Discovery & Filtering**: Search by title, filter by category, filter by date, search by venue, and sort by date or seat availability.
- **Event Details & Real-Time Countdown**: Detailed event page with live countdown timer (`Days : Hours : Minutes : Seconds`), seat capacity progress bar, organizer details, and deadline indicator.
- **Seamless Registration**: One-click registration modal for logged-in attendees with automatic pre-fill and atomic seat decrementing (prevents race conditions and duplicate bookings).
- **User Dashboard ("My Registrations")**: View booked passes, filter by Upcoming / Completed / Cancelled, and cancel passes with instant seat restoration.
- **User Profile Management**: Update personal details, update password, and view account registration statistics.
- **Dark / Light Mode**: Theme switcher with persistent `localStorage` preference.

### 🛡️ Administrator Features
- **Protected Admin Console**: Role-based access control preventing unauthorized user access.
- **Real-Time Analytics Dashboard**: Live MongoDB statistics (Total Events, Users, Registrations, Upcoming, Completed, Cancelled) with **Recharts** visualizations (30-day registration trend, category distribution, top popular events).
- **Event Management**: Create, edit, and delete events with live thumbnail previews, seat adjustments, and delete safeguards.
- **Registration Management**: Comprehensive table with search and filtering by event/status, plus **instant CSV export**.
- **User Management**: Search users, toggle roles (Admin ↔ User), delete users with **safety checks** (prevents deleting own account or demoting the last administrator).
- **Deep Aggregations**: 6-month monthly trends, category breakdown, seat occupancy rates, and event lifecycle statistics.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router DOM v7, Axios, Lucide React, React Hot Toast, Recharts |
| **Backend** | Node.js, Express.js (CommonJS: `require` & `module.exports`), Multer, Helmet, Morgan, Express Rate Limit, Cookie-Parser, CORS |
| **Database** | MongoDB v8+, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt.js, HTTP-Only Cookies & Bearer fallback |

---

## ☁️ Deploying to Vercel with Preloaded Seeds

Deploying this full-stack application to Vercel takes less than 5 minutes because the repository is already pre-configured with a unified serverless configuration ([`vercel.json`](vercel.json) and [`api/index.js`](api/index.js)).

### Step 1: Set up a Free Cloud Database (MongoDB Atlas)
*Since Vercel is a serverless host, it cannot run a local MongoDB instance. You need a free cloud MongoDB instance:*
1. Visit [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a free shared cluster (**M0 Free Tier**).
3. Under **Security → Database Access**, create a user (e.g. `eventhub_admin` with a password).
4. Under **Security → Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere** (`0.0.0.0/0`). *(Required because Vercel functions run on dynamic cloud IPs)*.
5. In **Database Deployments**, click **Connect → Drivers** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/eventhub?retryWrites=true&w=majority
   ```

---

### Step 2: Choose Your Preloading Seed Method

We have built **3 ways** to preload seed data:

#### Method A: Automatic Seed on First Vercel Launch (Recommended & Easiest)
In [`backend/config/db.js`](backend/config/db.js), the backend automatically checks if the database is empty when connecting. On your first visit, it will automatically populate all **10 events**, the **Admin account**, and **Demo users**!
You can also set `AUTO_SEED=true` in Vercel's Environment Variables to enforce this.

#### Method B: One-Click Web Seed Endpoint
After deploying to Vercel, simply open this URL in your browser:
```
https://your-eventhub-app.vercel.app/api/seed
```
This triggers the seed routine in MongoDB Atlas and returns a JSON confirmation.

#### Method C: CLI Seed directly from your computer to MongoDB Atlas
Before pushing to GitHub, paste your Atlas connection URI into `backend/.env`:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/eventhub?retryWrites=true&w=majority
```
Then run:
```bash
cd backend
npm run seed
```
Your Atlas database is now permanently pre-populated with all events and demo accounts!

---

### Step 3: Push Your Code to GitHub
Initialize git and push the project to a GitHub repository:
```bash
git init
git add .
git commit -m "Deploy EventHub to Vercel"
git branch -M main
git remote add origin https://github.com/your-username/your-eventhub-repo.git
git push -u origin main
```

---

### Step 4: Import and Deploy on Vercel
1. Log in to [vercel.com](https://vercel.com) and click **"Add New..." → "Project"**.
2. Select your GitHub repository and click **Import**.
3. In the project setup:
   - **Framework Preset**: Leave as default or select **Vite** (Vercel automatically detects [`vercel.json`](vercel.json)).
   - **Root Directory**: `./` (leave default).
4. Expand **Environment Variables** and add the following keys:

| Environment Variable | Value Example |
|---|---|
| `MONGO_URI` | `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/eventhub?retryWrites=true&w=majority` |
| `JWT_SECRET` | `supersecret_eventhub_jwt_key_2026_production` |
| `NODE_ENV` | `production` |
| `AUTO_SEED` | `true` |

5. Click **Deploy**!
Vercel will install dependencies, build the React frontend, link the Express serverless API, and deploy your live application.

---

## 🔑 Pre-configured Demo Accounts

Once seeded, you can immediately log in using either account:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@eventhub.com` | `Admin@123` | Full access to Admin Console, Analytics, CRUD, CSV Export |
| **Normal User** | `user@eventhub.com` | `User@123` | Event browsing, registration, My Registrations, Profile |

*(Note: The Login page also includes 1-click buttons to automatically fill both sets of credentials).*

---

## 💻 Running Locally

### Option A: Run Both Frontend & Backend Concurrently
```bash
npm install
npm run dev
```

### Option B: Run in Separate Terminals

#### Terminal 1 – Backend:
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

#### Terminal 2 – Frontend:
```bash
cd frontend
npm install
npm run dev
# Web app runs on http://localhost:5173
```

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create new attendee account
- `POST /api/auth/login` - Sign in and get JWT token & HTTP-only cookie
- `GET /api/auth/me` - Fetch authenticated user
- `POST /api/auth/logout` - Clear session cookie

### Events (`/api/events`)
- `GET /api/events` - Get events with search, category/venue filters, sorting, and pagination
- `GET /api/events/featured` - Get featured highlights
- `GET /api/events/:id` - Get single event details
- `POST /api/events` - Create event (Admin only)
- `PUT /api/events/:id` - Update event (Admin only)
- `DELETE /api/events/:id` - Delete event & cancel its passes (Admin only)

### Registrations (`/api/registrations`)
- `POST /api/registrations` - Register for event (atomically decrements seats)
- `GET /api/registrations/my` - Fetch current user's passes
- `PUT /api/registrations/:id/cancel` - Cancel pass & restore available seat

### Admin (`/api/admin`)
- `GET /api/admin/dashboard` - Overview statistics & Recharts analytics
- `GET /api/admin/events` - Complete event catalog with admin controls
- `GET /api/admin/registrations` - Attendee list (supports `?export=csv`)
- `GET /api/admin/users` - Registered users list
- `GET /api/admin/analytics` - Database aggregation metrics
- `PUT /api/admin/users/:id/role` - Toggle user role (with last admin safety)
- `DELETE /api/admin/users/:id` - Delete user (with self & last admin safety)

### Seeding (`/api/seed`)
- `GET /api/seed` or `POST /api/seed` - Preload/reset 10 sample events, demo users, and bookings.
