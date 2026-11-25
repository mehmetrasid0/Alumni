/**
 * ============================================================================
 * Alumni Tracker — Admin Panel Controller (AdminController)
 * ============================================================================
 * Architectural Layer: CONTROLLER (Administrative Operations, RBAC & Date Control)
 * Specification Reference: DDD.md Section 8
 * Security: All routes guarded by requireAuth + requireAdmin.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const db = require('../db');
const User = require('../models/User');
const { errorLogPath } = require('../middleware/logger');

const ALLOWED_ROLES = ['alumni', 'coordinator', 'admin'];

function parseValidDate(input) {
  if (input === null || input === undefined || input === '') return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) {
    const err = new Error(`Invalid date value: '${input}'`);
    err.statusCode = 400;
    throw err;
  }
  return d.toISOString();
}

class AdminController {
  /**
   * [GET /api/admin/overview]
   * Aggregate real-time platform counts grouped by role and entity status.
   */
  async overview(req, res) {
    try {
      const [usersRes, annRes, jobsRes, appsRes] = await Promise.all([
        db.query(`
          SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE role = 'admin')::int AS admins,
            COUNT(*) FILTER (WHERE role = 'coordinator')::int AS coordinators,
            COUNT(*) FILTER (WHERE role = 'alumni')::int AS alumni
          FROM users
        `),
        db.query(`
          SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'published')::int AS published,
            COUNT(*) FILTER (WHERE status = 'draft')::int AS drafts,
            COUNT(*) FILTER (WHERE status = 'archived')::int AS archived
          FROM announcements
        `),
        db.query(`
          SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'active')::int AS active,
            COUNT(*) FILTER (WHERE status = 'closed')::int AS closed
          FROM job_postings
        `),
        db.query(`
          SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'submitted')::int AS submitted,
            COUNT(*) FILTER (WHERE status = 'under_review')::int AS under_review,
            COUNT(*) FILTER (WHERE status = 'interview')::int AS interview,
            COUNT(*) FILTER (WHERE status = 'accepted')::int AS accepted,
            COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
          FROM applications
        `)
      ]);

      return res.status(200).json({
        success: true,
        actor: req.authUser,
        data: {
          users: usersRes.rows[0],
          announcements: annRes.rows[0],
          jobs: jobsRes.rows[0],
          applications: appsRes.rows[0],
          serverTime: new Date().toISOString(),
          uptimeSeconds: Math.floor(process.uptime())
        }
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to load admin overview'
      });
    }
  }

  /**
   * [PATCH /api/admin/users/:id/role]
   * Assign system RBAC role ('alumni' | 'coordinator' | 'admin') to any account.
   */
  async updateUserRole(req, res) {
    try {
      const targetUser = await User.findById(req.params.id);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          error: `User with ID ${req.params.id} not found`
        });
      }

      const rawRole = req.body.userRole || req.body.user_role || req.body.role;
      const normalizedRole = rawRole ? String(rawRole).trim().toLowerCase() : '';

      if (!ALLOWED_ROLES.includes(normalizedRole)) {
        return res.status(400).json({
          success: false,
          error: `Invalid role '${normalizedRole}'. Allowed values: ${ALLOWED_ROLES.join(', ')}`
        });
      }

      await db.query(
        `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [normalizedRole, targetUser.userId]
      );

      const updated = await User.findById(targetUser.userId);
      return res.status(200).json({
        success: true,
        message: `Role for ${updated.email} updated to '${normalizedRole}'`,
        data: updated
      });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Failed to update user role'
      });
    }
  }

  /**
   * [PATCH /api/admin/dates/:resource/:id]
   * Administrative date & data adjustment endpoint supporting:
   *   - announcements : createdAt / created_at, updatedAt, status, pinned, priority
   *   - jobs          : deadline, createdAt / created_at, status
   *   - applications  : appliedAt / applied_at, status, notes
   *   - users         : createdAt / created_at, graduationYear / graduation_year
   */
  async updateRecordDates(req, res) {
    try {
      const resource = String(req.params.resource || '').trim().toLowerCase();
      const id = req.params.id;
      const body = req.body || {};

      if (resource === 'announcements') {
        const createdAt = body.createdAt !== undefined ? parseValidDate(body.createdAt)
          : (body.created_at !== undefined ? parseValidDate(body.created_at) : undefined);
        const sets = [];
        const params = [];
        let idx = 1;

        if (createdAt !== undefined) {
          sets.push(`created_at = $${idx++}`);
          params.push(createdAt);
        }
        if (body.status !== undefined) {
          sets.push(`status = $${idx++}`);
          params.push(String(body.status).trim());
        }
        if (body.priority !== undefined) {
          sets.push(`priority = $${idx++}`);
          params.push(String(body.priority).trim());
        }
        if (body.pinned !== undefined) {
          sets.push(`pinned = $${idx++}`);
          params.push(Boolean(body.pinned));
        }

        if (sets.length === 0) {
          return res.status(400).json({ success: false, error: 'No fields provided for update' });
        }

        sets.push(`updated_at = CURRENT_TIMESTAMP`);
        params.push(parseInt(id, 10));

        const result = await db.query(
          `UPDATE announcements SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
          params
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ success: false, error: `Announcement ${id} not found` });
        }
        return res.status(200).json({
          success: true,
          message: 'Announcement date/fields updated successfully',
          data: result.rows[0]
        });
      }

      if (resource === 'jobs') {
        const deadlineRaw = body.deadline !== undefined ? body.deadline : undefined;
        const createdAt = body.createdAt !== undefined ? parseValidDate(body.createdAt)
          : (body.created_at !== undefined ? parseValidDate(body.created_at) : undefined);

        const sets = [];
        const params = [];
        let idx = 1;

        if (deadlineRaw !== undefined) {
          const parsedDeadline = deadlineRaw === null || deadlineRaw === '' ? null : parseValidDate(deadlineRaw);
          sets.push(`deadline = $${idx++}`);
          params.push(parsedDeadline ? parsedDeadline.split('T')[0] : null);
        }
        if (createdAt !== undefined) {
          sets.push(`created_at = $${idx++}`);
          params.push(createdAt);
        }
        if (body.status !== undefined) {
          sets.push(`status = $${idx++}`);
          params.push(String(body.status).trim());
        }

        if (sets.length === 0) {
          return res.status(400).json({ success: false, error: 'No fields provided for update' });
        }

        sets.push(`updated_at = CURRENT_TIMESTAMP`);
        params.push(id);

        const result = await db.query(
          `UPDATE job_postings SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
          params
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ success: false, error: `Job posting ${id} not found` });
        }
        return res.status(200).json({
          success: true,
          message: 'Job posting date/fields updated successfully',
          data: result.rows[0]
        });
      }

      if (resource === 'applications') {
        const appliedAt = body.appliedAt !== undefined ? parseValidDate(body.appliedAt)
          : (body.applied_at !== undefined ? parseValidDate(body.applied_at) : undefined);

        const sets = [];
        const params = [];
        let idx = 1;

        if (appliedAt !== undefined) {
          sets.push(`applied_at = $${idx++}`);
          params.push(appliedAt);
        }
        if (body.status !== undefined) {
          sets.push(`status = $${idx++}`);
          params.push(String(body.status).trim());
        }
        if (body.notes !== undefined) {
          sets.push(`notes = $${idx++}`);
          params.push(body.notes);
        }

        if (sets.length === 0) {
          return res.status(400).json({ success: false, error: 'No fields provided for update' });
        }

        sets.push(`updated_at = CURRENT_TIMESTAMP`);
        params.push(id);

        const result = await db.query(
          `UPDATE applications SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
          params
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ success: false, error: `Application ${id} not found` });
        }
        return res.status(200).json({
          success: true,
          message: 'Application date/fields updated successfully',
          data: result.rows[0]
        });
      }

      if (resource === 'users') {
        const target = await User.findById(id);
        if (!target) {
          return res.status(404).json({ success: false, error: `User ${id} not found` });
        }

        const createdAt = body.createdAt !== undefined ? parseValidDate(body.createdAt)
          : (body.created_at !== undefined ? parseValidDate(body.created_at) : undefined);
        const gradYear = body.graduationYear !== undefined ? parseInt(body.graduationYear, 10)
          : (body.graduation_year !== undefined ? parseInt(body.graduation_year, 10) : undefined);

        if (createdAt !== undefined) {
          await db.query(
            `UPDATE users SET created_at = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
            [createdAt, target.userId]
          );
          if (target.profileId) {
            await db.query(
              `UPDATE alumni_profiles SET created_at = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
              [createdAt, target.profileId]
            );
          }
        }

        if (gradYear !== undefined && !Number.isNaN(gradYear) && target.profileId) {
          await db.query(
            `UPDATE alumni_profiles SET graduation_year = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
            [gradYear, target.profileId]
          );
        }

        const refreshed = await User.findById(target.userId);
        return res.status(200).json({
          success: true,
          message: 'User dates updated successfully',
          data: refreshed
        });
      }

      return res.status(400).json({
        success: false,
        error: `Unsupported resource '${resource}'. Allowed: announcements, jobs, applications, users`
      });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Failed to update record dates'
      });
    }
  }

  /**
   * [GET /api/admin/logs]
   * Return trailing entries from logs/error.logs for security/error audit.
   */
  async getErrorLogs(req, res) {
    try {
      if (!fs.existsSync(errorLogPath)) {
        return res.status(200).json({ success: true, count: 0, entries: [] });
      }
      const raw = fs.readFileSync(errorLogPath, 'utf8');
      const chunks = raw
        .split('-'.repeat(80))
        .map(s => s.trim())
        .filter(Boolean);
      const recent = chunks.slice(-50).reverse();

      return res.status(200).json({
        success: true,
        count: recent.length,
        totalLogged: chunks.length,
        entries: recent
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to read error logs'
      });
    }
  }
}

module.exports = new AdminController();
