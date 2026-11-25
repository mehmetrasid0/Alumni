const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const ApiAnnouncementController = require('../controllers/ApiAnnouncementController');
const {
  requireAuth,
  requireStaff,
  requireOwnership,
  resolveAnnouncementOwner
} = require('../middleware/authMiddleware');

/**
 * ============================================================================
 * Alumni Tracker — API Announcement Routes
 * ============================================================================
 * Architectural Layer: ROUTES (Dispatches to ApiAnnouncementController)
 * Base Path: /api/announcements
 * Author: Mehmet Raşid Ünlüel
 * Institution: Istanbul University (Management Information Systems / YBS, 3rd Year)
 * ============================================================================
 */

// GET /api/announcements - Retrieve published announcements (drafts visible to staff/admin)
router.get('/', (req, res) => ApiAnnouncementController.getAll(req, res));

// GET /api/announcements/:id - Retrieve single announcement by ID
router.get('/:id', (req, res) => ApiAnnouncementController.getById(req, res));

// POST /api/announcements - Create new announcement (Coordinator & Admin only)
router.post('/', requireAuth, requireStaff, upload.none(), (req, res) => ApiAnnouncementController.create(req, res));

// PUT /api/announcements/:id - Fully update existing announcement (Author Coordinator or Admin)
router.put(
  '/:id',
  requireAuth,
  requireStaff,
  requireOwnership(resolveAnnouncementOwner, { bypassRoles: ['admin'], resourceLabel: 'announcement' }),
  upload.none(),
  (req, res) => ApiAnnouncementController.update(req, res)
);

// PATCH /api/announcements/:id - Partially update existing announcement (Author Coordinator or Admin)
router.patch(
  '/:id',
  requireAuth,
  requireStaff,
  requireOwnership(resolveAnnouncementOwner, { bypassRoles: ['admin'], resourceLabel: 'announcement' }),
  upload.none(),
  (req, res) => ApiAnnouncementController.patch(req, res)
);

// DELETE /api/announcements/:id - Delete announcement by ID (Author Coordinator or Admin)
router.delete(
  '/:id',
  requireAuth,
  requireStaff,
  requireOwnership(resolveAnnouncementOwner, { bypassRoles: ['admin'], resourceLabel: 'announcement' }),
  (req, res) => ApiAnnouncementController.delete(req, res)
);

module.exports = router;

