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

module.exports = router;

