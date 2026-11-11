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
   - [5.4 `job_postings` Table Dictionary](#54-job_postings-table-dictionary)
6. [⚙️ Physical Data Model (PDM) & PostgreSQL DDL](#-physical-data-model-pdm--postgresql-ddl)
   - [6.1 Complete PostgreSQL DDL Script](#61-complete-postgresql-ddl-script)
   - [6.2 Indexing Strategy & Performance Optimization](#62-indexing-strategy--performance-optimization)
   - [6.3 Constraints & Invariant Enforcement](#63-constraints--invariant-enforcement)
   - [6.4 HTTP Observability, Error Persistence & Guardians](#64-http-observability-error-persistence--guardians)
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

The system manages critical academic records, career trajectories, graduate employment networking, institutional campus bulletins, and verified professional job postings. The data layer is engineered around six primary objectives:

1. **Strict Relational Integrity (ACID):** Absolute data consistency across alumni profiles, graduation verification, authentication credentials, authored notices, and career job postings.
2. **Semi-Structured Agility (Hybrid JSONB):** Efficient storage and instant querying of multi-value attributes (e.g. professional skills in profiles and vacancy requirements) without costly schema migrations.
3. **High-Speed Query Performance:** Optimized multi-criteria search (filtering by graduation year, department, employer, work mode, and skills) through tailored B-Tree and GIN indexes.
4. **Alumni Talent & Career Pipeline:** Relational matchmaking linking verified alumni recruiters with career and internship opportunities for Istanbul University graduates.
5. **Data Security & Privacy:** Strict separation of authentication credentials from public directory data, bcrypt password hashing, and compliance with institutional data governance.
6. **Clean Architectural Decoupling:** Decoupling Model abstractions from physical storage engines, transitioning seamlessly from current In-Memory JavaScript stores to persistent Dockerized PostgreSQL.

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
    REQ --> R6["Job Postings & Career Board (FTS, Skills GIN, Filters)"]

    R1 --> POSTGRES["🏆 PostgreSQL (Selected)"]
    R2 --> POSTGRES
    R3 --> POSTGRES
    R4 --> POSTGRES
    R5 --> POSTGRES
    R6 --> POSTGRES

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
    USER ||--o{ APPLICATION : "submits zero or many (1:N)"
    JOB_POSTING ||--o{ APPLICATION : "receives zero or many (1:N)"
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

    JOB_POSTING {
        identifier posting_id
        string position_title "required, max 120 chars"
        string company_organization "required"
        string target_department
        string job_location "city/location, optional"
        string employment_type
        string work_mode
        string experience_level
        string salary_compensation
        number min_wage_multiplier "asgari ucret katsayisi"
        string process_duration "surec suresi bilgisi"
        text role_description "optional"
        text qualification_requirements
        list required_skills
        string application_url
        string contact_email
        date application_deadline
        string posting_status
        integer view_analytics
        timestamp posted_timestamp
    }

    APPLICATION {
        identifier application_id
        identifier job_posting_id
        identifier applicant_user_id
        string resume_document_url
        text cover_letter_statement
        string workflow_status
        text recruiter_notes
        timestamp submission_timestamp
        timestamp last_review_timestamp
    }
```

### Conceptual Business Rules & Invariants
1. **One-to-One Identity Mapping (`USER` ➔ `ALUMNI_PROFILE`):** Every alumni profile must belong to exactly one user account. Deleting a user account cascades to remove the corresponding alumni profile.
2. **One-to-Many Authorship (`USER` ➔ `ANNOUNCEMENT`):** Announcements are authored by users with elevated roles (`admin` or departmental coordinator).
3. **Many-to-Many Career Engagement via Associative Entity (`USER` ➔ `APPLICATION` ➔ `JOB_POSTING`):** Users (alumni) and Job Postings are **not** directly coupled. Instead, their relationship is modeled as a canonical Many-to-Many (M:N) association resolved through the **`APPLICATION`** associative entity. Job postings represent corporate and institutional career vacancies. Alumni interact with career openings exclusively by lodging candidate applications.
4. **Unique Matriculation:** A student matriculation number (`student_id`) is permanently unique and immutable once verified.
5. **Email Identity:** An email address serves as the unique login principal across the entire application ecosystem.
6. **Application Lifecycle, Cardinality & Singularity:** Registered alumni submit job applications to active career postings. Each user may apply at most once per job posting (enforced by a composite candidate key `(job_id, applicant_id)`). Deleting either the user account or the target job posting cascades to remove the corresponding application records. Application status transitions follow a defined workflow (`submitted` ➔ `under_review` ➔ `shortlisted` / `rejected` ➔ `accepted`).
7. **Job Posting Integrity, Specification & Compensation Rules:**
   - **Required Title & Length Invariant (`title`):** Position title is mandatory and strictly bounded to a maximum of 120 characters (`max 120 chars`) for interface consistency.
   - **Required Company (`company_name`):** Hiring corporation or entity is mandatory.
   - **Optional City / Location & Description (`location`, `description`):** Both geographic location (city) and detailed role description are optional attributes.
   - **Average Minimum Wage Coefficient (`min_wage_multiplier`):** Captures the position's budgeted salary tier expressed as a multiple of the official minimum wage (*bu pozisyon için ayrılan ortalama asgari ücret katsayısı*, e.g., 1.5x, 2.5x, 4.0x asgari ücret). Must be a positive decimal value when specified.
   - **Hiring Process Duration (`process_duration`):** Provides transparent candidate information regarding how long the recruitment, review, and interview process is expected to take (*sürecin ne kadar süreceğine dair bilgi*, e.g., "2-3 hafta", "1 ay", "30 gün").

---

## 📐 Logical Data Model (LDM) & Normalization

The Logical Data Model refines the conceptual entities into a normalized relational schema adhering to **Third Normal Form (3NF)**:

```mermaid
erDiagram
    USERS ||--|| ALUMNI_PROFILES : "1:1 via user_id"
    USERS ||--o{ ANNOUNCEMENTS : "1:N via author_id"
    USERS ||--o{ APPLICATIONS : "1:N via applicant_id"
    JOB_POSTINGS ||--o{ APPLICATIONS : "1:N via job_id"

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

    JOB_POSTINGS {
        UUID id PK "Primary Key"
        VARCHAR title "Position Title (Required, max 120 chars)"
        VARCHAR company_name "Hiring Organization (Required)"
        VARCHAR department "Target Academic Discipline"
        VARCHAR location "Job Location / City (Optional)"
        VARCHAR employment_type "Employment Type"
        VARCHAR work_mode "Workplace Arrangement"
        VARCHAR experience_level "Seniority Level"
        VARCHAR salary_range "Salary Compensation Range"
        DECIMAL min_wage_multiplier "Average Min Wage Multiplier (Katsayı)"
        VARCHAR process_duration "Recruitment Process Duration (Süreç Bilgisi)"
        TEXT description "Job Overview & Responsibilities (Optional)"
        TEXT requirements "Candidate Qualifications"
        JSONB skills "Required Technical Skills"
        VARCHAR application_url "External Apply Link"
        VARCHAR contact_email "Contact Recruiter Email"
        DATE deadline "Application Deadline"
        VARCHAR status "Workflow Lifecycle State"
        INTEGER views_count "Engagement Counter"
        TIMESTAMP created_at "Creation timestamp"
        TIMESTAMP updated_at "Modification timestamp"
    }

    APPLICATIONS {
        UUID id PK "Primary Key (gen_random_uuid())"
        UUID job_id FK "Foreign Key referencing JOB_POSTINGS.id"
        UUID applicant_id FK "Foreign Key referencing USERS.id"
        VARCHAR resume_url "Resume Document URL"
        TEXT cover_letter "Applicant Cover Letter / Pitch"
        VARCHAR status "Workflow Status (submitted, review, etc.)"
        TEXT notes "Recruiter Evaluation Notes"
        TIMESTAMP applied_at "Submission timestamp"
        TIMESTAMP updated_at "Status modification timestamp"
    }
```

### Normalization Validation (3NF Audit)

* **First Normal Form (1NF):**
  * All tables have a primary key (`id`).
  * Atomic column values are enforced for scalar attributes.
  * Multi-valued competencies and job skill requirements (`skills`) are stored using PostgreSQL's binary JSON (`JSONB`), avoiding non-atomic delimited string anti-patterns (`"node,docker,sql"`).
* **Second Normal Form (2NF):**
  * All non-key attributes are fully functionally dependent on the primary key. No partial key dependencies exist (all tables use single-column primary keys: `UUID` or `SERIAL`).
* **Third Normal Form (3NF):**
  * No transitive dependencies exist. Attributes depend solely on the primary key (`A ➔ PK`, no `A ➔ B ➔ PK`).
  * In `job_postings`, the attributes `title`, `company_name`, `location`, `salary_range`, `description`, `requirements`, and `deadline` represent intrinsic attributes of the specific job opening entity. The publisher relationship is normalized via `poster_id ➔ USERS.id`.
  * Department, user profiles, announcements, and career postings are cleanly segregated, preventing update, insertion, or deletion anomalies.

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

### 5.4 `job_postings` Table Dictionary

The `job_postings` table stores professional job vacancies, corporate and startup hiring notices, internships, and graduate employment opportunities published by verified alumni or departmental coordinators.

| Column Name | Physical Data Type | Nullable | Key | Default Value | Description & Constraints | Validation Rules |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **`id`** | `UUID` | ❌ No | **PK** | `gen_random_uuid()` | Universally unique surrogate primary key for job postings. | Valid RFC 4122 UUID v4 |
| **`title`** | `VARCHAR(120)` | ❌ No | - | *None* | Job title or designation (e.g. *Senior Cloud Architect*). Mandatory field. | Min 3 chars, max 120 chars, non-empty |
| **`company_name`** | `VARCHAR(150)` | ❌ No | - | *None* | Name of hiring corporation, startup, or academic unit. Mandatory field. | Min 2 chars, max 150 chars, non-empty |
| **`department`** | `VARCHAR(100)` | ⚠️ Yes | - | *None* | Preferred or target academic discipline (e.g. *Management Information Systems (YBS)*). | Max 100 chars |
| **`location`** | `VARCHAR(100)` | ⚠️ Yes | - | *None* | Primary city / geographic location of work (e.g. *Istanbul*, *Ankara*, *London*). Optional field. | Max 100 chars |
| **`employment_type`**| `VARCHAR(50)` | ❌ No | - | `'Full-time'` | Contractual engagement structure. Enforced by CHECK constraint. | In: `('Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance')` |
| **`work_mode`** | `VARCHAR(50)` | ❌ No | - | `'Hybrid'` | Workplace presence arrangement. Enforced by CHECK constraint. | In: `('On-site', 'Hybrid', 'Remote')` |
| **`experience_level`**| `VARCHAR(50)` | ❌ No | - | `'Mid-Level'` | Target professional seniority tier. Enforced by CHECK constraint. | In: `('Entry-Level', 'Mid-Level', 'Senior', 'Lead', 'Executive', 'Internship')` |
| **`salary_range`** | `VARCHAR(100)` | ⚠️ Yes | - | *None* | Disclosed monthly/annual compensation bracket or currency. | Max 100 chars |
| **`min_wage_multiplier`** | `NUMERIC(4,2)` | ⚠️ Yes | - | *None* | Bu pozisyon için ayrılan ortalama asgari ücret katsayısı (örn. 1.50, 2.50, 3.75 katı). | `CHECK (min_wage_multiplier > 0)` |
| **`process_duration`** | `VARCHAR(100)` | ⚠️ Yes | - | *None* | İşe alım ve değerlendirme sürecinin ne kadar süreceğine dair bilgi (örn. *2-3 hafta*, *45 gün*, *3 aşamalı / 1 ay*). | Max 100 chars |
| **`description`** | `TEXT` | ⚠️ Yes | - | *None* | Comprehensive role overview, day-to-day responsibilities, and team mission. Optional field. | Freeform text |
| **`requirements`** | `TEXT` | ⚠️ Yes | - | *None* | Mandatory qualifications, degree expectations, and years of experience. | Freeform markdown text |
| **`skills`** | `JSONB` | ❌ No | - | `'[]'::jsonb` | Binary JSON array of technical/domain skills sought (e.g. `["PostgreSQL", "Node.js", "Docker"]`). | Must be valid JSON array of strings |
| **`application_url`**| `VARCHAR(255)` | ⚠️ Yes | - | *None* | External career portal, ATS endpoint, or direct submission link. | Must begin with `http://` or `https://` |
| **`contact_email`** | `VARCHAR(255)` | ⚠️ Yes | - | *None* | Direct recruiter, HR, or alumnus contact email for applications/inquiries. | Valid email syntax if provided |
| **`deadline`** | `DATE` | ⚠️ Yes | - | *None* | Application closing deadline date. | Valid calendar date (YYYY-MM-DD) |
| **`status`** | `VARCHAR(20)` | ❌ No | - | `'active'` | Job posting lifecycle state. Enforced by CHECK constraint. | In: `('draft', 'active', 'closed', 'archived')` |
| **`views_count`** | `INTEGER` | ❌ No | - | `0` | Analytic counter tracking total viewing impressions. | `CHECK (views_count >= 0)` |
| **`created_at`** | `TIMESTAMP WITH TIME ZONE` | ❌ No | - | `CURRENT_TIMESTAMP` | Initial job publication timestamp. | UTC timestamp |
| **`updated_at`** | `TIMESTAMP WITH TIME ZONE` | ❌ No | - | `CURRENT_TIMESTAMP` | Last modification timestamp. | Auto-updated via trigger |

---

### 5.5 `applications` Table Dictionary

The `applications` table tracks job and internship submissions made by alumni candidates to published career postings, providing complete candidate tracking, evaluation notes, and workflow status.

| Column Name | Physical Data Type | Nullable | Key | Default Value | Description & Constraints | Validation Rules |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **`id`** | `UUID` | ❌ No | **PK** | `gen_random_uuid()` | Universally unique surrogate primary key for job application record. | Valid RFC 4122 UUID v4 |
| **`job_id`** | `UUID` | ❌ No | **FK** | *None* | Relational reference to `job_postings(id)`. Foreign key with `ON DELETE CASCADE`. | Must exist in `job_postings.id` |
| **`applicant_id`** | `UUID` | ❌ No | **FK** | *None* | Relational reference to `users(id)` representing the applicant. Foreign key with `ON DELETE CASCADE`. | Must exist in `users.id` |
| **`resume_url`** | `VARCHAR(255)` | ⚠️ Yes | - | *None* | Public or authenticated URI pointing to applicant's CV or portfolio document. | Must begin with `http://` or `https://` if provided |
| **`cover_letter`** | `TEXT` | ⚠️ Yes | - | *None* | Detailed motivation statement or cover letter submitted by candidate. | Freeform text |
| **`status`** | `VARCHAR(30)` | ❌ No | - | `'submitted'` | Application lifecycle state. Enforced by CHECK constraint. | In: `('submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'rejected', 'accepted', 'withdrawn')` |
| **`notes`** | `TEXT` | ⚠️ Yes | - | *None* | Private recruiter or departmental evaluation notes. | Freeform text |
| **`applied_at`** | `TIMESTAMP WITH TIME ZONE` | ❌ No | - | `CURRENT_TIMESTAMP` | Initial application submission timestamp. | UTC timestamp |
| **`updated_at`** | `TIMESTAMP WITH TIME ZONE` | ❌ No | - | `CURRENT_TIMESTAMP` | Last status modification timestamp. | Auto-updated via trigger |

> 🔒 **Composite Uniqueness Invariant:** `CONSTRAINT uq_applications_job_applicant UNIQUE (job_id, applicant_id)` guarantees that an alumnus cannot submit multiple concurrent applications to the same job posting.

---

## ⚙️ Physical Data Model (PDM) & PostgreSQL DDL

> 💡 **Database Migrations:** In addition to the baseline initialization script ([`database/init.sql`](./database/init.sql)), incremental schema evolutions are version-controlled in [`database/migrations/`](./database/migrations/). The migrations [`002_create_job_postings_table.sql`](./database/migrations/002_create_job_postings_table.sql) and [`003_create_applications_table.sql`](./database/migrations/003_create_applications_table.sql) safely provision the `job_postings` and `applications` tables, constraints, triggers, and indexes without destroying existing live alumni records. Run via `npm run db:migrate` or [`./db-migrate.ps1`](./db-migrate.ps1).

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
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS job_postings CASCADE;
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

-- ============================================================================
-- TABLE: job_postings
-- Stores career opportunities, internship openings, and alumni job postings.
-- ============================================================================
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(120) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    location VARCHAR(100),
    employment_type VARCHAR(50) NOT NULL DEFAULT 'Full-time',
    work_mode VARCHAR(50) NOT NULL DEFAULT 'Hybrid',
    experience_level VARCHAR(50) NOT NULL DEFAULT 'Mid-Level',
    salary_range VARCHAR(100),
    min_wage_multiplier NUMERIC(4,2),
    process_duration VARCHAR(100),
    description TEXT,
    requirements TEXT,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    application_url VARCHAR(255),
    contact_email VARCHAR(255),
    deadline DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    views_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Value Check Constraints
    CONSTRAINT chk_job_postings_employment_type CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance')),
    CONSTRAINT chk_job_postings_work_mode CHECK (work_mode IN ('On-site', 'Hybrid', 'Remote')),
    CONSTRAINT chk_job_postings_experience_level CHECK (experience_level IN ('Entry-Level', 'Mid-Level', 'Senior', 'Lead', 'Executive', 'Internship')),
    CONSTRAINT chk_job_postings_status CHECK (status IN ('draft', 'active', 'closed', 'archived')),
    CONSTRAINT chk_job_postings_skills_array CHECK (jsonb_typeof(skills) = 'array'),
    CONSTRAINT chk_job_postings_title_length CHECK (char_length(TRIM(title)) >= 3 AND char_length(title) <= 120),
    CONSTRAINT chk_job_postings_company_length CHECK (char_length(TRIM(company_name)) >= 2),
    CONSTRAINT chk_job_postings_min_wage_multiplier CHECK (min_wage_multiplier IS NULL OR min_wage_multiplier > 0),
    CONSTRAINT chk_job_postings_views_positive CHECK (views_count >= 0)
);

-- ============================================================================
-- TABLE: applications
-- Stores alumni applications submitted to job postings.
-- ============================================================================
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    applicant_id UUID NOT NULL,
    resume_url VARCHAR(255),
    cover_letter TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'submitted',
    notes TEXT,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Key Constraints (Cascade deletion upon parent removal)
    CONSTRAINT fk_applications_job FOREIGN KEY (job_id)
        REFERENCES job_postings (id) ON DELETE CASCADE,
    CONSTRAINT fk_applications_applicant FOREIGN KEY (applicant_id)
        REFERENCES users (id) ON DELETE CASCADE,

    -- Singularity Invariant: One application per user per job
    CONSTRAINT uq_applications_job_applicant UNIQUE (job_id, applicant_id),

    -- Workflow Check Constraints
    CONSTRAINT chk_applications_status CHECK (status IN (
        'submitted', 'under_review', 'shortlisted', 
        'interview_scheduled', 'rejected', 'accepted', 'withdrawn'
    ))
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
CREATE INDEX idx_applications_job_id ON applications (job_id);
CREATE INDEX idx_applications_applicant_id ON applications (applicant_id);

-- 2. Multi-column Compound Indexes for Directory & Feed Search
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

-- 6. Job Postings Active Feed Index (Newest active jobs first)
CREATE INDEX idx_job_postings_feed ON job_postings (status, created_at DESC)
    WHERE status = 'active';

-- 7. Job Postings Compound Filter (Work Mode + Employment Type)
CREATE INDEX idx_job_postings_filter ON job_postings (work_mode, employment_type);

-- 8. GIN Index for Required Job Postings Skills Matching
CREATE INDEX idx_job_postings_skills_gin ON job_postings USING GIN (skills);

-- 9. Full-Text Search (FTS) Index across Job Title, Company, Location, and Description
CREATE INDEX idx_job_postings_fts ON job_postings USING GIN (
    to_tsvector('simple', COALESCE(title, '') || ' ' || 
                          COALESCE(company_name, '') || ' ' || 
                          COALESCE(location, '') || ' ' || 
                          COALESCE(description, ''))
);

-- 10. Application Status & Job Composite Indexes
CREATE INDEX idx_applications_status ON applications (status);
CREATE INDEX idx_applications_job_status ON applications (job_id, status);
CREATE INDEX idx_applications_applied_at ON applications (applied_at DESC);
```

---

### 6.3 Constraints & Invariant Enforcement

```mermaid
graph TD
    subgraph APPLICATION_LEVEL ["1. APPLICATION / CONTROLLER LEVEL"]
        C1["express.json() & Form Body Parsers"]
        C2["Model Business Validation (User.js, Announcement.js & JobPosting.js)"]
    end

    subgraph DATABASE_LEVEL ["2. DATABASE / ENGINE LEVEL (Last Line of Defense)"]
        D1["PRIMARY KEY & UNIQUE (Email, Student ID, 1:1 user_id)"]
        D2["FOREIGN KEY ... ON DELETE CASCADE (Referential Integrity)"]
        D3["CHECK Constraints (Valid graduation year, Enum strings)"]
        D4["NOT NULL Constraints (Guaranteed mandatory attributes)"]
    end

    APPLICATION_LEVEL -->|Dispatches Validated Payload| DATABASE_LEVEL
```

#### Job Posting Integrity & Business Rules Matrix

| Rule / Field | Enforcement Level | Database Invariant / Constraint | Business Rationale & Description |
| :--- | :---: | :--- | :--- |
| **`title` (Required)** | Application & DB | `NOT NULL`, `CHECK (char_length(TRIM(title)) >= 3)` | İlan başlığı zorunludur; boş bırakılamaz. |
| **`title` (Max 120 Chars)**| Application & DB | `VARCHAR(120)`, `CHECK (char_length(title) <= 120)` | Başlık metni en fazla 120 karakter uzunluğunda olabilir; kart ve liste görünümlerinde taşmayı önler. |
| **`company_name` (Required)**| Application & DB | `VARCHAR(150) NOT NULL`, `CHECK (char_length(TRIM(company_name)) >= 2)` | İlanı veren şirket/kurum adı zorunludur; doğrulanabilir işveren kimliği sağlar. |
| **`location` / City (Optional)**| Application & DB | `VARCHAR(100) NULL` (Nullable) | Pozisyon lokasyonu / şehir bilgisi isteğe bağlıdır (özellikle Remote pozisyonlar ve genel istihdam çağrıları için serbest bırakılmıştır). |
| **`description` (Optional)**| Application & DB | `TEXT NULL` (Nullable) | Detaylı pozisyon açıklaması isteğe bağlıdır; hızlı ilan yayınlama ve harici link/başvuru odaklı ilanları destekler. |
| **Ortalama Asgari Ücret Katsayısı (`min_wage_multiplier`)**| Application & DB | `NUMERIC(4,2) NULL`, `CHECK (min_wage_multiplier IS NULL OR min_wage_multiplier > 0)` | Bu pozisyon için ayrılan bütçenin güncel net/brüt asgari ücrete göre ortalama katsayı karşılığıdır (örn. 1.50x, 2.50x, 4.00x katı). |
| **Süreç Bilgisi (`process_duration`)**| Application & DB | `VARCHAR(100) NULL` | İşe alım, teknik mülakat ve teklif sürecinin tahmini ne kadar süreceğine dair adayları bilgilendiren süreç süresi (örn. *"2-3 hafta"*, *"1 ay"*, *"45 gün"*). |

---

### 6.4 HTTP Observability, Error Persistence & Guardians

To ensure end-to-end reliability, runtime diagnostic transparency, and a graceful user experience during unexpected faults, the application integrates an enterprise-grade middleware pipeline in [`server/server.js`](./server/server.js):

#### 6.4.1 Terminal HTTP Logger Middleware (`server/middleware/logger.js`)

To provide real-time request observability on the terminal, the Express pipeline includes a lightweight custom `loggerMiddleware` that intercepts every HTTP request and writes structured telemetry to `stdout` when the response finishes (`res.on('finish')`):

* **Log Row Format:** `<time> <method> <route> <res-type> <duration>`
* **Example Terminal Output:**
  ```text
  10:20:30 POST /user 201 18ms
  10:20:35 GET /api/jobs 200 12ms
  10:21:02 POST /api/jobs 201 24ms
  ```

| Field | Format / Source | Example | Description |
| :--- | :--- | :--- | :--- |
| **`time`** | `HH:MM:SS` | `10:20:30` | İsteğin tamamlandığı yerel sunucu saati. |
| **`method`** | `req.method` | `POST` | HTTP istek metodu (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`). |
| **`route`** | `req.originalUrl` | `/user` | İstek yapılan uç nokta (endpoint / URL yolu). |
| **`res-type`** | `res.statusCode` | `201` | HTTP yanıt durum kodu (`200`, `201`, `400`, `404`, `500`). |
| **`duration`** | `<ms>ms` | `18ms` | İsteğin başlangıcından yanıtın tamamlanmasına kadar geçen süre (milisaniye). |

* **Kalıcı Hata Günlüğü (`server/logs/error.logs`):**
  Sunucuda meydana gelen tüm `4xx` (İstemci / Bulunamadı hataları) ve `5xx` (Sunucu istisnaları) anında dosya sistemindeki [`logs/error.logs`](./server/logs/error.logs) dosyasına tarih, HTTP metodu, rota, durum kodu, yanıt süresi, istemci IP'si, hata gerekçesi (**reason**) ve stack trace detaylarıyla birlikte kalıcı olarak kaydedilir. Böylece geçmiş hatalar ve anomaliler geriye dönük olarak denetlenebilir.

#### 6.4.2 404 Guardian Middleware & Generic 404 Redirection (`server/middleware/notFoundGuardian.js`)

Tanımlanmamış veya yanlış yazılmış rotaları yakalayarak istemciye hatanın kaynağını ve nedenini açıklayan bir gerekçe (**reason**) ile standart 404 yanıtı döndürür:

* **API Rotaları (`/api/*` veya JSON talepleri):**
  ```json
  {
    "success": false,
    "status": 404,
    "error": "Not Found",
    "method": "GET",
    "path": "/api/nonexistent-route",
    "reason": "Endpoint 'GET /api/nonexistent-route' was not found. Please check the URL path, HTTP method, or consult the API specification at /api/swagger.",
    "timestamp": "2026-11-11T07:26:56.641Z"
  }
  ```
* **Web / Tarayıcı Rotaları (Generic 404 Page & Redirection):** Kullanıcıyı düz bir metin veya siyah JSON ekranına düşürmek yerine, tüm geçersiz web istekleri doğrudan bağımsız **Generic 404 Sayfasına (`/404`)** yönlendirilir (`redirect invalid request`). Bu rota, tam teşekküllü kurumsal şablonu (Navbar, Footer, Beyazıt teması, aranan URL ve gerekçe kutusu) içeren [`server/public/404.html`](./server/public/404.html) sayfasını gerçek **HTTP 404 Not Found** durum koduyla sunar. Sayfada "Ana Sayfaya Dön", "Mezun Rehberi", "İş İlanları" ve "Duyurular" hızlı bağlantıları yer alır.

#### 6.4.3 5xx Server Error Guardian Middleware (`server/middleware/serverErrorGuardian.js`)

Sunucu tarafında meydana gelen beklenmedik istisnaları (`Unhandled Exceptions`), veritabanı bağlantı kopmalarını (`ECONNREFUSED`), kısıt ihlallerini (`Unique/FK Constraint Violation`) ve runtime hatalarını yakalayan Express hata yakalama ara yazılımıdır (`err, req, res, next`). Hatayı terminale detaylı stack trace ile loglarken istemciye hatanın gerekçesini (**reason**) içeren güvenli bir 5xx yanıtı sunar:

* **API / JSON Yanıtı (500 Internal Server Error):**
  ```json
  {
    "success": false,
    "status": 500,
    "error": "Internal Server Error",
    "method": "POST",
    "path": "/api/jobs",
    "reason": "Database connection failed: The database service is unreachable or not accepting connections.",
    "timestamp": "2026-11-11T07:30:38.157Z"
  }
  ```
* **Web / Tarayıcı Yanıtı:** Kullanıcıyı sitenin ana sayfasında tutarak hata kodunu (`500`), hatanın nedenini (`Reason`) ve sayfayı yeniden deneme butonunu içeren modern bir modal açar.

---

## 🔄 In-Memory to Persistent Storage Transition Strategy

The codebase is engineered to transition from the current development In-Memory model to persistent PostgreSQL without modifying controller interfaces:

```mermaid
graph LR
    subgraph PRESENTATION ["Presentation / Routes"]
        R["/api/users, /api/announcements & /api/jobs"]
    end

    subgraph CONTROLLER ["Controllers"]
        C["ApiUserController.js, ApiAnnouncementController.js & ApiJobController.js"]
    end

    subgraph MODEL_ABSTRACTION ["Model Interface (DAO / Repository)"]
        M["UserModel, AnnouncementModel & JobPostingModel Interfaces"]
    end

    subgraph STORAGE_IMPL ["Storage Adapters"]
        PG["🏆 Active Production: PostgreSQL Client Pool<br/><i>(server/db.js via pg.Pool)</i>"]
    end

    R --> C
    C --> M
    M ==>|Active (Connected & Persistent)| PG
```

### Database Provisioning & Execution Status (Phase 5 — COMPLETED & OPERATIONAL ✅):
1. **CRUD Interface Integration:** Upgraded `server/models/User.js`, `server/models/Announcement.js`, and `server/models/JobPosting.js` (designed) to execute real-time parameterized queries against `alumni-postgres` via connection pool (`server/db.js`). Controllers are fully asynchronous (`async/await`).
2. **Docker Compose Service:** Configured `postgres:15-alpine` container (`alumni-postgres`), exposed port `5432:5432`, persistent named volume `postgres_data`, and automatic schema mount `./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro`.
3. **Environment Configuration:** Synchronized `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/alumni_db?schema=public` in `server/.env`, `server/.env.example`, and `env.example`.
4. **Database Schema & Seed Ingestion:** Created and executed [`database/init.sql`](./database/init.sql). All 4 relational tables (`users`, `alumni_profiles`, `announcements`, `job_postings`), 10 performance indexes (including dual GIN skills and FTS text search), auto-update triggers, and seeded users along with announcements and corporate postings are live and operational in PostgreSQL.

---

## 🔐 Data Security, Privacy & KVKK/GDPR Compliance

1. **Credential Segregation:** Passwords are never stored in plaintext. They are hashed using **`bcrypt`** with a minimum work factor of 10 (`saltRounds = 10`) before storage in `users.password_hash`.
2. **PII Protection & Public Scoping:** The `users` table and `alumni_profiles` table are physically decoupled. Public directory queries (`GET /api/users`) project only non-sensitive alumni attributes, omitting password hashes and private contact numbers.
3. **Career Posting Authorization & Scoping:** Job opportunities can only be authored and managed by verified alumni accounts, company coordinators, or administrators (`poster_id`). Mutation endpoints (`PUT`, `DELETE`) require ownership verification matching the active authenticated session.
4. **SQL Injection Immunity:** All database interactions are executed using parameterized SQL queries (`$1, $2, $3...` in `pg`) or ORM query builders (Prisma), preventing SQL injection vectors entirely.
5. **Least-Privilege Database Role:** The Express web application connects using an unprivileged database user (`alumni_app`) that has only `SELECT`, `INSERT`, `UPDATE`, and `DELETE` grants, with no permissions to `DROP` tables or alter schemas.

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

## 🔗 Integration Matrix: Codebase & Routing Architecture (Direct & Nested Routes)

The Alumni Tracker routing architecture is structured around Domain-Driven Design (DDD) aggregate boundaries and RESTful resource hierarchies, cleanly bifurcated into **Direct Routes** (top-level independent resource endpoints) and **Nested Routes** (sub-resource endpoints modeling entity relationships).

```mermaid
graph TD
    subgraph DIRECT_ROUTING ["1. DIRECT ROUTING ARCHITECTURE (Aggregate Roots)"]
        D_Users["/api/users (Alumni Directory)"]
        D_Jobs["/api/jobs (Career Board)"]
        D_Announce["/api/announcements (Campus Feed)"]
        D_Apps["/api/applications (Applications Tracker)"]
    end

    subgraph NESTED_ROUTING ["2. NESTED ROUTING ARCHITECTURE (Relational Sub-Resources)"]
        N_UserJobs["/api/users/:userId/jobs<br/><i>(User 1:N JobPosting)</i>"]
        N_UserAnnounce["/api/users/:userId/announcements<br/><i>(User 1:N Announcement)</i>"]
        N_UserProfile["/api/users/:userId/profile<br/><i>(User 1:1 AlumniProfile)</i>"]
        N_JobApps["/api/jobs/:jobId/applications<br/><i>(JobPosting 1:N Application)</i>"]
        N_UserApps["/api/users/:userId/applications<br/><i>(User 1:N Application)</i>"]
    end

    subgraph ROUTER_PIPELINE ["Express.js Router Pipeline"]
        R_App["server.js (app.use)"]
        R_UserRouter["apiUserRoutes.js"]
        R_JobRouter["apiJobRoutes.js<br/><code>Router({ mergeParams: true })</code>"]
        R_AnnounceRouter["apiAnnouncementRoutes.js"]
        R_AppRouter["apiApplicationRoutes.js<br/><code>Router({ mergeParams: true })</code>"]
    end

    R_App -->|/api/users| R_UserRouter
    R_App -->|/api/jobs| R_JobRouter
    R_App -->|/api/announcements| R_AnnounceRouter
    R_App -->|/api/applications| R_AppRouter

    R_UserRouter -->|router.use('/:userId/jobs')| R_JobRouter
    R_UserRouter -->|router.get('/:userId/announcements')| R_AnnounceRouter
    R_UserRouter -->|router.use('/:userId/applications')| R_AppRouter
    R_JobRouter -->|router.use('/:jobId/applications')| R_AppRouter

    D_Users -.-> R_UserRouter
    D_Jobs -.-> R_JobRouter
    D_Announce -.-> R_AnnounceRouter
    D_Apps -.-> R_AppRouter

    N_UserAnnounce -.-> R_UserRouter
    N_UserProfile -.-> R_UserRouter
    N_JobApps -.-> R_AppRouter
    N_UserApps -.-> R_AppRouter
```

---

### 10.1 Direct Routes Architecture (Independent Resource Endpoints)

Direct routes expose top-level RESTful collections and web views without requiring context from a parent entity. Query string parameters (`?department=...&skills=...`) are utilized for orthogonal filtering across the entire entity collection.

| Endpoint | HTTP Method | MVC Controller Handler | Resource Semantics | Executed PostgreSQL Action |
| :--- | :---: | :--- | :--- | :--- |
| `/api/users` | `GET` | `ApiUserController.getAll` | Global Alumni Directory | `SELECT p.*, u.email, u.role FROM alumni_profiles p JOIN users u ON p.user_id = u.id ORDER BY p.graduation_year DESC` |
| `/api/users/:id` | `GET` | `ApiUserController.getById` | Single Alumnus Entity | `SELECT p.*, u.email FROM alumni_profiles p JOIN users u ON p.user_id = u.id WHERE p.id = $1 OR p.student_id = $1` |
| `/api/users` | `POST` | `ApiUserController.create` | Register New Alumnus | `BEGIN; INSERT INTO users ...; INSERT INTO alumni_profiles ...; COMMIT;` |
| `/api/users/:id` | `PUT` | `ApiUserController.update` | Full Profile Replacement | `UPDATE alumni_profiles SET full_name = $1 ... WHERE id = $N RETURNING *` |
| `/api/users/:id` | `PATCH` | `ApiUserController.patch` | Selective Profile Update | Dynamic parameterized SQL update for modified keys |
| `/api/users/:id` | `DELETE` | `ApiUserController.delete` | Unregister Alumnus | `DELETE FROM users WHERE id = $1` *(Cascades to profile, announcements, applications)* |
| `/api/jobs` | `GET` | `ApiJobController.getAll` | Global Career Feed | `SELECT j.* FROM job_postings j WHERE status = 'active' ORDER BY j.created_at DESC` |
| `/api/jobs/:id` | `GET` | `ApiJobController.getById` | Single Job Posting | `SELECT j.* FROM job_postings j WHERE j.id = $1` |
| `/api/jobs` | `POST` | `ApiJobController.create` | Create Job Posting | `INSERT INTO job_postings (title, company_name, ...) VALUES ($1, $2, ...) RETURNING *` |
| `/api/jobs/:id` | `PUT` | `ApiJobController.update` | Full Job Replacement | `UPDATE job_postings SET title = $1, company_name = $2, ... WHERE id = $N RETURNING *` |
| `/api/jobs/:id` | `PATCH` | `ApiJobController.patch` | Selective Job Update | Dynamic parameterized SQL update on permitted job fields |
| `/api/jobs/:id` | `DELETE` | `ApiJobController.delete` | Delete Job Vacancy | `DELETE FROM job_postings WHERE id = $1 RETURNING *` *(Cascades to applications)* |
| `/api/jobs/:id/apply` | `POST` | `ApiJobController.apply` | Apply to Job Opening | Shortcut endpoint proxying to Application creation |
| `/api/applications` | `GET` | `ApiApplicationController.getAll` | Global Applications Register | `SELECT a.*, j.title, j.company_name, u.email, p.full_name FROM applications a JOIN job_postings j ON a.job_id = j.id JOIN users u ON a.applicant_id = u.id LEFT JOIN alumni_profiles p ON p.user_id = u.id ORDER BY a.applied_at DESC` |
| `/api/applications/:id` | `GET` | `ApiApplicationController.getById` | Single Application Detail | `SELECT a.*, j.title, j.company_name, u.email, p.full_name FROM applications a JOIN job_postings j ON a.job_id = j.id JOIN users u ON a.applicant_id = u.id LEFT JOIN alumni_profiles p ON p.user_id = u.id WHERE a.id = $1` |
| `/api/applications` | `POST` | `ApiApplicationController.create` | Submit Job Application | `INSERT INTO applications (job_id, applicant_id, resume_url, cover_letter, status) VALUES (...) RETURNING *` |
| `/api/applications/:id` | `PUT` | `ApiApplicationController.update` | Full Application Update | `UPDATE applications SET status = $1, notes = $2, resume_url = $3, cover_letter = $4 WHERE id = $N RETURNING *` |
| `/api/applications/:id` | `PATCH` | `ApiApplicationController.patch` | Partial Application Update | Dynamic parameterized SQL update on application status or notes |
| `/api/applications/:id` | `DELETE` | `ApiApplicationController.delete` | Withdraw Application | `DELETE FROM applications WHERE id = $1 RETURNING *` |
| `/api/announcements` | `GET` | `ApiAnnouncementController.getAll` | Campus Bulletins Feed | `SELECT a.*, p.full_name, u.email FROM announcements a LEFT JOIN users u ON a.author_id = u.id ORDER BY a.pinned DESC, a.created_at DESC` |
| `/api/announcements/:id` | `GET` | `ApiAnnouncementController.getById` | Single Bulletin Detail | `SELECT a.*, p.full_name, u.email FROM announcements a LEFT JOIN users u ON a.author_id = u.id WHERE a.id = $1` |
| `/api/announcements` | `POST` | `ApiAnnouncementController.create` | Author New Bulletin | `INSERT INTO announcements (author_id, title, content, category, priority, status, target_audience, pinned) VALUES (...)` |
| `/api/announcements/:id` | `PUT` | `ApiAnnouncementController.update` | Full Bulletin Update | `UPDATE announcements SET title = $1, content = $2, ... WHERE id = $N RETURNING *` |
| `/api/announcements/:id` | `PATCH` | `ApiAnnouncementController.patch` | Selective Bulletin Update | Dynamic parameterized SQL update on modified keys |
| `/api/announcements/:id` | `DELETE` | `ApiAnnouncementController.delete` | Remove Bulletin | `DELETE FROM announcements WHERE id = $1 RETURNING *` |

---

### 10.2 Nested Routes Architecture (Relational Sub-Resource Endpoints)

Nested routes express relational hierarchy between domain entities directly within the URI path (`/parents/:parentId/children`). By leveraging Express router parameter propagation (`mergeParams: true`), handlers automatically inherit parent scoping without code duplication. Note that because **Users** and **JobPostings** are related exclusively through **Applications (M:N)**, nested candidate routing passes through the `/applications` sub-resource endpoints:

| Nested Route | HTTP Method | Domain Relationship | MVC Controller Handler | Scoped Execution & Verification |
| :--- | :---: | :--- | :--- | :--- |
| `/api/users/:userId/applications` | `GET` | `User 1:N Application` | `ApiApplicationController.getAll` | Queries only applications submitted by candidate `:userId` |
| `/api/users/:userId/applications/:id` | `GET` | `User 1:N Application` | `ApiApplicationController.getById` | Verifies application `:id` belongs to candidate `:userId` |
| `/api/users/:userId/applications/:id` | `DELETE` | `User 1:N Application` | `ApiApplicationController.delete` | Withdraws application submitted by candidate `:userId` |
| `/api/jobs/:jobId/applications` | `GET` | `JobPosting 1:N Application` | `ApiApplicationController.getAll` | Queries only applications submitted for target job `:jobId` |
| `/api/jobs/:jobId/applications` | `POST` | `JobPosting 1:N Application` | `ApiApplicationController.create` | Automatically binds `job_id = :jobId` during submission |
| `/api/jobs/:jobId/applications/:id` | `GET` | `JobPosting 1:N Application` | `ApiApplicationController.getById` | Verifies application `:id` belongs to target job `:jobId` |
| `/api/jobs/:jobId/applications/:id` | `PUT` | `JobPosting 1:N Application` | `ApiApplicationController.update` | Updates candidate application status for job `:jobId` |
| `/api/jobs/:jobId/applications/:id` | `PATCH` | `JobPosting 1:N Application` | `ApiApplicationController.patch` | Modifies review state or recruiter notes for job `:jobId` |
| `/api/jobs/:jobId/applications/:id` | `DELETE` | `JobPosting 1:N Application` | `ApiApplicationController.delete` | Removes application from target job `:jobId` |
| `/api/users/:userId/announcements` | `GET` | `User 1:N Announcement` | `ApiAnnouncementController.getAll` | Queries only bulletins where `author_id = :userId` |
| `/api/users/:userId/announcements` | `POST` | `User 1:N Announcement` | `ApiAnnouncementController.create` | Automatically sets `authorId = :userId` for new bulletin |
| `/api/users/:userId/profile` | `GET` | `User 1:1 AlumniProfile` | `ApiUserController.getById` | Fetches the singular profile associated with `:userId` |

---

### 10.3 Parameter Merging & Router Design Pattern

In Express.js, child routers mounted on parameter paths (e.g. `router.use('/:userId/jobs', apiJobRoutes)`) isolate route parameters by default. To allow the child router to access `:userId`, the sub-router is instantiated with **`mergeParams: true`**:

```javascript
// server/routes/apiJobRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true }); // Enables :userId access from parent router

// Handles both Direct (GET /api/jobs) and Nested (GET /api/users/:userId/jobs)
router.get('/', (req, res) => ApiJobController.getAll(req, res));
router.get('/:id', (req, res) => ApiJobController.getById(req, res));
router.post('/', upload.none(), (req, res) => ApiJobController.create(req, res));
router.put('/:id', upload.none(), (req, res) => ApiJobController.update(req, res));
router.patch('/:id', upload.none(), (req, res) => ApiJobController.patch(req, res));
router.delete('/:id', (req, res) => ApiJobController.delete(req, res));
```

The controller dynamically detects the execution context:
```javascript
// server/controllers/ApiJobController.js
async getAll(req, res) {
  // If invoked via nested route (/api/users/:userId/jobs), enforce posterId filter
  const posterId = req.params.userId || req.query.posterId;
  const filters = { ...req.query, ...(posterId && { posterId }) };
  const jobs = await JobPosting.findAll(filters);
  return res.status(200).json({ success: true, count: jobs.length, data: jobs });
}
```

---

### 10.4 Web Browser View Layer Routes (Direct & Nested)

The server also supplies rich HTML presentation views corresponding to each resource hierarchy:

| Web Route | HTTP Method | Type | Controller Handler | Presentation Description |
| :--- | :---: | :---: | :--- | :--- |
| `/jobs` | `GET` | Direct | `JobController.index` | Career Board listing with active job cards and filters |
| `/jobs/create` | `GET` | Direct | `JobController.create` | Form view to publish a new job opening |
| `/jobs` | `POST` | Direct | `JobController.store` | Handles form submission and redirects to `/jobs` |
| `/jobs/:id` | `GET` | Direct | `JobController.show` | Comprehensive job detail card with apply/contact actions |
| `/jobs/:id/edit` | `GET` | Direct | `JobController.edit` | Pre-filled form view to modify job opening |
| `/jobs/:id/update` | `POST` | Direct | `JobController.update` | Submits updates and redirects to `/jobs/:id` |
| `/jobs/:id/delete` | `POST` | Direct | `JobController.destroy` | Deletes job posting and redirects to `/jobs` |
| `/users/:userId/jobs` | `GET` | **Nested** | `JobController.userJobs` | Web view listing career opportunities posted by specific alumnus |
| `/applications` | `GET` | Direct | `ApplicationController.index` | Applications Management Dashboard & status tracking UI |
| `/applications/:id` | `GET` | Direct | `ApplicationController.show` | Candidate application review card with recruiter action buttons |
| `/jobs/:jobId/apply` | `GET` | **Nested** | `ApplicationController.create` | Candidate application submission form view for job `:jobId` |
| `/jobs/:jobId/apply` | `POST` | **Nested** | `ApplicationController.store` | Submits candidate application form and redirects with feedback |
| `/users/:userId/applications` | `GET` | **Nested** | `ApplicationController.userApplications` | Web portal view for candidate alumni tracking submitted applications |

---

## 🌱 Factory & Seeder Data Provisioning Architecture

To support automated end-to-end testing, local development, and load benchmarking without polluting production schemas, the data architecture implements a formal **Factory & Seeder Pattern** adhering to modern enterprise frameworks (e.g. Laravel / Fishery / Prisma Seeding).

```mermaid
graph TD
    CLI["💻 CLI Invocations<br/><code>npm run db:seed</code><br/><code>db-seed.ps1 --clean</code>"] --> DS["🌱 DatabaseSeeder.js<br/><i>(Master Orchestrator)</i>"]

    DS --> US["👤 UserSeeder.js"]
    DS --> AS["📢 AnnouncementSeeder.js"]
    DS --> JS["💼 JobPostingSeeder.js"]

    US -->|Fixed Fixtures| UA["Core Admin & 6 Anchor Alumni"]
    US -->|Dynamic Batch Generation| UF["🏭 UserFactory.js"]
    US -->|Dynamic Profile Ingestion| APF["🏭 AlumniProfileFactory.js"]

    AS -->|Fixed Fixtures| AA["5 Core Campus Bulletins"]
    AS -->|Dynamic Generation| AF["🏭 AnnouncementFactory.js"]

    JS -->|Fixed Fixtures| JA["4 Core Tech & Corporate Job Openings"]
    JS -->|Dynamic Generation| JF["🏭 JobPostingFactory.js"]

    UF -->|Inserts users| PG[("🐘 PostgreSQL alumni_db")]
    APF -->|Inserts alumni_profiles (JSONB skills)| PG
    AF -->|Inserts announcements| PG
    JF -->|Inserts job_postings (JSONB skills & FTS)| PG
```

### 11.1 Factory Pattern Implementation

Factories define the canonical "recipe" for synthesizing realistic mock domain entities while respecting relational constraints and field invariants:

| Factory Class | Source Path | Target Entity | Responsibilities & Fluent States |
| :--- | :--- | :--- | :--- |
| **`UserFactory`** | [`server/database/factories/UserFactory.js`](./server/database/factories/UserFactory.js) | `users` | Generates email patterns, salted bcrypt password hashes, and roles. States: `.admin()`, `.coordinator()`, `.alumni()`. |
| **`AlumniProfileFactory`** | [`server/database/factories/AlumniProfileFactory.js`](./server/database/factories/AlumniProfileFactory.js) | `alumni_profiles` | Generates realistic names, departments, graduation years, student IDs, company affiliations, and randomized `skills` JSONB arrays. States: `.recentGraduate()`, `.seniorAlumnus()`, `.department(dept)`, `.withSkills(list)`. |
| **`AnnouncementFactory`** | [`server/database/factories/AnnouncementFactory.js`](./server/database/factories/AnnouncementFactory.js) | `announcements` | Generates official bulletin titles, categories, priority tags, markdown bodies, and pinned feed flags. States: `.pinned()`, `.urgent()`, `.draft()`, `.career()`, `.event()`. |
| **`JobPostingFactory`** | [`server/database/factories/JobPostingFactory.js`](./server/database/factories/JobPostingFactory.js) | `job_postings` | Generates realistic position titles, employer names, locations, salary brackets, descriptions, requirements, and required `skills` JSONB arrays. States: `.remote()`, `.hybrid()`, `.internship()`, `.senior()`, `.active()`, `.closed()`. |

### 11.2 Seeder Orchestration & Lifecycle

Seeders compose factories to provision consistent, reproducible database states across developer workstations and CI/CD pipelines:

1. **`DatabaseSeeder` (`server/database/seeders/DatabaseSeeder.js`):**
   - Central entry point with argument parsing (`--clean`, `--alumni=N`, `--announcements=N`, `--jobs=N`).
   - Verifies PostgreSQL health before execution.
   - Cleans existing tables when `--clean` is supplied (`TRUNCATE TABLE job_postings, announcements, alumni_profiles, users RESTART IDENTITY CASCADE`).
   - Executes seeders in dependency order: `UserSeeder` ➔ `AnnouncementSeeder` ➔ `JobPostingSeeder`.
   - Aggregates and logs diagnostic metrics (total counts, top 5 skills stored in GIN index).
2. **`UserSeeder` (`server/database/seeders/UserSeeder.js`):**
   - Provisions 1 system administrator account (`admin@alumni.edu`).
   - Provisions the 6 core anchor alumni accounts matching test expectations.
   - Synthesizes `N` randomized alumni accounts using `UserFactory` and `AlumniProfileFactory`.
3. **`AnnouncementSeeder` (`server/database/seeders/AnnouncementSeeder.js`):**
   - Provisions 5 core academic/career bulletins pinned to the Beyazıt Campus.
   - Synthesizes `N` randomized bulletins linked to the active administrator ID.
4. **`JobPostingSeeder` (`server/database/seeders/JobPostingSeeder.js`):**
   - Provisions 4 anchor tech & corporate opportunities posted by Google, Microsoft, and Amazon alumni.
   - Synthesizes `N` randomized career listings linked to verified alumni accounts.

### 11.3 CLI Execution & Automated Testing

Developers can trigger data seeding from either the Node.js package environment or native host shell scripts:

```bash
# 1. Standard Seeding via npm (Appends 10 dynamic alumni, 5 bulletins, and 5 jobs)
cd server && npm run db:seed

# 2. Fresh Database Wipe & Scale Seeding (20 alumni, 10 announcements, 10 jobs)
cd server && npm run db:seed:fresh

# 3. Windows PowerShell Runner (From project root)
./db-seed.ps1 -Clean -Alumni 25 -Announcements 10 -Jobs 10

# 4. Windows Batch Runner (Double-clickable)
./db-seed.bat
```

---

<p align="center">
  <b>Alumni Tracker — Official Data Design Documentation (DDD)</b><br/>
  Istanbul University — Management Information Systems (YBS)<br/>
  Academic Year 2026
</p>
