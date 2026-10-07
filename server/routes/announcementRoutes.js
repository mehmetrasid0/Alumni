const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const AnnouncementController = require('../controllers/AnnouncementController');

/**
 * ============================================================================
 * Alumni Tracker — Web Announcement Routes (Full CRUD Suite & Management UI)
 * ============================================================================
 * Architectural Layer: ROUTES (Dispatches to AnnouncementController)
 * Mount Path: /
 * Author: Mehmet Raşid Ünlüel
 * Institution: Istanbul University (Management Information Systems / YBS, 3rd Year)
 * ============================================================================
 */

// 1. [MANAGEMENT UI / INDEX] Announcement Dashboard & Listing
router.get('/announcements', (req, res) => AnnouncementController.index(req, res));
router.get('/announcement', (req, res) => AnnouncementController.index(req, res));

// 2. [CREATE FORM] Show form view to author a new announcement (precedes :id route)
router.get('/announcements/create', (req, res) => AnnouncementController.create(req, res));
router.get('/announcements/new', (req, res) => AnnouncementController.create(req, res));

// 3. [STORE / POST] Process announcement form submission and redirect
router.post('/announcements', upload.none(), (req, res) => AnnouncementController.store(req, res));
router.post('/announcement', upload.none(), (req, res) => AnnouncementController.store(req, res));

// 4. [READ ONE / SHOW] Show single announcement detail view
router.get('/announcements/:id', (req, res) => AnnouncementController.show(req, res));

// 5. [EDIT FORM] Show form view to edit an existing announcement
router.get('/announcements/:id/edit', (req, res) => AnnouncementController.edit(req, res));

// 6. [UPDATE] Process announcement update form submission
router.post('/announcements/:id/update', upload.none(), (req, res) => AnnouncementController.update(req, res));
router.post('/announcements/:id', upload.none(), (req, res) => AnnouncementController.update(req, res));
router.put('/announcements/:id', upload.none(), (req, res) => AnnouncementController.update(req, res));

// 7. [DELETE / DESTROY] Process deletion of announcement
router.post('/announcements/:id/delete', (req, res) => AnnouncementController.destroy(req, res));
router.get('/announcements/:id/delete', (req, res) => AnnouncementController.destroy(req, res));
router.delete('/announcements/:id', (req, res) => AnnouncementController.destroy(req, res));

module.exports = router;
