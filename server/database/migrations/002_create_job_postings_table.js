/**
 * ============================================================================
 * Alumni Tracker — Database Migration (JavaScript Definition)
 * ============================================================================
 * Migration: 002_create_job_postings_table.js
 * Description: Explicitly defines Domain Models, Field Types, Invariants,
 *              and Entity Relationships for the Job Postings module.
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * Specification Reference: DDD.md (Sections 4, 5.4, 6.1, 6.2)
 * ============================================================================
 */

/**
 * ============================================================================
 * 1. DOMAIN MODEL DEFINITION: JobPosting
 * ============================================================================
 */
const JobPostingModelDefinition = {
  modelName: 'JobPosting',
  tableName: 'job_postings',
  description: 'Represents graduate employment opportunities, corporate vacancies, and internships.',
  
  // Model Attributes & Validation Invariants
  attributes: {
    id: {
      type: 'UUID',
      primaryKey: true,
      defaultValue: 'gen_random_uuid()',
      description: 'Universally unique surrogate primary key (RFC 4122 UUID v4).'
    },
    title: {
      type: 'VARCHAR(120)',
      allowNull: false,
      validate: { minLength: 3, maxLength: 120 },
      description: 'Designation / job title (e.g. Senior Cloud Engineer). Maximum 120 chars.'
    },
    company_name: {
      type: 'VARCHAR(150)',
      allowNull: false,
      validate: { minLength: 2, maxLength: 150 },
      description: 'Hiring corporate or academic entity.'
    },
    department: {
      type: 'VARCHAR(100)',
      allowNull: true,
      description: 'Target academic discipline (e.g. Information Systems / YBS).'
    },
    location: {
      type: 'VARCHAR(100)',
      allowNull: true,
      description: 'Geographic location / primary city of employment (Optional).'
    },
    employment_type: {
      type: 'VARCHAR(50)',
      allowNull: false,
      defaultValue: 'Full-time',
      validate: {
        isIn: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']
      },
      description: 'Contractual employment model.'
    },
    work_mode: {
      type: 'VARCHAR(50)',
      allowNull: false,
      defaultValue: 'Hybrid',
      validate: {
        isIn: ['On-site', 'Hybrid', 'Remote']
      },
      description: 'Workplace presence arrangement.'
    },
    experience_level: {
      type: 'VARCHAR(50)',
      allowNull: false,
      defaultValue: 'Mid-Level',
      validate: {
        isIn: ['Entry-Level', 'Mid-Level', 'Senior', 'Lead', 'Executive', 'Internship']
      },
      description: 'Target seniority classification.'
    },
    salary_range: {
      type: 'VARCHAR(100)',
      allowNull: true,
      description: 'Disclosed compensation bracket.'
    },
    min_wage_multiplier: {
      type: 'NUMERIC(4,2)',
      allowNull: true,
      validate: { min: 0 },
      description: 'Average minimum wage multiplier (Ortalama asgari ucret katsayisi).'
    },
    process_duration: {
      type: 'VARCHAR(100)',
      allowNull: true,
      description: 'Estimated duration of hiring process (Surec bilgisi).'
    },
    description: {
      type: 'TEXT',
      allowNull: true,
      description: 'Comprehensive role overview and daily responsibilities (Optional).'
    },
    requirements: {
      type: 'TEXT',
      allowNull: true,
      description: 'Mandatory technical criteria and academic qualifications.'
    },
    skills: {
      type: 'JSONB',
      allowNull: false,
      defaultValue: [],
      validate: { isArray: true },
      description: 'Semi-structured binary JSON array of required competencies.'
    },
    application_url: {
      type: 'VARCHAR(255)',
      allowNull: true,
      validate: { isUrl: true },
      description: 'External applicant tracking system or portal URL.'
    },
    contact_email: {
      type: 'VARCHAR(255)',
      allowNull: true,
      validate: { isEmail: true },
      description: 'Direct recruiter or referral contact email address.'
    },
    deadline: {
      type: 'DATE',
      allowNull: true,
      description: 'Application cutoff deadline date.'
    },
    status: {
      type: 'VARCHAR(20)',
      allowNull: false,
      defaultValue: 'active',
      validate: {
        isIn: ['draft', 'active', 'closed', 'archived']
      },
      description: 'Publication lifecycle workflow state.'
    },
    views_count: {
      type: 'INTEGER',
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
      description: 'Aggregated impression counter.'
    },
    created_at: {
      type: 'TIMESTAMP WITH TIME ZONE',
      allowNull: false,
      defaultValue: 'CURRENT_TIMESTAMP'
    },
    updated_at: {
      type: 'TIMESTAMP WITH TIME ZONE',
      allowNull: false,
      defaultValue: 'CURRENT_TIMESTAMP'
    }
  }
};

/**
 * ============================================================================
 * 2. ENTITY RELATIONSHIP SPECIFICATIONS
 * ============================================================================
 */
const ModelRelationships = [
  {
    name: 'JobPosting_hasMany_Applications',
    source: 'JobPosting',
    target: 'Application',
    type: 'hasMany',
    cardinality: '1:N',
    foreignKey: 'job_id',
    sourceKey: 'id',
    as: 'applications',
    description: 'A career opportunity receives zero or many candidate submissions via the associative applications table.'
  },
  {
    name: 'JobPosting_belongsToMany_Users',
    source: 'JobPosting',
    target: 'User',
    type: 'belongsToMany',
    cardinality: 'M:N',
    through: 'applications',
    foreignKey: 'job_id',
    otherKey: 'applicant_id',
    as: 'applicants',
    description: 'Many-to-Many relational association linking JobPostings to applicant Users exclusively through Applications.'
  }
];

/**
 * ============================================================================
 * 3. MIGRATION EXECUTION (UP & DOWN)
 * ============================================================================
 */

/**
 * Apply migration: Create job_postings table, constraints, and indexes.
 * @param {Object} db - Database client connection
 */
async function up(db) {
  await db.query('BEGIN');
  try {
    // 1. Table Creation
    await db.query(`
      CREATE TABLE IF NOT EXISTS job_postings (
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
    `);

    // 2. Performance Indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_job_postings_feed_order ON job_postings (status, created_at DESC) WHERE status = 'active';
      CREATE INDEX IF NOT EXISTS idx_job_postings_filter ON job_postings (work_mode, employment_type);
      CREATE INDEX IF NOT EXISTS idx_job_postings_skills_gin ON job_postings USING GIN (skills);
      CREATE INDEX IF NOT EXISTS idx_job_postings_fts ON job_postings USING GIN (
        to_tsvector('simple', COALESCE(title, '') || ' ' || 
                              COALESCE(company_name, '') || ' ' || 
                              COALESCE(location, '') || ' ' || 
                              COALESCE(description, ''))
      );
    `);

    // 3. Auto-updating Timestamp Trigger
    await db.query(`
      DROP TRIGGER IF EXISTS trigger_job_postings_updated_at ON job_postings;
      CREATE TRIGGER trigger_job_postings_updated_at
      BEFORE UPDATE ON job_postings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // 4. Record Migration Execution
    await db.query(`
      INSERT INTO schema_migrations (version, name)
      VALUES ('002', 'create_job_postings_table')
      ON CONFLICT (version) DO UPDATE SET applied_at = CURRENT_TIMESTAMP;
    `);

    await db.query('COMMIT');
  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  }
}

/**
 * Revert migration: Drop trigger, indexes, and table.
 * @param {Object} db - Database client connection
 */
async function down(db) {
  await db.query('BEGIN');
  try {
    await db.query(`
      DROP TRIGGER IF EXISTS trigger_job_postings_updated_at ON job_postings;
      DROP INDEX IF EXISTS idx_job_postings_fts;
      DROP INDEX IF EXISTS idx_job_postings_skills_gin;
      DROP INDEX IF EXISTS idx_job_postings_filter;
      DROP INDEX IF EXISTS idx_job_postings_feed_order;
      DROP INDEX IF EXISTS idx_job_postings_poster_id;
      DROP TABLE IF EXISTS job_postings CASCADE;
      DELETE FROM schema_migrations WHERE version = '002';
    `);
    await db.query('COMMIT');
  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  }
}

module.exports = {
  version: '002',
  name: 'create_job_postings_table',
  Model: JobPostingModelDefinition,
  Relationships: ModelRelationships,
  up,
  down
};
