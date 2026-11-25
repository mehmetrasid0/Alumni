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
const { requireAuth, requireAdmin, requireStaff } = require('../middleware/authMiddleware');

// 1. [READ ALL / INDEX] - Public career feed
router.get('/', (req, res) => ApiJobController.getAll(req, res));

// 2. [READ ONE / SHOW] - Public single job detail
router.get('/:id', (req, res) => ApiJobController.getById(req, res));

// 3. [CREATE / STORE] - Coordinator & Admin
router.post('/', requireAuth, requireStaff, upload.none(), (req, res) => ApiJobController.create(req, res));

// 4. [UPDATE / PUT] - Coordinator & Admin
router.put('/:id', requireAuth, requireStaff, upload.none(), (req, res) => ApiJobController.update(req, res));

// 5. [PATCH / PARTIAL UPDATE] - Coordinator & Admin
router.patch('/:id', requireAuth, requireStaff, upload.none(), (req, res) => ApiJobController.patch(req, res));

// 6. [DELETE / DESTROY] - Admin only
router.delete('/:id', requireAuth, requireAdmin, (req, res) => ApiJobController.delete(req, res));

// 7. [ACTION SUB-ROUTE] - Authenticated users
router.post('/:id/apply', requireAuth, upload.none(), (req, res) => ApiJobController.apply(req, res));

// ============================================================================
// Nested Sub-resource Routes (Model Relationships)
// ============================================================================
// Nested Applications: /api/jobs/:jobId/applications (JobPosting 1:N Application)
const apiApplicationRoutes = require('./apiApplicationRoutes');
router.use('/:jobId/applications', apiApplicationRoutes);

module.exports = router;
