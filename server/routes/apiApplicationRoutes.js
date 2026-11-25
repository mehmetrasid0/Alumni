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
const {
  requireAuth,
  requireStaff,
  requireOwnership,
  resolveParamUserOwner,
  resolveApplicationOwner
} = require('../middleware/authMiddleware');

const checkNestedUserScope = requireOwnership(resolveParamUserOwner, {
  bypassRoles: ['admin', 'coordinator'],
  resourceLabel: 'user applications'
});

function enforceNestedUserScope(req, res, next) {
  if (req.params.userId) {
    return checkNestedUserScope(req, res, next);
  }
  return next();
}

// 1. [READ ALL / INDEX] - Requires auth (alumni scoped to own in controller; nested :userId guarded)
router.get('/', requireAuth, enforceNestedUserScope, (req, res) => ApiApplicationController.getAll(req, res));

// 2. [READ ONE / SHOW] - Owner, Coordinator, or Admin
router.get(
  '/:id',
  requireAuth,
  requireOwnership(resolveApplicationOwner, { bypassRoles: ['admin', 'coordinator'], resourceLabel: 'application' }),
  (req, res) => ApiApplicationController.getById(req, res)
);

// 3. [CREATE / SUBMIT] - Requires auth; identity bound in controller for non-admins
router.post('/', requireAuth, enforceNestedUserScope, upload.none(), (req, res) => ApiApplicationController.create(req, res));

// 4. [UPDATE / PUT] - Coordinator & Admin status/notes review
router.put('/:id', requireAuth, requireStaff, upload.none(), (req, res) => ApiApplicationController.update(req, res));

// 5. [PATCH / PARTIAL UPDATE] - Coordinator & Admin
router.patch('/:id', requireAuth, requireStaff, upload.none(), (req, res) => ApiApplicationController.patch(req, res));

// 6. [DELETE / WITHDRAW] - Applicant Owner or Admin
router.delete(
  '/:id',
  requireAuth,
  requireOwnership(resolveApplicationOwner, { bypassRoles: ['admin'], resourceLabel: 'application' }),
  (req, res) => ApiApplicationController.delete(req, res)
);

module.exports = router;
