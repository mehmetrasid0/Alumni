const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const ApiUserController = require('../controllers/ApiUserController');

/**
 * ============================================================================
 * Alumni Tracker — API User Routes
 * ============================================================================
 * Architectural Layer: ROUTES (Dispatches to ApiUserController)
 * Base Path: /api/users
 * ============================================================================
 */

// GET /api/users - Retrieve all users (supports optional filtering query params)
router.get('/', (req, res) => ApiUserController.getAll(req, res));

// GET /api/users/:id - Retrieve single user by ID
router.get('/:id', (req, res) => ApiUserController.getById(req, res));

// POST /api/users - Create new user (supports json, multipart/form-data, urlencoded)
router.post('/', upload.none(), (req, res) => ApiUserController.create(req, res));

// PUT /api/users/:id - Fully update existing user
router.put('/:id', upload.none(), (req, res) => ApiUserController.update(req, res));

// PATCH /api/users/:id - Partially update existing user
router.patch('/:id', upload.none(), (req, res) => ApiUserController.patch(req, res));

// DELETE /api/users/:id - Delete user by ID
router.delete('/:id', (req, res) => ApiUserController.delete(req, res));

// ============================================================================
// Nested Sub-resource Routes (Model Relationships)
// ============================================================================

// 1. Nested Announcements: /api/users/:userId/announcements (User 1:N Announcement)
const ApiAnnouncementController = require('../controllers/ApiAnnouncementController');
router.get('/:userId/announcements', (req, res) => {
  req.query.authorId = req.params.userId;
  return ApiAnnouncementController.getAll(req, res);
});
router.post('/:userId/announcements', upload.none(), (req, res) => {
  req.body.authorId = req.params.userId;
  return ApiAnnouncementController.create(req, res);
});

// 3. Nested Profile: /api/users/:userId/profile (User 1:1 AlumniProfile)
router.get('/:userId/profile', (req, res) => {
  req.params.id = req.params.userId;
  return ApiUserController.getById(req, res);
});

// 4. Nested Applications: /api/users/:userId/applications (User 1:N Application)
const apiApplicationRoutes = require('./apiApplicationRoutes');
router.use('/:userId/applications', apiApplicationRoutes);

module.exports = router;

