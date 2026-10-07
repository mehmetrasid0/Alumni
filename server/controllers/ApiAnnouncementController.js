/**
 * ============================================================================
 * Alumni Tracker — API Announcement Controller (ApiAnnouncementController)
 * ============================================================================
 * Architectural Layer: CONTROLLER (REST API Handlers)
 * Author: Mehmet Raşid Ünlüel
 * Institution: Istanbul University (Management Information Systems / YBS, 3rd Year)
 * 
 * Description:
 *   Handles all RESTful HTTP requests for Announcements without a database.
 *   Responsible for:
 *   - Request parsing (query parameters, body payloads, URL path params)
 *   - Input validation orchestration via the Announcement Model
 *   - Returning standard JSON payloads with appropriate HTTP status codes
 *   - Full CRUD operations: getAll, getById, create, update (PUT), patch (PATCH), delete
 * ============================================================================
 */

const Announcement = require('../models/Announcement');

class ApiAnnouncementController {
  /**
   * [GET /api/announcements]
   * Retrieve all announcements with optional query filtering.
   * Query params supported: ?query=, ?category=, ?status=, ?priority=
   */
  getAll(req, res) {
    try {
      const announcements = Announcement.findAll(req.query);
      return res.status(200).json({
        success: true,
        count: announcements.length,
        data: announcements
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal server error while fetching announcements'
      });
    }
  }

  /**
   * [GET /api/announcements/:id]
   * Retrieve a single announcement by primary numeric ID.
   */
  getById(req, res) {
    try {
      const announcement = Announcement.findById(req.params.id);

      if (!announcement) {
        return res.status(404).json({
          success: false,
          error: `Announcement with ID ${req.params.id} not found`
        });
      }

      return res.status(200).json({
        success: true,
        data: announcement
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal server error while fetching announcement'
      });
    }
  }

  /**
   * [POST /api/announcements]
   * Create a new announcement record.
   * Accepts JSON, multipart/form-data, or urlencoded body.
   */
  create(req, res) {
    try {
      const newAnnouncement = Announcement.create(req.body);
      return res.status(201).json({
        success: true,
        message: 'Announcement created successfully',
        data: newAnnouncement
      });
    } catch (err) {
      return res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * [PUT /api/announcements/:id]
   * Fully update an existing announcement (requires title and content).
   */
  update(req, res) {
    try {
      const updated = Announcement.update(req.params.id, req.body, false);
      return res.status(200).json({
        success: true,
        message: 'Announcement fully updated successfully',
        data: updated
      });
    } catch (err) {
      return res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * [PATCH /api/announcements/:id]
   * Partially update selective fields of an existing announcement.
   */
  patch(req, res) {
    try {
      const updated = Announcement.update(req.params.id, req.body, true);
      return res.status(200).json({
        success: true,
        message: 'Announcement partially updated successfully',
        data: updated
      });
    } catch (err) {
      return res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * [DELETE /api/announcements/:id]
   * Remove an announcement record by primary ID.
   */
  delete(req, res) {
    try {
      const deleted = Announcement.delete(req.params.id);
      return res.status(200).json({
        success: true,
        message: `Announcement "${deleted.title}" successfully deleted`,
        data: deleted
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
module.exports = new ApiAnnouncementController();

