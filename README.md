# 🎓 Alumni Tracker

A full-stack web application for tracking and managing university alumni. Built as a course project for **Web Programming** at Istanbul Yeni Yüzyıl University — Information Systems (YBS), 3rd Year.

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 📖 About the Project

**Alumni Tracker** is a web-based platform that enables universities to maintain and manage a comprehensive database of their graduates. The system allows administrators to track alumni information, employment status, and career progress after graduation. Alumni can also register, update their profiles, and connect with fellow graduates.

### Problem Statement

Universities often lose contact with their graduates after they leave the institution. This makes it difficult to:
- Track employment outcomes and career paths
- Maintain an updated alumni network
- Gather feedback for curriculum improvement
- Organize alumni events and reunions

**Alumni Tracker** solves these problems by providing a centralized platform for alumni management.

---

## ✨ Features

### Core Features
- **User Authentication** — Secure registration and login with JWT-based authentication
- **Alumni Profiles** — Create and manage detailed alumni profiles (education, employment, skills)
- **Search & Filter** — Search alumni by name, graduation year, department, or company
- **Admin Dashboard** — Manage all alumni records, view statistics, and generate reports
- **Profile Management** — Alumni can update their own profile and employment information

### Planned Features
- [ ] Event management for alumni reunions
- [ ] Messaging system between alumni
- [ ] Data visualization and analytics dashboard
- [ ] Export alumni data (CSV/PDF)
- [ ] Email notifications for events and updates

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React.js** | UI library for building interactive user interfaces |
| **Vite** | Fast build tool and development server |
| **React Router** | Client-side routing and navigation |
| **Axios** | HTTP client for API requests |
| **CSS Modules** | Component-scoped styling |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | Web framework for building REST APIs |
| **Mongoose** | MongoDB object modeling (ODM) |
| **JWT** | JSON Web Tokens for authentication |
| **bcrypt** | Password hashing |
| **dotenv** | Environment variable management |

### Database
| Technology | Purpose |
|---|---|
| **MongoDB** | NoSQL document database |
| **MongoDB Atlas** | Cloud-hosted database service |

### Development Tools
| Tool | Purpose |
|---|---|
| **Git & GitHub** | Version control and collaboration |
| **Postman** | API testing |
| **Nodemon** | Auto-restart server during development |
| **ESLint** | Code linting and formatting |

---

## 📁 Project Structure

```
alumni-tracker/
├── client/                    # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/            # Images, icons, static files
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── AlumniCard.jsx
│   │   │   └── SearchBar.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── AlumniList.jsx
│   │   ├── context/           # React Context for state management
│   │   ├── services/          # API service functions
│   │   ├── utils/             # Helper functions
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Backend (Node.js + Express)
│   ├── config/
│   │   └── db.js              # MongoDB connection configuration
│   ├── controllers/           # Route handler logic
│   │   ├── authController.js
│   │   ├── alumniController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   └── errorHandler.js    # Global error handling
│   ├── models/                # Mongoose schemas
│   │   ├── User.js
│   │   └── Alumni.js
│   ├── routes/                # API route definitions
│   │   ├── authRoutes.js
│   │   ├── alumniRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/                 # Helper utilities
│   ├── server.js              # Entry point
│   └── package.json
│
├── .env.example               # Environment variable template
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your system:

- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** — [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Git** — [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mehmetrasid0/Alumni.git
   cd Alumni
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   ```

3. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**

   Create a `.env` file in the `server/` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://your_connection_string
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   ```

5. **Run the application**

   Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

   Start the frontend (in a new terminal):
   ```bash
   cd client
   npm run dev
   ```

6. **Open your browser**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT token |
| `GET` | `/api/auth/me` | Get current logged-in user |

### Alumni
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/alumni` | Get all alumni (with pagination) |
| `GET` | `/api/alumni/:id` | Get a single alumni by ID |
| `POST` | `/api/alumni` | Create a new alumni record |
| `PUT` | `/api/alumni/:id` | Update an alumni record |
| `DELETE` | `/api/alumni/:id` | Delete an alumni record |
| `GET` | `/api/alumni/search?q=` | Search alumni by name/department |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Get dashboard statistics |
| `GET` | `/api/admin/users` | Get all registered users |
| `PUT` | `/api/admin/users/:id/role` | Update user role |

---

## 🗄️ Database Schema

### User Model
```javascript
{
  name:          String,       // Full name
  email:         String,       // Unique email address
  password:      String,       // Hashed password
  role:          String,       // "alumni" | "admin"
  createdAt:     Date          // Account creation date
}
```

### Alumni Model
```javascript
{
  user:           ObjectId,    // Reference to User
  studentId:      String,      // University student number
  department:     String,      // Department/major
  graduationYear: Number,      // Year of graduation
  degree:         String,      // "Bachelor" | "Master" | "PhD"
  currentCompany: String,      // Current employer
  jobTitle:       String,      // Current position
  city:           String,      // Current city
  country:        String,      // Current country
  linkedIn:       String,      // LinkedIn profile URL
  phone:          String,      // Contact number
  bio:            String,      // Short biography
  skills:         [String],    // List of skills
  updatedAt:      Date         // Last profile update
}
```

---

## 📸 Screenshots

> Screenshots will be added as the project progresses.

---

## 🗺️ Roadmap

- [x] Project setup and README
- [ ] Backend: Initialize Express server and MongoDB connection
- [ ] Backend: User authentication (register/login with JWT)
- [ ] Backend: CRUD operations for alumni records
- [ ] Backend: Admin routes and middleware
- [ ] Frontend: Project setup with Vite + React
- [ ] Frontend: Login and Registration pages
- [ ] Frontend: Alumni listing and search page
- [ ] Frontend: Individual alumni profile page
- [ ] Frontend: Admin dashboard
- [ ] Integration: Connect frontend with backend API
- [ ] Testing: API testing with Postman
- [ ] Deployment: Deploy to cloud platform

---

## 🤝 Contributing

This is a university course project. Contributions are welcome for learning purposes.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Mehmet Raşid** — Istanbul Yeni Yüzyıl University, Information Systems (YBS), 3rd Year

- GitHub: [@mehmetrasid0](https://github.com/mehmetrasid0)

---

<p align="center">
  Made with ❤️ for Web Programming Course — 2026
</p>
