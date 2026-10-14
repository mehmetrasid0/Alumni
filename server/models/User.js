/**
 * ============================================================================
 * Alumni Tracker — User & Profile Model (PostgreSQL Persistent Model)
 * ============================================================================
 * Architectural Layer: MODEL (M in MVC / DAO Pattern)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * Specification Reference: DDD.md
 * 
 * Description:
 *   Production-grade User Model directly connected to PostgreSQL database.
 *   Encapsulates all CRUD operations for `users` and `alumni_profiles` tables.
 *   Provides full backwards-compatibility for existing controllers and views
 *   with dual-format attribute mapping (camelCase & snake_case).
 * ============================================================================
 */

const db = require('../db');

/**
 * Format a raw PostgreSQL database row into a standardized DTO.
 * Supports both snake_case (DB spec) and camelCase (client views / Postman).
 * @param {Object} row
 * @returns {Object|null}
 */
function formatUser(row) {
  if (!row) return null;

  let parsedSkills = [];
  if (Array.isArray(row.skills)) {
    parsedSkills = row.skills;
  } else if (typeof row.skills === 'string') {
    try {
      parsedSkills = JSON.parse(row.skills);
    } catch (e) {
      parsedSkills = [];
    }
  }

  return {
    id: row.profile_id || row.id,
    profileId: row.profile_id || row.id,
    profile_id: row.profile_id || row.id,
    userId: row.user_id || row.id,
    user_id: row.user_id || row.id,
    studentId: row.student_id || null,
    student_id: row.student_id || null,
    name: row.full_name || 'Anonymous Alumnus',
    fullName: row.full_name || 'Anonymous Alumnus',
    full_name: row.full_name || 'Anonymous Alumnus',
    email: row.email,
    role: row.job_title || row.user_role || row.role || 'Alumnus',
    jobTitle: row.job_title || null,
    job_title: row.job_title || null,
    company: row.current_company || null,
    currentCompany: row.current_company || null,
    current_company: row.current_company || null,
    department: row.department || null,
    graduationYear: row.graduation_year ? Number(row.graduation_year) : null,
    graduation_year: row.graduation_year ? Number(row.graduation_year) : null,
    degree: row.degree || 'Bachelor',
    city: row.city || null,
    country: row.country || 'Turkey',
    linkedinUrl: row.linkedin_url || null,
    linkedin_url: row.linkedin_url || null,
    phone: row.phone || null,
    bio: row.bio || null,
    skills: parsedSkills,
    userRole: row.user_role || row.role || 'alumni',
    createdAt: row.profile_created_at || row.created_at || new Date().toISOString(),
    created_at: row.profile_created_at || row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString()
  };
}

class UserModel {
  // ==========================================================================
  // [READ] Queries
  // ==========================================================================

  /**
   * Retrieve all alumni records with optional filtering.
   * @param {Object} [filters={}] - query, department, graduationYear, skill
   * @returns {Promise<Array<Object>>}
   */
  async findAll(filters = {}) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Filter by general query (matches full_name, email, current_company, job_title, department)
    const searchTerm = filters.query || filters.q;
    if (searchTerm) {
      conditions.push(`(
        p.full_name ILIKE $${paramIndex} OR
        u.email ILIKE $${paramIndex} OR
        p.current_company ILIKE $${paramIndex} OR
        p.job_title ILIKE $${paramIndex} OR
        p.department ILIKE $${paramIndex}
      )`);
      params.push(`%${String(searchTerm).trim()}%`);
      paramIndex++;
    }

    // Filter by department
    if (filters.department && filters.department !== 'all') {
      conditions.push(`p.department = $${paramIndex}`);
      params.push(String(filters.department).trim());
      paramIndex++;
    }

    // Filter by graduation year
    const year = filters.graduationYear || filters.graduation_year;
    if (year && year !== 'all') {
      conditions.push(`p.graduation_year = $${paramIndex}`);
      params.push(parseInt(year, 10));
      paramIndex++;
    }

    // Filter by specific skill using GIN index containment
    const skill = filters.skill || filters.skills;
    if (skill) {
      conditions.push(`p.skills ? $${paramIndex}`);
      params.push(String(skill).trim());
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        p.id AS profile_id,
        p.id,
        p.user_id,
        p.student_id,
        p.full_name,
        p.department,
        p.graduation_year,
        p.degree,
        p.current_company,
        p.job_title,
        p.city,
        p.country,
        p.linkedin_url,
        p.phone,
        p.bio,
        p.skills,
        p.created_at AS profile_created_at,
        p.updated_at,
        u.email,
        u.role AS user_role
      FROM alumni_profiles p
      JOIN users u ON p.user_id = u.id
      ${whereClause}
      ORDER BY p.graduation_year DESC, p.created_at DESC
    `;

    const res = await db.query(sql, params);
    return res.rows.map(formatUser);
  }

  /**
   * Find a single alumni record by ID (UUID, numeric ID, or student_id).
   * @param {string|number} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    if (!id) return null;
    const strId = String(id).trim();

    // Check if ID matches RFC 4122 UUID v4 regex
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(strId);

    let sql;
    let params;

    if (isUUID) {
      sql = `
        SELECT 
          p.id AS profile_id, p.id, p.user_id, p.student_id, p.full_name,
          p.department, p.graduation_year, p.degree, p.current_company,
          p.job_title, p.city, p.country, p.linkedin_url, p.phone, p.bio,
          p.skills, p.created_at AS profile_created_at, p.updated_at,
          u.email, u.role AS user_role
        FROM alumni_profiles p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = $1 OR p.user_id = $1
        LIMIT 1
      `;
      params = [strId];
    } else {
      // Lookup by student_id or sequential numeric reference
      sql = `
        SELECT 
          p.id AS profile_id, p.id, p.user_id, p.student_id, p.full_name,
          p.department, p.graduation_year, p.degree, p.current_company,
          p.job_title, p.city, p.country, p.linkedin_url, p.phone, p.bio,
          p.skills, p.created_at AS profile_created_at, p.updated_at,
          u.email, u.role AS user_role
        FROM alumni_profiles p
        JOIN users u ON p.user_id = u.id
        WHERE p.student_id = $1
        LIMIT 1
      `;
      params = [strId];
    }

    const res = await db.query(sql, params);
    return res.rows.length > 0 ? formatUser(res.rows[0]) : null;
  }

  /**
   * Find user by case-insensitive email address.
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    if (!email) return null;
    const normalized = String(email).trim().toLowerCase();

    const sql = `
      SELECT 
        p.id AS profile_id, p.id, p.user_id, p.student_id, p.full_name,
        p.department, p.graduation_year, p.degree, p.current_company,
        p.job_title, p.city, p.country, p.linkedin_url, p.phone, p.bio,
        p.skills, p.created_at AS profile_created_at, p.updated_at,
        u.email, u.role AS user_role
      FROM users u
      LEFT JOIN alumni_profiles p ON p.user_id = u.id
      WHERE LOWER(u.email) = $1
      LIMIT 1
    `;
    const res = await db.query(sql, [normalized]);
    return res.rows.length > 0 ? formatUser(res.rows[0]) : null;
  }

  /**
   * Return the total count of alumni profiles currently stored.
   * @param {Object} [filters={}]
   * @returns {Promise<number>}
   */
  async count(filters = {}) {
    const list = await this.findAll(filters);
    return list.length;
  }

  // ==========================================================================
  // [CREATE] Creation
  // ==========================================================================

  /**
   * Create and persist a new alumni user record across `users` and `alumni_profiles`.
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  async create(userData) {
    if (!userData || typeof userData !== 'object') {
      const err = new Error('Invalid user payload');
      err.statusCode = 400;
      throw err;
    }

    const name = userData.name || userData.fullName || userData.full_name;
    const email = userData.email;
    const graduationYear = userData.graduationYear || userData.graduation_year;
    const department = userData.department;
    const company = userData.company || userData.currentCompany || userData.current_company;
    const role = userData.role || userData.jobTitle || userData.job_title;
    const studentId = userData.studentId || userData.student_id || `1306${Math.floor(100000 + Math.random() * 900000)}`;
    const skills = userData.skills || [];

    // Validate mandatory fields
    if (!name || !String(name).trim() || !email || !String(email).trim()) {
      const err = new Error('Both name and email are mandatory fields');
      err.statusCode = 400;
      throw err;
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    // Verify email uniqueness
    const existing = await this.findByEmail(trimmedEmail);
    if (existing) {
      const err = new Error('A user with this email address is already registered');
      err.statusCode = 409;
      throw err;
    }

    // Atomic Transaction: Insert into users, then insert into alumni_profiles
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert into users
      const userRes = await client.query(
        `INSERT INTO users (email, password_hash, role)
         VALUES ($1, crypt('AlumniPass123!', gen_salt('bf', 10)), 'alumni')
         RETURNING id, email, role, created_at`,
        [trimmedEmail]
      );
      const userId = userRes.rows[0].id;

      // 2. Insert into alumni_profiles
      const profileRes = await client.query(
        `INSERT INTO alumni_profiles (
          user_id, student_id, full_name, department, graduation_year, degree,
          current_company, job_title, city, country, skills
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
        RETURNING *`,
        [
          userId,
          studentId,
          String(name).trim(),
          department ? String(department).trim() : 'Information Systems (YBS)',
          graduationYear ? parseInt(graduationYear, 10) : 2024,
          userData.degree || 'Bachelor',
          company ? String(company).trim() : null,
          role ? String(role).trim() : 'Alumnus',
          userData.city || 'Istanbul',
          userData.country || 'Turkey',
          JSON.stringify(Array.isArray(skills) ? skills : [skills].filter(Boolean))
        ]
      );

      await client.query('COMMIT');

      const combined = {
        ...profileRes.rows[0],
        email: userRes.rows[0].email,
        user_role: userRes.rows[0].role
      };

      return formatUser(combined);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // ==========================================================================
  // [UPDATE] Modification
  // ==========================================================================

  /**
   * Update an existing alumni profile (PUT or PATCH).
   * @param {string|number} id - Target user ID (UUID, student_id)
   * @param {Object} updateData - Modified fields
   * @param {boolean} [isPartial=false] - True for PATCH, false for PUT
   * @returns {Promise<Object>}
   */
  async update(id, updateData = {}, isPartial = false) {
    const existing = await this.findById(id);
    if (!existing) {
      const err = new Error(`User with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }

    const name = updateData.name || updateData.fullName || updateData.full_name;
    const email = updateData.email;
    const graduationYear = updateData.graduationYear !== undefined ? updateData.graduationYear : updateData.graduation_year;
    const department = updateData.department;
    const company = updateData.company || updateData.currentCompany || updateData.current_company;
    const role = updateData.role || updateData.jobTitle || updateData.job_title;

    // Strict validation in PUT mode
    if (!isPartial) {
      if (!name || !String(name).trim() || !email || !String(email).trim()) {
        const err = new Error('PUT requests require both name and email fields');
        err.statusCode = 400;
        throw err;
      }
    }

    // Verify email conflict if email is being updated
    if (email) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (normalizedEmail !== existing.email.toLowerCase()) {
        const conflict = await this.findByEmail(normalizedEmail);
        if (conflict && conflict.userId !== existing.userId) {
          const err = new Error('This email address is already registered by another user');
          err.statusCode = 409;
          throw err;
        }
      }
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Update users table if email provided
      if (email) {
        await client.query(
          `UPDATE users SET email = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [String(email).trim().toLowerCase(), existing.userId]
        );
      }

      // Prepare updated profile fields
      const newName = name !== undefined ? String(name).trim() : existing.name;
      const newDept = department !== undefined ? String(department).trim() : existing.department;
      const newYear = graduationYear !== undefined ? (graduationYear ? parseInt(graduationYear, 10) : null) : existing.graduationYear;
      const newCompany = company !== undefined ? String(company).trim() : existing.company;
      const newRole = role !== undefined ? String(role).trim() : existing.jobTitle;
      const newSkills = updateData.skills !== undefined 
        ? JSON.stringify(Array.isArray(updateData.skills) ? updateData.skills : []) 
        : JSON.stringify(existing.skills);

      const profileRes = await client.query(
        `UPDATE alumni_profiles 
         SET full_name = $1,
             department = $2,
             graduation_year = $3,
             current_company = $4,
             job_title = $5,
             skills = $6::jsonb,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $7
         RETURNING *`,
        [newName, newDept, newYear, newCompany, newRole, newSkills, existing.profileId]
      );

      await client.query('COMMIT');

      const updated = {
        ...profileRes.rows[0],
        email: email ? String(email).trim().toLowerCase() : existing.email,
        user_role: existing.userRole
      };

      return formatUser(updated);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // ==========================================================================
  // [DELETE] Removal
  // ==========================================================================

  /**
   * Delete an alumnus record by primary ID (Cascades from users to alumni_profiles).
   * @param {string|number} id
   * @returns {Promise<Object>} Deleted user DTO
   */
  async delete(id) {
    const existing = await this.findById(id);
    if (!existing) {
      const err = new Error(`User with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }

    // Deleting from users automatically cascades to alumni_profiles via foreign key constraint
    await db.query(`DELETE FROM users WHERE id = $1`, [existing.userId]);
    return existing;
  }
}

// Export singleton instance of UserModel
module.exports = new UserModel();
