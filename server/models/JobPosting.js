/**
 * ============================================================================
 * Alumni Tracker — Job Posting Model (PostgreSQL Persistent Model)
 * ============================================================================
 * Architectural Layer: MODEL (M in MVC / DAO Pattern)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * Specification Reference: DDD.md
 * 
 * Description:
 *   Production-grade Job Posting Model directly connected to PostgreSQL database.
 *   Encapsulates all CRUD operations for the `job_postings` table.
 *   Provides dual-format attribute mapping (camelCase & snake_case) and robust
 *   multi-criteria search with GIN index skills containment.
 * ============================================================================
 */

const db = require('../db');

/**
 * Format a raw database row into a standardized JobPosting DTO.
 * @param {Object} row
 * @returns {Object|null}
 */
function formatJobPosting(row) {
  if (!row) return null;

  let skills = [];
  if (Array.isArray(row.skills)) {
    skills = row.skills;
  } else if (typeof row.skills === 'string') {
    try {
      skills = JSON.parse(row.skills);
    } catch {
      skills = [];
    }
  }

  return {
    id: row.id,
    title: row.title,
    companyName: row.company_name,
    company_name: row.company_name,
    department: row.department || null,
    location: row.location,
    employmentType: row.employment_type || 'Full-time',
    employment_type: row.employment_type || 'Full-time',
    workMode: row.work_mode || 'Hybrid',
    work_mode: row.work_mode || 'Hybrid',
    experienceLevel: row.experience_level || 'Mid-Level',
    experience_level: row.experience_level || 'Mid-Level',
    salaryRange: row.salary_range || null,
    salary_range: row.salary_range || null,
    minWageMultiplier: row.min_wage_multiplier !== null && row.min_wage_multiplier !== undefined ? parseFloat(row.min_wage_multiplier) : null,
    min_wage_multiplier: row.min_wage_multiplier !== null && row.min_wage_multiplier !== undefined ? parseFloat(row.min_wage_multiplier) : null,
    processDuration: row.process_duration || null,
    process_duration: row.process_duration || null,
    description: row.description || null,
    requirements: row.requirements || null,
    skills,
    applicationUrl: row.application_url || null,
    application_url: row.application_url || null,
    contactEmail: row.contact_email || null,
    contact_email: row.contact_email || null,
    deadline: row.deadline ? new Date(row.deadline).toISOString().split('T')[0] : null,
    status: row.status || 'active',
    viewsCount: parseInt(row.views_count, 10) || 0,
    views_count: parseInt(row.views_count, 10) || 0,
    createdAt: row.created_at || new Date().toISOString(),
    created_at: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || null,
    updated_at: row.updated_at || null
  };
}

class JobPostingModel {
  // ==========================================================================
  // [READ] Queries
  // ==========================================================================

  /**
   * Retrieve all job postings with multi-criteria filtering.
   * @param {Object} [filters={}] - query/q, department, employmentType, workMode, experienceLevel, status, skill
   * @returns {Promise<Array<Object>>}
   */
  async findAll(filters = {}) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Filter by keyword query (matches title, company, location, description)
    const searchTerm = filters.query || filters.q;
    if (searchTerm) {
      conditions.push(`(
        j.title ILIKE $${paramIndex} OR
        j.company_name ILIKE $${paramIndex} OR
        j.location ILIKE $${paramIndex} OR
        j.description ILIKE $${paramIndex}
      )`);
      params.push(`%${String(searchTerm).trim()}%`);
      paramIndex++;
    }

    // Filter by department
    if (filters.department) {
      conditions.push(`j.department ILIKE $${paramIndex}`);
      params.push(`%${String(filters.department).trim()}%`);
      paramIndex++;
    }

    // Filter by employment type
    const empType = filters.employmentType || filters.employment_type;
    if (empType) {
      conditions.push(`LOWER(j.employment_type) = LOWER($${paramIndex})`);
      params.push(String(empType).trim());
      paramIndex++;
    }

    // Filter by work mode
    const workMode = filters.workMode || filters.work_mode;
    if (workMode) {
      conditions.push(`LOWER(j.work_mode) = LOWER($${paramIndex})`);
      params.push(String(workMode).trim());
      paramIndex++;
    }

    // Filter by experience level
    const expLevel = filters.experienceLevel || filters.experience_level;
    if (expLevel) {
      conditions.push(`LOWER(j.experience_level) = LOWER($${paramIndex})`);
      params.push(String(expLevel).trim());
      paramIndex++;
    }

    // Filter by status (defaults to active unless specified or 'all')
    const status = filters.status;
    if (status && status !== 'all') {
      conditions.push(`LOWER(j.status) = LOWER($${paramIndex})`);
      params.push(String(status).trim());
      paramIndex++;
    } else if (!status) {
      conditions.push(`j.status = 'active'`);
    }

    // Filter by skill using GIN jsonb containment
    if (filters.skill) {
      conditions.push(`j.skills @> $${paramIndex}::jsonb`);
      params.push(JSON.stringify([String(filters.skill).trim()]));
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
      SELECT j.*
      FROM job_postings j
      ${whereClause}
      ORDER BY j.created_at DESC
    `;

    const res = await db.query(query, params);
    return res.rows.map(formatJobPosting);
  }

  /**
   * Retrieve a single job posting by ID.
   * @param {string} id - UUID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const query = `
      SELECT j.*
      FROM job_postings j
      WHERE j.id = $1
      LIMIT 1
    `;

    const res = await db.query(query, [id]);
    if (res.rows.length === 0) return null;
    return formatJobPosting(res.rows[0]);
  }

  /**
   * For backwards compatibility.
   * @returns {Promise<Array<Object>>}
   */
  async findByPosterId() {
    return [];
  }

  // ==========================================================================
  // [CREATE] Mutation
  // ==========================================================================

  /**
   * Create and persist a new job posting.
   * @param {Object} jobData
   * @returns {Promise<Object>}
   */
  async create(jobData) {
    const title = String(jobData.title || '').trim();
    if (!title) {
      throw new Error('Position title is required');
    }
    if (title.length > 120) {
      throw new Error('Position title must not exceed 120 characters');
    }

    const companyName = String(jobData.companyName || jobData.company_name || '').trim();
    if (!companyName) {
      throw new Error('Company name is required');
    }

    const department = jobData.department ? String(jobData.department).trim() : null;
    const location = jobData.location !== undefined && jobData.location !== null ? String(jobData.location).trim() : null;
    const employmentType = jobData.employmentType || jobData.employment_type || 'Full-time';
    const workMode = jobData.workMode || jobData.work_mode || 'Hybrid';
    const experienceLevel = jobData.experienceLevel || jobData.experience_level || 'Mid-Level';
    const salaryRange = jobData.salaryRange || jobData.salary_range || null;

    let minWageMultiplier = jobData.minWageMultiplier !== undefined ? jobData.minWageMultiplier : jobData.min_wage_multiplier;
    if (minWageMultiplier !== undefined && minWageMultiplier !== null && minWageMultiplier !== '') {
      minWageMultiplier = parseFloat(minWageMultiplier);
      if (isNaN(minWageMultiplier) || minWageMultiplier <= 0) {
        throw new Error('Minimum wage multiplier must be a positive number');
      }
    } else {
      minWageMultiplier = null;
    }

    const processDuration = jobData.processDuration || jobData.process_duration || null;
    const description = jobData.description !== undefined && jobData.description !== null ? String(jobData.description).trim() : null;
    const requirements = jobData.requirements ? String(jobData.requirements).trim() : null;
    const applicationUrl = jobData.applicationUrl || jobData.application_url || null;
    const contactEmail = jobData.contactEmail || jobData.contact_email || null;
    const deadline = jobData.deadline || null;
    const status = jobData.status || 'active';

    let skills = [];
    if (Array.isArray(jobData.skills)) {
      skills = jobData.skills;
    } else if (typeof jobData.skills === 'string') {
      try {
        skills = JSON.parse(jobData.skills);
      } catch {
        skills = jobData.skills.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    const query = `
      INSERT INTO job_postings (
        title, company_name, department, location, employment_type,
        work_mode, experience_level, salary_range, min_wage_multiplier, process_duration,
        description, requirements, skills, application_url, contact_email, deadline, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const res = await db.query(query, [
      title,
      companyName,
      department,
      location,
      employmentType,
      workMode,
      experienceLevel,
      salaryRange,
      minWageMultiplier,
      processDuration,
      description,
      requirements,
      JSON.stringify(skills),
      applicationUrl,
      contactEmail,
      deadline,
      status
    ]);

    return formatJobPosting(res.rows[0]);
  }

  // ==========================================================================
  // [UPDATE] Mutation
  // ==========================================================================

  /**
   * Update an existing job posting.
   * @param {string} id - UUID
   * @param {Object} updateData
   * @returns {Promise<Object|null>}
   */
  async update(id, updateData) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const title = updateData.title !== undefined ? String(updateData.title).trim() : existing.title;
    if (title && title.length > 120) {
      throw new Error('Position title must not exceed 120 characters');
    }

    const companyName = (updateData.companyName || updateData.company_name) !== undefined
      ? String(updateData.companyName || updateData.company_name).trim()
      : existing.companyName;
    const department = updateData.department !== undefined ? updateData.department : existing.department;
    const location = updateData.location !== undefined ? (updateData.location ? String(updateData.location).trim() : null) : existing.location;
    const employmentType = (updateData.employmentType || updateData.employment_type) !== undefined
      ? (updateData.employmentType || updateData.employment_type)
      : existing.employmentType;
    const workMode = (updateData.workMode || updateData.work_mode) !== undefined
      ? (updateData.workMode || updateData.work_mode)
      : existing.workMode;
    const experienceLevel = (updateData.experienceLevel || updateData.experience_level) !== undefined
      ? (updateData.experienceLevel || updateData.experience_level)
      : existing.experienceLevel;
    const salaryRange = (updateData.salaryRange || updateData.salary_range) !== undefined
      ? (updateData.salaryRange || updateData.salary_range)
      : existing.salaryRange;

    let minWageMultiplier = existing.minWageMultiplier;
    if (updateData.minWageMultiplier !== undefined || updateData.min_wage_multiplier !== undefined) {
      const rawMultiplier = updateData.minWageMultiplier !== undefined ? updateData.minWageMultiplier : updateData.min_wage_multiplier;
      if (rawMultiplier !== null && rawMultiplier !== '') {
        minWageMultiplier = parseFloat(rawMultiplier);
        if (isNaN(minWageMultiplier) || minWageMultiplier <= 0) {
          throw new Error('Minimum wage multiplier must be a positive number');
        }
      } else {
        minWageMultiplier = null;
      }
    }

    const processDuration = (updateData.processDuration || updateData.process_duration) !== undefined
      ? (updateData.processDuration || updateData.process_duration)
      : existing.processDuration;

    const description = updateData.description !== undefined ? (updateData.description ? String(updateData.description).trim() : null) : existing.description;
    const requirements = updateData.requirements !== undefined ? updateData.requirements : existing.requirements;
    const applicationUrl = (updateData.applicationUrl || updateData.application_url) !== undefined
      ? (updateData.applicationUrl || updateData.application_url)
      : existing.applicationUrl;
    const contactEmail = (updateData.contactEmail || updateData.contact_email) !== undefined
      ? (updateData.contactEmail || updateData.contact_email)
      : existing.contactEmail;
    const deadline = updateData.deadline !== undefined ? updateData.deadline : existing.deadline;
    const status = updateData.status !== undefined ? updateData.status : existing.status;

    let skills = existing.skills;
    if (updateData.skills !== undefined) {
      if (Array.isArray(updateData.skills)) {
        skills = updateData.skills;
      } else if (typeof updateData.skills === 'string') {
        try {
          skills = JSON.parse(updateData.skills);
        } catch {
          skills = updateData.skills.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
    }

    const query = `
      UPDATE job_postings SET
        title = $1,
        company_name = $2,
        department = $3,
        location = $4,
        employment_type = $5,
        work_mode = $6,
        experience_level = $7,
        salary_range = $8,
        min_wage_multiplier = $9,
        process_duration = $10,
        description = $11,
        requirements = $12,
        skills = $13,
        application_url = $14,
        contact_email = $15,
        deadline = $16,
        status = $17,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $18
      RETURNING *
    `;

    const res = await db.query(query, [
      title,
      companyName,
      department,
      location,
      employmentType,
      workMode,
      experienceLevel,
      salaryRange,
      minWageMultiplier,
      processDuration,
      description,
      requirements,
      JSON.stringify(skills),
      applicationUrl,
      contactEmail,
      deadline,
      status,
      id
    ]);

    if (res.rows.length === 0) return null;
    return formatJobPosting(res.rows[0]);
  }

  // ==========================================================================
  // [DELETE] Mutation
  // ==========================================================================

  /**
   * Delete a job posting by ID.
   * @param {string} id - UUID
   * @returns {Promise<Object|null>}
   */
  async delete(id) {
    const res = await db.query('DELETE FROM job_postings WHERE id = $1 RETURNING *', [id]);
    if (res.rows.length === 0) return null;
    return formatJobPosting(res.rows[0]);
  }

  // ==========================================================================
  // [ANALYTICS] Queries & Mutations
  // ==========================================================================

  /**
   * Increment view impressions count for a job posting.
   * @param {string} id - UUID
   * @returns {Promise<number>}
   */
  async incrementViews(id) {
    const res = await db.query(
      'UPDATE job_postings SET views_count = views_count + 1 WHERE id = $1 RETURNING views_count',
      [id]
    );
    return res.rows.length > 0 ? res.rows[0].views_count : 0;
  }

  /**
   * Count total jobs matching optional status filter.
   * @param {string} [status]
   * @returns {Promise<number>}
   */
  async count(status) {
    if (status) {
      const res = await db.query('SELECT count(*) FROM job_postings WHERE status = $1', [status]);
      return parseInt(res.rows[0].count, 10);
    }
    const res = await db.query('SELECT count(*) FROM job_postings');
    return parseInt(res.rows[0].count, 10);
  }
}

module.exports = new JobPostingModel();
