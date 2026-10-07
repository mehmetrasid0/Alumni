const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const ApiAnnouncementController = require('../controllers/ApiAnnouncementController');

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

// GET /api/announcements - Retrieve all announcements (supports ?query=, ?category=, ?status=, ?priority=)
router.get('/', (req, res) => ApiAnnouncementController.getAll(req, res));

// GET /api/announcements/:id - Retrieve single announcement by ID
router.get('/:id', (req, res) => ApiAnnouncementController.getById(req, res));

// POST /api/announcements - Create new announcement (supports json, multipart/form-data, urlencoded)
router.post('/', upload.none(), (req, res) => ApiAnnouncementController.create(req, res));

// PUT /api/announcements/:id - Fully update existing announcement
router.put('/:id', upload.none(), (req, res) => ApiAnnouncementController.update(req, res));

// PATCH /api/announcements/:id - Partially update existing announcement
router.patch('/:id', upload.none(), (req, res) => ApiAnnouncementController.patch(req, res));

// DELETE /api/announcements/:id - Delete announcement by ID
router.delete('/:id', (req, res) => ApiAnnouncementController.delete(req, res));

module.exports = router;
