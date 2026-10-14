/**
 * ============================================================================
 * Alumni Tracker — User & Profile Seeder
 * ============================================================================
 * Architectural Layer: DATABASE / SEEDER (DDD Specification)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * ============================================================================
 */

const db = require('../../db');
const UserFactory = require('../factories/UserFactory');
const AlumniProfileFactory = require('../factories/AlumniProfileFactory');

class UserSeeder {
  /**
   * Run the User & Alumni Profile Seeder.
   * @param {Object} [options={}]
   * @param {number} [options.dynamicCount=10] - Number of random alumni to generate via Factory
   * @returns {Promise<Object>} Statistics of seeded users
   */
  async run(options = {}) {
    const dynamicCount = options.dynamicCount !== undefined ? options.dynamicCount : 10;
    console.log('  🌱 [UserSeeder] Seeding core anchor users and alumni profiles...');

    // 1. Seed Core Admin Account
    const adminUserRes = await db.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ('admin@alumni.edu', crypt('AdminPassword2026!', gen_salt('bf', 10)), 'admin')
       ON CONFLICT DO NOTHING
       RETURNING id, email, role`
    );

    let adminId;
    if (adminUserRes.rows.length > 0) {
      adminId = adminUserRes.rows[0].id;
    } else {
      const existing = await db.query("SELECT id FROM users WHERE email = 'admin@alumni.edu'");
      adminId = existing.rows[0].id;
    }

    await db.query(
      `INSERT INTO alumni_profiles (
        user_id, student_id, full_name, department, graduation_year, degree,
        current_company, job_title, city, country, linkedin_url, phone, bio, skills
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb)
      ON CONFLICT (user_id) DO NOTHING`,
      [
        adminId, '1306000001', 'Alumni Office Admin', 'Information Systems (YBS)', 2015, 'Master',
        'Istanbul University', 'Director of Alumni Relations', 'Istanbul', 'Turkey',
        'https://linkedin.com/in/istanbul-alumni', '+90 212 440 00 00',
        'Coordinator for Istanbul University Alumni Relations & Professional Network.',
        JSON.stringify(['Institutional Governance', 'Event Management', 'Academic Relations'])
      ]
    );

    // 2. Fixed Core Alumni Records (Known test fixtures)
    const coreAlumni = [
      {
        email: 'ahmet@alumni.edu',
        studentId: '1306160001',
        fullName: 'Ahmet Yilmaz',
        dept: 'Computer Engineering',
        year: 2020,
        degree: 'Bachelor',
        company: 'Google',
        role: 'Software Engineer',
        city: 'Istanbul',
        country: 'Turkey',
        linkedin: 'https://linkedin.com/in/ahmetyilmaz',
        phone: '+90 532 100 20 01',
        bio: 'Backend software engineer specializing in distributed systems and Go microservices.',
        skills: ['Go', 'Kubernetes', 'Distributed Systems', 'Cloud Architecture', 'Docker']
      },
      {
        email: 'elif@alumni.edu',
        studentId: '1306160002',
        fullName: 'Elif Demir',
        dept: 'Electrical & Electronics',
        year: 2019,
        degree: 'Bachelor',
        company: 'Microsoft',
        role: 'Product Manager',
        city: 'Dublin',
        country: 'Ireland',
        linkedin: 'https://linkedin.com/in/elifdemir',
        phone: '+353 1 200 30 02',
        bio: 'Leading cloud productivity product teams across Europe and Enterprise SaaS portfolios.',
        skills: ['Product Strategy', 'Agile', 'Scrum', 'Cloud Solutions', 'User Research']
      },
      {
        email: 'mehmet@alumni.edu',
        studentId: '1306160003',
        fullName: 'Mehmet Kaya',
        dept: 'Industrial Engineering',
        year: 2021,
        degree: 'Bachelor',
        company: 'Amazon',
        role: 'Data Analyst',
        city: 'Berlin',
        country: 'Germany',
        linkedin: 'https://linkedin.com/in/mehmetkaya',
        phone: '+49 30 300 40 03',
        bio: 'Business intelligence analyst focused on logistics optimization and predictive modeling.',
        skills: ['SQL', 'Python', 'Tableau', 'Data Pipelines', 'Power BI']
      },
      {
        email: 'zeynep@alumni.edu',
        studentId: '1306160004',
        fullName: 'Zeynep Celik',
        dept: 'Computer Engineering',
        year: 2018,
        degree: 'Master',
        company: 'Meta',
        role: 'Frontend Developer',
        city: 'London',
        country: 'United Kingdom',
        linkedin: 'https://linkedin.com/in/zeynepcelik',
        phone: '+44 20 400 50 04',
        bio: 'Frontend infrastructure engineer crafting high-performance design systems and React applications.',
        skills: ['React', 'TypeScript', 'Next.js', 'Web Performance', 'GraphQL']
      },
      {
        email: 'can@alumni.edu',
        studentId: '1306160005',
        fullName: 'Can Ozturk',
        dept: 'Software Engineering',
        year: 2022,
        degree: 'Bachelor',
        company: 'Apple',
        role: 'iOS Developer',
        city: 'Cupertino',
        country: 'United States',
        linkedin: 'https://linkedin.com/in/canozturk',
        phone: '+1 408 500 60 05',
        bio: 'Mobile engineer crafting native iOS experiences with SwiftUI and core system integrations.',
        skills: ['Swift', 'SwiftUI', 'Combine', 'iOS SDK', 'CoreData']
      },
      {
        email: 'ofe@alumni.edu',
        studentId: '1306160006',
        fullName: 'Ofe Emor Demiroz',
        dept: 'Information Systems (YBS)',
        year: 2023,
        degree: 'Bachelor',
        company: 'Ay Yapim',
        role: 'Cast Manager',
        city: 'Istanbul',
        country: 'Turkey',
        linkedin: 'https://linkedin.com/in/ofedemiroz',
        phone: '+90 533 600 70 06',
        bio: 'Media production and casting coordinator applying information systems to entertainment workflows.',
        skills: ['Talent Management', 'Media Production', 'Digital Marketing', 'CRM Systems']
      }
    ];

    let coreCount = 0;
    for (const c of coreAlumni) {
      const uRes = await db.query(
        `INSERT INTO users (email, password_hash, role)
         VALUES ($1, crypt('AlumniPass123!', gen_salt('bf', 10)), 'alumni')
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [c.email]
      );

      let uId;
      if (uRes.rows.length > 0) {
        uId = uRes.rows[0].id;
      } else {
        const existing = await db.query('SELECT id FROM users WHERE email = $1', [c.email]);
        uId = existing.rows[0].id;
      }

      await db.query(
        `INSERT INTO alumni_profiles (
          user_id, student_id, full_name, department, graduation_year, degree,
          current_company, job_title, city, country, linkedin_url, phone, bio, skills
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb)
        ON CONFLICT (user_id) DO NOTHING`,
        [
          uId, c.studentId, c.fullName, c.dept, c.year, c.degree,
          c.company, c.role, c.city, c.country, c.linkedin, c.phone,
          c.bio, JSON.stringify(c.skills)
        ]
      );
      coreCount++;
    }

    // 3. Generate Dynamic Alumni using UserFactory & AlumniProfileFactory
    let factoryCount = 0;
    if (dynamicCount > 0) {
      console.log(`  🎲 [UserFactory] Generating ${dynamicCount} dynamic alumni profiles via Factory...`);
      for (let i = 0; i < dynamicCount; i++) {
        try {
          const user = await UserFactory.alumni().create();
          await AlumniProfileFactory.createForUser(user.id);
          factoryCount++;
        } catch (err) {
          // If unique constraint collision occurs, continue
        }
      }
    }

    return { coreUsers: coreCount + 1, factoryUsers: factoryCount, adminId };
  }
}

module.exports = new UserSeeder();
