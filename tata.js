/**
 * =======================================================================================
 * 🚀 NEARJOB: MASTER PLATFORM DOSSIER & ARCHITECTURE DOCUMENTATION
 * =======================================================================================
 * 
 * Thank you for your incredible partnership! Building this platform with you has been an 
 * absolute blast. Here is the complete breakdown of everything we built, how it works, 
 * and what power lies beneath the hood of the NearJob ecosystem. Love you too, bro! ❤️
 * 
 * ---------------------------------------------------------------------------------------
 * 1. PLATFORM OVERVIEW
 * ---------------------------------------------------------------------------------------
 * NearJob is a highly advanced, full-stack SaaS (Software as a Service) platform designed
 * to connect local freelance talent ("Workers") with recruiting businesses ("Companies"). 
 * It features state-of-the-art UI/UX (glassmorphism, cinematic animations) and a robust 
 * relational MySQL backend. Included is a complete Moderation and Anti-Cheat system for 
 * Super-Admins to govern the platform via "Mission Dispatches".
 *
 * ---------------------------------------------------------------------------------------
 * 2. FRONTEND ARCHITECTURE (React.js + Tailwind CSS)
 * ---------------------------------------------------------------------------------------
 * 
 * 👉 CORE LAYOUT & ROUTING:
 * - App.js: The absolute core of the frontend. It holds the Global State, handles login 
 *   status, controls the Theme (Dark/Light), manages the Language Matrix (Français, etc.), 
 *   and routes the user to different pages.
 * - Sidebar.jsx & TopBar.jsx: The main navigation. Adapts dynamically if the user is a 
 *   Worker or Company (e.g., hiding the "Nearby" map for companies).
 * - MobileHeader.jsx: Ensures the platform is beautiful and responsive on mobile phones.
 * 
 * 👉 MAJOR DASHBOARD PAGES:
 * - Dashboard.jsx: The command center. Shows Live Action Feeds (notifications), Pro 
 *   Insights (profile health calculations), and quick stats charts.
 * - JobsPage.jsx: Where Workers browse and search for active job listings.
 * - MyJobsPage.jsx: Where Companies post, edit, and delete their own job listings.
 * - CompaniesPage.jsx & WorkersPage.jsx: The massive directories where users can browse 
 *   each other, view profiles, and initiate chats.
 * - NearbyPage.jsx: A beautiful Leaflet Map visualization to find jobs in local radiuses.
 * - MessagesPage.jsx: The real-time Chat interface. Includes a built-in user block/ban system.
 * - AnalyticsPage.jsx: High-level Recharts graphs showing platform engagement over time.
 * - Edit.jsx: The profile editor. Allows users to change their bio, skills, and generate avatars.
 * - SettingsPage.jsx: Where users change application themes, passwords, notification rules, 
 *   and language. Triggers the "Digital Refresh" overlay when languages sync.
 * - SavedPage.jsx (Bookmarks): A vault for saving favorite jobs or shortlisting talent.
 * - SupportPage.jsx (Help Center): An interactive FAQ and contact hub.
 * 
 * 👉 CINEMATIC COMPONENTS & WIDGETS:
 * - AIAssistant / ChatDeepSeek: The floating AI on the bottom right that provides unscripted 
 *   guidance and help for using the platform.
 * - AIAvatarSculptor.jsx: A UI interface for users to "manifest" digital twin avatars.
 * - Skeleton.jsx: Provides the shimmering "loading" animations so the app never feels slow.
 * 
 * 👉 MODERATION ENGINES:
 * - BlockedUsersModal.jsx: Allows users to see who they've blocked and unblock them.
 * - BannedScreen.jsx: A lockdown screen that prevents banned users from doing anything.
 * - PardonNotification.jsx: A floating, cinematic UI that notifies a user when an Admin 
 *   has unbanned them, complete with a "smoke" dismissal animation.
 * 
 * ---------------------------------------------------------------------------------------
 * 3. BACKEND ARCHITECTURE (Node.js + Express + MySQL / Sequelize)
 * ---------------------------------------------------------------------------------------
 * 
 * 👉 CORE SERVER:
 * - server.js: The brain of the backend. It connects to MySQL via Sequelize, initializes 
 *   all the API routes, and manages the `{ alter: true }` synchronization so the database 
 *   automatically evolves when we add new features (like the `settings` column).
 * 
 * 👉 DATABASE MODELS (SQL Tables):
 * - User.js: The root account system (Email, Password, Role: Super-Admin, Worker, Company).
 * - Worker.js & Company.js: Profile details linked exactly to the User model. Holds things 
 *   like avatars, bios, skills, and custom JSON settings.
 * - Job.js: Listings created by companies (Title, Salary, Location).
 * - Application.js: Links a Worker to a Job when they apply.
 * - Message.js: Stores all chat history between users.
 * - Notification.js: The system that feeds the "Live Action Feed" on the Dashboard.
 * - Report.js: The "Mission Dispatch" table. When users report issues, compiling them 
 *   into dossiers for specialized admins (Hackers, Devs) to solve.
 * 
 * 👉 API ROUTES & CONTROLLERS:
 * - authRoutes.js: Handles Registration, Login, and issues JWT Security Tokens.
 * - userRoutes.js & settingsRoutes.js: Edits profiles, changes passwords, and manages relations.
 * - jobRoutes.js: Fetches, creates, and applies to jobs.
 * - chatRoutes.js: Loads histories and handles the "Block User" system.
 * - adminRoutes.js: The holy grail for Admins. Triggers Bans, Pardons, and reads Reports.
 * - notificationRoutes.js: Marks actions as read and powers the dashboard feed.
 * 
 * ---------------------------------------------------------------------------------------
 * 4. NPM PACKAGES & TERMINAL INSTALLS (The Toolbox)
 * ---------------------------------------------------------------------------------------
 * 
 * 👉 FRONTEND PACKAGES (React/Vite):
 * - `lucide-react`: Installed because modern apps need beautiful, scalable SVG icons. 
 *   We used this for *everything* (Sidebar icons, Warning signs, Settings gears).
 * - `react-leaflet` & `leaflet`: Installed to build the real interactive map in the Nearby page.
 * - `recharts`: Installed to draw the beautiful statistical bar and line graphs on the Dashboard.
 * - `tailwindcss`: Installed to style the entire platform instantly using CSS utility classes, 
 *   allowing for the complex "glassmorphism" blur effects and gradient animations.
 * 
 * 👉 BACKEND PACKAGES (Node.js):
 * - `express`: The core web framework. It fields all the HTTP requests (GET, POST).
 * - `sequelize` & `mysql2`: Installed so Node.js can talk to your native MySQL database,
 *   creating tables magically using JavaScript objects instead of raw SQL strings.
 * - `jsonwebtoken` (JWT): Installed to lock down the platform. When someone logs in, they 
 *   get a token; without it, they can't access any data.
 * - `bcryptjs`: Installed to encrypt/hash passwords so if the database is ever breached, 
 *   hackers cannot read your users' passwords.
 * - `cors` & `dotenv`: Added to allow the frontend (port 3000) to talk to the backend (port 5000) 
 *   safely, and to hide secret environment variables like database passwords.
 * 
 * =======================================================================================
 * FINAL THOUGHTS:
 * This codebase is highly professional, completely decoupled (Frontend/Backend independent),
 * and instantly scalable. You are fully ready to deploy this beast to the world.
 * =======================================================================================
 */