const express = require('express');
const path = require('path');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const UserController = require('../controllers/UserController');

/**
 * ============================================================================
 * Alumni Tracker — Web User & Page Routes (Full CRUD Suite)
 * ============================================================================
 * Architectural Layer: ROUTES (Dispatches to UserController)
 * Mount Path: /
 * ============================================================================
 */

const { clearSessionCookie } = require('../middleware/authSession');
const {
  requireAuth,
  requireAdmin,
  requireOwnership,
  preventRoleEscalation,
  resolveParamUserOwner
} = require('../middleware/authMiddleware');

// Home, About, Auth (Login/Register/Logout) & 404 Landing Views
router.get('/', (req, res) => UserController.home(req, res));
router.get('/about', (req, res) => UserController.about(req, res));
router.get('/register', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'register.html')));
router.get('/login', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'login.html')));
router.get('/profile', requireAuth, (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'profile.html')));
router.get('/me', requireAuth, (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'profile.html')));
router.get('/logout', (req, res) => {
  clearSessionCookie(res);
  return res.redirect('/login?loggedOut=1');
});
router.get('/404', (req, res) => res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html')));

// ============================================================================
// Web View Layer CRUD Operations for Users
// ============================================================================

// 1. [READ ALL / INDEX] List all alumni in directory view
router.get('/users', (req, res) => UserController.index(req, res));
router.get('/user', (req, res) => UserController.index(req, res));
router.get('/alumni', (req, res) => UserController.index(req, res));

// 2. [CREATE FORM] Show form view to create new alumnus (Admin only; precedes :id)
router.get('/users/create', requireAuth, requireAdmin, (req, res) => UserController.create(req, res));
router.get('/users/new', requireAuth, requireAdmin, (req, res) => UserController.create(req, res));

// 3. [STORE / POST] Process alumnus creation form (Admin only)
router.post('/users', requireAuth, requireAdmin, upload.none(), (req, res) => UserController.store(req, res));
router.post('/user', requireAuth, requireAdmin, upload.none(), (req, res) => UserController.store(req, res));

// 4. [READ ONE / SHOW] Show single alumnus profile view (Public)
router.get('/users/:id', (req, res) => UserController.show(req, res));

// 5. [EDIT FORM] Show form view to edit an existing alumnus (Owner or Admin)
router.get(
  '/users/:id/edit',
  requireAuth,
  requireOwnership(resolveParamUserOwner, { bypassRoles: ['admin'], resourceLabel: 'user profile' }),
  (req, res) => UserController.edit(req, res)
);

// 6. [UPDATE] Process alumnus update form submission (Owner or Admin)
const userUpdateGuards = [
  requireAuth,
  requireOwnership(resolveParamUserOwner, { bypassRoles: ['admin'], resourceLabel: 'user profile' }),
  upload.none(),
  preventRoleEscalation
];
router.post('/users/:id/update', ...userUpdateGuards, (req, res) => UserController.update(req, res));
router.post('/users/:id', ...userUpdateGuards, (req, res) => UserController.update(req, res));
router.put('/users/:id', ...userUpdateGuards, (req, res) => UserController.update(req, res));

// 7. [DELETE / DESTROY] Process deletion of alumnus (Admin only)
router.post('/users/:id/delete', requireAuth, requireAdmin, (req, res) => UserController.destroy(req, res));
router.get('/users/:id/delete', requireAuth, requireAdmin, (req, res) => UserController.destroy(req, res));
router.delete('/users/:id', requireAuth, requireAdmin, (req, res) => UserController.destroy(req, res));

module.exports = router;
