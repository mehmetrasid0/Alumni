/**
 * ============================================================================
 * Alumni Tracker — API Job Controller (ApiJobController)
 * ============================================================================
 * Architectural Layer: CONTROLLER (REST API Handlers / Database Integrated)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * Specification Reference: DDD.md
 * 
 * Supports Direct Career Endpoints & Nested Applications:
 *   1. Direct Routes:  /api/jobs, /api/jobs/:id
 *   2. Nested Route:   /api/jobs/:jobId/applications
 * ============================================================================
 */

const JobPosting = require('../models/JobPosting');

class ApiJobController {
  /**
   * [GET /api/jobs]
   * Retrieve all job postings with multi-criteria filtering.
   */
  async getAll(req, res) {
    try {
      const filters = { ...req.query };
      const jobs = await JobPosting.findAll(filters);
      return res.status(200).json({
        success: true,
        count: jobs.length,
        data: jobs
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal server error while fetching job postings'
      });
    }
  }

  /**
   * [GET /api/jobs/:id]
   * Retrieve a single job posting by ID.
   */
  async getById(req, res) {
    try {
      const jobId = req.params.jobId || req.params.id;
      const job = await JobPosting.findById(jobId);

      if (!job) {
        return res.status(404).json({
          success: false,
          error: `Job posting with ID ${jobId} not found`
        });
      }

      // Increment view impressions in the background
      JobPosting.incrementViews(jobId).catch(() => {});

      return res.status(200).json({
        success: true,
        data: job
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal server error while fetching job posting'
      });
    }
  }

  /**
   * [POST /api/jobs]
   * Create and persist a new job posting.
   */
  async create(req, res) {
    try {
      const payload = { ...req.body };

      // Validate required fields: title and companyName are mandatory, location and description are optional
      const title = payload.title ? String(payload.title).trim() : '';
      const companyName = payload.companyName || payload.company_name ? String(payload.companyName || payload.company_name).trim() : '';

      if (!title || !companyName) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title and companyName (company) are mandatory'
        });
      }

      if (title.length > 120) {
        return res.status(400).json({
          success: false,
          error: 'Validation error: title must not exceed 120 characters'
        });
      }

      const newJob = await JobPosting.create(payload);
      return res.status(201).json({
        success: true,
        message: 'Job posting created successfully',
        data: newJob
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message || 'Failed to create job posting'
      });
    }
  }

  /**
   * [PUT /api/jobs/:id]
   * Fully update an existing job posting.
   */
  async update(req, res) {
    try {
      const jobId = req.params.id;
      const existing = await JobPosting.findById(jobId);

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: `Job posting with ID ${jobId} not found`
        });
      }

      const updated = await JobPosting.update(jobId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Job posting updated successfully',
        data: updated
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message || 'Failed to update job posting'
      });
    }
  }

  /**
   * [PATCH /api/jobs/:id]
   * Partially update an existing job posting.
   */
  async patch(req, res) {
    return this.update(req, res);
  }

  /**
   * [DELETE /api/jobs/:id]
   * Delete a job posting by ID.
   */
  async delete(req, res) {
    try {
      const jobId = req.params.id;
      const existing = await JobPosting.findById(jobId);

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: `Job posting with ID ${jobId} not found`
        });
      }

      const deleted = await JobPosting.delete(jobId);
      return res.status(200).json({
        success: true,
        message: 'Job posting deleted successfully',
        data: deleted
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to delete job posting'
      });
    }
  }

  /**
   * [POST /api/jobs/:id/apply]
   * Submit an application intent for a specific job posting.
   */
  async apply(req, res) {
    try {
      const jobId = req.params.id;
      const job = await JobPosting.findById(jobId);

      if (!job) {
        return res.status(404).json({
          success: false,
          error: `Job posting with ID ${jobId} not found`
        });
      }

      const applicantName = req.body.name || req.body.fullName || 'Anonymous Alumnus';
      const applicantEmail = req.body.email;
      const resumeUrl = req.body.resumeUrl || req.body.resume_url || null;

      if (!applicantEmail) {
        return res.status(400).json({
          success: false,
          error: 'Applicant email address is required to apply'
        });
      }

      return res.status(200).json({
        success: true,
        message: `Application submitted successfully for position "${job.title}" at ${job.companyName}`,
        data: {
          jobId: job.id,
          position: job.title,
          company: job.companyName,
          applicant: {
            name: applicantName,
            email: applicantEmail,
            resumeUrl
          },
          contactEmail: job.contactEmail,
          applicationUrl: job.applicationUrl,
          appliedAt: new Date().toISOString()
        }
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to process job application'
      });
    }
  }
}

module.exports = new ApiJobController();
