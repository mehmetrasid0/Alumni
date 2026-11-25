const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const ApiUserController = require('../controllers/ApiUserController');
const {
  requireAuth,
  requireAdmin,
  requireStaff,
  requireOwnership,
  preventRoleEscalation,
  resolveParamUserOwner
} = require('../middleware/authMiddleware');

/**
 * ============================================================================
 * Alumni Tracker — API User Routes
 * ============================================================================
 * Architectural Layer: ROUTES (Dispatches to ApiUserController)
 * Base Path: /api/users
 * ============================================================================
 */

// Authentication & Session Endpoints (Public / Session-Aware)
router.post('/register', upload.none(), (req, res) => ApiUserController.register(req, res));
router.post('/login', upload.none(), (req, res) => ApiUserController.login(req, res));
router.post('/logout', (req, res) => ApiUserController.logout(req, res));
router.get('/me', (req, res) => ApiUserController.me(req, res));
router.get('/navigation', (req, res) => ApiUserController.navigation(req, res));

// Public Directory Reads
router.get('/', (req, res) => ApiUserController.getAll(req, res));
router.get('/:id', (req, res) => ApiUserController.getById(req, res));

// Protected User Mutations (Admin & Profile Owner)
router.post('/', requireAuth, requireAdmin, upload.none(), (req, res) => ApiUserController.create(req, res));

router.put(
  '/:id',
  requireAuth,
  requireOwnership(resolveParamUserOwner, { bypassRoles: ['admin'], resourceLabel: 'user profile' }),
  upload.none(),
  preventRoleEscalation,
  (req, res) => ApiUserController.update(req, res)
);

router.patch(
  '/:id',
  requireAuth,
  requireOwnership(resolveParamUserOwner, { bypassRoles: ['admin'], resourceLabel: 'user profile' }),
  upload.none(),
  preventRoleEscalation,
  (req, res) => ApiUserController.patch(req, res)
);

router.delete('/:id', requireAuth, requireAdmin, (req, res) => ApiUserController.delete(req, res));

// ============================================================================
// Nested Sub-resource Routes (Model Relationships)
// ============================================================================

// 1. Nested Announcements: /api/users/:userId/announcements (User 1:N Announcement)
const ApiAnnouncementController = require('../controllers/ApiAnnouncementController');
router.get('/:userId/announcements', (req, res) => {
  req.query.authorId = req.params.userId;
  return ApiAnnouncementController.getAll(req, res);
});
router.post(
  '/:userId/announcements',
  requireAuth,
  requireStaff,
  requireOwnership(resolveParamUserOwner, { bypassRoles: ['admin'], resourceLabel: 'author namespace' }),
  upload.none(),
  (req, res) => {
    req.body.authorId = req.params.userId;
    return ApiAnnouncementController.create(req, res);
  }
);

// 3. Nested Profile: /api/users/:userId/profile (User 1:1 AlumniProfile)
router.get('/:userId/profile', (req, res) => {
  req.params.id = req.params.userId;
  return ApiUserController.getById(req, res);
});

// 4. Nested Applications: /api/users/:userId/applications (User 1:N Application)
const apiApplicationRoutes = require('./apiApplicationRoutes');
router.use('/:userId/applications', apiApplicationRoutes);

module.exports = router;

