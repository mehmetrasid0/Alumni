const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const JobController = require('../controllers/JobController');
const { requireAuth, requireAdmin, requireStaff } = require('../middleware/authMiddleware');

/**
 * ============================================================================
 * Alumni Tracker — Web Job Routes (Full CRUD Suite & Career Portal UI)
 * ============================================================================
 * Architectural Layer: ROUTES (Dispatches to JobController)
 * Mount Path: /
 * Author: Mehmet Raşid Ünlüel
 * Institution: Istanbul University (Management Information Systems / YBS, 3rd Year)
 * ============================================================================
 */

// 1. [MANAGEMENT UI / INDEX] Career Board & Job Listing (Public)
router.get('/jobs', (req, res) => JobController.index(req, res));
router.get('/job', (req, res) => JobController.index(req, res));

// 2. [CREATE FORM] Show form view to publish a new job opening (Coordinator & Admin)
router.get('/jobs/create', requireAuth, requireStaff, (req, res) => JobController.create(req, res));
router.get('/jobs/new', requireAuth, requireStaff, (req, res) => JobController.create(req, res));

// 3. [STORE / POST] Process job publication form submission (Coordinator & Admin)
router.post('/jobs', requireAuth, requireStaff, upload.none(), (req, res) => JobController.store(req, res));
router.post('/job', requireAuth, requireStaff, upload.none(), (req, res) => JobController.store(req, res));

// 4. [READ ONE / SHOW] Show single job opening details (Public)
router.get('/jobs/:id', (req, res) => JobController.show(req, res));

// 5. [EDIT FORM] Show form view to edit an existing job posting (Coordinator & Admin)
router.get('/jobs/:id/edit', requireAuth, requireStaff, (req, res) => JobController.edit(req, res));

// 6. [UPDATE] Process job update form submission (Coordinator & Admin)
router.post('/jobs/:id/update', requireAuth, requireStaff, upload.none(), (req, res) => JobController.update(req, res));
router.post('/jobs/:id', requireAuth, requireStaff, upload.none(), (req, res) => JobController.update(req, res));
router.put('/jobs/:id', requireAuth, requireStaff, upload.none(), (req, res) => JobController.update(req, res));

// 7. [DELETE / DESTROY] Process deletion of job posting (Admin only)
router.post('/jobs/:id/delete', requireAuth, requireAdmin, (req, res) => JobController.destroy(req, res));
router.get('/jobs/:id/delete', requireAuth, requireAdmin, (req, res) => JobController.destroy(req, res));
router.delete('/jobs/:id', requireAuth, requireAdmin, (req, res) => JobController.destroy(req, res));

module.exports = router;
