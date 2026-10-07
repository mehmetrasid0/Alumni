# 🎓 Alumni Tracker

A modern, containerized full-stack web application for tracking and managing university alumni. Built as a course project for **Web Programming** at Istanbul Yeni Yüzyıl University — Information Systems (YBS), 3rd Year.

---

## 🚀 Key Features & Modules

- **👤 Alumni Profiles & Career Tracking**:
  - Detailed professional profiles with current company, role, industry, and skills.
  - Academic history (graduation year, department, degree, student ID).
  - LinkedIn and portfolio integration.
- **🔍 Advanced Search & Directory**:
  - Filter alumni by graduation year, department, company, or location.
  - Dynamic results with real-time client-side search.
- **🔐 Authentication & Authorization**:
  - JWT-based secure registration and login (Planned).
  - Role-based access control (Admin / Alumni).
- **📊 Admin Dashboard**:
  - Manage all alumni records, view statistics, and generate reports.
  - User role management and verification workflows.
- **💼 Profile Management**:
  - Alumni can update their own profile and employment information.

### Planned Features
- [ ] Event management for alumni reunions
- [ ] Messaging system between alumni
- [ ] Data visualization and analytics dashboard
- [ ] Export alumni data (CSV/PDF)
- [ ] Email notifications for events and updates

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | **Node.js** + **Express.js** | High-performance RESTful API with modular route architecture. |
| **Database** | **MongoDB** (Atlas) | Flexible NoSQL document database for alumni and user data (Planned). |
| **ODM** | **Mongoose** | Schema-based data modeling and validation for MongoDB (Planned). |
| **Frontend** | **HTML5** + **CSS3** + **Vanilla JS (ES6+)** | Responsive, accessible UI with real-time filtering (React + Vite planned for Phase 7). |
| **Documentation** | **Swagger UI** + **OpenAPI 3.0** | Interactive API documentation and in-browser testing portal. |
| **Containerization** | **Docker** & **Docker Compose** | Reproducible development environment with volume synchronization. |
| **Dev Tools** | **Nodemon** (legacy watch) | Auto-restart server on file changes inside Docker containers. |
| **Testing** | **Postman Collection** | Preconfigured automated test suite for all REST API endpoints. |

---

## 📌 Quick Overview & Instructor Evaluation Guide

| Verification Item | Direct Link / Resource | Description |
| :--- | :--- | :--- |
| ⭐ **This Week (W4)** | [Week 4 — MVC Architecture & Postman](#-week-4-w4--october-07-2026-this-week--current-week-) | Comprehensive MVC breakdown, directory map, and automated test suite |
| 👁️ **Live UI (View)** | [`http://localhost:5000/alumni`](http://localhost:5000/alumni) | Interactive alumni search, multi-filter directory, and creation modal |
| 📘 **Swagger UI (Docs/Model)** | [`http://localhost:5000/api/swagger`](http://localhost:5000/api/swagger) | Interactive OpenAPI 3.0 API documentation & live testing portal |
| 🩺 **Health Check (Controller)**| [`http://localhost:5000/api/health`](http://localhost:5000/api/health) | Real-time CPU load, memory utilization, OS details, and server uptime |
| 📮 **Postman Test Suite** | [`postman/Alumni_Tracker_API.postman_collection.json`](./postman/Alumni_Tracker_API.postman_collection.json) | One-click importable Postman collection containing 14 automated API requests |
| 🏗️ **MVC Architecture** | [MVC Architecture Specification](#-mvc-architecture-model---view---controller) | Detailed technical breakdown of Model, View, and Controller layers |
| 📁 **File & Directory Map** | [Project Directory, Folder & File Structure](#-project-directories-folders--files-structure) | Full mapping of project files to their respective MVC roles |

---

## 📅 Weekly Development Progress Tracker (W1 — W4)

This project is developed in weekly milestones throughout the academic semester. The breakdown below details goals, completed work, affected files, and commit references based on the Git commit history:

| Week | Date Range | Focus & Deliverables | Git Commits | Status |
| :--- | :--- | :--- | :--- | :--- |
| **W1** | Sep 22 – 23, 2026 | Project Kickoff, Docker Containerization & Express Foundation | `d76cbcb`, `54eeece`, `6b9af53` | ✅ Completed |
| **W2** | Sep 23 – 29, 2026 | View Layer Foundation, Institutional UI (Home & About), Design System | `e612c51` | ✅ Completed |
| **W3** | Sep 30, 2026 | RESTful API (Users CRUD), Health Telemetry, Swagger UI, Alumni UI | `cd6b3ef` | ✅ Completed |
| **W4** | **Oct 07, 2026** | **MVC Architecture Formalization, File Map, Postman Test Suite & Blueprint** | `88f15e5` | 🚀 **This Week (Active)** |

---

### 📦 Week 1 (W1) — September 22–23, 2026: Project Kickoff & Infrastructure
* **Objective**: Establish the core infrastructure for the Alumni Tracker platform, configure containerization via Docker, and draft initial project documentation.
* **Commits**:
  * [`d76cbcb`](https://github.com/mehmetrasid0/Alumni/commit/d76cbcb) — *Initial commit: Add README and project documentation*
  * [`54eeece`](https://github.com/mehmetrasid0/Alumni/commit/54eeece) — *feat: add Docker Compose setup and Express server with basic routes*
  * [`6b9af53`](https://github.com/mehmetrasid0/Alumni/commit/6b9af53) — *docs: redesign README with mermaid diagrams, ER schema, and phased roadmap*
* **Accomplishments**:
  1. Initialized Git repository with clean `.gitignore` rule configurations.
  2. Configured containerization using `Dockerfile` (Node.js 18 Alpine) and `docker-compose.yml` with live volume reload.
  3. Initialized Express.js HTTP backend server with foundational utility routes (`GET /hello/:name`, `GET /sum/:number1/:number2`).
  4. Designed preliminary Entity-Relationship (ER) schema for MongoDB Atlas and established a multi-phased development roadmap.
* **Related Files**: `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `server/server.js`, `README.md`.

---

### 🎨 Week 2 (W2) — September 23–29, 2026: View Layer & Institutional Web UI
* **Objective**: Build responsive, professional frontend views for the application landing page and institutional about page.
* **Commits**:
  * [`e612c51`](https://github.com/mehmetrasid0/Alumni/commit/e612c51) — *feat: add homepage UI and about page with developer info*
* **Accomplishments**:
  1. **Landing Page (`server/public/index.html`)**: Designed greeting hero banner, real-time platform statistics counters, feature highlight cards, and call-to-action buttons.
  2. **About Page (`server/public/about.html`)**: Authored academic project overview for Istanbul Yeni Yüzyıl University (Information Systems / YBS, 3rd Year), vision, mission, and developer biography.
  3. **Global Design System (`server/public/css/style.css`)**: Built unified CSS design tokens utilizing an institutional Navy (`--navy-900`) and Gold (`--gold-400`) palette, typography scale, responsive CSS Grid/Flexbox layouts, and mobile drawer navigation.
  4. Configured static asset delivery using Express static middleware (`express.static('public')`).
* **Related Files**: `server/public/index.html`, `server/public/about.html`, `server/public/css/style.css`, `server/server.js`.

---

### ⚡ Week 3 (W3) — September 30, 2026: RESTful API, Health Telemetry, Swagger & Alumni Dashboard
* **Objective**: Implement a full-featured RESTful CRUD API for alumni management, integrate Swagger documentation, and construct an interactive client-side alumni directory.
* **Commits**:
  * [`cd6b3ef`](https://github.com/mehmetrasid0/Alumni/commit/cd6b3ef) — *feat: Swagger API docs, health endpoint, users CRUD, alumni UI*
* **Accomplishments**:
  1. **Users RESTful CRUD API**:
     * `GET /api/users` (List all alumni records)
     * `GET /api/users/:id` (Fetch single user by ID)
     * `POST /api/users` (Add new alumni record with email uniqueness validation)
     * `PUT /api/users/:id` (Full record update with mandatory field enforcement)
     * `PATCH /api/users/:id` (Partial field update preserving entity identity)
     * `DELETE /api/users/:id` (Remove record from data store)
  2. **Multipart & Form Parsing**: Integrated `multer` middleware alongside standard body parsers to support `application/json`, `multipart/form-data`, and `application/x-www-form-urlencoded`.
  3. **System Telemetry & Health Check (`GET /api/health`)**: Built comprehensive hardware telemetry endpoint reporting per-core CPU load, system and process RAM usage, operating system details, and uptime with health status classification (`healthy`, `warning`, `critical`).
  4. **Swagger UI Portal (`/api/swagger`)**: Integrated OpenAPI 3.0 specification (`swagger.js`) providing browser-based interactive API testing with "Try it out" capability.
  5. **Interactive Alumni Dashboard (`server/public/alumni.html`)**:
     * Real-time client-side search across names, companies, roles, and emails.
     * Reactive dropdown filtering by academic department and graduation year.
     * Dynamic DOM card rendering engine with automated avatar initials generation.
     * Asynchronous modal dialog for adding new alumni records using `fetch()`.
     * Instant toast notification feedback system.
* **Related Files**: `server/server.js`, `server/swagger.js`, `server/public/alumni.html`, `server/public/css/style.css`, `server/package.json`.

---

### 🚀 Week 4 (W4) — October 07, 2026 (THIS WEEK / CURRENT WEEK ⭐)
* **Objective**: Formalize the **Model-View-Controller (MVC)** architectural pattern, document directory/folder/file responsibilities, produce end-to-end request lifecycle diagrams, build a standardized Postman API test suite, and organize the repository layout.
* **Focus**: Architectural Integrity, Layer Separation (MVC), Test Automation & Clean Project Template
* **This Week's Accomplishments (Instructor Evaluation Checklist)**:
  1. **Comprehensive MVC Architecture Documentation**:
     * **Model Layer**: Documented `server/swagger.js` OpenAPI data models (`User`, `UserInput`, `UserPatch`) and `server/server.js` in-memory state management and business validation rules.
     * **View Layer**: Documented `server/public/` presentation assets (`index.html`, `about.html`, `alumni.html`), design system tokens (`css/style.css`), and Swagger UI.
     * **Controller Layer**: Documented `server/server.js` middleware pipeline, page view dispatchers, CRUD business logic handlers, and diagnostics controller.
  2. **Directory, Folder & File Architecture Map**:
     * Mapped every file in the repository to its architectural role (`[Model]`, `[View]`, `[Controller]`, `[DevOps]`, `[Config]`, `[Testing]`) and formulated an exhaustive Component Responsibility Matrix.
  3. **Mermaid Flow & Sequence Diagrams**:
     * High-level MVC interaction diagram illustrating decoupled layer communications.
     * 10-step sequence diagram tracing user submission in the View $\rightarrow$ validation & mutation in the Controller/Model $\rightarrow$ HTTP response $\rightarrow$ DOM update in the View.
  4. **Postman API Test Collection**:
     * Authored and exported [`postman/Alumni_Tracker_API.postman_collection.json`](./postman/Alumni_Tracker_API.postman_collection.json) containing 14 ready-to-execute automated requests covering CRUD, Health Telemetry, Utilities, and Web Pages.
  5. **Modular MVC Scaling Blueprint**:
     * Outlined the future decomposition plan for segregating monolithic controller code into dedicated `models/`, `views/`, `controllers/`, `routes/`, and `middleware/` folders during Phase 5 (MongoDB Atlas + JWT Auth).
* **Evaluation Reference Links**:
  * 📖 **MVC Specification**: [🏗️ MVC Architecture](#-mvc-architecture-model---view---controller)
  * 📁 **Directory Map**: [📁 Project Directories, Folders & Files Structure](#-project-directories-folders--files-structure)
  * 🌐 **Live Web UI**: [`http://localhost:5000/alumni`](http://localhost:5000/alumni)
  * 📘 **Swagger UI**: [`http://localhost:5000/api/swagger`](http://localhost:5000/api/swagger)
  * 🩺 **Health Telemetry**: [`http://localhost:5000/api/health`](http://localhost:5000/api/health)
  * 📮 **Postman Test Suite**: [`postman/Alumni_Tracker_API.postman_collection.json`](./postman/Alumni_Tracker_API.postman_collection.json)

---

## 🏛️ System Architecture

```mermaid
graph TD
    User(["🌐 Web Client / Browser"]) -->|HTTP Requests| View["👁️ View Layer: Static HTML / CSS / Vanilla JS :5000"]
    View -->|REST API Calls via Fetch| Controller["🎮 Controller Layer: Express.js Routing & Handlers :5000"]
    Controller -->|CRUD & Validation| Model["🧠 Model Layer: In-Memory Store & Swagger Schemas"]
    Controller -.->|Target DB Integration| DB[("MongoDB Atlas via Mongoose")]
    Controller -->|Interactive API Docs| SwaggerUI["📘 Swagger UI: /api/swagger"]
```

---

## 🏗️ MVC Architecture (Model - View - Controller)

The **Alumni Tracker** application is designed following the **Model-View-Controller (MVC)** architectural pattern. This pattern separates the application into three interconnected components, decoupling internal representations of information from the ways that information is presented to and accepted from the user.

```mermaid
graph TD
    subgraph VIEW_LAYER ["👁️ VIEW LAYER (Client Presentation)"]
        V_Home["index.html<br/>(Landing Page)"]
        V_About["about.html<br/>(About Page)"]
        V_Alumni["alumni.html<br/>(Alumni Directory & Form)"]
        V_CSS["css/style.css<br/>(Design Tokens & Layout)"]
        V_Swagger["Swagger UI<br/>(/api/swagger)"]
    end

    subgraph CONTROLLER_LAYER ["🎮 CONTROLLER LAYER (Application Logic)"]
        C_Middleware["Middleware Pipeline<br/>(express.json, urlencoded, multer)"]
        C_ViewRoutes["View Controllers<br/>(Route to static HTML pages)"]
        C_ApiRoutes["User API Controllers<br/>(CRUD: GET, POST, PUT, PATCH, DELETE)"]
        C_Health["Diagnostics Controller<br/>(GET /api/health)"]
        C_Util["Utility Controllers<br/>(GET /hello, GET /sum)"]
    end

    subgraph MODEL_LAYER ["🧠 MODEL LAYER (Data & Schema)"]
        M_Memory["In-Memory Data Store<br/>(users array & nextId counter)"]
        M_Validation["Business Rules & Validation<br/>(Required fields, Email uniqueness)"]
        M_Swagger["OpenAPI 3.0 Schemas<br/>(User, UserInput, UserPatch)"]
        M_TargetDB[("Future: MongoDB + Mongoose<br/>(User & Alumni Schemas)")]
    end

    User(["👤 End User"]) -->|Interacts with UI| VIEW_LAYER
    VIEW_LAYER -->|Dispatches HTTP Requests| C_Middleware
    C_Middleware --> C_ViewRoutes
    C_Middleware --> C_ApiRoutes
    C_Middleware --> C_Health
    C_Middleware --> C_Util

    C_ApiRoutes -->|Queries / Validates / Modifies| M_Memory
    C_ApiRoutes -.->|Conforms to Schemas| M_Swagger
    C_ApiRoutes -.->|Target Persistence| M_TargetDB

    M_Memory -->|Returns State / Records| C_ApiRoutes
    C_ApiRoutes -->|JSON Response (200, 201, 400, 404, 409)| VIEW_LAYER
    C_ViewRoutes -->|Serves HTML Pages| VIEW_LAYER
    VIEW_LAYER -->|Renders Dynamic Cards & Feedback| User
```

---

### 🧠 1. Model Layer (Data & Schema Contracts)
The **Model** represents core data structures, business logic constraints, and schema validations. It manages the state and rules governing alumni entities.

* **Current Implementation (`server/models/User.js` & `server/swagger.js`)**:
  * **User Model Class (`server/models/User.js`)**:
    * Encapsulates all data state and business validation without requiring an external database connection.
    * Implements comprehensive **CRUD methods**:
      * `findAll(filters)`: Retrieves the alumni collection with optional keyword search, department, and graduation year filtering.
      * `findById(id)`: Fetches a single user record by numeric ID.
      * `findByEmail(email)`: Queries user by email for duplicate checks and authentication.
      * `create(userData)`: Validates required fields, enforces email uniqueness, auto-increments primary ID, and timestamps creation.
      * `update(id, updateData, isPartial)`: Handles both full entity replacement (`PUT`) and selective field mutations (`PATCH`) while guarding immutable fields.
      * `delete(id)`: Removes user record from the data store by ID.
      * `count()`: Returns active total record count.
  * **Schema Definition & Data Contracts (`server/swagger.js`)**:
    * `User`: Complete entity model (`id`, `name`, `email`, `graduationYear`, `department`, `company`, `role`).
    * `UserInput`: Validation schema for incoming registration payloads.
    * `UserPatch`: Validation schema for selective field modifications.
    * `HealthCheckResponse`: Specification contract for system diagnostics telemetry.
* **Target Persistence Layer**:
  * Mongoose ODM models (`models/User.js`, `models/Alumni.js`) mapped to MongoDB Atlas cloud collections.

---

### 👁️ 2. View Layer (User Interface & Presentation)
The **View** is responsible for presenting data to the user, capturing user interactions, and rendering visual feedback.

* **Current Implementation (`server/public/`)**:
  * **`index.html` (Landing View)**: Brand hero section, quick navigation, key university information, and platform statistics overview.
  * **`about.html` (Informational View)**: Project motivation, academic department curriculum context (Istanbul Yeni Yüzyıl University YBS), and development background.
  * **`alumni.html` (Dynamic Alumni Directory View)**:
    * **Reactive Search & Filtering**: Real-time client-side search across names, emails, companies, and roles, alongside department and graduation year select filters.
    * **Card Generator Engine**: Dynamic DOM generation converting user objects into styled card components with initials avatars and metadata tags.
    * **Modal Dialog & Form Handling**: Intercepts user inputs, formats JSON payloads, and communicates asynchronously with backend endpoints via `fetch()`.
    * **Toast Notification System**: Real-time feedback alerts for successful operations or HTTP errors.
  * **`css/style.css` (Visual Design System)**:
    * CSS Custom Properties (design tokens for colors: `--navy-900`, `--gold-400`, typography, elevation shadows, transitions).
    * Responsive CSS Grid and Flexbox layouts supporting desktop, tablet, and mobile breakpoints.
  * **Swagger UI View (`/api/swagger`)**:
    * Interactive documentation portal allowing live exploration, testing, and debugging of all API endpoints directly within the browser.

---

### 🎮 3. Controller Layer (Routing & Request Orchestration)
The **Controller** acts as the intermediate coordinator. It intercepts incoming HTTP requests, applies middleware processing, invokes validation on the Model, updates data, and returns appropriate HTTP status codes and response payloads.

* **Current Implementation (`server/server.js`)**:
  * **Middleware Pipeline**:
    * `express.json()`: Parses incoming JSON request payloads.
    * `express.urlencoded({ extended: true })`: Handles standard form-encoded data.
    * `multer().none()`: Enables parsing of `multipart/form-data` without file storage.
    * `express.static('public')`: Delivers view assets (HTML, CSS, static files).
  * **View Routing Controllers**:
    * `GET /` $\rightarrow$ Serves `index.html`
    * `GET /about` $\rightarrow$ Serves `about.html`
    * `GET /alumni` $\rightarrow$ Serves `alumni.html`
  * **User CRUD API Controllers**:
    * `GET /api/users`: Queries model for all users; returns HTTP 200 with record count and payload.
    * `GET /api/users/:id`: Extracts `:id` parameter; returns HTTP 200 or HTTP 404 with error message.
    * `POST /api/users`: Validates required fields, checks email uniqueness, creates new record, returns HTTP 201 Created.
    * `PUT /api/users/:id`: Replaces existing record, enforces all required attributes, returns HTTP 200 or 400/404/409.
    * `PATCH /api/users/:id`: Selectively modifies provided fields, validates email uniqueness if changed, returns HTTP 200.
    * `DELETE /api/users/:id`: Removes record from model collection by ID; returns HTTP 200 with deleted user info or HTTP 404.
  * **System Diagnostics & Health Controller**:
    * `GET /api/health`: Collects Node.js runtime and OS telemetry (CPU core load, memory usage, uptime, OS type, process PID) and computes status levels (`healthy`, `warning`, `critical`).
  * **Utility Controllers**:
    * `GET /hello/:name`: URL parameter greeting generator.
    * `GET /sum/:number1/:number2`: Parameterized math computation controller.

---

### 🔄 Request-Response Lifecycle Flow

The following sequence diagram illustrates how an action performed in the **View** flows through the **Controller** and **Model**, and returns updated state to the user:

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Alumni / User
    participant View as 👁️ View (alumni.html)
    participant Controller as 🎮 Controller (server.js)
    participant Model as 🧠 Model (In-Memory / Schemas)

    User->>View: 1. Opens "Add Alumni" modal & submits form
    View->>Controller: 2. POST /api/users (JSON payload via fetch)
    Note over Controller: Validates name & email presence<br/>Checks email uniqueness
    alt Validation Failed (Missing fields or duplicate email)
        Controller-->>View: 3a. Return HTTP 400 or HTTP 409 (Error JSON)
        View-->>User: 4a. Display error toast ("Already registered / Required fields missing")
    else Validation Succeeded
        Controller->>Model: 3b. Create new user object with nextId++ & push to array
        Model-->>Controller: 4b. Confirm saved entity
        Controller-->>View: 5. Return HTTP 201 Created (Success JSON)
        View->>Controller: 6. GET /api/users (Trigger automatic directory refresh)
        Controller->>Model: 7. Query all alumni records
        Model-->>Controller: 8. Return users array
        Controller-->>View: 9. Return HTTP 200 OK (Updated alumni array)
        View-->>User: 10. Close modal, render updated cards & show success toast
    end
```

---

## 📁 Project Directories, Folders & Files Structure

The comprehensive mapping below details every directory, folder, and file across the project, identifying its exact architectural layer and purpose:

```text
alumni-tracker/
│
├── .postman/                                   # [Testing Configuration]
│   └── resources.yaml                          # Postman workspace definition & local metadata
│
├── postman/                                    # [API Testing & Verification]
│   ├── collections/                            # Automated API request test collections
│   ├── documents/                              # Supplementary API documentation & notes
│   ├── environments/                           # Postman environment variables (Local / Docker)
│   ├── flows/                                  # API workflow sequences & automation
│   ├── globals/                                # Global variable definitions
│   │   └── workspace.globals.yaml
│   ├── mocks/                                  # Mock server configurations
│   └── specs/                                  # OpenAPI / API specifications
│
└── Alumni/                                     # [Main Application Workspace]
    ├── .dockerignore                           # [DevOps] Excludes node_modules & temp files from Docker context
    ├── .gitignore                              # [VCS] Git version control exclusion rules
    ├── Dockerfile                              # [DevOps] Node.js 18 Alpine container image specification
    ├── docker-compose.yml                      # [DevOps] Multi-container orchestration, port mapping & live volume mount
    ├── README.md                               # [Documentation] Comprehensive project documentation & MVC guide
    │
    └── server/                                 # [Application Server Root]
        ├── .env                                # [Config] Environment variables (PORT=5000, NODE_ENV=development)
        ├── package.json                        # [Manifest] Project metadata, NPM dependencies & run scripts
        ├── package-lock.json                   # [Manifest] Deterministic dependency lockfile
        │
        ├── models/                             # 🧠 [MODEL LAYER]
        │   └── User.js                         # In-memory User Model with complete CRUD methods & business validation
        │
        ├── swagger.js                          # 🧠 [MODEL & SCHEMA CONTRACTS]
        │                                       # • OpenAPI 3.0 specification & Swagger UI configuration
        │                                       # • Entity schemas: User, UserInput, UserPatch
        │                                       # • Response schemas: SuccessResponse, ErrorResponse
        │                                       # • Endpoint parameter docs & HTTP status code contracts
        │
        ├── server.js                           # 🎮 [CONTROLLER & ROUTING]
        │                                       # • Express application initialization & middleware chain
        │                                       # • Delegates data operations to User Model (models/User.js)
        │                                       # • Page routing controllers: GET /, GET /about, GET /alumni
        │                                       # • User CRUD API controllers: GET, POST, PUT, PATCH, DELETE /api/users
        │                                       # • System health diagnostics controller: GET /api/health
        │                                       # • Utility calculation controllers: GET /hello, GET /sum
        │                                       # • Server lifecycle listener on configured PORT
        │
        └── public/                             # 👁️ [VIEW LAYER] Client-Facing Presentation
            ├── index.html                      # [View - Home] Landing page, platform highlights & call to action
            ├── about.html                      # [View - About] University, department (YBS) & project mission info
            ├── alumni.html                     # [View - Alumni] Main interactive directory:
            │                                   #   • Real-time search by keyword (name, company, role)
            │                                   #   • Department & graduation year dropdown filters
            │                                   #   • Dynamic card grid rendering with avatar initials
            │                                   #   • New alumni addition modal dialog
            │                                   #   • Toast alert notification component
            │                                   #   • Responsive mobile navigation drawer
            │
            └── css/
                └── style.css                   # [View - Styling] Global stylesheet:
                                                #   • Design tokens (Navy/Gold university palette)
                                                #   • CSS Grid, Flexbox & responsive breakpoints
                                                #   • Animations, card micro-interactions & modals
```

---

### 📊 Component Mapping & Responsibility Matrix

| Path | MVC Layer | Component Type | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **`Alumni/server/models/User.js`** | **Model** | Model Class (ES6) | In-memory User data store and complete CRUD operations (`findAll`, `findById`, `findByEmail`, `create`, `update`, `delete`). |
| **`Alumni/server/swagger.js`** | **Model** | Schema Contracts | Defines formal OpenAPI data models (`User`, `UserInput`, `UserPatch`), constraints, and examples. |
| **`Alumni/server/public/index.html`** | **View** | Presentation (HTML5) | Application landing page with hero banner, feature highlights, and navigation links. |
| **`Alumni/server/public/about.html`** | **View** | Presentation (HTML5) | Department context (Istanbul Yeni Yüzyıl University YBS), project objectives, and author details. |
| **`Alumni/server/public/alumni.html`** | **View** | Interactive UI (HTML5 + JS) | Search input, filter selectors, alumni card grid rendering, modal form, and toast alerts. |
| **`Alumni/server/public/css/style.css`** | **View** | Styling (CSS3) | Design tokens, color system, typography, animations, responsive layout rules, card styling. |
| **`http://localhost:5000/api/swagger`** | **View** | API UI (Swagger) | Interactive OpenAPI 3.0 browser view for testing endpoints and inspecting model schemas. |
| **`Alumni/server/server.js`** *(Routes)* | **Controller** | Router & Handler | Dispatches HTTP requests to appropriate view loaders or REST API controller handlers. |
| **`Alumni/server/server.js`** *(CRUD)* | **Controller** | Business Logic | Validates input formats, delegates CRUD operations to User Model, and manages HTTP responses. |
| **`Alumni/server/server.js`** *(Health)* | **Controller** | Diagnostics | Computes CPU core utilization, memory thresholds, OS metrics, and uptime statistics. |
| **`Alumni/Dockerfile`** | **DevOps** | Containerization | Defines container build instructions for Node.js 18 Alpine runtime environment. |
| **`Alumni/docker-compose.yml`** | **DevOps** | Orchestration | Coordinates container startup, port forwarding (`5000:5000`), and live volume mounting. |
| **`Alumni/server/.env`** | **Config** | Environment | Stores runtime environment variables (`PORT`, `NODE_ENV`). |
| **`postman/`** | **Testing** | Verification | Houses automated Postman test suites and collections to validate controller endpoints. |

---

### 🚀 Target Modular MVC Architecture (Scaling Roadmap)

As the project expands in Phase 5 through Phase 7 (database persistence and authentication), the monolithic controller in `server.js` cleanly decomposes into modular, dedicated MVC sub-packages:

```text
Alumni/server/
├── config/
│   └── db.js                   # [Model/Config] MongoDB Atlas connection via Mongoose
├── models/
│   ├── User.js                 # [Model] Mongoose User schema & password hashing hooks
│   └── Alumni.js               # [Model] Mongoose Alumni profile schema & indexing
├── controllers/
│   ├── authController.js       # [Controller] Register, Login, JWT issuance
│   ├── alumniController.js     # [Controller] Alumni directory query, search & CRUD operations
│   ├── healthController.js     # [Controller] Health check & server telemetry
│   └── pageController.js       # [Controller] Static view serving & routing
├── routes/
│   ├── authRoutes.js           # [Routes] /api/auth routes
│   ├── alumniRoutes.js         # [Routes] /api/users & /api/alumni routes
│   └── pageRoutes.js           # [Routes] Web page routes (/, /about, /alumni)
├── middleware/
│   ├── auth.js                 # [Middleware] JWT verification & role validation
│   └── errorHandler.js         # [Middleware] Centralized HTTP error handling
├── public/                     # [View] Static views or compiled React/Vite SPA bundle
└── server.js                   # [Entry Point] Express bootstrap & middleware registration
```

---

## 🗄️ Database Schema (MongoDB Atlas - Target Model)

```mermaid
erDiagram
    USERS ||--o{ ALUMNI_PROFILES : has
    USERS {
        ObjectId _id PK
        string name "Full name"
        string email "Unique email address"
        string password "Hashed with bcrypt"
        string role "alumni | admin"
        date createdAt "Account creation date"
    }

    ALUMNI_PROFILES {
        ObjectId _id PK
        ObjectId user FK "Reference to Users"
        string studentId "University student number"
        string department "Department or major"
        number graduationYear "Year of graduation"
        string degree "Bachelor | Master | PhD"
        string currentCompany "Current employer"
        string jobTitle "Current position"
        string city "Current city"
        string country "Current country"
        string linkedIn "LinkedIn profile URL"
        string phone "Contact number"
        string bio "Short biography"
        array skills "List of skills"
        date updatedAt "Last profile update"
    }
```

---

## 📡 API Endpoints

### 📘 Swagger API Documentation

To interactively explore, test, and view schemas for all API endpoints, use **Swagger UI**:

| Resource | URL | Description |
| :--- | :--- | :--- |
| **Swagger UI** | [`/api/swagger`](http://localhost:5000/api/swagger) | Interactive API documentation — Test directly with "Try it out" |
| **Swagger JSON** | [`/api/swagger.json`](http://localhost:5000/api/swagger.json) | OpenAPI 3.0 specification in raw JSON format |

> **💡 Tip:** Click the **"Try it out"** button next to any endpoint in Swagger UI to dispatch live API requests straight from your browser.

#### Testing Steps via Swagger UI
1. Open [`http://localhost:5000/api/swagger`](http://localhost:5000/api/swagger) in your browser.
2. Expand the endpoint you want to test.
3. Click the **"Try it out"** button.
4. Fill in any required request body or path parameters.
5. Click the **"Execute"** button.
6. Inspect the live response code, headers, and body.

### Health Check
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Comprehensive server diagnostics telemetry (CPU, memory, OS, runtime info) |

### Users (CRUD)
| Method | Endpoint | Description | Accepted Formats |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | List all alumni users | — |
| `GET` | `/api/users/:id` | Fetch single user by ID | — |
| `POST` | `/api/users` | Create new alumni user | JSON, form-data, x-www-form-urlencoded |
| `PUT` | `/api/users/:id` | Fully update user (all fields required) | JSON, form-data, x-www-form-urlencoded |
| `PATCH` | `/api/users/:id` | Partially update user (selective fields) | JSON, form-data, x-www-form-urlencoded |
| `DELETE` | `/api/users/:id` | Delete user record by ID | — |

### Utility
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/hello/:name` | Returns greeting message: `Hello,{name}!` |
| `GET` | `/sum/:num1/:num2` | Returns sum of two numbers |

### Pages (View Layer)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Home / Landing page (`index.html`) |
| `GET` | `/about` | About page (`about.html`) |
| `GET` | `/alumni` | Alumni directory & management UI (`alumni.html`) |
| `GET` | `/api/swagger` | Interactive Swagger UI portal |

### Example API Requests

#### List All Users
```bash
curl http://localhost:5000/api/users
```

#### Create New User (JSON)
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Ali Vural","email":"ali@alumni.edu","graduationYear":2023,"department":"Software Engineering","company":"SAP","role":"Backend Developer"}'
```

#### Partially Update User (PATCH)
```bash
curl -X PATCH http://localhost:5000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"company":"Tesla","role":"Senior Engineer"}'
```

#### Delete User
```bash
curl -X DELETE http://localhost:5000/api/users/1
```

---

## ⚡ Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Engine & Docker Compose)
- [Git](https://git-scm.com/)

### 1. Clone & Configure Environment
```bash
git clone https://github.com/mehmetrasid0/Alumni.git
cd Alumni
```

Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://your_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### 2. Run with Docker Compose
Start the backend with a single command:
```bash
docker compose up -d --build
```

### 3. Service Endpoints
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Swagger UI**: [http://localhost:5000/api/swagger](http://localhost:5000/api/swagger) — Interactive API documentation
- **Swagger JSON**: [http://localhost:5000/api/swagger.json](http://localhost:5000/api/swagger.json)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Alumni Web Directory**: [http://localhost:5000/alumni](http://localhost:5000/alumni)

### 4. Useful Commands
```bash
docker logs alumni          # View container logs
docker restart alumni       # Restart the container
docker compose down         # Stop and remove containers
```

> **💡 Live Reload:** The `server/` directory is mounted as a volume. Code changes are automatically reflected inside the container thanks to **nodemon** with legacy watch mode — no rebuild needed!

### Alternative: Run Without Docker
```bash
cd server
npm install
npm run dev
```

---

## 🗺️ Roadmap & Weekly Milestones

- [x] **Phase 1 (W1): Environment & Architecture Setup** *(Completed)*
  - Git repository, `.gitignore`, and initial README documentation.
  - Node.js 18 Alpine `Dockerfile` and `docker-compose.yml` configuration.
  - Express.js HTTP backend server with foundational utility routes (`/hello`, `/sum`).
- [x] **Phase 2 (W2): View Layer & Core Web UI** *(Completed)*
  - Application landing page with hero greeting, live counters, and feature cards (`index.html`).
  - Institutional about page with academic context, mission, and developer bio (`about.html`).
  - Responsive global design system with custom CSS properties (`css/style.css`).
- [x] **Phase 3 (W3): RESTful API, Health Telemetry & Swagger UI** *(Completed)*
  - Users CRUD operations (`GET`, `POST`, `PUT`, `PATCH`, `DELETE /api/users`).
  - `multer` integration for `multipart/form-data` and URL-encoded payload handling.
  - Server CPU, RAM, OS, and uptime telemetry endpoint (`/api/health`).
  - OpenAPI 3.0 specification and interactive Swagger UI documentation (`/api/swagger`).
  - Interactive alumni dashboard with real-time search, filters, and modal form (`alumni.html`).
- [x] **Phase 4 (W4 - This Week): MVC Architecture & Postman Test Suite** *(Completed ⭐)*
  - Formal Model-View-Controller (MVC) architectural analysis and detailed technical documentation.
  - Comprehensive directory, folder, and file mapping matrix with explicit MVC role tags.
  - Mermaid end-to-end request-response sequence diagrams.
  - Postman API test collection containing 14 automated requests.
  - Blueprint for modular MVC directory scaling.
- [ ] **Phase 5 (W5): Database Persistence (MongoDB Atlas) & JWT Authentication**
  - Connect Mongoose ODM User and Alumni schemas to MongoDB Atlas cloud database.
  - Password hashing with bcrypt and JWT token-based authentication (Auth Middleware).
  - Role-based access control (Admin / Alumni).
- [ ] **Phase 6 (W6): Advanced Alumni Management, Admin Portal & Reporting**
  - Event management and reunion module.
  - Export alumni records (CSV and PDF formats).
  - Admin analytics dashboard and verification workflows.
- [ ] **Phase 7 (W7): Frontend SPA (React + Vite) Migration & Cloud Deployment**
  - Refactor frontend views into React components with Vite build system.
  - Production Docker builds and automated CI/CD deployment to cloud hosting.

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
