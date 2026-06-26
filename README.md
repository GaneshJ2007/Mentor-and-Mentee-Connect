# 🎓 Mentor Connect

A full-stack **Mentor & Mentee Connect** platform built with **React**, **Node.js/Express**, and **MongoDB**. Features two distinct user roles, rich academic tracking, achievement portfolios, interactive analytics, and one-click PDF report generation.

---

## ✨ Features

### Mentee Portal
- **Profile Setup** — Personal info, academic details, skills, bio & career goals
- **Academic Records** — Internal assessment marks (IA1/IA2/IA3, quizzes) and full semester exam results with grades, SGPA, CGPA
- **Achievements & Portfolio** — Dynamic forms for certifications, online courses, and extra-curricular activities

### Mentor Portal
- **Dashboard** — Overview stats (avg CGPA, total certifications, profile completeness)
- **Student Directory** — Searchable, sortable list of all assigned mentees
- **Detailed Analytics** — Tabs for overview, academic records, achievements, and interactive Recharts (SGPA trend, pie charts, bar charts)
- **PDF Report** — Download a fully-styled dark-theme PDF report for any mentee

---

## 🗂️ Project Structure

```
mentor-connect/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Register, login, getMe
│   │   ├── menteeController.js  # Profile & academic CRUD
│   │   └── mentorController.js  # Dashboard, analytics, PDF data
│   ├── middleware/
│   │   ├── auth.js              # JWT protect + restrictTo
│   │   └── errorHandler.js      # Global error handler
│   ├── models/
│   │   ├── User.js              # User schema (mentor/mentee roles)
│   │   └── MenteeProfile.js     # Full academic + achievement schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── mentee.js
│   │   └── mentor.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── mentee/
    │   │   │   ├── MenteeProfilePage.jsx      # Profile + skills form
    │   │   │   ├── MenteeAcademicsPage.jsx    # Internal & semester exams
    │   │   │   └── MenteeAchievementsPage.jsx # Certs, courses, activities
    │   │   ├── mentor/
    │   │   │   ├── MentorDashboard.jsx        # Stats + mentee cards
    │   │   │   ├── MentorMenteesPage.jsx      # Table view
    │   │   │   └── MenteeDetailPage.jsx       # Full analytics + PDF
    │   │   └── shared/
    │   │       ├── Layout.jsx                 # Sidebar + top bar
    │   │       └── UI.jsx                     # StatCard, Badge, Toast, etc.
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   └── AuthPages.jsx                  # Login + Register
    │   ├── utils/
    │   │   ├── api.js                         # Axios service layer
    │   │   └── pdfGenerator.js                # jsPDF report generator
    │   ├── App.jsx                            # Router + route guards
    │   ├── main.jsx
    │   └── index.css                          # Tailwind v4 + custom styles
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally on port 27017 (or a MongoDB Atlas URI)

---

### 1. Clone & set up the backend

```bash
cd mentor-connect/backend
cp .env.example .env          # Edit the values as needed
npm install
npm run dev                   # Starts on http://localhost:5000
```

**`.env` variables:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mentor_connect
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

### 2. Set up the frontend

```bash
cd mentor-connect/frontend
npm install
npm run dev                   # Starts on http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to `http://localhost:5000` automatically.

---

### 3. First-time usage

1. Open `http://localhost:5173`
2. Click **Create Account** → select **Mentor** → register
3. Create another account → select **Mentee** → pick the mentor from the dropdown
4. Log in as the **Mentee** to fill in profile, academic records, and achievements
5. Log in as the **Mentor** to view the dashboard and download PDF reports

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register mentor or mentee |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Private | Get current user |
| GET | `/api/auth/mentors` | Public | List all mentors (for register dropdown) |

### Mentee (requires JWT + mentee role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mentee/profile` | Get own full profile |
| PUT | `/api/mentee/profile` | Update personal/academic details |
| POST | `/api/mentee/profile/full` | Save all sections in one request |
| PUT | `/api/mentee/academics/internal` | Replace internal exam array |
| PUT | `/api/mentee/academics/semester` | Replace semester exam array |
| PUT | `/api/mentee/achievements/certifications` | Replace certifications array |
| PUT | `/api/mentee/achievements/courses` | Replace courses array |
| PUT | `/api/mentee/achievements/activities` | Replace activities array |

### Mentor (requires JWT + mentor role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mentor/dashboard` | Stats + all assigned mentees summary |
| POST | `/api/mentor/assign-mentee` | Manually assign a mentee |
| GET | `/api/mentor/mentee/:id` | Full mentee profile + analytics object |
| GET | `/api/mentor/mentee/:id/pdf-data` | PDF-optimised structured data |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS v4, React Router v6 |
| Icons | Lucide React |
| Charts | Recharts |
| HTTP Client | Axios |
| PDF Generation | jsPDF |
| Backend | Node.js, Express 4 |
| Auth | JSON Web Tokens (bcryptjs + jsonwebtoken) |
| Database | MongoDB 7 + Mongoose 8 |

---

## 📄 License

MIT — free to use, modify, and distribute.
