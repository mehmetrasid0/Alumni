/**
 * ============================================================================
 * Alumni Tracker — Web Job Controller (JobController)
 * ============================================================================
 * Architectural Layer: CONTROLLER (Web View & Request Lifecycle)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * Specification Reference: DDD.md
 * Supports Direct Career Web Views:
 *   1. index()    - [GET /jobs]               Directory of all career openings
 *   2. create()   - [GET /jobs/create]        Form to publish new job vacancy
 *   3. store()    - [POST /jobs]              Process job publication
 *   4. show()     - [GET /jobs/:id]           Single job detail presentation
 *   5. edit()     - [GET /jobs/:id/edit]      Form to edit existing job posting
 *   6. update()   - [POST /jobs/:id/update]   Process job modifications
 *   7. destroy()  - [POST /jobs/:id/delete]   Delete job posting
 * ============================================================================
 */

const path = require('path');
const JobPosting = require('../models/JobPosting');

class JobController {
  /**
   * [GET /jobs]
   * [CRUD: READ ALL] Renders the Career Board view.
   */
  index(req, res) {
    res.sendFile(path.join(__dirname, '..', 'public', 'jobs.html'));
  }

  /**
   * [GET /jobs/create]
   * [CRUD: CREATE FORM] Renders form to author a job posting.
   */
  async create(req, res) {
    try {
      res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Post a Career Opening — Alumni Tracker</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body style="background: #F8FAFC; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px 20px; color: #1E293B;">
          <div style="max-width: 680px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; padding: 36px; box-shadow: 0 10px 30px rgba(10, 22, 40, 0.08); border: 1px solid #E2E8F0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
              <a href="/jobs" style="color: #0A1628; text-decoration: none; font-weight: 600; font-size: 0.95rem;">← Back to Career Board</a>
              <span style="background: #F1F5F9; color: #475569; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">Istanbul University YBS</span>
            </div>

            <h1 style="color: #0A1628; font-size: 1.8rem; margin-bottom: 8px;">💼 Post a New Career Vacancy</h1>
            <p style="color: #64748B; font-size: 0.95rem; margin-bottom: 28px;">Connect talented graduates with opportunities at your organization.</p>

            <form action="/jobs" method="POST" style="display: flex; flex-direction: column; gap: 18px;">
              <div>
                <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">Position Title *</label>
                <input type="text" name="title" placeholder="e.g. Senior Cloud Architect" required style="width: 100%; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 8px;">
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">Company / Entity *</label>
                  <input type="text" name="companyName" placeholder="e.g. Google" required style="width: 100%; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 8px;">
                </div>
                <div>
                  <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">Location *</label>
                  <input type="text" name="location" placeholder="e.g. Istanbul, Turkey" required style="width: 100%; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 8px;">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
                <div>
                  <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">Employment Type</label>
                  <select name="employmentType" style="width: 100%; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 8px;">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">Work Mode</label>
                  <select name="workMode" style="width: 100%; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 8px;">
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">Experience Level</label>
                  <select name="experienceLevel" style="width: 100%; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 8px;">
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Entry-Level">Entry-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">Salary Range (Optional)</label>
                <input type="text" name="salaryRange" placeholder="e.g. ₺90,000 - ₺120,000 / month" style="width: 100%; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 8px;">
              </div>

              <div>
                <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">Job Description *</label>
                <textarea name="description" rows="4" placeholder="Detailed responsibilities, team structure, and projects..." required style="width: 100%; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 8px;"></textarea>
              </div>

              <div>
                <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">Candidate Requirements</label>
                <textarea name="requirements" rows="3" placeholder="Degree, technical skills, and years of experience..." style="width: 100%; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 8px;"></textarea>
              </div>

              <div>
                <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">Required Skills (Comma separated)</label>
                <input type="text" name="skills" placeholder="e.g. PostgreSQL, Node.js, Docker, AWS" style="width: 100%; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 8px;">
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">Application URL</label>
                  <input type="url" name="applicationUrl" placeholder="https://careers.google.com/..." style="width: 100%; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 8px;">
                </div>
                <div>
                  <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px;">Contact Email</label>
                  <input type="email" name="contactEmail" placeholder="recruiter@company.com" style="width: 100%; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 8px;">
                </div>
              </div>

              <button type="submit" style="background: #0A1628; color: #FFFFFF; padding: 12px 24px; border: none; border-radius: 10px; font-weight: 600; font-size: 1rem; cursor: pointer; margin-top: 10px;">
                Publish Career Opening
              </button>
            </form>
          </div>
        </body>
        </html>
      `);
    } catch (err) {
      res.status(500).send(`Error loading form: ${err.message}`);
    }
  }

  /**
   * [POST /jobs]
   * [CRUD: STORE] Process form submission.
   */
  async store(req, res) {
    try {
      const payload = { ...req.body };
      if (typeof payload.skills === 'string') {
        payload.skills = payload.skills.split(',').map(s => s.trim()).filter(Boolean);
      }
      await JobPosting.create(payload);
      res.redirect('/jobs');
    } catch (err) {
      res.status(400).send(`Failed to store job posting: ${err.message}`);
    }
  }

  /**
   * [GET /jobs/:id]
   * [CRUD: SHOW] Display details of a single job.
   */
  async show(req, res) {
    try {
      const job = await JobPosting.findById(req.params.id);
      if (!job) {
        return res.status(404).send('Job posting not found');
      }

      JobPosting.incrementViews(job.id).catch(() => {});

      res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${job.title} — Alumni Tracker</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body style="background: #F8FAFC; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px 20px; color: #1E293B;">
          <div style="max-width: 800px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; padding: 36px; border: 1px solid #E2E8F0; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
              <a href="/jobs" style="color: #64748B; text-decoration: none; font-weight: 600;">← Back to Career Board</a>
              <span style="background: #EEF2FF; color: #4F46E5; padding: 4px 12px; border-radius: 12px; font-weight: 600; font-size: 0.8rem;">${job.workMode} • ${job.employmentType}</span>
            </div>

            <h1 style="color: #0A1628; margin: 0 0 8px 0; font-size: 2rem;">${job.title}</h1>
            <h3 style="color: #475569; margin: 0 0 20px 0; font-weight: 600;">🏢 ${job.companyName} • 📍 ${job.location}</h3>

            <div style="background: #F8FAFC; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 0.9rem;">
              <div><b>Experience Level:</b> ${job.experienceLevel}</div>
              <div><b>Compensation:</b> ${job.salaryRange || 'Competitive'}</div>
              <div><b>Hiring Organization:</b> ${job.companyName}</div>
              <div><b>Deadline:</b> ${job.deadline || 'Rolling basis'}</div>
            </div>

            <h3 style="color: #0A1628; margin-bottom: 8px;">Role Overview</h3>
            <p style="color: #334155; line-height: 1.7; font-size: 1rem; margin-bottom: 24px;">${job.description}</p>

            ${job.requirements ? `
              <h3 style="color: #0A1628; margin-bottom: 8px;">Requirements & Criteria</h3>
              <p style="color: #334155; line-height: 1.7; font-size: 1rem; margin-bottom: 24px;">${job.requirements}</p>
            ` : ''}

            <h3 style="color: #0A1628; margin-bottom: 12px;">Required Competencies</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px;">
              ${(job.skills || []).map(s => `<span style="background: #F1F5F9; color: #334155; font-size: 0.85rem; padding: 6px 12px; border-radius: 8px; font-weight: 600;">${s}</span>`).join('')}
            </div>

            <div style="display: flex; gap: 12px; border-top: 1px solid #E2E8F0; padding-top: 24px;">
              ${job.applicationUrl ? `<a href="${job.applicationUrl}" target="_blank" style="background: #0A1628; color: #FFFFFF; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600;">Apply Online ↗</a>` : ''}
              ${job.contactEmail ? `<a href="mailto:${job.contactEmail}" style="background: #EEF2FF; color: #4F46E5; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600;">Contact Recruiter</a>` : ''}
            </div>
          </div>
        </body>
        </html>
      `);
    } catch (err) {
      res.status(500).send(`Error: ${err.message}`);
    }
  }
}

module.exports = new JobController();
