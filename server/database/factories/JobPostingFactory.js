/**
 * ============================================================================
 * Alumni Tracker — Job Posting Factory
 * ============================================================================
 * Architectural Layer: DATABASE / FACTORY (DDD Specification)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * Specification Reference: DDD.md
 * ============================================================================
 */

const Factory = require('./Factory');
const db = require('../../db');

class JobPostingFactory extends Factory {
  definition() {
    const roles = [
      {
        title: 'Senior Cloud & Distributed Systems Engineer',
        company: 'Google',
        department: 'Computer Engineering',
        location: 'Istanbul, Turkey',
        type: 'Full-time',
        mode: 'Hybrid',
        level: 'Senior',
        salary: '₺140,000 - ₺180,000 / month',
        skills: ['Go', 'Kubernetes', 'Distributed Systems', 'Cloud Architecture', 'Docker', 'gRPC'],
        domain: 'google.com'
      },
      {
        title: 'Product Operations Manager — Enterprise Cloud SaaS',
        company: 'Microsoft',
        department: 'Electrical & Electronics',
        location: 'Dublin, Ireland',
        type: 'Full-time',
        mode: 'Remote',
        level: 'Mid-Level',
        salary: '€85,000 - €105,000 / year',
        skills: ['Product Strategy', 'Agile', 'Scrum', 'Cloud Solutions', 'User Research', 'Data Analytics'],
        domain: 'microsoft.com'
      },
      {
        title: 'Logistics Data Analyst & Operations Researcher',
        company: 'Amazon',
        department: 'Industrial Engineering',
        location: 'Berlin, Germany',
        type: 'Full-time',
        mode: 'On-site',
        level: 'Mid-Level',
        salary: '€65,000 - €80,000 / year',
        skills: ['SQL', 'Python', 'Tableau', 'Data Pipelines', 'Power BI', 'Operations Research'],
        domain: 'amazon.com'
      },
      {
        title: 'Senior Frontend Design Systems Engineer',
        company: 'Meta',
        department: 'Computer Engineering',
        location: 'London, United Kingdom',
        type: 'Full-time',
        mode: 'Hybrid',
        level: 'Senior',
        salary: '£90,000 - £115,000 / year',
        skills: ['React', 'TypeScript', 'Next.js', 'Web Performance', 'GraphQL', 'TailwindCSS'],
        domain: 'meta.com'
      },
      {
        title: 'Junior Full-Stack Web Developer (IU Technopark)',
        company: 'Istanbul University Technopark',
        department: 'Information Systems (YBS)',
        location: 'Istanbul, Turkey',
        type: 'Full-time',
        mode: 'Hybrid',
        level: 'Entry-Level',
        salary: '₺45,000 - ₺60,000 / month',
        skills: ['Node.js', 'Express', 'PostgreSQL', 'JavaScript', 'REST APIs', 'Docker'],
        domain: 'istanbul.edu.tr'
      },
      {
        title: 'Mobile Application Engineer (iOS / SwiftUI)',
        company: 'Apple',
        department: 'Software Engineering',
        location: 'Cupertino, United States',
        type: 'Full-time',
        mode: 'On-site',
        level: 'Senior',
        salary: '$150,000 - $185,000 / year',
        skills: ['Swift', 'SwiftUI', 'Combine', 'iOS SDK', 'CoreData', 'CI/CD'],
        domain: 'apple.com'
      },
      {
        title: 'Business Intelligence & Data Visualization Intern',
        company: 'Trendyol Group',
        department: 'Information Systems (YBS)',
        location: 'Istanbul, Turkey',
        type: 'Internship',
        mode: 'Hybrid',
        level: 'Internship',
        salary: '₺25,000 - ₺32,000 / month',
        skills: ['SQL', 'Python', 'Power BI', 'Excel Modeling', 'E-commerce Analytics'],
        domain: 'trendyol.com'
      }
    ];

    const pick = Factory.randomElement(roles);
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 60) + 15);

    return {
      title: pick.title,
      company_name: pick.company,
      department: pick.department,
      location: pick.location,
      employment_type: pick.type,
      work_mode: pick.mode,
      experience_level: pick.level,
      salary_range: pick.salary,
      description: `We are seeking an exceptional professional to join ${pick.company} as ${pick.title}. In this role, you will collaborate with cross-functional teams to architect, deploy, and scale high-impact solutions serving millions of global users.`,
      requirements: `Required Qualifications: Degree in ${pick.department} or equivalent practical experience. Demonstrated proficiency with ${pick.skills.slice(0, 3).join(', ')}. Strong problem-solving aptitude, communication skills, and commitment to software engineering best practices.`,
      skills: pick.skills,
      application_url: `https://careers.${pick.domain}/jobs/${pick.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      contact_email: `careers@${pick.domain}`,
      deadline: deadline.toISOString().split('T')[0],
      status: 'active',
      views_count: Math.floor(Math.random() * 250) + 15,
      created_at: Factory.randomDate(2025, 2026),
      updated_at: new Date().toISOString()
    };
  }

  remote() {
    return this.state({ work_mode: 'Remote' });
  }

  hybrid() {
    return this.state({ work_mode: 'Hybrid' });
  }

  onsite() {
    return this.state({ work_mode: 'On-site' });
  }

  internship() {
    return this.state({ employment_type: 'Internship', experience_level: 'Internship' });
  }

  senior() {
    return this.state({ experience_level: 'Senior' });
  }

  draft() {
    return this.state({ status: 'draft' });
  }

  closed() {
    return this.state({ status: 'closed' });
  }

  /**
   * Persist job posting to PostgreSQL database.
   * @param {Object} [overrides={}]
   * @returns {Promise<Object>}
   */
  async create(overrides = {}) {
    const data = this.make(overrides);
    const res = await db.query(
      `INSERT INTO job_postings (
        title, company_name, department, location, employment_type,
        work_mode, experience_level, salary_range, description, requirements,
        skills, application_url, contact_email, deadline, status, views_count,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        data.title,
        data.company_name,
        data.department,
        data.location,
        data.employment_type,
        data.work_mode,
        data.experience_level,
        data.salary_range,
        data.description,
        data.requirements,
        JSON.stringify(data.skills),
        data.application_url,
        data.contact_email,
        data.deadline,
        data.status,
        data.views_count,
        data.created_at
      ]
    );

    return res.rows[0];
  }

  /**
   * For backwards compatibility.
   */
  async createForPoster(posterId, overrides = {}) {
    return this.create(overrides);
  }
}

module.exports = new JobPostingFactory();
