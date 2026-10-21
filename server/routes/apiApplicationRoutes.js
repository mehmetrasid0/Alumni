/**
 * ============================================================================
 * Alumni Tracker — API Application Routes (Direct & Nested Routes)
 * ============================================================================
 * Architectural Layer: ROUTES (Dispatches to ApiApplicationController)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * Specification Reference: DDD.md (Section 10)
 * 
 * Supports:
 *   1. Direct Routes:
 *      - GET    /api/applications
 *      - GET    /api/applications/:id
 *      - POST   /api/applications
 *      - PUT    /api/applications/:id
 *      - PATCH  /api/applications/:id
 *      - DELETE /api/applications/:id
 * 
 *   2. Nested Job Routes (via apiJobRoutes: router.use('/:jobId/applications', apiApplicationRoutes)):
 *      - GET    /api/jobs/:jobId/applications
 *      - POST   /api/jobs/:jobId/applications
 *      - GET    /api/jobs/:jobId/applications/:id
 *      - PUT    /api/jobs/:jobId/applications/:id
 *      - DELETE /api/jobs/:jobId/applications/:id
 * 
 *   3. Nested User Routes (via apiUserRoutes: router.use('/:userId/applications', apiApplicationRoutes)):
 *      - GET    /api/users/:userId/applications
 *      - GET    /api/users/:userId/applications/:id
 *      - DELETE /api/users/:userId/applications/:id
 * ============================================================================
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const upload = multer();
const ApiApplicationController = require('../controllers/ApiApplicationController');

// 1. [READ ALL / INDEX]
// Direct: GET /api/applications
// Nested Job: GET /api/jobs/:jobId/applications
// Nested User: GET /api/users/:userId/applications
router.get('/', (req, res) => ApiApplicationController.getAll(req, res));

// 2. [READ ONE / SHOW]
// Direct: GET /api/applications/:id
// Nested Job: GET /api/jobs/:jobId/applications/:id
// Nested User: GET /api/users/:userId/applications/:id
router.get('/:id', (req, res) => ApiApplicationController.getById(req, res));

// 3. [CREATE / SUBMIT]
// Direct: POST /api/applications
// Nested Job: POST /api/jobs/:jobId/applications
router.post('/', upload.none(), (req, res) => ApiApplicationController.create(req, res));

// 4. [UPDATE / PUT]
// Direct: PUT /api/applications/:id
// Nested Job: PUT /api/jobs/:jobId/applications/:id
router.put('/:id', upload.none(), (req, res) => ApiApplicationController.update(req, res));

// 5. [PATCH / PARTIAL UPDATE]
// Direct: PATCH /api/applications/:id
// Nested Job: PATCH /api/jobs/:jobId/applications/:id
router.patch('/:id', upload.none(), (req, res) => ApiApplicationController.patch(req, res));

// 6. [DELETE / WITHDRAW]
// Direct: DELETE /api/applications/:id
// Nested Job: DELETE /api/jobs/:jobId/applications/:id
// Nested User: DELETE /api/users/:userId/applications/:id
router.delete('/:id', (req, res) => ApiApplicationController.delete(req, res));

module.exports = router;
