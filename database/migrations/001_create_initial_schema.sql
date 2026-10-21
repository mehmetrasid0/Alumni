-- ============================================================================
-- Migration: 001_create_initial_schema.sql
-- Description: Baseline schema provisioning users, alumni_profiles, and announcements
-- Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
-- Specification Reference: DDD.md (Sections 5.1, 5.2, 5.3)
-- Database Engine: PostgreSQL 15+
-- ============================================================================

BEGIN;

-- 1. Ensure required cryptographic extension is active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Schema Migrations Ledger Table
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. TABLE: users
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'alumni',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_users_role CHECK (role IN ('alumni', 'admin', 'coordinator')),
    CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));

-- ============================================================================
-- 4. TABLE: alumni_profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS alumni_profiles (
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

    CONSTRAINT fk_alumni_user FOREIGN KEY (user_id) 
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_alumni_user_id UNIQUE (user_id),
    CONSTRAINT uq_alumni_student_id UNIQUE (student_id),

    CONSTRAINT chk_alumni_graduation_year CHECK (graduation_year BETWEEN 1950 AND 2100),
    CONSTRAINT chk_alumni_degree CHECK (degree IN ('Bachelor', 'Master', 'PhD', 'Associate')),
    CONSTRAINT chk_alumni_skills_array CHECK (jsonb_typeof(skills) = 'array')
);

CREATE INDEX IF NOT EXISTS idx_alumni_profiles_user_id ON alumni_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_alumni_dept_grad_year ON alumni_profiles (department, graduation_year);
CREATE INDEX IF NOT EXISTS idx_alumni_skills_gin ON alumni_profiles USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_alumni_fts ON alumni_profiles USING GIN (
    to_tsvector('simple', COALESCE(full_name, '') || ' ' || 
                          COALESCE(job_title, '') || ' ' || 
                          COALESCE(current_company, '') || ' ' || 
                          COALESCE(bio, ''))
);

-- ============================================================================
-- 5. TABLE: announcements
-- ============================================================================
CREATE TABLE IF NOT EXISTS announcements (
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

    CONSTRAINT fk_announcements_author FOREIGN KEY (author_id)
        REFERENCES users (id) ON DELETE RESTRICT,

    CONSTRAINT chk_announcements_category CHECK (category IN ('Career', 'Event', 'Academic', 'General', 'Networking')),
    CONSTRAINT chk_announcements_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT chk_announcements_status CHECK (status IN ('draft', 'published', 'archived')),
    CONSTRAINT chk_announcements_title_length CHECK (char_length(TRIM(title)) >= 3)
);

CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON announcements (author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_feed_order ON announcements (pinned DESC, created_at DESC)
    WHERE status = 'published';

-- ============================================================================
-- 6. TIMESTAMP TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_alumni_profiles_updated_at ON alumni_profiles;
CREATE TRIGGER trigger_alumni_profiles_updated_at
BEFORE UPDATE ON alumni_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_announcements_updated_at ON announcements;
CREATE TRIGGER trigger_announcements_updated_at
BEFORE UPDATE ON announcements
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Record Migration
INSERT INTO schema_migrations (version, name)
VALUES ('001', 'create_initial_schema')
ON CONFLICT (version) DO NOTHING;

COMMIT;
