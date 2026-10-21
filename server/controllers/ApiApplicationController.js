/**
 * ============================================================================
 * Alumni Tracker — API Application Controller (ApiApplicationController)
 * ============================================================================
 * Architectural Layer: CONTROLLER (REST API JSON Response & Lifecycle)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * Specification Reference: DDD.md (Section 10)
 * 
 * Supports Direct & Nested REST API Routes:
 *   1. Direct Routes:
 *      - GET    /api/applications              (List all applications across system)
 *      - GET    /api/applications/:id          (Single application details)
 *      - POST   /api/applications              (Submit application)
 *      - PUT    /api/applications/:id          (Update application status/notes)
 *      - PATCH  /api/applications/:id          (Partial status mutation)
 *      - DELETE /api/applications/:id          (Withdraw application)
 * 
 *   2. Nested Job Sub-resource Routes (JobPosting 1:N Application):
 *      - GET    /api/jobs/:jobId/applications     (List all candidates for specific job)
 *      - POST   /api/jobs/:jobId/applications     (Apply directly to specific job)
 *      - GET    /api/jobs/:jobId/applications/:id (Verify candidate belonging to job)
 *      - PUT    /api/jobs/:jobId/applications/:id (Update candidate review for job)
 *      - DELETE /api/jobs/:jobId/applications/:id (Remove candidate from job)
 * 
 *   3. Nested User Sub-resource Routes (User 1:N Application):
 *      - GET    /api/users/:userId/applications   (List all applications by an alumnus)
 *      - GET    /api/users/:userId/applications/:id
 *      - DELETE /api/users/:userId/applications/:id
 * ============================================================================
 */

const Application = require('../models/Application');
const JobPosting = require('../models/JobPosting');

class ApiApplicationController {
  /**
   * [GET /api/applications] or [GET /api/jobs/:jobId/applications] or [GET /api/users/:userId/applications]
   * [CRUD: READ ALL] List applications with dynamic route parameter scoping.
   */
  async getAll(req, res) {
    try {
      const jobId = req.params.jobId || req.query.jobId;
      const applicantId = req.params.userId || req.query.applicantId || req.query.userId;

      const filters = {
        ...req.query,
        ...(jobId && { jobId }),
        ...(applicantId && { applicantId })
      };

      const applications = await Application.findAll(filters);

      return res.status(200).json({
        success: true,
        count: applications.length,
        context: {
          scopedJobId: jobId || null,
          scopedApplicantId: applicantId || null
        },
        data: applications
      });
    } catch (err) {
      console.error('[ApiApplicationController.getAll] Error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve applications',
        message: err.message
      });
    }
  }

  /**
   * [GET /api/applications/:id] or nested
   * [CRUD: READ ONE] Retrieve a single application by ID with route validation.
   */
  async getById(req, res) {
    try {
      const application = await Application.findById(req.params.id);

      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Application with ID ${req.params.id} does not exist.`
        });
      }

      // Nested validation: ensure application belongs to scoped job
      if (req.params.jobId && application.jobId !== req.params.jobId) {
        return res.status(404).json({
          success: false,
          error: 'Scope Mismatch',
          message: `Application ${req.params.id} does not belong to job ${req.params.jobId}.`
        });
      }

      // Nested validation: ensure application belongs to scoped user
      if (req.params.userId && application.applicantId !== req.params.userId) {
        return res.status(404).json({
          success: false,
          error: 'Scope Mismatch',
          message: `Application ${req.params.id} does not belong to user ${req.params.userId}.`
        });
      }

      return res.status(200).json({
        success: true,
        data: application
      });
    } catch (err) {
      console.error('[ApiApplicationController.getById] Error:', err);
      return res.status(500).json({
        success: false,
        error: 'Server Error',
        message: err.message
      });
    }
  }

  /**
   * [POST /api/applications] or [POST /api/jobs/:jobId/applications]
   * [CRUD: CREATE] Submit a candidate application.
   */
  async create(req, res) {
    try {
      const jobId = req.params.jobId || req.body.jobId || req.body.job_id;
      const applicantId = req.params.userId || req.body.applicantId || req.body.applicant_id || req.body.userId;

      if (!jobId || !applicantId) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Both jobId and applicantId are required.'
        });
      }

      // Verify target job exists and is open
      const job = await JobPosting.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job Not Found',
          message: `Target job posting ${jobId} does not exist.`
        });
      }

      if (job.status === 'closed') {
        return res.status(400).json({
          success: false,
          error: 'Job Closed',
          message: 'This job opportunity is closed and no longer accepting applications.'
        });
      }

      const payload = {
        ...req.body,
        jobId,
        applicantId
      };

      const newApplication = await Application.create(payload);

      return res.status(201).json({
        success: true,
        message: 'Job application submitted successfully.',
        data: newApplication
      });
    } catch (err) {
      if (err.code === 'DUPLICATE_APPLICATION' || err.statusCode === 409) {
        return res.status(409).json({
          success: false,
          error: 'Duplicate Application',
          message: err.message
        });
      }

      console.error('[ApiApplicationController.create] Error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to submit application',
        message: err.message
      });
    }
  }

  /**
   * [PUT /api/applications/:id]
   * [CRUD: FULL UPDATE] Update candidate application status and recruiter evaluation notes.
   */
  async update(req, res) {
    try {
      const application = await Application.findById(req.params.id);

      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Application ${req.params.id} does not exist.`
        });
      }

      // Check nested scope
      if (req.params.jobId && application.jobId !== req.params.jobId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Application does not belong to the specified job posting.'
        });
      }

      const updated = await Application.update(req.params.id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Application updated successfully.',
        data: updated
      });
    } catch (err) {
      console.error('[ApiApplicationController.update] Error:', err);
      return res.status(500).json({
        success: false,
        error: 'Update Failed',
        message: err.message
      });
    }
  }

  /**
   * [PATCH /api/applications/:id]
   * [CRUD: PARTIAL UPDATE] Partially update application status.
   */
  async patch(req, res) {
    return this.update(req, res);
  }

  /**
   * [DELETE /api/applications/:id]
   * [CRUD: DELETE] Withdraw application.
   */
  async delete(req, res) {
    try {
      const application = await Application.findById(req.params.id);

      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Application ${req.params.id} does not exist.`
        });
      }

      // Verify nested scoping
      if (req.params.jobId && application.jobId !== req.params.jobId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Application does not belong to specified job posting.'
        });
      }

      if (req.params.userId && application.applicantId !== req.params.userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only withdraw your own applications.'
        });
      }

      const deleted = await Application.delete(req.params.id);

      return res.status(200).json({
        success: true,
        message: 'Application withdrawn successfully.',
        data: deleted
      });
    } catch (err) {
      console.error('[ApiApplicationController.delete] Error:', err);
      return res.status(500).json({
        success: false,
        error: 'Delete Failed',
        message: err.message
      });
    }
  }
}

module.exports = new ApiApplicationController();
