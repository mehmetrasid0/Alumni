-- ============================================================================
-- Migration: 002_create_job_postings_table.sql
-- Description: Provision job_postings table, integrity constraints, performance indexes, and triggers
-- Author: Mehmet Raşid Ünlüel (Istanbul University - YBS, 3rd Year)
-- Project: Alumni Tracker (Web Programming Course - 2026)
-- Specification Reference: DDD.md (Sections 5.4, 6.1, 6.2, 6.3)
-- Target Database Engine: PostgreSQL 15+
-- ============================================================================

-- ============================================================================
-- UP MIGRATION (Apply)
-- ============================================================================

BEGIN;

-- 1. Ensure required cryptographic extension is active for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Schema Migrations Ledger Table
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. DOMAIN MODEL SPECIFICATION & RELATIONSHIPS
-- ============================================================================
-- Model: JobPosting
-- Physical Table: job_postings
-- Primary Key: id (UUID v4)
-- Domain Module: Career & Opportunity Management
--
-- ENTITY RELATIONSHIPS:
-- User and JobPosting are related as a Many-to-Many (M:N) relationship
-- resolved exclusively through the associative table `applications`:
--
-- ┌────────────────┐          1:N (applicant_id)          ┌───────────────┐
-- │  Model: User   │ ◄────────────────────────────────── │ Model:        │
-- │ (Table: users) │                                     │  Application  │
-- └────────────────┘                                     │ (applications)│
--                                                        └───────────────┘
--                                                                ▲
--                                                                │ 1:N (job_id)
--                                                        ┌───────────────┐
--                                                        │  JobPosting   │
--                                                        │ (job_postings)│
--                                                        └───────────────┘
-- ============================================================================

CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    location VARCHAR(100) NOT NULL,
    employment_type VARCHAR(50) NOT NULL DEFAULT 'Full-time',
    work_mode VARCHAR(50) NOT NULL DEFAULT 'Hybrid',
    experience_level VARCHAR(50) NOT NULL DEFAULT 'Mid-Level',
    salary_range VARCHAR(100),
    description TEXT NOT NULL,
    requirements TEXT,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    application_url VARCHAR(255),
    contact_email VARCHAR(255),
    deadline DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    views_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- [MODEL INVARIANTS]: Table Integrity & Check Constraints
    CONSTRAINT chk_job_postings_employment_type CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance')),
    CONSTRAINT chk_job_postings_work_mode CHECK (work_mode IN ('On-site', 'Hybrid', 'Remote')),
    CONSTRAINT chk_job_postings_experience_level CHECK (experience_level IN ('Entry-Level', 'Mid-Level', 'Senior', 'Lead', 'Executive', 'Internship')),
    CONSTRAINT chk_job_postings_status CHECK (status IN ('draft', 'active', 'closed', 'archived')),
    CONSTRAINT chk_job_postings_skills_array CHECK (jsonb_typeof(skills) = 'array'),
    CONSTRAINT chk_job_postings_title_length CHECK (char_length(TRIM(title)) >= 3),
    CONSTRAINT chk_job_postings_company_length CHECK (char_length(TRIM(company_name)) >= 2),
    CONSTRAINT chk_job_postings_views_positive CHECK (views_count >= 0)
);

-- Register Model metadata in PostgreSQL Data Catalog
COMMENT ON TABLE job_postings IS 'Domain Model: JobPosting | Table: job_postings | Managed by JobPostingModel';
COMMENT ON COLUMN job_postings.id IS 'Model Attribute: JobPosting.id [PK UUID v4]';
COMMENT ON COLUMN job_postings.title IS 'Model Attribute: JobPosting.title [Position Title / Designation]';
COMMENT ON COLUMN job_postings.company_name IS 'Model Attribute: JobPosting.companyName [Hiring Company / Organization]';
COMMENT ON COLUMN job_postings.department IS 'Model Attribute: JobPosting.department [Target Academic Discipline]';
COMMENT ON COLUMN job_postings.location IS 'Model Attribute: JobPosting.location [City / Country]';
COMMENT ON COLUMN job_postings.employment_type IS 'Model Attribute: JobPosting.employmentType [Full-time, Part-time, Internship, Contract, Freelance]';
COMMENT ON COLUMN job_postings.work_mode IS 'Model Attribute: JobPosting.workMode [On-site, Hybrid, Remote]';
COMMENT ON COLUMN job_postings.experience_level IS 'Model Attribute: JobPosting.experienceLevel [Entry-Level, Mid-Level, Senior, Lead, Executive, Internship]';
COMMENT ON COLUMN job_postings.skills IS 'Model Attribute: JobPosting.skills [Semi-structured JSONB array of required competencies]';

-- ============================================================================
-- 4. PERFORMANCE & FULL-TEXT SEARCH (FTS) INDEXES
-- ============================================================================

-- Filtered Feed Index (Fast sorting for active listings by newest date)
CREATE INDEX IF NOT EXISTS idx_job_postings_feed_order 
    ON job_postings (status, created_at DESC)
    WHERE status = 'active';

-- Compound Filter Index for Career Board (Work Mode + Employment Type)
CREATE INDEX IF NOT EXISTS idx_job_postings_filter 
    ON job_postings (work_mode, employment_type);

-- GIN (Generalized Inverted Index) for JSONB Skills Matching
CREATE INDEX IF NOT EXISTS idx_job_postings_skills_gin 
    ON job_postings USING GIN (skills);

-- GIN Full-Text Search Index (Title, Company, Location, Description)
CREATE INDEX IF NOT EXISTS idx_job_postings_fts 
    ON job_postings USING GIN (
        to_tsvector('simple', COALESCE(title, '') || ' ' || 
                              COALESCE(company_name, '') || ' ' || 
                              COALESCE(location, '') || ' ' || 
                              COALESCE(description, ''))
    );

-- ============================================================================
-- 5. AUTO-UPDATING TIMESTAMP TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_job_postings_updated_at ON job_postings;
CREATE TRIGGER trigger_job_postings_updated_at
BEFORE UPDATE ON job_postings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. RECORD MIGRATION EXECUTION
-- ============================================================================
INSERT INTO schema_migrations (version, name)
VALUES ('002', 'create_job_postings_table')
ON CONFLICT (version) DO UPDATE 
SET applied_at = CURRENT_TIMESTAMP;

COMMIT;

-- ============================================================================
-- DOWN MIGRATION (Rollback / Revert)
-- Run the statements below to safely reverse this migration:
-- ============================================================================
/*
BEGIN;

DROP TRIGGER IF EXISTS trigger_job_postings_updated_at ON job_postings;
DROP INDEX IF EXISTS idx_job_postings_fts;
DROP INDEX IF EXISTS idx_job_postings_skills_gin;
DROP INDEX IF EXISTS idx_job_postings_filter;
DROP INDEX IF EXISTS idx_job_postings_feed_order;
DROP INDEX IF EXISTS idx_job_postings_poster_id;
DROP TABLE IF EXISTS job_postings CASCADE;

DELETE FROM schema_migrations WHERE version = '002';

COMMIT;
*/
