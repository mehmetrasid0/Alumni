-- ============================================================================
-- ALUMNI TRACKER — POSTGRESQL INITIALIZATION & SCHEMA DDL (DDD SPECIFICATION)
-- Database Engine: PostgreSQL 15+
-- Author: Mehmet Raşid Ünlüel (Istanbul University - YBS, 3rd Year)
-- Project: Alumni Tracker (Web Programming Course - 2026)
-- Specification Reference: DDD.md
-- ============================================================================

-- 1. Ensure required cryptographic extension is loaded for UUID & bcrypt
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables in reverse dependency order (Clean setup)
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS alumni_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 3. TABLE: users
-- Manages authentication principals, roles, and lifecycle timestamps.
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
-- 4. TABLE: alumni_profiles
-- Stores graduate academic credentials, employment details, and skills.
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
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
-- 5. TABLE: announcements
-- Holds institutional bulletins, career notices, and academic events.
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
-- 6. PERFORMANCE & FULL-TEXT SEARCH INDEXES
-- ============================================================================

-- Foreign Key Fast Joins
CREATE INDEX idx_alumni_profiles_user_id ON alumni_profiles (user_id);
CREATE INDEX idx_announcements_author_id ON announcements (author_id);

-- Compound Index for Directory Filtering (Department + Graduation Year)
CREATE INDEX idx_alumni_dept_grad_year ON alumni_profiles (department, graduation_year);

-- GIN (Generalized Inverted Index) for JSONB Skills Array Containment
CREATE INDEX idx_alumni_skills_gin ON alumni_profiles USING GIN (skills);

-- Full-Text Search (FTS) Index across Name, Role, Company, and Bio
CREATE INDEX idx_alumni_fts ON alumni_profiles USING GIN (
    to_tsvector('simple', COALESCE(full_name, '') || ' ' || 
                          COALESCE(job_title, '') || ' ' || 
                          COALESCE(current_company, '') || ' ' || 
                          COALESCE(bio, ''))
);

-- Announcement Feed Sorting Index (Pinned first, then newest published)
CREATE INDEX idx_announcements_feed_order ON announcements (pinned DESC, created_at DESC)
    WHERE status = 'published';

-- ============================================================================
-- 7. AUTO-UPDATING TIMESTAMP TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_alumni_profiles_updated_at
BEFORE UPDATE ON alumni_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_announcements_updated_at
BEFORE UPDATE ON announcements
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. INITIAL SEED DATA POPULATION
-- Populates Admin user, all existing alumni members, and institutional bulletins.
-- Passwords are cryptographically salted & hashed using bcrypt work factor 10.
-- ============================================================================

-- A. Insert System Administrator / Coordinator
WITH new_admin AS (
    INSERT INTO users (email, password_hash, role)
    VALUES (
        'admin@alumni.edu',
        crypt('AdminPassword2026!', gen_salt('bf', 10)),
        'admin'
    )
    RETURNING id
)
INSERT INTO alumni_profiles (
    user_id, student_id, full_name, department, graduation_year, degree,
    current_company, job_title, city, country, linkedin_url, phone, bio, skills
)
SELECT 
    id, '1306000001', 'Alumni Office Admin', 'Information Systems (YBS)', 2015, 'Master',
    'Istanbul University', 'Director of Alumni Relations', 'Istanbul', 'Turkey',
    'https://linkedin.com/in/istanbul-alumni', '+90 212 440 00 00',
    'Coordinator for Istanbul University Alumni Relations & Professional Network.',
    '["Institutional Governance", "Event Management", "Academic Relations"]'::jsonb
FROM new_admin;

-- B. Insert Alumni 1: Ahmet Yılmaz (Google - Software Engineer)
WITH new_user AS (
    INSERT INTO users (email, password_hash, role)
    VALUES ('ahmet@alumni.edu', crypt('AlumniPass123!', gen_salt('bf', 10)), 'alumni')
    RETURNING id
)
INSERT INTO alumni_profiles (
    user_id, student_id, full_name, department, graduation_year, degree,
    current_company, job_title, city, country, linkedin_url, phone, bio, skills
)
SELECT 
    id, '1306160001', 'Ahmet Yilmaz', 'Computer Engineering', 2020, 'Bachelor',
    'Google', 'Software Engineer', 'Istanbul', 'Turkey',
    'https://linkedin.com/in/ahmetyilmaz', '+90 532 100 20 01',
    'Backend software engineer specializing in distributed systems and Go microservices.',
    '["Go", "Kubernetes", "Distributed Systems", "Cloud Architecture", "Docker"]'::jsonb
FROM new_user;

-- C. Insert Alumni 2: Elif Demir (Microsoft - Product Manager)
WITH new_user AS (
    INSERT INTO users (email, password_hash, role)
    VALUES ('elif@alumni.edu', crypt('AlumniPass123!', gen_salt('bf', 10)), 'alumni')
    RETURNING id
)
INSERT INTO alumni_profiles (
    user_id, student_id, full_name, department, graduation_year, degree,
    current_company, job_title, city, country, linkedin_url, phone, bio, skills
)
SELECT 
    id, '1306160002', 'Elif Demir', 'Electrical & Electronics', 2019, 'Bachelor',
    'Microsoft', 'Product Manager', 'Dublin', 'Ireland',
    'https://linkedin.com/in/elifdemir', '+353 1 200 30 02',
    'Leading cloud productivity product teams across Europe and Enterprise SaaS portfolios.',
    '["Product Strategy", "Agile", "Scrum", "Cloud Solutions", "User Research"]'::jsonb
FROM new_user;

-- D. Insert Alumni 3: Mehmet Kaya (Amazon - Data Analyst)
WITH new_user AS (
    INSERT INTO users (email, password_hash, role)
    VALUES ('mehmet@alumni.edu', crypt('AlumniPass123!', gen_salt('bf', 10)), 'alumni')
    RETURNING id
)
INSERT INTO alumni_profiles (
    user_id, student_id, full_name, department, graduation_year, degree,
    current_company, job_title, city, country, linkedin_url, phone, bio, skills
)
SELECT 
    id, '1306160003', 'Mehmet Kaya', 'Industrial Engineering', 2021, 'Bachelor',
    'Amazon', 'Data Analyst', 'Berlin', 'Germany',
    'https://linkedin.com/in/mehmetkaya', '+49 30 300 40 03',
    'Business intelligence analyst focused on logistics optimization and predictive modeling.',
    '["SQL", "Python", "Tableau", "Data Pipelines", "Power BI"]'::jsonb
FROM new_user;

-- E. Insert Alumni 4: Zeynep Çelik (Meta - Frontend Developer)
WITH new_user AS (
    INSERT INTO users (email, password_hash, role)
    VALUES ('zeynep@alumni.edu', crypt('AlumniPass123!', gen_salt('bf', 10)), 'alumni')
    RETURNING id
)
INSERT INTO alumni_profiles (
    user_id, student_id, full_name, department, graduation_year, degree,
    current_company, job_title, city, country, linkedin_url, phone, bio, skills
)
SELECT 
    id, '1306160004', 'Zeynep Celik', 'Computer Engineering', 2018, 'Master',
    'Meta', 'Frontend Developer', 'London', 'United Kingdom',
    'https://linkedin.com/in/zeynepcelik', '+44 20 400 50 04',
    'Frontend infrastructure engineer crafting high-performance design systems and React applications.',
    '["React", "TypeScript", "Next.js", "Web Performance", "GraphQL"]'::jsonb
FROM new_user;

-- F. Insert Alumni 5: Can Öztürk (Apple - iOS Developer)
WITH new_user AS (
    INSERT INTO users (email, password_hash, role)
    VALUES ('can@alumni.edu', crypt('AlumniPass123!', gen_salt('bf', 10)), 'alumni')
    RETURNING id
)
INSERT INTO alumni_profiles (
    user_id, student_id, full_name, department, graduation_year, degree,
    current_company, job_title, city, country, linkedin_url, phone, bio, skills
)
SELECT 
    id, '1306160005', 'Can Ozturk', 'Software Engineering', 2022, 'Bachelor',
    'Apple', 'iOS Developer', 'Cupertino', 'United States',
    'https://linkedin.com/in/canozturk', '+1 408 500 60 05',
    'Mobile engineer crafting native iOS experiences with SwiftUI and core system integrations.',
    '["Swift", "SwiftUI", "Combine", "iOS SDK", "CoreData"]'::jsonb
FROM new_user;

-- G. Insert Alumni 6: Öfe Emor Demiröz (Ay Yapım - Cast Manager)
WITH new_user AS (
    INSERT INTO users (email, password_hash, role)
    VALUES ('ofe@alumni.edu', crypt('AlumniPass123!', gen_salt('bf', 10)), 'alumni')
    RETURNING id
)
INSERT INTO alumni_profiles (
    user_id, student_id, full_name, department, graduation_year, degree,
    current_company, job_title, city, country, linkedin_url, phone, bio, skills
)
SELECT 
    id, '1306160006', 'Ofe Emor Demiroz', 'Information Systems (YBS)', 2023, 'Bachelor',
    'Ay Yapim', 'Cast Manager', 'Istanbul', 'Turkey',
    'https://linkedin.com/in/ofedemiroz', '+90 533 600 70 06',
    'Media production and casting coordinator applying information systems to entertainment workflows.',
    '["Talent Management", "Media Production", "Digital Marketing", "CRM Systems"]'::jsonb
FROM new_user;

-- ============================================================================
-- 9. SEED ANNOUNCEMENTS
-- Authored by the Admin user in the system
-- ============================================================================
INSERT INTO announcements (
    author_id, title, content, category, priority, status, target_audience, pinned, created_at
)
SELECT 
    u.id,
    'Annual Alumni Homecoming & Networking Gala 2026',
    'Join us on the historic Beyazit Campus for the annual Istanbul University Alumni Reunion. Features keynote addresses from industry leaders, networking dinners, and campus tours.',
    'Event', 'high', 'published', 'All Alumni & Faculty', TRUE,
    '2026-09-15 09:00:00+03'
FROM users u WHERE u.email = 'admin@alumni.edu';

INSERT INTO announcements (
    author_id, title, content, category, priority, status, target_audience, pinned, created_at
)
SELECT 
    u.id,
    'Tech Career Fair & Executive Mentorship Program',
    'Exclusive career opportunities for YBS and engineering graduates with premier technology firms including Google, Microsoft, and Amazon. Pre-registration is mandatory.',
    'Career', 'urgent', 'published', 'Graduates & Final-Year Students', TRUE,
    '2026-09-20 11:30:00+03'
FROM users u WHERE u.email = 'admin@alumni.edu';

INSERT INTO announcements (
    author_id, title, content, category, priority, status, target_audience, pinned, created_at
)
SELECT 
    u.id,
    'Guest Lecture: Artificial Intelligence & Enterprise Architecture',
    'Distinguished alumni seminar on modern microservices, cloud telemetry, and AI integration in corporate management information systems.',
    'Academic', 'medium', 'published', 'Management Information Systems (YBS)', FALSE,
    '2026-09-28 14:15:00+03'
FROM users u WHERE u.email = 'admin@alumni.edu';

INSERT INTO announcements (
    author_id, title, content, category, priority, status, target_audience, pinned, created_at
)
SELECT 
    u.id,
    'Alumni Mentorship Applications Now Open for Fall Semester',
    'Give back to the Istanbul University community by guiding 3rd and 4th-year students through industry transitions and professional career planning.',
    'Networking', 'high', 'published', 'Alumni with 2+ Years Experience', FALSE,
    '2026-10-01 08:45:00+03'
FROM users u WHERE u.email = 'admin@alumni.edu';

INSERT INTO announcements (
    author_id, title, content, category, priority, status, target_audience, pinned, created_at
)
SELECT 
    u.id,
    'Alumni Survey 2026: Enhancing Departmental Curriculum',
    'We invite all graduates to complete our biennial academic feedback survey to align current course offerings with modern industry requirements.',
    'General', 'low', 'draft', 'All Graduates', FALSE,
    '2026-10-05 16:20:00+03'
FROM users u WHERE u.email = 'admin@alumni.edu';
