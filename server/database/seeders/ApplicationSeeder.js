/**
 * ============================================================================
 * Alumni Tracker — Application Seeder
 * ============================================================================
 * Architectural Layer: DATABASE / SEEDER (DDD Specification)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * Specification Reference: DDD.md
 * ============================================================================
 */

const db = require('../../db');
const ApplicationFactory = require('../factories/ApplicationFactory');

class ApplicationSeeder {
  /**
   * Run application seeding.
   * @param {Object} [options={}]
   * @param {number} [options.dynamicCount=6]
   * @returns {Promise<{coreApplications: number, factoryApplications: number}>}
   */
  static async run(options = {}) {
    const dynamicCount = options.dynamicCount || 6;

    // 1. Fetch available jobs and applicants
    const jobsRes = await db.query('SELECT id, title, company_name FROM job_postings ORDER BY created_at ASC');
    const usersRes = await db.query("SELECT id, email FROM users WHERE role = 'alumni' ORDER BY created_at ASC");

    if (jobsRes.rows.length === 0 || usersRes.rows.length === 0) {
      console.log('[-] Skipping ApplicationSeeder: Jobs or users missing.');
      return { coreApplications: 0, factoryApplications: 0 };
    }

    const jobs = jobsRes.rows;
    const users = usersRes.rows;

    let coreCount = 0;
    let factoryCount = 0;

    // 2. Insert Core Anchor Applications
    const corePairs = [
      { jobIndex: 0, userIndex: 0, status: 'shortlisted', notes: 'Top candidate recommendation.' },
      { jobIndex: 1, userIndex: 1, status: 'under_review', notes: 'Reviewing portfolio sample code.' },
      { jobIndex: 2, userIndex: 2, status: 'submitted', notes: 'Initial submission received.' }
    ];

    for (const pair of corePairs) {
      const targetJob = jobs[pair.jobIndex % jobs.length];
      const targetUser = users[pair.userIndex % users.length];

      try {
        await db.query(`
          INSERT INTO applications (job_id, applicant_id, resume_url, cover_letter, status, notes)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (job_id, applicant_id) DO NOTHING
        `, [
          targetJob.id,
          targetUser.id,
          `https://storage.alumni.edu/resumes/${targetUser.email.split('@')[0]}-cv.pdf`,
          `I am thrilled to submit my candidacy for ${targetJob.title} at ${targetJob.company_name}. My background at Istanbul University prepared me well for this technical challenge.`,
          pair.status,
          pair.notes
        ]);
        coreCount++;
      } catch (err) {
        console.error('Core application insert error:', err.message);
      }
    }

    // 3. Insert Dynamic Factory Applications
    const existingPairs = new Set(corePairs.map(p => `${jobs[p.jobIndex % jobs.length].id}_${users[p.userIndex % users.length].id}`));

    for (let i = 0; i < dynamicCount; i++) {
      const job = jobs[Math.floor(Math.random() * jobs.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const pairKey = `${job.id}_${user.id}`;

      if (existingPairs.has(pairKey)) continue;
      existingPairs.add(pairKey);

      const appData = new ApplicationFactory().make({
        jobId: job.id,
        applicantId: user.id
      });

      try {
        await db.query(`
          INSERT INTO applications (job_id, applicant_id, resume_url, cover_letter, status, notes)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (job_id, applicant_id) DO NOTHING
        `, [
          job.id,
          user.id,
          appData.resumeUrl,
          appData.coverLetter,
          appData.status,
          appData.notes
        ]);
        factoryCount++;
      } catch (err) {
        console.error('Factory application insert error:', err.message);
      }
    }

    return { coreApplications: coreCount, factoryApplications: factoryCount };
  }
}

module.exports = ApplicationSeeder;
