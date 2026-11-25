/**
 * ============================================================================
 * Alumni Tracker — Web Application Routes (Full CRUD & Candidate UI)
 * ============================================================================
 * Architectural Layer: ROUTES (Dispatches to ApplicationController)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * Mount Path: /
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const ApplicationController = require('../controllers/ApplicationController');
const {
  requireAuth,
  requireOwnership,
  resolveApplicationOwner,
  resolveParamUserOwner
} = require('../middleware/authMiddleware');

// 1. [MANAGEMENT UI / INDEX] Application Dashboard (renders UI; fetches protected /api/applications)
router.get('/applications', (req, res) => ApplicationController.index(req, res));
router.get('/application', (req, res) => ApplicationController.index(req, res));

// 2. [READ ONE / REVIEW CARD] Single application details (Owner, Coordinator, or Admin)
router.get(
  '/applications/:id',
  requireAuth,
  requireOwnership(resolveApplicationOwner, { bypassRoles: ['admin', 'coordinator'], resourceLabel: 'application' }),
  (req, res) => ApplicationController.show(req, res)
);

// 3. [NESTED APPLICATION VIEW] Candidate applications for specific job
router.get('/jobs/:jobId/applications', requireAuth, (req, res) => ApplicationController.index(req, res));

// 4. [NESTED APPLICATION FORM] Submit application form for specific job (Authenticated users)
router.get('/jobs/:jobId/apply', requireAuth, (req, res) => ApplicationController.create(req, res));
router.post('/jobs/:jobId/apply', requireAuth, upload.none(), (req, res) => ApplicationController.store(req, res));

// 5. [NESTED ALUMNUS APPLICATION VIEW] View applications submitted by an alumnus (Owner, Coordinator, or Admin)
router.get(
  '/users/:userId/applications',
  requireAuth,
  requireOwnership(resolveParamUserOwner, { bypassRoles: ['admin', 'coordinator'], resourceLabel: 'user applications' }),
  (req, res) => ApplicationController.userApplications(req, res)
);

module.exports = router;
