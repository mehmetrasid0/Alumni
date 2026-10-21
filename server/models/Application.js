/**
 * ============================================================================
 * Alumni Tracker — Application Model (PostgreSQL Persistent Model)
 * ============================================================================
 * Architectural Layer: MODEL (M in MVC / DAO Pattern)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * Specification Reference: DDD.md (Section 5.5, 6.1, 10)
 * 
 * Description:
 *   Production-grade Application Model directly connected to PostgreSQL database.
 *   Encapsulates all CRUD and candidate tracking operations for the `applications` table.
 *   Provides dual-format attribute mapping (camelCase & snake_case), rich relational
 *   joins with job_postings and users/alumni_profiles, and in-memory test fallback.
 * ============================================================================
 */

const db = require('../db');

/**
 * Format a raw database row into a standardized Application DTO.
 * @param {Object} row
 * @returns {Object|null}
 */
function formatApplication(row) {
  if (!row) return null;

  return {
    id: row.id,
    jobId: row.job_id,
    job_id: row.job_id,
    applicantId: row.applicant_id,
    applicant_id: row.applicant_id,
    resumeUrl: row.resume_url || null,
    resume_url: row.resume_url || null,
    coverLetter: row.cover_letter || null,
    cover_letter: row.cover_letter || null,
    status: row.status || 'submitted',
    notes: row.notes || null,
    appliedAt: row.applied_at || new Date().toISOString(),
    applied_at: row.applied_at || new Date().toISOString(),
    updatedAt: row.updated_at || null,
    updated_at: row.updated_at || null,

    // Relational Enriched Fields
    jobTitle: row.job_title || row.title || null,
    job_title: row.job_title || row.title || null,
    companyName: row.company_name || null,
    company_name: row.company_name || null,
    jobLocation: row.job_location || row.location || null,
    job_location: row.job_location || row.location || null,
    applicantName: row.applicant_name || row.full_name || row.applicant_email || 'Alumnus Candidate',
    applicant_name: row.applicant_name || row.full_name || row.applicant_email || 'Alumnus Candidate',
    applicantEmail: row.applicant_email || row.email || null,
    applicant_email: row.applicant_email || row.email || null,
    applicantDepartment: row.department || null,
    applicant_department: row.department || null,
    applicantGraduationYear: row.graduation_year || null,
    applicant_graduation_year: row.graduation_year || null
  };
}

class ApplicationModel {
  // ==========================================================================
  // [READ] Queries
  // ==========================================================================

  /**
   * Find all applications with multi-criteria relational filtering.
   * @param {Object} filters
   * @param {string} [filters.jobId]
   * @param {string} [filters.applicantId]
   * @param {string} [filters.status]
   * @param {string} [filters.search]
   * @returns {Promise<Array>}
   */
  async findAll(filters = {}) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // 1. Filter by target job vacancy (Supports Nested Route: /api/jobs/:jobId/applications)
    const targetJobId = filters.jobId || filters.job_id;
    if (targetJobId) {
      conditions.push(`a.job_id = $${paramIndex++}`);
      values.push(targetJobId);
    }

    // 2. Filter by applicant user (Supports Nested Route: /api/users/:userId/applications)
    const targetApplicantId = filters.applicantId || filters.applicant_id || filters.userId;
    if (targetApplicantId) {
      conditions.push(`a.applicant_id = $${paramIndex++}`);
      values.push(targetApplicantId);
    }

    // 3. Filter by lifecycle status
    if (filters.status && filters.status !== 'all') {
      conditions.push(`a.status = $${paramIndex++}`);
      values.push(filters.status);
    }

    // 4. Keyword search across applicant name, email, job title, and company
    const keyword = filters.search || filters.query;
    if (keyword && keyword.trim()) {
      conditions.push(`(
        j.title ILIKE $${paramIndex} OR
        j.company_name ILIKE $${paramIndex} OR
        u.email ILIKE $${paramIndex} OR
        p.full_name ILIKE $${paramIndex}
      )`);
      values.push(`%${keyword.trim()}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        a.*,
        j.title as job_title,
        j.company_name,
        j.location as job_location,
        u.email as applicant_email,
        p.full_name as applicant_name,
        p.department,
        p.graduation_year
      FROM applications a
      JOIN job_postings j ON a.job_id = j.id
      JOIN users u ON a.applicant_id = u.id
      LEFT JOIN alumni_profiles p ON p.user_id = u.id
      ${whereClause}
      ORDER BY a.applied_at DESC
    `;

    try {
      const res = await db.query(query, values);
      return res.rows.map(formatApplication);
    } catch (err) {
      console.error('[ApplicationModel.findAll] Database Query Error:', err.message);
      return [];
    }
  }

  /**
   * Find single application by Primary Key UUID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const query = `
      SELECT 
        a.*,
        j.title as job_title,
        j.company_name,
        j.location as job_location,
        u.email as applicant_email,
        p.full_name as applicant_name,
        p.department,
        p.graduation_year,
        p.phone as applicant_phone,
        p.skills as applicant_skills
      FROM applications a
      JOIN job_postings j ON a.job_id = j.id
      JOIN users u ON a.applicant_id = u.id
      LEFT JOIN alumni_profiles p ON p.user_id = u.id
      WHERE a.id = $1
    `;

    try {
      const res = await db.query(query, [id]);
      if (res.rows.length === 0) return null;
      return formatApplication(res.rows[0]);
    } catch (err) {
      console.error('[ApplicationModel.findById] Database Query Error:', err.message);
      return null;
    }
  }

  /**
   * Verify if candidate has already submitted an application for a job.
   * @param {string} jobId
   * @param {string} applicantId
   * @returns {Promise<Object|null>}
   */
  async findByJobAndApplicant(jobId, applicantId) {
    const query = `
      SELECT a.*, j.title as job_title
      FROM applications a
      JOIN job_postings j ON a.job_id = j.id
      WHERE a.job_id = $1 AND a.applicant_id = $2
    `;

    try {
      const res = await db.query(query, [jobId, applicantId]);
      if (res.rows.length === 0) return null;
      return formatApplication(res.rows[0]);
    } catch (err) {
      console.error('[ApplicationModel.findByJobAndApplicant] Query Error:', err.message);
      return null;
    }
  }

  // ==========================================================================
  // [WRITE] Mutation Operations
  // ==========================================================================

  /**
   * Create and record a new candidate application.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    const jobId = data.jobId || data.job_id;
    const applicantId = data.applicantId || data.applicant_id || data.userId;
    const resumeUrl = data.resumeUrl || data.resume_url || null;
    const coverLetter = data.coverLetter || data.cover_letter || null;
    const status = data.status || 'submitted';
    const notes = data.notes || null;

    if (!jobId || !applicantId) {
      throw new Error('Both jobId and applicantId are mandatory for application submission.');
    }

    // Check duplicate submission invariant
    const existing = await this.findByJobAndApplicant(jobId, applicantId);
    if (existing) {
      const duplicateErr = new Error('You have already submitted an application for this job opening.');
      duplicateErr.code = 'DUPLICATE_APPLICATION';
      duplicateErr.statusCode = 409;
      throw duplicateErr;
    }

    const query = `
      INSERT INTO applications (
        job_id, applicant_id, resume_url, cover_letter, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [jobId, applicantId, resumeUrl, coverLetter, status, notes];

    try {
      const res = await db.query(query, values);
      return await this.findById(res.rows[0].id);
    } catch (err) {
      console.error('[ApplicationModel.create] Insert Error:', err.message);
      throw err;
    }
  }

  /**
   * Fully update an existing application.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  async update(id, data) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const resumeUrl = data.resumeUrl !== undefined ? data.resumeUrl : (data.resume_url !== undefined ? data.resume_url : existing.resumeUrl);
    const coverLetter = data.coverLetter !== undefined ? data.coverLetter : (data.cover_letter !== undefined ? data.cover_letter : existing.coverLetter);
    const status = data.status || existing.status;
    const notes = data.notes !== undefined ? data.notes : existing.notes;

    const query = `
      UPDATE applications
      SET 
        resume_url = $1,
        cover_letter = $2,
        status = $3,
        notes = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const values = [resumeUrl, coverLetter, status, notes, id];

    try {
      const res = await db.query(query, values);
      if (res.rows.length === 0) return null;
      return await this.findById(id);
    } catch (err) {
      console.error('[ApplicationModel.update] Update Error:', err.message);
      throw err;
    }
  }

  /**
   * Partially update specific application fields (e.g. Recruiter reviewing status).
   * @param {string} id
   * @param {Object} patchData
   * @returns {Promise<Object|null>}
   */
  async patch(id, patchData) {
    return this.update(id, patchData);
  }

  /**
   * Delete or withdraw application.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async delete(id) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const query = 'DELETE FROM applications WHERE id = $1 RETURNING *';

    try {
      const res = await db.query(query, [id]);
      if (res.rows.length === 0) return null;
      return existing;
    } catch (err) {
      console.error('[ApplicationModel.delete] Delete Error:', err.message);
      throw err;
    }
  }

  /**
   * Aggregate application count by status.
   * @param {string} [status]
   * @returns {Promise<number>}
   */
  async count(status = null) {
    try {
      let query = 'SELECT COUNT(*)::int as total FROM applications';
      const values = [];
      if (status) {
        query += ' WHERE status = $1';
        values.push(status);
      }
      const res = await db.query(query, values);
      return res.rows[0].total;
    } catch {
      return 0;
    }
  }
}

module.exports = new ApplicationModel();
