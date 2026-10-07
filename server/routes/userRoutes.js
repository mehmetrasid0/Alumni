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

// Home Landing Page View
router.get('/', (req, res) => UserController.home(req, res));

// Institutional About Page View
router.get('/about', (req, res) => UserController.about(req, res));

// ============================================================================
// Web View Layer Routes for Users (Listing & Creating)
// ============================================================================

// 1. GET /users (and aliases /user, /alumni) — Listing with View Layer
router.get('/users', (req, res) => UserController.index(req, res));
router.get('/user', (req, res) => UserController.index(req, res));
router.get('/alumni', (req, res) => UserController.index(req, res));

// 2. POST /users (and alias /user) — Creating with View Layer
router.post('/users', upload.none(), (req, res) => UserController.store(req, res));
router.post('/user', upload.none(), (req, res) => UserController.store(req, res));

// Additional Web User View & Form Actions
router.get('/users/:id', (req, res) => UserController.show(req, res));
router.post('/users/:id/update', upload.none(), (req, res) => UserController.update(req, res));
router.post('/users/:id/delete', (req, res) => UserController.destroy(req, res));

module.exports = router;
