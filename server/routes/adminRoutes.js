/**
 * ============================================================================
 * Alumni Tracker — Admin Panel & RBAC Administration Routes
 * ============================================================================
 * Architectural Layer: ROUTES (Admin UI & Protected /api/admin Endpoints)
 * Security: Strictly enforced with requireAuth + requireAdmin
 * ============================================================================
 */

const express = require('express');
const path = require('path');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Admin Panel Web View (redirects to /login if unauthenticated, 403 if non-admin)
router.get('/admin', requireAuth, requireAdmin, (req, res) => {
  return res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

// Admin REST APIs
router.get('/api/admin/overview', requireAuth, requireAdmin, (req, res) => AdminController.overview(req, res));
router.patch('/api/admin/users/:id/role', requireAuth, requireAdmin, (req, res) => AdminController.updateUserRole(req, res));
router.patch('/api/admin/dates/:resource/:id', requireAuth, requireAdmin, (req, res) => AdminController.updateRecordDates(req, res));
router.get('/api/admin/logs', requireAuth, requireAdmin, (req, res) => AdminController.getErrorLogs(req, res));

module.exports = router;
