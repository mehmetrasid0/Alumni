/**
 * ============================================================================
 * Alumni Tracker — API Job Routes (Direct Routes & Sub-resource Applications)
 * ============================================================================
 * Architectural Layer: ROUTES (Dispatches to ApiJobController)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * Specification Reference: DDD.md
 * 
 * Supports:
 *   1. Direct Routes:  /api/jobs, /api/jobs/:id
 *   2. Nested Routes:  /api/jobs/:jobId/applications (1:N Sub-resource)
 * ============================================================================
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const upload = multer();
const ApiJobController = require('../controllers/ApiJobController');

// 1. [READ ALL / INDEX]
// GET /api/jobs - List all active jobs (supports filtering query params)
router.get('/', (req, res) => ApiJobController.getAll(req, res));

// 2. [READ ONE / SHOW]
// GET /api/jobs/:id - Get specific job details
router.get('/:id', (req, res) => ApiJobController.getById(req, res));

// 3. [CREATE / STORE]
// POST /api/jobs - Create job vacancy
router.post('/', upload.none(), (req, res) => ApiJobController.create(req, res));

// 4. [UPDATE / PUT]
// PUT /api/jobs/:id - Fully update job
router.put('/:id', upload.none(), (req, res) => ApiJobController.update(req, res));

// 5. [PATCH / PARTIAL UPDATE]
// PATCH /api/jobs/:id - Partially update job
router.patch('/:id', upload.none(), (req, res) => ApiJobController.patch(req, res));

// 6. [DELETE / DESTROY]
// DELETE /api/jobs/:id - Delete job
router.delete('/:id', (req, res) => ApiJobController.delete(req, res));

// 7. [ACTION SUB-ROUTE]
// POST /api/jobs/:id/apply - Apply for job directly
router.post('/:id/apply', upload.none(), (req, res) => ApiJobController.apply(req, res));

// ============================================================================
// Nested Sub-resource Routes (Model Relationships)
// ============================================================================
// Nested Applications: /api/jobs/:jobId/applications (JobPosting 1:N Application)
const apiApplicationRoutes = require('./apiApplicationRoutes');
router.use('/:jobId/applications', apiApplicationRoutes);

module.exports = router;
