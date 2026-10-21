/**
 * ============================================================================
 * Alumni Tracker — Database Migration (JavaScript Definition)
 * ============================================================================
 * Migration: 003_create_applications_table.js
 * Description: Explicitly defines Domain Models, Field Types, Invariants,
 *              and Entity Relationships for the Applications & Recruitment module.
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * Specification Reference: DDD.md (Sections 4, 5.5, 6.1, 6.2, 10)
 * ============================================================================
 */

/**
 * ============================================================================
 * 1. DOMAIN MODEL DEFINITION: Application
 * ============================================================================
 */
const ApplicationModelDefinition = {
  modelName: 'Application',
  tableName: 'applications',
  description: 'Represents candidate applications submitted by alumni to published job vacancies and internships.',
  
  // Model Attributes & Validation Invariants
  attributes: {
    id: {
      type: 'UUID',
      primaryKey: true,
      defaultValue: 'gen_random_uuid()',
      description: 'Universally unique surrogate primary key (RFC 4122 UUID v4).'
    },
    job_id: {
      type: 'UUID',
      allowNull: false,
      references: {
        model: 'job_postings',
        key: 'id'
      },
      onDelete: 'CASCADE',
      description: 'Foreign key referencing target career vacancy (job_postings.id).'
    },
    applicant_id: {
      type: 'UUID',
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      description: 'Foreign key referencing applying alumnus user (users.id).'
    },
    resume_url: {
      type: 'VARCHAR(255)',
      allowNull: true,
      validate: {
        isUrl: true
      },
      description: 'Optional web URI pointing to applicant resume PDF or portfolio.'
    },
    cover_letter: {
      type: 'TEXT',
      allowNull: true,
      description: 'Freeform candidate statement of interest and career introduction.'
    },
    status: {
      type: 'VARCHAR(30)',
      allowNull: false,
      defaultValue: 'submitted',
      validate: {
        isIn: [['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'rejected', 'accepted', 'withdrawn']]
      },
      description: 'Application lifecycle state.'
    },
    notes: {
      type: 'TEXT',
      allowNull: true,
      description: 'Confidential recruiter or departmental evaluation notes.'
    },
    applied_at: {
      type: 'TIMESTAMP WITH TIME ZONE',
      allowNull: false,
      defaultValue: 'CURRENT_TIMESTAMP',
      description: 'Application submission audit timestamp.'
    },
    updated_at: {
      type: 'TIMESTAMP WITH TIME ZONE',
      allowNull: false,
      defaultValue: 'CURRENT_TIMESTAMP',
      description: 'Last status or evaluation modification timestamp.'
    }
  },

  // Table Level Constraints
  constraints: {
    uniqueApplicationPerJob: {
      type: 'UNIQUE',
      fields: ['job_id', 'applicant_id'],
      description: 'Singularity Invariant: Guarantees an alumnus can apply at most once per job posting.'
    },
    statusEnumCheck: {
      type: 'CHECK',
      definition: "status IN ('submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'rejected', 'accepted', 'withdrawn')",
      description: 'Enforces valid lifecycle states.'
    }
  },

  // Performance & Relationship Indexes
  indexes: [
    {
      name: 'idx_applications_job_id',
      fields: ['job_id'],
      type: 'BTREE',
      purpose: 'Fast joins and retrieval of candidate lists for recruiters.'
    },
    {
      name: 'idx_applications_applicant_id',
      fields: ['applicant_id'],
      type: 'BTREE',
      purpose: 'Fast joins and retrieval of user application history.'
    },
    {
      name: 'idx_applications_status',
      fields: ['status'],
      type: 'BTREE',
      purpose: 'Status filter optimization for recruitment workflow pipeline.'
    },
    {
      name: 'idx_applications_job_status',
      fields: ['job_id', 'status'],
      type: 'BTREE',
      purpose: 'Compound index accelerating recruiter status-based applicant filtering.'
    },
    {
      name: 'idx_applications_applied_at',
      fields: ['applied_at DESC'],
      type: 'BTREE',
      purpose: 'Chronological candidate submission timeline ordering.'
    }
  ]
};

/**
 * ============================================================================
 * 2. ENTITY RELATIONSHIP SPECIFICATIONS
 * ============================================================================
 */
const Relationships = [
  {
    name: 'Application_belongsTo_JobPosting',
    source: 'Application',
    target: 'JobPosting',
    cardinality: 'N:1',
    foreignKey: 'job_id',
    targetKey: 'id',
    onDelete: 'CASCADE',
    description: 'Each application belongs to exactly one target job posting.'
  },
  {
    name: 'JobPosting_hasMany_Applications',
    source: 'JobPosting',
    target: 'Application',
    cardinality: '1:N',
    foreignKey: 'job_id',
    targetKey: 'id',
    onDelete: 'CASCADE',
    description: 'A job posting receives zero or many candidate applications.'
  },
  {
    name: 'Application_belongsTo_User_Applicant',
    source: 'Application',
    target: 'User',
    cardinality: 'N:1',
    foreignKey: 'applicant_id',
    targetKey: 'id',
    onDelete: 'CASCADE',
    description: 'Each application is authored by exactly one registered alumnus user.'
  },
  {
    name: 'User_hasMany_Applications',
    source: 'User',
    target: 'Application',
    cardinality: '1:N',
    foreignKey: 'applicant_id',
    targetKey: 'id',
    onDelete: 'CASCADE',
    description: 'A registered alumnus user may submit applications to zero or many job vacancies.'
  },
  {
    name: 'AlumniProfile_hasMany_Applications',
    source: 'AlumniProfile',
    target: 'Application',
    cardinality: '1:N (Logical)',
    foreignKey: 'applicant_id',
    targetKey: 'user_id',
    description: 'Alumni profile details (degree, graduation year, skills) projected on candidate evaluation views.'
  }
];

module.exports = {
  version: '003',
  name: '003_create_applications_table',
  Model: ApplicationModelDefinition,
  Relationships
};
