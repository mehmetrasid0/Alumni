-- ============================================================================
-- Migration: 003_create_applications_table.sql
-- Description: Provision applications table, relational integrity constraints,
--              unique submission invariants, performance indexes, and triggers
-- Author: Mehmet Raşid Ünlüel (Istanbul University - YBS, 3rd Year)
-- Project: Alumni Tracker (Web Programming Course - 2026)
-- Specification Reference: DDD.md (Sections 5.5, 6.1, 6.2, 6.3, 10)
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
-- Model: Application
-- Physical Table: applications
-- Primary Key: id (UUID v4)
-- Domain Module: Recruitment, Opportunity Applications & Candidate Tracking
--
-- ENTITY RELATIONSHIPS:
-- ┌────────────────┐          1:N (Foreign Key: applicant_id)        ┌───────────────┐
-- │  Model: User   │ ◄───────────────────────────────────────────── │ Model:        │
-- │ (Table: users) │                                                │  Application  │
-- └────────────────┘                                                │(applications) │
--         ▲                                                         └───────────────┘
--         │ 1:1 (user_id)                                                   │
--         ▼                                                                 │
-- ┌─────────────────┐                                                       │
-- │  AlumniProfile  │ ◄ - - - - Candidate Profile Information - - - - - - - ┤
-- │(alumni_profiles)│                                                       │
-- └─────────────────┘                                                       │
--                                                                           │
-- ┌────────────────┐         1:N (Foreign Key: job_id)                     │
-- │Model:JobPosting│ ◄─────────────────────────────────────────────────────┘
-- │ (job_postings) │
-- └────────────────┘
--
-- 1. Application N:1 JobPosting (Many-to-One):
--    - Source Model: Application (Foreign Key: job_id)
--    - Target Model: JobPosting (Target Key: id)
--    - Cardinality: N:1 (Each application belongs to exactly one target job posting)
--    - Referential Action: ON DELETE CASCADE (Deleting job removes related applications)
--
-- 2. Application N:1 User [Applicant] (Many-to-One):
--    - Source Model: Application (Foreign Key: applicant_id)
--    - Target Model: User (Target Key: id)
--    - Cardinality: N:1 (Each application is authored by exactly one registered alumnus user)
--    - Referential Action: ON DELETE CASCADE (Deleting user account removes their applications)
--
-- 3. JobPosting 1:N Application (One-to-Many):
--    - Source Model: JobPosting (Primary Key: id)
--    - Target Model: Application (Foreign Key: job_id)
--    - Cardinality: 1:N (A job vacancy receives zero or many candidate applications)
--
-- 4. User 1:N Application (One-to-Many):
--    - Source Model: User (Primary Key: id)
--    - Target Model: Application (Foreign Key: applicant_id)
--    - Cardinality: 1:N (A user may apply to zero or many distinct job postings)
--
-- 5. Composite Uniqueness Invariant:
--    - UNIQUE (job_id, applicant_id): An alumnus can submit at most one application per job.
-- ============================================================================

-- 4. Create applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    applicant_id UUID NOT NULL,
    resume_url VARCHAR(255),
    cover_letter TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'submitted',
    notes TEXT,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Key Constraints
    CONSTRAINT fk_applications_job FOREIGN KEY (job_id)
        REFERENCES job_postings (id) ON DELETE CASCADE,
    CONSTRAINT fk_applications_applicant FOREIGN KEY (applicant_id)
        REFERENCES users (id) ON DELETE CASCADE,

    -- Singularity Invariant: One application per user per job vacancy
    CONSTRAINT uq_applications_job_applicant UNIQUE (job_id, applicant_id),

    -- Workflow Check Constraints
    CONSTRAINT chk_applications_status CHECK (status IN (
        'submitted', 'under_review', 'shortlisted', 
        'interview_scheduled', 'rejected', 'accepted', 'withdrawn'
    ))
);

-- ============================================================================
-- 5. PERFORMANCE & RELATIONSHIP INDEXES
-- ============================================================================

-- Fast Foreign Key Joins
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications (job_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON applications (applicant_id);

-- Status & Compound Filtering (Recruiter Dashboard)
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_job_status ON applications (job_id, status);

-- Candidate Submission Timeline Ordering
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications (applied_at DESC);

-- ============================================================================
-- 6. AUTO-UPDATING TIMESTAMP TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_applications_updated_at ON applications;

CREATE TRIGGER trigger_applications_updated_at
BEFORE UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. POSTGRESQL DATA CATALOG METADATA (Self-Documenting Schema)
-- ============================================================================

COMMENT ON TABLE applications IS 'Stores candidate applications submitted by alumni to published career opportunities.';
COMMENT ON COLUMN applications.id IS 'Universally unique surrogate primary key (RFC 4122 UUID v4).';
COMMENT ON COLUMN applications.job_id IS 'Foreign key referencing target job posting (job_postings.id) ON DELETE CASCADE.';
COMMENT ON COLUMN applications.applicant_id IS 'Foreign key referencing applying alumnus (users.id) ON DELETE CASCADE.';
COMMENT ON COLUMN applications.resume_url IS 'Optional web URI pointing to applicant PDF resume or portfolio.';
COMMENT ON COLUMN applications.cover_letter IS 'Freeform candidate statement of interest and career introduction.';
COMMENT ON COLUMN applications.status IS 'Recruitment lifecycle status: submitted, under_review, shortlisted, interview_scheduled, rejected, accepted, withdrawn.';
COMMENT ON COLUMN applications.notes IS 'Confidential recruiter or departmental evaluation remarks.';
COMMENT ON COLUMN applications.applied_at IS 'Application submission audit timestamp.';
COMMENT ON COLUMN applications.updated_at IS 'Timestamp of last status modification or evaluation note update.';

-- ============================================================================
-- 8. LEDGER RECORDING
-- ============================================================================

INSERT INTO schema_migrations (version, name, applied_at)
VALUES ('003', '003_create_applications_table.sql', CURRENT_TIMESTAMP)
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ============================================================================
-- DOWN MIGRATION (Rollback)
-- ============================================================================
-- To revert this migration run:
-- BEGIN;
-- DROP TRIGGER IF EXISTS trigger_applications_updated_at ON applications;
-- DROP TABLE IF EXISTS applications CASCADE;
-- DELETE FROM schema_migrations WHERE version = '003';
-- COMMIT;
