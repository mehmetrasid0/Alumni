/**
 * ============================================================================
 * Alumni Tracker — API Announcement Controller (ApiAnnouncementController)
 * ============================================================================
 * Architectural Layer: CONTROLLER (REST API Handlers / Database Integrated)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * ============================================================================
 */

const Announcement = require('../models/Announcement');

class ApiAnnouncementController {
  /**
   * [GET /api/announcements]
   * Retrieve all announcements with optional query filtering.
   * Query params supported: ?query=, ?category=, ?status=, ?priority=
   */
  async getAll(req, res) {
    try {
      const announcements = await Announcement.findAll(req.query);
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
  async getById(req, res) {
    try {
      const announcement = await Announcement.findById(req.params.id);

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
   * Create a new announcement record in PostgreSQL.
   */
  async create(req, res) {
    try {
      const newAnnouncement = await Announcement.create(req.body);
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
   * Fully update an existing announcement.
   */
  async update(req, res) {
    try {
      const updated = await Announcement.update(req.params.id, req.body, false);
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
  async patch(req, res) {
    try {
      const updated = await Announcement.update(req.params.id, req.body, true);
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
  async delete(req, res) {
    try {
      const deleted = await Announcement.delete(req.params.id);
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
