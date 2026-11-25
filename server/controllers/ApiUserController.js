/**
 * ============================================================================
 * Alumni Tracker — API User Controller (ApiUserController)
 * ============================================================================
 * Architectural Layer: CONTROLLER (REST API Handlers / Database Integrated)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * ============================================================================
 */

const User = require('../models/User');
const { issueSessionCookie, clearSessionCookie } = require('../middleware/authSession');
const { getNavigationByRole } = require('../middleware/authMiddleware');

class ApiUserController {
  /**
   * [GET /api/users]
   * Retrieve all alumni records with optional query filtering.
   * Query params supported: ?query=, ?department=, ?graduationYear=, ?skill=
   */
  async getAll(req, res) {
    try {
      const users = await User.findAll(req.query);
      return res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal server error while fetching users'
      });
    }
  }

  /**
   * [GET /api/users/:id]
   * Retrieve a single user by primary ID (UUID or student ID).
   */
  async getById(req, res) {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: `User with ID ${req.params.id} not found`
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal server error while fetching user'
      });
    }
  }

  /**
   * [POST /api/users/register]
   * Public self-registration endpoint enforcing password presence and RBAC role boundaries.
   */
  async register(req, res) {
    try {
      const body = req.body || {};
      if (!body.password || String(body.password).length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password is required and must be at least 6 characters long'
        });
      }

      const requestedRole = (body.userRole || body.user_role || 'alumni').toString().trim().toLowerCase();
      if (requestedRole === 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Self-registration as admin is forbidden by platform RBAC policy'
        });
      }

      const skillsArray = typeof body.skills === 'string'
        ? body.skills.split(',').map(s => s.trim()).filter(Boolean)
        : (Array.isArray(body.skills) ? body.skills : []);

      const newUser = await User.create({
        ...body,
        userRole: requestedRole,
        skills: skillsArray
      });

      const token = issueSessionCookie(res, newUser);

      return res.status(201).json({
        success: true,
        message: 'Registration completed successfully',
        token,
        data: newUser
      });
    } catch (err) {
      return res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * [POST /api/users/login]
   * Authenticate user credentials and issue signed HttpOnly session cookie.
   */
  async login(req, res) {
    try {
      const { email, password, remember } = req.body || {};
      if (!email || !String(email).trim() || !password) {
        return res.status(400).json({
          success: false,
          error: 'Both email and password are required'
        });
      }

      const user = await User.verifyCredentials(email, password);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email address or password'
        });
      }

      const token = issueSessionCookie(res, user, Boolean(remember));

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        data: user
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal server error during login'
      });
    }
  }

  /**
   * [POST /api/users/logout]
   * Clear active authentication session cookie.
   */
  async logout(req, res) {
    clearSessionCookie(res);
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }

  /**
   * [GET /api/users/me]
   * Return currently authenticated session user or 401 when signed out.
   */
  async me(req, res) {
    try {
      if (!req.authUser || !req.authUser.id) {
        return res.status(401).json({
          success: false,
          authenticated: false,
          error: 'Not authenticated'
        });
      }

      const freshUser = await User.findById(req.authUser.id);
      if (!freshUser) {
        clearSessionCookie(res);
        return res.status(401).json({
          success: false,
          authenticated: false,
          error: 'Session account no longer exists'
        });
      }

      return res.status(200).json({
        success: true,
        authenticated: true,
        data: freshUser,
        navigation: getNavigationByRole(freshUser)
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to inspect session'
      });
    }
  }

  /**
   * [GET /api/users/navigation]
   * Return role-specific navigation links for guest, alumni, coordinator, or admin.
   */
  async navigation(req, res) {
    try {
      if (!req.authUser || !req.authUser.id) {
        return res.status(200).json({
          success: true,
          authenticated: false,
          role: 'guest',
          items: getNavigationByRole(null),
          user: null
        });
      }

      const freshUser = await User.findById(req.authUser.id);
      if (!freshUser) {
        clearSessionCookie(res);
        return res.status(200).json({
          success: true,
          authenticated: false,
          role: 'guest',
          items: getNavigationByRole(null),
          user: null
        });
      }

      return res.status(200).json({
        success: true,
        authenticated: true,
        role: freshUser.userRole || 'alumni',
        items: getNavigationByRole(freshUser),
        user: freshUser
      });
    } catch (err) {
      return res.status(200).json({
        success: true,
        authenticated: false,
        role: 'guest',
        items: getNavigationByRole(null),
        user: null
      });
    }
  }

  /**
   * [POST /api/users]
   * Create a new alumni record in PostgreSQL.
   */
  async create(req, res) {
    try {
      const newUser = await User.create(req.body);
      return res.status(201).json({
        success: true,
        message: 'Alumni record created successfully',
        data: newUser
      });
    } catch (err) {
      return res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * [PUT /api/users/:id]
   * Fully update an existing user (all required fields must be supplied).
   */
  async update(req, res) {
    try {
      const updatedUser = await User.update(req.params.id, req.body, false);
      return res.status(200).json({
        success: true,
        message: 'Alumni record fully updated successfully',
        data: updatedUser
      });
    } catch (err) {
      return res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * [PATCH /api/users/:id]
   * Partially update selective fields of an existing user.
   */
  async patch(req, res) {
    try {
      const updatedUser = await User.update(req.params.id, req.body, true);
      return res.status(200).json({
        success: true,
        message: 'Alumni record partially updated successfully',
        data: updatedUser
      });
    } catch (err) {
      return res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * [DELETE /api/users/:id]
   * Remove an alumni record by primary ID.
   */
  async delete(req, res) {
    try {
      const deletedUser = await User.delete(req.params.id);
      return res.status(200).json({
        success: true,
        message: `${deletedUser.name} successfully deleted`,
        data: deletedUser
      });
    } catch (err) {
      return res.status(err.statusCode || 404).json({
        success: false,
        error: err.message
      });
    }
  }
}

// Export singleton instance
module.exports = new ApiUserController();
