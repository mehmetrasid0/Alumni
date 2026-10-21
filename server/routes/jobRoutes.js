const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const JobController = require('../controllers/JobController');

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

// 1. [MANAGEMENT UI / INDEX] Career Board & Job Listing
// Direct Route: GET /jobs
router.get('/jobs', (req, res) => JobController.index(req, res));
router.get('/job', (req, res) => JobController.index(req, res));

// 2. [CREATE FORM] Show form view to publish a new job opening (precedes :id route)
// Direct Route: GET /jobs/create
router.get('/jobs/create', (req, res) => JobController.create(req, res));
router.get('/jobs/new', (req, res) => JobController.create(req, res));

// 3. [STORE / POST] Process job publication form submission and redirect
// Direct Route: POST /jobs
router.post('/jobs', upload.none(), (req, res) => JobController.store(req, res));
router.post('/job', upload.none(), (req, res) => JobController.store(req, res));

// 4. [READ ONE / SHOW] Show single job opening details
// Direct Route: GET /jobs/:id
router.get('/jobs/:id', (req, res) => JobController.show(req, res));

// 5. [EDIT FORM] Show form view to edit an existing job posting
// Direct Route: GET /jobs/:id/edit
router.get('/jobs/:id/edit', (req, res) => JobController.edit(req, res));

// 6. [UPDATE] Process job update form submission
// Direct Route: POST /jobs/:id/update
router.post('/jobs/:id/update', upload.none(), (req, res) => JobController.update(req, res));
router.post('/jobs/:id', upload.none(), (req, res) => JobController.update(req, res));
router.put('/jobs/:id', upload.none(), (req, res) => JobController.update(req, res));

// 7. [DELETE / DESTROY] Process deletion of job posting
// Direct Route: POST /jobs/:id/delete
router.post('/jobs/:id/delete', (req, res) => JobController.destroy(req, res));
router.get('/jobs/:id/delete', (req, res) => JobController.destroy(req, res));
router.delete('/jobs/:id', (req, res) => JobController.destroy(req, res));

module.exports = router;
