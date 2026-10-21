/**
 * ============================================================================
 * Alumni Tracker — Job Posting Seeder
 * ============================================================================
 * Architectural Layer: DATABASE / SEEDER (DDD Specification)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * Specification Reference: DDD.md
 * ============================================================================
 */

const db = require('../../db');
const JobPostingFactory = require('../factories/JobPostingFactory');

class JobPostingSeeder {
  /**
   * Run job posting seeding.
   * @param {Object} [options={}]
   * @param {number} [options.dynamicCount=5]
   * @returns {Promise<{coreJobs: number, factoryJobs: number}>}
   */
  static async run(options = {}) {
    const dynamicCount = options.dynamicCount || 5;

    // 1. Insert Core Anchor Job Postings (Decoupled from direct User FK; related via Applications M:N)
    const coreJobsData = [
      {
        title: 'Senior Cloud & Distributed Systems Engineer',
        company_name: 'Google',
        department: 'Computer Engineering',
        location: 'Istanbul, Turkey',
        employment_type: 'Full-time',
        work_mode: 'Hybrid',
        experience_level: 'Senior',
        salary_range: '₺140,000 - ₺180,000 / month',
        description: 'Join Google Cloud infrastructure team architecting next-generation distributed storage microservices. You will lead technical design reviews, optimize latency-critical services, and mentor junior engineers across EMEA.',
        requirements: 'BS/MS in Computer Engineering or related discipline. 5+ years experience in distributed systems (Go/C++), Kubernetes, and gRPC. Strong understanding of concurrent algorithms and Linux kernel internals.',
        skills: ['Go', 'Kubernetes', 'Distributed Systems', 'Cloud Architecture', 'Docker', 'gRPC'],
        application_url: 'https://careers.google.com/jobs/results/senior-cloud-engineer-istanbul',
        contact_email: 'ahmet.careers@google.com',
        deadline: '2026-11-30',
        status: 'active',
        views_count: 142
      },
      {
        title: 'Product Operations Manager — Enterprise Cloud SaaS',
        company_name: 'Microsoft',
        department: 'Electrical & Electronics',
        location: 'Dublin, Ireland',
        employment_type: 'Full-time',
        work_mode: 'Remote',
        experience_level: 'Mid-Level',
        salary_range: '€85,000 - €105,000 / year',
        description: 'Lead enterprise product launch strategies and growth roadmaps for Microsoft 365 European cloud customers. Coordinate cross-functional engineering, UX, and marketing teams to enhance customer lifecycle telemetry.',
        requirements: '3+ years of product management experience in SaaS or B2B enterprise software. Proven track record leading Agile/Scrum sprints, user research interviews, and quantitative product metrics analysis.',
        skills: ['Product Strategy', 'Agile', 'Scrum', 'Cloud Solutions', 'User Research', 'Data Analytics'],
        application_url: 'https://careers.microsoft.com/jobs/product-manager-dublin',
        contact_email: 'elif.demir@microsoft.com',
        deadline: '2026-12-15',
        status: 'active',
        views_count: 89
      },
      {
        title: 'Logistics Data Analyst & Operations Researcher',
        company_name: 'Amazon',
        department: 'Industrial Engineering',
        location: 'Berlin, Germany',
        employment_type: 'Full-time',
        work_mode: 'On-site',
        experience_level: 'Mid-Level',
        salary_range: '€65,000 - €80,000 / year',
        description: 'Analyze end-to-end European fulfillment network operations, design predictive routing algorithms, and automate daily KPI reporting pipelines using SQL, Python, and Tableau dashboards.',
        requirements: 'Degree in Industrial Engineering, Management Information Systems, or Statistics. Strong SQL mastery, Python scripting (Pandas, NumPy), and experience deploying self-service BI dashboards.',
        skills: ['SQL', 'Python', 'Tableau', 'Data Pipelines', 'Power BI', 'Operations Research'],
        application_url: 'https://amazon.jobs/en/jobs/data-analyst-berlin',
        contact_email: 'mehmet.kaya@amazon.de',
        deadline: '2026-12-01',
        status: 'active',
        views_count: 64
      },
      {
        title: 'Junior Full-Stack Web Developer (IU Technopark)',
        company_name: 'Istanbul University Technopark',
        department: 'Information Systems (YBS)',
        location: 'Istanbul, Turkey',
        employment_type: 'Full-time',
        work_mode: 'Hybrid',
        experience_level: 'Entry-Level',
        salary_range: '₺45,000 - ₺60,000 / month',
        description: 'Accelerated incubation startup at IU Avcilar Technopark seeks an enthusiastic junior developer to build modern web portals with Node.js, Express, PostgreSQL, and modern reactive frontend components.',
        requirements: 'Bachelor degree in YBS or Computer Engineering. Proficiency in modern JavaScript (ES6+), relational database modeling (PostgreSQL), RESTful API design, and Git version control.',
        skills: ['Node.js', 'Express', 'PostgreSQL', 'JavaScript', 'REST APIs', 'Docker'],
        application_url: 'https://istanbul.edu.tr/technopark/careers/junior-dev',
        contact_email: 'careers@alumni.edu',
        deadline: '2026-11-15',
        status: 'active',
        views_count: 210
      }
    ];

    for (const job of coreJobsData) {
      await JobPostingFactory.create(job);
    }

    // 3. Insert Dynamic Factory Job Postings
    for (let i = 0; i < dynamicCount; i++) {
      await JobPostingFactory.create();
    }

    return {
      coreJobs: coreJobsData.length,
      factoryJobs: dynamicCount
    };
  }
}

module.exports = JobPostingSeeder;
