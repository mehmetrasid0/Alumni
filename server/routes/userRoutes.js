const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const UserController = require('../controllers/UserController');

/**
 * ============================================================================
 * Alumni Tracker — Web User & Page Routes (Full CRUD Suite)
 * ============================================================================
 * Architectural Layer: ROUTES (Dispatches to UserController)
 * Mount Path: /
 * ============================================================================
 */

// Home & About Landing Views
router.get('/', (req, res) => UserController.home(req, res));
router.get('/about', (req, res) => UserController.about(req, res));

// ============================================================================
// Web View Layer CRUD Operations for Users
// ============================================================================

// 1. [READ ALL / INDEX] List all alumni in directory view
router.get('/users', (req, res) => UserController.index(req, res));
router.get('/user', (req, res) => UserController.index(req, res));
router.get('/alumni', (req, res) => UserController.index(req, res));

// 2. [CREATE FORM] Show form view to create new alumnus (precedes :id route)
router.get('/users/create', (req, res) => UserController.create(req, res));
router.get('/users/new', (req, res) => UserController.create(req, res));

// 3. [STORE / POST] Process registration form submission and redirect
router.post('/users', upload.none(), (req, res) => UserController.store(req, res));
router.post('/user', upload.none(), (req, res) => UserController.store(req, res));

// 4. [READ ONE / SHOW] Show single alumnus profile view
router.get('/users/:id', (req, res) => UserController.show(req, res));

// 5. [EDIT FORM] Show form view to edit an existing alumnus
router.get('/users/:id/edit', (req, res) => UserController.edit(req, res));

// 6. [UPDATE] Process alumnus update form submission
router.post('/users/:id/update', upload.none(), (req, res) => UserController.update(req, res));
router.post('/users/:id', upload.none(), (req, res) => UserController.update(req, res));
router.put('/users/:id', upload.none(), (req, res) => UserController.update(req, res));

// 7. [DELETE / DESTROY] Process deletion of alumnus
router.post('/users/:id/delete', (req, res) => UserController.destroy(req, res));
router.get('/users/:id/delete', (req, res) => UserController.destroy(req, res));
router.delete('/users/:id', (req, res) => UserController.destroy(req, res));

module.exports = router;
