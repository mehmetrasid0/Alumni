# 🗄️ Data Design Documentation (DDD)

> **Document Type:** Data Design Document (DDD) / Database Specification  
> **Project:** Alumni Tracker  
> **Institution:** Istanbul University — Faculty of Economics, Department of Management Information Systems (YBS), 3rd Year  
> **Author:** [Mehmet Raşid Ünlüel](https://github.com/mehmetrasid0)  
> **Course:** Web Programming / Database Management & System Design  
> **Primary Documentation:** [⬅️ Return to Main Project Documentation (README.md)](./README.md)  
> **API & Schema Explorer:** [Interactive Swagger UI (`/api/swagger`)](http://localhost:5000/api/swagger)

---

## 📑 Table of Contents

1. [🎯 Executive Summary & Data Objectives](#-executive-summary--data-objectives)
2. [🏆 Database Engine Selection & Architectural Rationale](#-database-engine-selection--architectural-rationale)
3. [🧠 Conceptual Data Model (CDM)](#-conceptual-data-model-cdm)
4. [📐 Logical Data Model (LDM) & Normalization](#-logical-data-model-ldm--normalization)
5. [📖 Comprehensive Data Dictionary (Veri Sözlüğü)](#-comprehensive-data-dictionary-veri-sözlüğü)
   - [5.1 `users` Table Dictionary](#51-users-table-dictionary)
   - [5.2 `alumni_profiles` Table Dictionary](#52-alumni_profiles-table-dictionary)
   - [5.3 `announcements` Table Dictionary](#53-announcements-table-dictionary)
6. [⚙️ Physical Data Model (PDM) & PostgreSQL DDL](#-physical-data-model-pdm--postgresql-ddl)
   - [6.1 Complete PostgreSQL DDL Script](#61-complete-postgresql-ddl-script)
   - [6.2 Indexing Strategy & Performance Optimization](#62-indexing-strategy--performance-optimization)
   - [6.3 Constraints & Invariant Enforcement](#63-constraints--invariant-enforcement)
7. [🔄 In-Memory to Persistent Storage Transition Strategy](#-in-memory-to-persistent-storage-transition-strategy)
8. [🔐 Data Security, Privacy & KVKK/GDPR Compliance](#-data-security-privacy--kvkkgdpr-compliance)
9. [💾 Backup, Disaster Recovery & Docker Volume Management](#-backup-disaster-recovery--docker-volume-management)
10. [🔗 Integration Matrix: Codebase & API Mapping](#-integration-matrix-codebase--api-mapping)
11. [🌱 Factory & Seeder Data Provisioning Architecture](#-factory--seeder-data-provisioning-architecture)
    - [11.1 Factory Pattern Implementation](#111-factory-pattern-implementation)
    - [11.2 Seeder Orchestration & Lifecycle](#112-seeder-orchestration--lifecycle)
    - [11.3 CLI Execution & Automated Testing](#113-cli-execution--automated-testing)

---

## 🎯 Executive Summary & Data Objectives

The **Data Design Documentation (DDD)** defines the complete data architecture, schema specifications, entity relationships, integrity constraints, and persistence mechanisms for the **Alumni Tracker** platform.

The system manages critical academic and career records for university graduates, departmental administration, and campus communication bulletins. The data layer is engineered around five primary objectives:

1. **Strict Relational Integrity (ACID):** Absolute data consistency across alumni profiles, graduation verification, authentication credentials, and authored notices.
2. **Semi-Structured Agility (Hybrid JSONB):** Efficient storage and instant querying of multi-value attributes (e.g. professional skills, portfolio links) without costly schema migrations.
3. **High-Speed Query Performance:** Optimized multi-criteria directory search (filtering by graduation year, department, employer, and skills) through tailored B-Tree and GIN indexes.
4. **Data Security & Privacy:** Strict separation of authentication credentials from public directory data, bcrypt password hashing, and compliance with institutional data governance.
5. **Clean Architectural Decoupling:** Decoupling Model abstractions from physical storage engines, transitioning seamlessly from current In-Memory JavaScript stores to persistent Dockerized PostgreSQL.

---

## 🏆 Database Engine Selection & Architectural Rationale

An exhaustive architectural trade-off analysis was conducted across three industry-standard paradigms: **MongoDB (NoSQL Document Store)**, **MySQL (Traditional RDBMS)**, and **PostgreSQL (Advanced Object-Relational DBMS)**.

```mermaid
graph TD
    REQ["📋 Alumni Tracker Data Requirements"] --> R1["Strict Foreign Keys & Cascade Deletes"]
    REQ --> R2["Multi-criteria Filtering (Year, Dept, Role)"]
    REQ --> R3["Dynamic Skills Array (e.g. ['Node.js', 'Docker'])"]
    REQ --> R4["Full-Text Directory Search (Bio, Role, Company)"]
    REQ --> R5["Zero Cloud Dependency for Local Docker Dev"]

    R1 --> POSTGRES["🏆 PostgreSQL (Selected)"]
    R2 --> POSTGRES
    R3 --> POSTGRES
    R4 --> POSTGRES
    R5 --> POSTGRES

    subgraph REJECTED ["Excluded Engines"]
        MONGO["❌ MongoDB: Weak referential integrity, risk of orphaned alumni records"]
        MYSQL["❌ MySQL: Primitive JSON support, no GIN indexing, weak array operations"]
    end
```

### Architectural Comparison Matrix

| Evaluation Dimension | NoSQL (MongoDB) | MySQL (InnoDB) | PostgreSQL 15+ (Selected 🥇) |
| :--- | :--- | :--- | :--- |
| **Data Integrity & Foreign Keys** | ⚠️ Application-level joins; risk of orphaned data | ✅ Strong foreign key & cascade support | 🏆 **Superior**: ACID compliance, deferred constraints, robust referential cascade |
| **Semi-Structured Fields (Skills)** | ✅ Native BSON document model | ⚠️ Basic JSON data type, no GIN indexing | 🏆 **Best-of-Both-Worlds**: Native **`JSONB`** binary format with high-speed **GIN** indexing |
| **Directory Search & Indexing** | ⚠️ Requires external Atlas Search / Elastic | ⚠️ Rudimentary `LIKE` & basic FULLTEXT | 🏆 **Native Full-Text Search**: Built-in `tsvector` and `tsquery` text search engine |
| **Data Types & Standardization** | ⚠️ Schemaless (Schema enforcement in ODM) | ⚠️ Lacks native UUID & Array data types | 🏆 **Rich Native Types**: `UUID`, `JSONB`, `TIMESTAMP WITH TIME ZONE`, native Enums |
| **Container & Dev Environment** | ⚠️ Resource heavy, external Atlas setup | ✅ Lightweight | 🏆 **Flawless**: Official `postgres:alpine` image runs with <60MB RAM in Docker Compose |
| **ORM / Driver Ecosystem** | Mongoose ODM | mysql2 / Sequelize | Prisma ORM, Sequelize, and native `pg` connection pool |

**Conclusion:** **PostgreSQL** is selected as the primary database management system. It provides the rock-solid relational integrity demanded by academic records while offering native NoSQL flexibility (`JSONB`) for dynamic career profiles.

---

## 🧠 Conceptual Data Model (CDM)

The Conceptual Data Model identifies core real-world business entities and the fundamental cardinality governing their interactions, independent of physical storage implementation:

```mermaid
erDiagram
    USER ||--|| ALUMNI_PROFILE : "has exactly one (1:1)"
    USER ||--o{ ANNOUNCEMENT : "authors zero or many (1:N)"
    USER ||--o{ AUDIT_LOG : "triggers actions recorded in (1:N)"
    DEPARTMENT ||--o{ ALUMNI_PROFILE : "confers degree to (1:N)"

    USER {
        identifier user_id
        string email
        string credential
        string role
        timestamp registration_date
    }

    ALUMNI_PROFILE {
        identifier profile_id
        string student_matriculation_number
        string academic_department
        integer graduation_year
        string conferred_degree
        string employment_details
        string geographic_location
        list professional_skills
    }

    ANNOUNCEMENT {
        identifier bulletin_id
        string headline
        text body_text
        string topic_category
        string urgency_level
        string publication_state
        boolean is_pinned
        timestamp publication_timestamp
    }
```

### Conceptual Business Rules & Invariants
1. **One-to-One Identity Mapping (`USER` ➔ `ALUMNI_PROFILE`):** Every alumni profile must belong to exactly one user account. Deleting a user account cascades to remove the corresponding alumni profile.
2. **One-to-Many Authorship (`USER` ➔ `ANNOUNCEMENT`):** Announcements are authored by users with elevated roles (`admin` or departmental coordinator).
3. **Unique Matriculation:** A student matriculation number (`student_id`) is permanently unique and immutable once verified.
4. **Email Identity:** An email address serves as the unique login principal across the entire application ecosystem.

---

## 📐 Logical Data Model (LDM) & Normalization

The Logical Data Model refines the conceptual entities into a normalized relational schema adhering to **Third Normal Form (3NF)**:

```mermaid
erDiagram
    USERS ||--|| ALUMNI_PROFILES : "1:1 via user_id"
    USERS ||--o{ ANNOUNCEMENTS : "1:N via author_id"

    USERS {
        UUID id PK "Primary Key"
        VARCHAR email UK "Candidate Key (Unique)"
        VARCHAR password_hash "Encrypted Credential"
        VARCHAR role "Role classification"
        TIMESTAMP created_at "Audit timestamp"
        TIMESTAMP updated_at "Audit timestamp"
    }

    ALUMNI_PROFILES {
        UUID id PK "Primary Key"
        UUID user_id FK,UK "Foreign Key referencing USERS.id (1:1)"
        VARCHAR student_id UK "Unique Student Registration No"
        VARCHAR full_name "Full Alumnus Legal Name"
        VARCHAR department "Academic Department"
        INTEGER graduation_year "Conferral Year"
        VARCHAR degree "Degree Level"
        VARCHAR current_company "Current Employer"
        VARCHAR job_title "Professional Role"
        VARCHAR city "City of Residence"
        VARCHAR country "Country of Residence"
        VARCHAR linkedin_url "Professional Profile URL"
        VARCHAR phone "Contact Phone"
        TEXT bio "Professional Summary"
        JSONB skills "Structured Competencies"
        TIMESTAMP updated_at "Modification timestamp"
    }

    ANNOUNCEMENTS {
        SERIAL id PK "Primary Key (Auto-increment)"
        UUID author_id FK "Foreign Key referencing USERS.id"
        VARCHAR title "Bulletin Title"
        TEXT content "Bulletin Body"
        VARCHAR category "Classification"
        VARCHAR priority "Urgency Level"
        VARCHAR status "Workflow State"
        VARCHAR target_audience "Recipient Segment"
        BOOLEAN pinned "Pin State"
        TIMESTAMP created_at "Creation timestamp"
        TIMESTAMP updated_at "Modification timestamp"
    }
```

### Normalization Validation (3NF Audit)

* **First Normal Form (1NF):**
  * All tables have a primary key (`id`).
  * Atomic column values are enforced for scalar attributes.
  * Multi-valued competencies (`skills`) are stored using PostgreSQL's binary JSON (`JSONB`), avoiding non-atomic delimited string anti-patterns (`"node,docker,sql"`).
* **Second Normal Form (2NF):**
  * All non-key attributes are fully functionally dependent on the primary key. No partial key dependencies exist (all tables use single-column primary keys: `UUID` or `SERIAL`).
* **Third Normal Form (3NF):**
  * No transitive dependencies exist. Attributes depend solely on the primary key (`A ➔ PK`, no `A ➔ B ➔ PK`).
  * Department and alumni details are segregated, ensuring profile changes do not cause update anomalies.

---

## 📖 Comprehensive Data Dictionary (Veri Sözlüğü)

### 5.1 `users` Table Dictionary

The `users` table manages authentication credentials, account lifecycle state, and role-based permissions.

| Column Name | Physical Data Type | Nullable | Key | Default Value | Description & Constraints | Validation Rules |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **`id`** | `UUID` | ❌ No | **PK** | `gen_random_uuid()` | Universally unique surrogate primary key. | Valid RFC 4122 UUID v4 |
| **`email`** | `VARCHAR(255)` | ❌ No | **UK** | *None* | Alumnus login email address. Case-insensitive unique index. | Valid email syntax, normalized lowercase |
| **`password_hash`**| `VARCHAR(255)` | ❌ No | - | *None* | Salted cryptographic password hash (bcrypt). | Non-empty string, min 60 chars |
| **`role`** | `VARCHAR(50)` | ❌ No | - | `'alumni'` | Authorization role. Enforced by CHECK constraint. | In: `('alumni', 'admin', 'coordinator')` |
| **`created_at`** | `TIMESTAMP WITH TIME ZONE` | ❌ No | - | `CURRENT_TIMESTAMP` | Account creation timestamp. | UTC timestamp |
| **`updated_at`** | `TIMESTAMP WITH TIME ZONE` | ❌ No | - | `CURRENT_TIMESTAMP` | Last profile/account update timestamp. | UTC timestamp |

---

### 5.2 `alumni_profiles` Table Dictionary

The `alumni_profiles` table stores detailed academic history, career progression, and contact details for each graduate.

| Column Name | Physical Data Type | Nullable | Key | Default Value | Description & Constraints | Validation Rules |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **`id`** | `UUID` | ❌ No | **PK** | `gen_random_uuid()` | Profile surrogate primary key. | Valid UUID v4 |
| **`user_id`** | `UUID` | ❌ No | **FK, UK**| *None* | Relational reference to `users(id)`. Enforces 1:1 relationship with `ON DELETE CASCADE`. | Must exist in `users.id` |
| **`student_id`** | `VARCHAR(50)` | ⚠️ Yes | **UK** | *None* | Unique university student number assigned by registrar. | Alphanumeric, max 50 chars |
| **`full_name`** | `VARCHAR(150)` | ❌ No | - | *None* | Alumnus legal full name (First & Last). | Min 2 chars, max 150 chars, non-empty |
| **`department`** | `VARCHAR(100)` | ❌ No | - | *None* | Academic department from which the alumnus graduated. | Max 100 chars, non-empty |
| **`graduation_year`**| `INTEGER` | ❌ No | - | *None* | Calendar year degree was conferred. | `CHECK (graduation_year BETWEEN 1950 AND 2100)` |
| **`degree`** | `VARCHAR(50)` | ⚠️ Yes | - | `'Bachelor'` | Conferred degree classification. | In: `('Bachelor', 'Master', 'PhD', 'Associate')` |
| **`current_company`**| `VARCHAR(150)`| ⚠️ Yes | - | *None* | Name of current corporate or academic employer. | Max 150 chars |
| **`job_title`** | `VARCHAR(100)` | ⚠️ Yes | - | *None* | Current professional designation or position. | Max 100 chars |
| **`city`** | `VARCHAR(100)` | ⚠️ Yes | - | *None* | City of current employment or residence. | Max 100 chars |
| **`country`** | `VARCHAR(100)` | ⚠️ Yes | - | `'Turkey'` | Country of current employment or residence. | Max 100 chars |
| **`linkedin_url`**| `VARCHAR(255)` | ⚠️ Yes | - | *None* | Public LinkedIn profile URL. | Must begin with `http://` or `https://` |
| **`phone`** | `VARCHAR(50)` | ⚠️ Yes | - | *None* | Telephone number with country code. | Max 50 chars |
| **`bio`** | `TEXT` | ⚠️ Yes | - | *None* | Freeform professional biography / summary. | Max 2000 chars |
| **`skills`** | `JSONB` | ❌ No | - | `'[]'::jsonb` | Binary JSON array of technical/managerial skills. | Must be valid JSON array of strings |
| **`updated_at`** | `TIMESTAMP WITH TIME ZONE` | ❌ No | - | `CURRENT_TIMESTAMP` | Last profile modification timestamp. | Auto-updated via trigger |

---

### 5.3 `announcements` Table Dictionary

The `announcements` table holds institutional notices, career calls, and academic bulletins.

| Column Name | Physical Data Type | Nullable | Key | Default Value | Description & Constraints | Validation Rules |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **`id`** | `SERIAL` | ❌ No | **PK** | *Auto-seq* | Incremental bulletin ID for human-readable URLs. | Positive integer |
| **`author_id`** | `UUID` | ❌ No | **FK** | *None* | Reference to `users(id)` representing the publisher. | Must exist in `users.id` |
| **`title`** | `VARCHAR(255)` | ❌ No | - | *None* | Announcement headline. | Min 3 chars, max 255 chars |
| **`content`** | `TEXT` | ❌ No | - | *None* | Full markdown or formatted announcement body. | Min 10 chars |
| **`category`** | `VARCHAR(50)` | ❌ No | - | `'General'` | Thematic bulletin classification. | In: `('Career', 'Event', 'Academic', 'General', 'Networking')` |
| **`priority`** | `VARCHAR(20)` | ❌ No | - | `'medium'` | Display and notification urgency level. | In: `('low', 'medium', 'high', 'urgent')` |
| **`status`** | `VARCHAR(20)` | ❌ No | - | `'published'` | Publication workflow state. | In: `('draft', 'published', 'archived')` |
| **`target_audience`**| `VARCHAR(100)`| ❌ No | - | `'All Alumni'`| Intended recipient group for notifications. | Max 100 chars |
| **`pinned`** | `BOOLEAN` | ❌ No | - | `FALSE` | Flag determining apex pinning in feeds. | Boolean (`TRUE`/`FALSE`) |
| **`created_at`** | `TIMESTAMP WITH TIME ZONE` | ❌ No | - | `CURRENT_TIMESTAMP` | Bulletin publication timestamp. | UTC timestamp |
| **`updated_at`** | `TIMESTAMP WITH TIME ZONE` | ❌ No | - | `CURRENT_TIMESTAMP` | Last edit timestamp. | UTC timestamp |

---

## ⚙️ Physical Data Model (PDM) & PostgreSQL DDL

### 6.1 Complete PostgreSQL DDL Script

The production-ready Data Definition Language (DDL) script creates all extensions, tables, foreign keys, check constraints, and auto-updating timestamp triggers:

```sql
-- ============================================================================
-- Alumni Tracker — Physical Data Model DDL (PostgreSQL 15+)
-- Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
-- ============================================================================

-- 1. Ensure required cryptographic extensions are active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Clean table drop for fresh environment setups (Ordered by dependency)
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS alumni_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- TABLE: users
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'alumni',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Table Constraints
    CONSTRAINT chk_users_role CHECK (role IN ('alumni', 'admin', 'coordinator')),
    CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Case-insensitive unique index on email
CREATE UNIQUE INDEX idx_users_email_lower ON users (LOWER(email));

-- ============================================================================
-- TABLE: alumni_profiles
-- ============================================================================
CREATE TABLE alumni_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    student_id VARCHAR(50),
    full_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    graduation_year INTEGER NOT NULL,
    degree VARCHAR(50) DEFAULT 'Bachelor',
    current_company VARCHAR(150),
    job_title VARCHAR(100),
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Turkey',
    linkedin_url VARCHAR(255),
    phone VARCHAR(50),
    bio TEXT,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Key Constraint (1:1 with Cascade Delete)
    CONSTRAINT fk_alumni_user FOREIGN KEY (user_id) 
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_alumni_user_id UNIQUE (user_id),
    CONSTRAINT uq_alumni_student_id UNIQUE (student_id),

    -- Value Check Constraints
    CONSTRAINT chk_alumni_graduation_year CHECK (graduation_year BETWEEN 1950 AND 2100),
    CONSTRAINT chk_alumni_degree CHECK (degree IN ('Bachelor', 'Master', 'PhD', 'Associate')),
    CONSTRAINT chk_alumni_skills_array CHECK (jsonb_typeof(skills) = 'array')
);

-- ============================================================================
-- TABLE: announcements
-- ============================================================================
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    author_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'General',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    status VARCHAR(20) NOT NULL DEFAULT 'published',
    target_audience VARCHAR(100) NOT NULL DEFAULT 'All Alumni',
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Key Constraint
    CONSTRAINT fk_announcements_author FOREIGN KEY (author_id)
        REFERENCES users (id) ON DELETE RESTRICT,

    -- Workflow Check Constraints
    CONSTRAINT chk_announcements_category CHECK (category IN ('Career', 'Event', 'Academic', 'General', 'Networking')),
    CONSTRAINT chk_announcements_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT chk_announcements_status CHECK (status IN ('draft', 'published', 'archived')),
    CONSTRAINT chk_announcements_title_length CHECK (char_length(TRIM(title)) >= 3)
);
```

---

### 6.2 Indexing Strategy & Performance Optimization

To deliver instant filtering across thousands of alumni records, a multi-tiered indexing strategy is implemented:

```sql
-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- 1. Foreign Key Performance Indexes (Fast Joins)
CREATE INDEX idx_alumni_profiles_user_id ON alumni_profiles (user_id);
CREATE INDEX idx_announcements_author_id ON announcements (author_id);

-- 2. Multi-column Compound Indexes for Directory Search
-- Speeds up filtering queries: WHERE department = 'YBS' AND graduation_year = 2023
CREATE INDEX idx_alumni_dept_grad_year ON alumni_profiles (department, graduation_year);

-- 3. GIN (Generalized Inverted Index) for Semi-Structured Skills
-- Accelerates JSONB array containment queries: WHERE skills @> '["Node.js"]'::jsonb
CREATE INDEX idx_alumni_skills_gin ON alumni_profiles USING GIN (skills);

-- 4. Full-Text Search Index for Alumni Directory
-- Enables instant keyword search across name, role, company, and bio
CREATE INDEX idx_alumni_fts ON alumni_profiles USING GIN (
    to_tsvector('simple', COALESCE(full_name, '') || ' ' || 
                          COALESCE(job_title, '') || ' ' || 
                          COALESCE(current_company, '') || ' ' || 
                          COALESCE(bio, ''))
);

-- 5. Announcement Feed Sorting Index
-- Speeds up: ORDER BY pinned DESC, created_at DESC
CREATE INDEX idx_announcements_feed_order ON announcements (pinned DESC, created_at DESC)
    WHERE status = 'published';
```

---

### 6.3 Constraints & Invariant Enforcement

```mermaid
graph TD
    subgraph APPLICATION_LEVEL ["1. APPLICATION / CONTROLLER LEVEL"]
        C1["express.json() & Form Body Parsers"]
        C2["Model Business Validation (User.js & Announcement.js)"]
    end

    subgraph DATABASE_LEVEL ["2. DATABASE / ENGINE LEVEL (Last Line of Defense)"]
        D1["PRIMARY KEY & UNIQUE (Email, Student ID, 1:1 user_id)"]
        D2["FOREIGN KEY ... ON DELETE CASCADE (Referential Integrity)"]
        D3["CHECK Constraints (Valid graduation year, Enum strings)"]
        D4["NOT NULL Constraints (Guaranteed mandatory attributes)"]
    end

    APPLICATION_LEVEL -->|Dispatches Validated Payload| DATABASE_LEVEL
```

---

## 🔄 In-Memory to Persistent Storage Transition Strategy

The codebase is engineered to transition from the current development In-Memory model to persistent PostgreSQL without modifying controller interfaces:

```mermaid
graph LR
    subgraph PRESENTATION ["Presentation / Routes"]
        R["/api/users & /api/announcements"]
    end

    subgraph CONTROLLER ["Controllers"]
        C["ApiUserController.js & ApiAnnouncementController.js"]
    end

    subgraph MODEL_ABSTRACTION ["Model Interface (DAO / Repository)"]
        M["UserModel Interface (findAll, findById, create, update, delete)"]
    end

    subgraph STORAGE_IMPL ["Storage Adapters"]
        PG["🏆 Active Production: PostgreSQL Client Pool<br/><i>(server/db.js via pg.Pool)</i>"]
    end

    R --> C
    C --> M
    M ==>|Active (Connected & Persistent)| PG
```

### Database Provisioning & Execution Status (Phase 5 — COMPLETED & OPERATIONAL ✅):
1. **CRUD Interface Integration:** Upgraded `server/models/User.js` and `server/models/Announcement.js` to execute real-time parameterized queries against `alumni-postgres` via connection pool (`server/db.js`). Controllers (`ApiUserController`, `UserController`, `ApiAnnouncementController`, `AnnouncementController`) are fully asynchronous (`async/await`).
2. **Docker Compose Service:** Configured `postgres:15-alpine` container (`alumni-postgres`), exposed port `5432:5432`, persistent named volume `postgres_data`, and automatic schema mount `./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro`.
3. **Environment Configuration:** Synchronized `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/alumni_db?schema=public` in `server/.env`, `server/.env.example`, and `env.example`.
4. **Database Schema & Seed Ingestion:** Created and executed [`database/init.sql`](./database/init.sql). All 3 tables (`users`, `alumni_profiles`, `announcements`), 6 indexes (including GIN skills and FTS), auto-update triggers, and seeded users along with announcements are live and operational in PostgreSQL.


---

## 🔐 Data Security, Privacy & KVKK/GDPR Compliance

1. **Credential Segregation:** Passwords are never stored in plaintext. They are hashed using **`bcrypt`** with a minimum work factor of 10 (`saltRounds = 10`) before storage in `users.password_hash`.
2. **PII Protection & Public Scoping:** The `users` table and `alumni_profiles` table are physically decoupled. Public directory queries (`GET /api/users`) project only non-sensitive alumni attributes, omitting password hashes and private contact numbers.
3. **SQL Injection Immunity:** All database interactions are executed using parameterized SQL queries (`$1, $2, $3...` in `pg`) or ORM query builders (Prisma), preventing SQL injection vectors entirely.
4. **Least-Privilege Database Role:** The Express web application connects using an unprivileged database user (`alumni_app`) that has only `SELECT`, `INSERT`, `UPDATE`, and `DELETE` grants, with no permissions to `DROP` tables or alter schemas.

---

## 💾 Backup, Disaster Recovery & Docker Volume Management

To prevent data loss upon container lifecycle changes (`docker compose down` / `up`):

```mermaid
graph TD
    APP["🐳 Express Backend Container (:5000)"]
    DB["🐳 PostgreSQL Container (:5432)"]
    VOL[("💾 Persistent Docker Named Volume:<br/>postgres_data")]
    BACKUP["📦 Automated Backup Dump:<br/>alumni_db_backup.sql"]

    APP -->|Network: alumni_default| DB
    DB -->|Mounts Data Directory /var/lib/postgresql/data| VOL
    DB -.->|Scheduled pg_dump| BACKUP
```

### 1. Docker Volume Configuration
```yaml
services:
  db:
    image: postgres:15-alpine
    container_name: alumni-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: alumni_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secretpassword
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### 2. Backup & Restore Commands
* **Backup (Dump Database):**
  ```bash
  docker exec -t alumni-postgres pg_dump -U postgres alumni_db > backup_alumni_db.sql
  ```
* **Restore (Rehydrate Database):**
  ```bash
  cat backup_alumni_db.sql | docker exec -i alumni-postgres psql -U postgres -d alumni_db
  ```

---

## 🔗 Integration Matrix: Codebase & API Mapping

| API Endpoint | HTTP Method | MVC Controller | Active Persistent Model (PostgreSQL DAO) | Executed PostgreSQL Query & Action |
| :--- | :---: | :--- | :--- | :--- |
| `/api/users` | `GET` | `ApiUserController.getAll` | `UserModel.findAll(filters)` | `SELECT p.*, u.email, u.role FROM alumni_profiles p JOIN users u ON p.user_id = u.id WHERE ... ORDER BY p.graduation_year DESC` |
| `/api/users/:id` | `GET` | `ApiUserController.getById` | `UserModel.findById(id)` | `SELECT p.*, u.email FROM alumni_profiles p JOIN users u ON p.user_id = u.id WHERE p.id = $1 OR p.student_id = $1` |
| `/api/users` | `POST` | `ApiUserController.create` | `UserModel.create(data)` | `BEGIN; INSERT INTO users (...) RETURNING id; INSERT INTO alumni_profiles (user_id, ...) RETURNING *; COMMIT;` |
| `/api/users/:id` | `PUT` | `ApiUserController.update` | `UserModel.update(id, data)` | `UPDATE alumni_profiles SET full_name = $1, department = $2, ... WHERE id = $N RETURNING *` |
| `/api/users/:id` | `DELETE` | `ApiUserController.delete` | `UserModel.delete(id)` | `DELETE FROM users WHERE id = $1` *(Foreign Key automatically cascades deletion to `alumni_profiles`)* |
| `/api/announcements` | `GET` | `ApiAnnouncementController.getAll` | `AnnouncementModel.findAll()` | `SELECT a.*, p.full_name, u.email FROM announcements a LEFT JOIN users u ON a.author_id = u.id ORDER BY a.pinned DESC, a.created_at DESC` |
| `/api/announcements` | `POST` | `ApiAnnouncementController.create` | `AnnouncementModel.create()` | `INSERT INTO announcements (author_id, title, content, category, priority, status, target_audience, pinned) VALUES (...)` |
| `/api/announcements/:id` | `PUT` | `ApiAnnouncementController.update` | `AnnouncementModel.update()` | `UPDATE announcements SET title = $1, content = $2, ... WHERE id = $N RETURNING *` |
| `/api/announcements/:id` | `DELETE` | `ApiAnnouncementController.delete` | `AnnouncementModel.delete()` | `DELETE FROM announcements WHERE id = $1 RETURNING *` |

---

## 🌱 Factory & Seeder Data Provisioning Architecture

To support automated end-to-end testing, local development, and load benchmarking without polluting production schemas, the data architecture implements a formal **Factory & Seeder Pattern** adhering to modern enterprise frameworks (e.g. Laravel / Fishery / Prisma Seeding).

```mermaid
graph TD
    CLI["💻 CLI Invocations<br/><code>npm run db:seed</code><br/><code>db-seed.ps1 --clean</code>"] --> DS["🌱 DatabaseSeeder.js<br/><i>(Master Orchestrator)</i>"]

    DS --> US["👤 UserSeeder.js"]
    DS --> AS["📢 AnnouncementSeeder.js"]

    US -->|Fixed Fixtures| UA["Core Admin & 6 Anchor Alumni"]
    US -->|Dynamic Batch Generation| UF["🏭 UserFactory.js"]
    US -->|Dynamic Profile Ingestion| APF["🏭 AlumniProfileFactory.js"]

    AS -->|Fixed Fixtures| AA["5 Core Campus Bulletins"]
    AS -->|Dynamic Generation| AF["🏭 AnnouncementFactory.js"]

    UF -->|Inserts users| PG[("🐘 PostgreSQL alumni_db")]
    APF -->|Inserts alumni_profiles (JSONB skills)| PG
    AF -->|Inserts announcements| PG
```

### 11.1 Factory Pattern Implementation

Factories define the canonical "recipe" for synthesizing realistic mock domain entities while respecting relational constraints and field invariants:

| Factory Class | Source Path | Target Entity | Responsibilities & Fluent States |
| :--- | :--- | :--- | :--- |
| **`UserFactory`** | [`server/database/factories/UserFactory.js`](./server/database/factories/UserFactory.js) | `users` | Generates email patterns, salted bcrypt password hashes, and roles. States: `.admin()`, `.coordinator()`, `.alumni()`. |
| **`AlumniProfileFactory`** | [`server/database/factories/AlumniProfileFactory.js`](./server/database/factories/AlumniProfileFactory.js) | `alumni_profiles` | Generates realistic names, departments, graduation years, student IDs, company affiliations, and randomized `skills` JSONB arrays. States: `.recentGraduate()`, `.seniorAlumnus()`, `.department(dept)`, `.withSkills(list)`. |
| **`AnnouncementFactory`** | [`server/database/factories/AnnouncementFactory.js`](./server/database/factories/AnnouncementFactory.js) | `announcements` | Generates official bulletin titles, categories, priority tags, markdown bodies, and pinned feed flags. States: `.pinned()`, `.urgent()`, `.draft()`, `.career()`, `.event()`. |

### 11.2 Seeder Orchestration & Lifecycle

Seeders compose factories to provision consistent, reproducible database states across developer workstations and CI/CD pipelines:

1. **`DatabaseSeeder` (`server/database/seeders/DatabaseSeeder.js`):**
   - Central entry point with argument parsing (`--clean`, `--alumni=N`, `--announcements=N`).
   - Verifies PostgreSQL health before execution.
   - Cleans existing tables when `--clean` is supplied (`TRUNCATE TABLE announcements, alumni_profiles, users RESTART IDENTITY CASCADE`).
   - Executes seeders in dependency order: `UserSeeder` ➔ `AnnouncementSeeder`.
   - Aggregates and logs diagnostic metrics (total counts, top 5 skills stored in GIN index).
2. **`UserSeeder` (`server/database/seeders/UserSeeder.js`):**
   - Provisions 1 system administrator account (`admin@alumni.edu`).
   - Provisions the 6 core anchor alumni accounts matching test expectations.
   - Synthesizes `N` randomized alumni accounts using `UserFactory` and `AlumniProfileFactory`.
3. **`AnnouncementSeeder` (`server/database/seeders/AnnouncementSeeder.js`):**
   - Provisions 5 core academic/career bulletins pinned to the Beyazıt Campus.
   - Synthesizes `N` randomized bulletins linked to the active administrator ID.

### 11.3 CLI Execution & Automated Testing

Developers can trigger data seeding from either the Node.js package environment or native host shell scripts:

```bash
# 1. Standard Seeding via npm (Appends 10 dynamic alumni and 5 bulletins)
cd server && npm run db:seed

# 2. Fresh Database Wipe & Scale Seeding (20 alumni, 10 announcements)
cd server && npm run db:seed:fresh

# 3. Windows PowerShell Runner (From project root)
./db-seed.ps1 -Clean -Alumni 25 -Announcements 10

# 4. Windows Batch Runner (Double-clickable)
./db-seed.bat
```

---

<p align="center">
  <b>Alumni Tracker — Official Data Design Documentation (DDD)</b><br/>
  Istanbul University — Management Information Systems (YBS)<br/>
  Academic Year 2026
</p>
