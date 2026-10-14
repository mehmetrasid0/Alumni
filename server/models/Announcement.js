/**
 * ============================================================================
 * Alumni Tracker — Announcement Model (PostgreSQL Persistent Model)
 * ============================================================================
 * Architectural Layer: MODEL (M in MVC / DAO Pattern)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * Specification Reference: DDD.md
 * 
 * Description:
 *   Production-grade Announcement Model directly connected to PostgreSQL database.
 *   Encapsulates all CRUD operations for the `announcements` table.
 *   Provides full backwards-compatibility for existing controllers and views
 *   with dual-format attribute mapping (camelCase & snake_case).
 * ============================================================================
 */

const db = require('../db');

/**
 * Format a raw database row into a standardized Announcement DTO.
 * @param {Object} row
 * @returns {Object|null}
 */
function formatAnnouncement(row) {
  if (!row) return null;

  return {
    id: parseInt(row.id, 10),
    title: row.title,
    content: row.content,
    category: row.category,
    priority: row.priority,
    status: row.status,
    targetAudience: row.target_audience || 'All Alumni',
    target_audience: row.target_audience || 'All Alumni',
    pinned: Boolean(row.pinned),
    authorId: row.author_id,
    author_id: row.author_id,
    author: row.author_name || row.author_email || 'Istanbul University Alumni Office',
    createdAt: row.created_at || new Date().toISOString(),
    created_at: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || null,
    updated_at: row.updated_at || null
  };
}

class AnnouncementModel {
  // ==========================================================================
  // [READ] Queries
  // ==========================================================================

  /**
   * Retrieve all announcements with optional filtering criteria.
   * @param {Object} [filters={}] - query/q, category, status, priority
   * @returns {Promise<Array<Object>>}
   */
  async findAll(filters = {}) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Filter by keyword query (matches title, content, target_audience)
    const searchTerm = filters.query || filters.q;
    if (searchTerm) {
      conditions.push(`(
        a.title ILIKE $${paramIndex} OR
        a.content ILIKE $${paramIndex} OR
        a.category ILIKE $${paramIndex} OR
        a.target_audience ILIKE $${paramIndex}
      )`);
      params.push(`%${String(searchTerm).trim()}%`);
      paramIndex++;
    }

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      conditions.push(`a.category ILIKE $${paramIndex}`);
      params.push(String(filters.category).trim());
      paramIndex++;
    }

    // Filter by status (published, draft, archived)
    if (filters.status && filters.status !== 'all') {
      conditions.push(`a.status ILIKE $${paramIndex}`);
      params.push(String(filters.status).trim());
      paramIndex++;
    }

    // Filter by priority (low, medium, high, urgent)
    if (filters.priority && filters.priority !== 'all') {
      conditions.push(`a.priority ILIKE $${paramIndex}`);
      params.push(String(filters.priority).trim());
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        a.*,
        p.full_name AS author_name,
        u.email AS author_email
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN alumni_profiles p ON p.user_id = u.id
      ${whereClause}
      ORDER BY a.pinned DESC, a.created_at DESC
    `;

    const res = await db.query(sql, params);
    return res.rows.map(formatAnnouncement);
  }

  /**
   * Find a single announcement by primary numeric ID.
   * @param {number|string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return null;

    const sql = `
      SELECT 
        a.*,
        p.full_name AS author_name,
        u.email AS author_email
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN alumni_profiles p ON p.user_id = u.id
      WHERE a.id = $1
      LIMIT 1
    `;
    const res = await db.query(sql, [numericId]);
    return res.rows.length > 0 ? formatAnnouncement(res.rows[0]) : null;
  }

  /**
   * Return the total count of announcements.
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
   * Create and persist a new announcement.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    if (!data || typeof data !== 'object') {
      const err = new Error('Invalid announcement payload');
      err.statusCode = 400;
      throw err;
    }

    const title = data.title;
    const content = data.content;
    const category = data.category || 'General';
    const priority = data.priority || 'medium';
    const status = data.status || 'published';
    const targetAudience = data.targetAudience || data.target_audience || 'All Alumni';
    const pinned = Boolean(data.pinned === true || data.pinned === 'true' || data.pinned === 'on');

    // Validation
    if (!title || String(title).trim().length < 3) {
      const err = new Error('Announcement title must be at least 3 characters long');
      err.statusCode = 400;
      throw err;
    }

    if (!content || String(content).trim().length < 10) {
      const err = new Error('Announcement content must be at least 10 characters long');
      err.statusCode = 400;
      throw err;
    }

    // Determine author ID (Default to Admin user in database)
    let authorId = data.authorId || data.author_id;
    if (!authorId) {
      const adminRes = await db.query(
        "SELECT id FROM users WHERE role = 'admin' OR email = 'admin@alumni.edu' LIMIT 1"
      );
      authorId = adminRes.rows.length > 0 ? adminRes.rows[0].id : null;
    }

    if (!authorId) {
      const anyUser = await db.query('SELECT id FROM users LIMIT 1');
      authorId = anyUser.rows[0].id;
    }

    const res = await db.query(
      `INSERT INTO announcements (
        author_id, title, content, category, priority, status, target_audience, pinned
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        authorId,
        String(title).trim(),
        String(content).trim(),
        category,
        priority,
        status,
        String(targetAudience).trim(),
        pinned
      ]
    );

    return formatAnnouncement(res.rows[0]);
  }

  // ==========================================================================
  // [UPDATE] Modification
  // ==========================================================================

  /**
   * Update an existing announcement (PUT or PATCH).
   * @param {number|string} id
   * @param {Object} data
   * @param {boolean} [isPartial=false]
   * @returns {Promise<Object>}
   */
  async update(id, data = {}, isPartial = false) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      const err = new Error('Invalid announcement ID parameter');
      err.statusCode = 400;
      throw err;
    }

    const existing = await this.findById(numericId);
    if (!existing) {
      const err = new Error(`Announcement with ID ${numericId} not found`);
      err.statusCode = 404;
      throw err;
    }

    const title = data.title !== undefined ? String(data.title).trim() : existing.title;
    const content = data.content !== undefined ? String(data.content).trim() : existing.content;
    const category = data.category !== undefined ? data.category : existing.category;
    const priority = data.priority !== undefined ? data.priority : existing.priority;
    const status = data.status !== undefined ? data.status : existing.status;
    const targetAudience = (data.targetAudience || data.target_audience) !== undefined 
      ? String(data.targetAudience || data.target_audience).trim() 
      : existing.targetAudience;
    const pinned = data.pinned !== undefined 
      ? Boolean(data.pinned === true || data.pinned === 'true' || data.pinned === 'on') 
      : existing.pinned;

    // In PUT mode, check minimum length
    if (!isPartial) {
      if (!title || title.length < 3) {
        const err = new Error('Title must be at least 3 characters long');
        err.statusCode = 400;
        throw err;
      }
      if (!content || content.length < 10) {
        const err = new Error('Content must be at least 10 characters long');
        err.statusCode = 400;
        throw err;
      }
    }

    const res = await db.query(
      `UPDATE announcements
       SET title = $1,
           content = $2,
           category = $3,
           priority = $4,
           status = $5,
           target_audience = $6,
           pinned = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [title, content, category, priority, status, targetAudience, pinned, numericId]
    );

    return formatAnnouncement(res.rows[0]);
  }

  // ==========================================================================
  // [DELETE] Removal
  // ==========================================================================

  /**
   * Delete an announcement by primary ID.
   * @param {number|string} id
   * @returns {Promise<Object>} Deleted announcement DTO
   */
  async delete(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      const err = new Error('Invalid announcement ID parameter');
      err.statusCode = 400;
      throw err;
    }

    const existing = await this.findById(numericId);
    if (!existing) {
      const err = new Error(`Announcement with ID ${numericId} not found`);
      err.statusCode = 404;
      throw err;
    }

    await db.query('DELETE FROM announcements WHERE id = $1', [numericId]);
    return existing;
  }
}

// Export singleton instance of AnnouncementModel
module.exports = new AnnouncementModel();
