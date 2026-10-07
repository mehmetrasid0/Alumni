/**
 * ============================================================================
 * Alumni Tracker — API User Controller (ApiUserController)
 * ============================================================================
 * Architectural Layer: CONTROLLER (REST API Handlers)
 * 
 * Description:
 *   Handles all RESTful HTTP requests for Alumni users. Responsible for:
 *   - Request parsing (query parameters, body payloads, URL path params)
 *   - Input validation orchestration via the User Model
 *   - Returning standard JSON payloads with appropriate HTTP status codes
 *   - Full CRUD operations: getAll, getById, create, update (PUT), patch (PATCH), delete
 * ============================================================================
 */

const User = require('../models/User');

class ApiUserController {
  /**
   * [GET /api/users]
   * Retrieve all alumni records with optional query filtering.
   * Query params supported: ?query=, ?department=, ?graduationYear=
   */
  getAll(req, res) {
    try {
      const users = User.findAll(req.query);
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
   * Retrieve a single user by primary numeric ID.
   */
  getById(req, res) {
    try {
      const user = User.findById(req.params.id);

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
   * [POST /api/users]
   * Create a new alumni record.
   * Expects JSON, multipart/form-data, or urlencoded body.
   */
  create(req, res) {
    try {
      const newUser = User.create(req.body);
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
  update(req, res) {
    try {
      const updatedUser = User.update(req.params.id, req.body, false);
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
  patch(req, res) {
    try {
      const updatedUser = User.update(req.params.id, req.body, true);
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
  delete(req, res) {
    try {
      const deletedUser = User.delete(req.params.id);
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

