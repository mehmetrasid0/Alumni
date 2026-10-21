/**
 * ============================================================================
 * Alumni Tracker — Web Application Controller (ApplicationController)
 * ============================================================================
 * Architectural Layer: CONTROLLER (Web Presentation & Request Lifecycle)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * Specification Reference: DDD.md (Section 10)
 * ============================================================================
 */

const path = require('path');
const Application = require('../models/Application');
const JobPosting = require('../models/JobPosting');
const User = require('../models/User');

class ApplicationController {
  /**
   * [GET /applications] or [GET /jobs/:jobId/applications]
   * [CRUD: READ ALL] Renders the Applications Management Dashboard.
   */
  index(req, res) {
    res.sendFile(path.join(__dirname, '..', 'public', 'applications.html'));
  }

  /**
   * [GET /applications/:id]
   * [CRUD: READ ONE] Review a single candidate application.
   */
  async show(req, res) {
    try {
      const application = await Application.findById(req.params.id);
      if (!application) {
        return res.status(404).send('Application not found.');
      }

      res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Review — ${application.applicantName}</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body style="background: #F8FAFC; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px 20px; color: #1E293B;">
          <div style="max-width: 800px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
            <a href="/applications" style="color: #64748B; text-decoration: none; font-weight: 600; font-size: 0.9rem;">← Back to Applications</a>
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin: 20px 0;">
              <div>
                <h1 style="color: #0A1628; margin: 0 0 6px 0; font-size: 1.8rem;">Candidate: ${application.applicantName}</h1>
                <p style="margin: 0; color: #64748B;">Applying for: <b>${application.jobTitle}</b> at ${application.companyName}</p>
              </div>
              <span style="background: #EEF2FF; color: #4F46E5; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 0.85rem;">
                ${application.status.toUpperCase()}
              </span>
            </div>

            <div style="background: #F8FAFC; border-radius: 12px; padding: 20px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 0.9rem;">
              <div><b>Email:</b> ${application.applicantEmail}</div>
              <div><b>Department:</b> ${application.applicantDepartment || 'Management Information Systems'}</div>
              <div><b>Graduation Year:</b> ${application.applicantGraduationYear || '2023'}</div>
              <div><b>Submission Date:</b> ${new Date(application.appliedAt).toLocaleString()}</div>
            </div>

            <h3 style="color: #0A1628; margin-bottom: 8px;">Cover Letter & Pitch</h3>
            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px; margin-bottom: 24px; font-size: 0.95rem; line-height: 1.7; color: #334155;">
              ${application.coverLetter || 'No cover letter provided.'}
            </div>

            ${application.resumeUrl ? `
              <div style="margin-bottom: 24px;">
                <a href="${application.resumeUrl}" target="_blank" style="display: inline-block; background: #0A1628; color: #FFFFFF; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 0.9rem;">
                  📄 View Attached Resume / CV ↗
                </a>
              </div>
            ` : ''}

            ${application.notes ? `
              <h3 style="color: #0A1628; margin-bottom: 8px;">Recruiter Evaluation Notes</h3>
              <p style="background: #FEF3C7; color: #92400E; padding: 14px 18px; border-radius: 10px; font-size: 0.9rem; margin-bottom: 24px;">
                ${application.notes}
              </p>
            ` : ''}

            <div style="border-top: 1px solid #E2E8F0; padding-top: 20px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.85rem; color: #94A3B8;">Application ID: ${application.id}</span>
              <a href="/jobs/${application.jobId}" style="color: #4F46E5; text-decoration: none; font-weight: 600; font-size: 0.9rem;">View Job Posting Details ↗</a>
            </div>
          </div>
        </body>
        </html>
      `);
    } catch (err) {
      res.status(500).send(`Error: ${err.message}`);
    }
  }

  /**
   * [GET /jobs/:jobId/apply]
   * [NESTED WEB VIEW] Form to submit application for specific job.
   */
  async create(req, res) {
    try {
      const job = await JobPosting.findById(req.params.jobId);
      if (!job) {
        return res.status(404).send('Job posting not found.');
      }

      res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Apply for ${job.title} — Alumni Tracker</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body style="background: #F8FAFC; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px 20px; color: #1E293B;">
          <div style="max-width: 680px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
            <a href="/jobs/${job.id}" style="color: #64748B; text-decoration: none; font-weight: 600; font-size: 0.9rem;">← Back to Job Details</a>
            <h1 style="color: #0A1628; margin: 16px 0 6px 0;">Apply for Position</h1>
            <h3 style="color: #475569; margin: 0 0 24px 0; font-weight: 600;">🏢 ${job.companyName} • ${job.title}</h3>

            <form action="/jobs/${job.id}/apply" method="POST">
              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.9rem;">Applicant User ID (Alumnus Account)</label>
                <input type="text" name="applicantId" required placeholder="e.g. 1 or verified UUID" style="width: 100%; padding: 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 1rem; box-sizing: border-box;">
              </div>

              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.9rem;">Resume / CV Document URL</label>
                <input type="url" name="resumeUrl" placeholder="https://..." style="width: 100%; padding: 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 1rem; box-sizing: border-box;">
              </div>

              <div style="margin-bottom: 24px;">
                <label style="display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.9rem;">Cover Letter / Personal Statement</label>
                <textarea name="coverLetter" rows="6" placeholder="Explain your fit for this role and reference your Istanbul University background..." style="width: 100%; padding: 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 1rem; box-sizing: border-box;"></textarea>
              </div>

              <button type="submit" style="width: 100%; background: #0A1628; color: #FFFFFF; padding: 14px; border: none; border-radius: 10px; font-size: 1rem; font-weight: 700; cursor: pointer;">
                Submit Application 🚀
              </button>
            </form>
          </div>
        </body>
        </html>
      `);
    } catch (err) {
      res.status(500).send(`Error: ${err.message}`);
    }
  }

  /**
   * [POST /jobs/:jobId/apply]
   * [NESTED WEB ACTION] Process candidate application submission.
   */
  async store(req, res) {
    try {
      const jobId = req.params.jobId;
      const applicantId = req.body.applicantId;

      await Application.create({
        jobId,
        applicantId,
        resumeUrl: req.body.resumeUrl,
        coverLetter: req.body.coverLetter
      });

      res.redirect(`/applications`);
    } catch (err) {
      res.status(400).send(`Application Error: ${err.message}`);
    }
  }

  /**
   * [GET /users/:userId/applications]
   * [NESTED WEB VIEW] List applications submitted by specific alumnus.
   */
  async userApplications(req, res) {
    req.query.applicantId = req.params.userId;
    return this.index(req, res);
  }
}

module.exports = new ApplicationController();
