const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const UserController = require('../controllers/UserController');

/**
 * ============================================================================
 * Alumni Tracker — Web User & Page Routes
 * ============================================================================
 * Architectural Layer: ROUTES (Dispatches to UserController)
 * Mount Path: /
 * ============================================================================
 */

// GET / - Application home landing page
router.get('/', (req, res) => UserController.home(req, res));

// GET /about - Institutional About page
router.get('/about', (req, res) => UserController.about(req, res));

// GET /alumni - Interactive alumni directory dashboard
router.get('/alumni', (req, res) => UserController.index(req, res));

// GET /users/:id - HTML profile view for a specific alumnus
router.get('/users/:id', (req, res) => UserController.show(req, res));

// POST /users - Web form submission for creating a new alumnus
router.post('/users', upload.none(), (req, res) => UserController.store(req, res));

// POST /users/:id/update - Web form submission for updating an alumnus
router.post('/users/:id/update', upload.none(), (req, res) => UserController.update(req, res));

// POST /users/:id/delete - Web form action for deleting an alumnus
router.post('/users/:id/delete', (req, res) => UserController.destroy(req, res));

module.exports = router;
