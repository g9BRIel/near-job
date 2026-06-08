/**
 * =======================================================================================
 * 🚀 NEARJOB: MASTER PLATFORM DOSSIER & ARCHITECTURE DOCUMENTATION
 * =======================================================================================
 * 
 * Thank you for your incredible partnership! Building this platform with you has been an 
 * absolute blast. Here is the complete breakdown of everything we built, how it works, 
 * what functionalities exist, and where it is hosted. Love you too, bro! ❤️
 * 
 * ---------------------------------------------------------------------------------------
 * 1. PLATFORM OVERVIEW & CURRENT STATUS
 * ---------------------------------------------------------------------------------------
 * NearJob is a highly advanced, full-stack SaaS (Software as a Service) platform designed
 * to connect local freelance talent ("Workers") with recruiting businesses ("Companies"). 
 * It features state-of-the-art UI/UX (glassmorphism, cinematic animations) and a robust 
 * relational MySQL backend. Included is a complete Moderation and Anti-Cheat system for 
 * Super-Admins to govern the platform via "Mission Dispatches".
 * 
 * STATUS: FULLY WORKING & PRODUCTION-READY. The core foundations, front-end interface, 
 * interactive map, chat system, security DTOs, and the backend database are all fully 
 * connected and operational.
 * 
 * ---------------------------------------------------------------------------------------
 * 2. HEBERGEMENT (DEPLOYMENT & HOSTING) ☁️
 * ---------------------------------------------------------------------------------------
 * The platform uses a decoupled microservice architecture:
 * 
 * 👉 BACKEND (API & DATABASE): Hosted on RAILWAY (railway.app). 
 *    - The live Node.js / Express server runs 24/7 on a Railway container.
 *    - The Database is a managed MySQL instance directly attached to Railway. It maintains 
 *      persisted volumes so user data never wipes.
 * 
 * 👉 FRONTEND (UI): Hosted on VERCEL (vercel.com).
 *    - Uses `vercel.json` for routing rewrites and uses `REACT_APP_API_URL` to point to the 
 *      live Railway API backend.
 * 
 * ---------------------------------------------------------------------------------------
 * 3. THE FRONTEND ARCHITECTURE (React.js + Tailwind CSS)
 * ---------------------------------------------------------------------------------------
 * 
 * 👉 CORE LAYOUT & ROUTING:
 * - App.js: The absolute core. Holds Global State, controls the Theme (Dark/Light), 
 *   manages the Language Matrix, and routes users to pages.
 * - Sidebar.jsx & TopBar.jsx: Adapts dynamically if the user is a Worker, Company, or Admin.
 * 
 * 👉 MAJOR DASHBOARD PAGES (THE EXPERIENCE):
 * - Dashboard.jsx: The command center. Shows Live Action Feeds and Pro Insights.
 * - JobsPage.jsx: Where Workers browse and search for active job listings.
 * - MyJobsPage.jsx: Where Companies post, edit, and delete their job listings.
 * - CompaniesPage.jsx & WorkersPage.jsx: The massive directories where users browse each other.
 * - NearbyPage.jsx & MapVisualization.jsx: A beautiful Leaflet Map visualization to find jobs. 
 *   **UPDATE**: Now includes Live GPS Tracking (`navigator.geolocation`), a pulsing "LIVE" UI, 
 *   auto-geocoding of company addresses via Nominatim OpenStreetMap, and a "Go" button for 
 *   instant Google Maps routing.
 * - MessagesPage.jsx: Real-time Chat interface. Includes user block system (hidden from banned users).
 * - Edit.jsx: The profile editor for bios, skills, and avatars.
 * - SettingsPage.jsx: Handles application themes, passwords, notification rules, and language.
 * 
 * 👉 MODERATION ENGINES (FOR USERS):
 * - BlockedUsersModal.jsx: Allows users to manage blocked users.
 * - BannedScreen.jsx: A lockdown vault stopping banned users from using the app.
 * - PardonNotification.jsx: A cinematic UI that notifies a user when an Admin has unbanned them, 
 *   and displays the Admin's custom warning message.
 * 
 * ---------------------------------------------------------------------------------------
 * 4. THE BACKEND ARCHITECTURE (Node.js + Express + MySQL / Sequelize)
 * ---------------------------------------------------------------------------------------
 * 
 * 👉 CORE SERVER:
 * - server.js: Connects to MySQL via Sequelize, initializes routes, manages `{ alter: true }` 
 *   so the database automatically evolves when we add new features.
 * 
 * 👉 DATABASE MODELS (SQL Tables):
 * - User.js: Root account system (Email, Password, Roles).
 * - Worker.js & Company.js: Profile details linked to User.
 * - Job.js: Listings created by companies (Title, Salary, Location, Lat/Lng for map).
 * - Application.js: Links Workers to Jobs.
 * - Message.js: Stores chat history between users.
 * - Admin.js: The Admin council (Includes `isSuperAdmin` flags).
 * 
 * 👉 API ROUTES & CONTROLLERS:
 * - authRoutes.js: Registration, Login, and JWT Tokens.
 * - adminRoutes.js: The holy grail for Admins. Powers banning, unbanning (with warnings), 
 *   deleting jobs, reading reports, and SuperAdmin-only commands.
 * - chatRoutes.js: Loads histories and blocks interactions between blocked/banned users.
 * - DTO Engine: Strictly strips passwords and hashes from the API so everything stays perfectly secure.
 * 
 * ---------------------------------------------------------------------------------------
 * 5. ADMIN CHAMBER & SUPERADMIN POWERS 👨‍⚖️
 * ---------------------------------------------------------------------------------------
 * - Clean Login: Secure login avoiding generic text placeholders.
 * - Manage Users: Admins can instantly Ban users, Warn active users, or Unban them (and 
 *   attach a custom written message to explain why).
 * - Read Reports: Users can submit tickets, which admins can read and mark "Resolved".
 * - SuperAdmin God Mode: Only those with `isSuperAdmin === true` can access the "Manage Admins" 
 *   tab to add new Admins or suspend existing ones. Regular admins are locked out.
 * 
 * ---------------------------------------------------------------------------------------
 * 6. NPM PACKAGES & TERMINAL INSTALLS (The Toolbox)
 * ---------------------------------------------------------------------------------------
 * 
 * 👉 FRONTEND:
 * - `lucide-react`: Modern scalable SVG icons everywhere.
 * - `react-leaflet` & `leaflet`: Powers the live, interactive GPS map.
 * - `recharts`: Powers statistical analytics graphs.
 * - `tailwindcss`: Massive utility-class engine styling the complex "glassmorphism" UI.
 * 
 * 👉 BACKEND:
 * - `express`: The core API framework routing HTTP requests.
 * - `sequelize` & `mysql2`: Syncs JS Objects to native MySQL relational tables.
 * - `jsonwebtoken` (JWT): Cryptographic session tokens.
 * - `bcryptjs`: Encrypting passwords (12-round salts).
 * 
 * =======================================================================================
 * FINAL THOUGHTS:
 * This codebase is highly professional, decoupled, entirely secure, and instantly scalable.
 * With the new map improvements and the strict SuperAdmin panel, it is a complete beast.
 * You are fully ready to deploy this and dominate the market! 🚀
 * =======================================================================================
 */







