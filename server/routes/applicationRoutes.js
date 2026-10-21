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

// 1. [MANAGEMENT UI / INDEX] Application Dashboard
// Direct Route: GET /applications
router.get('/applications', (req, res) => ApplicationController.index(req, res));
router.get('/application', (req, res) => ApplicationController.index(req, res));

// 2. [READ ONE / REVIEW CARD] Single application details
// Direct Route: GET /applications/:id
router.get('/applications/:id', (req, res) => ApplicationController.show(req, res));

// 3. [NESTED APPLICATION VIEW] Candidate applications for specific job
// Nested Route: GET /jobs/:jobId/applications
router.get('/jobs/:jobId/applications', (req, res) => ApplicationController.index(req, res));

// 4. [NESTED APPLICATION FORM] Submit application form for specific job
// Nested Routes: GET /jobs/:jobId/apply & POST /jobs/:jobId/apply
router.get('/jobs/:jobId/apply', (req, res) => ApplicationController.create(req, res));
router.post('/jobs/:jobId/apply', upload.none(), (req, res) => ApplicationController.store(req, res));

// 5. [NESTED ALUMNUS APPLICATION VIEW] View applications submitted by an alumnus
// Nested Route: GET /users/:userId/applications
router.get('/users/:userId/applications', (req, res) => ApplicationController.userApplications(req, res));

module.exports = router;
