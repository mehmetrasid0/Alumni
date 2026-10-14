/**
 * ============================================================================
 * Alumni Tracker — Alumni Profile Factory
 * ============================================================================
 * Architectural Layer: DATABASE / FACTORY (DDD Specification)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * ============================================================================
 */

const Factory = require('./Factory');
const db = require('../../db');

class AlumniProfileFactory extends Factory {
  definition() {
    const firstNames = [
      'Ahmet', 'Mehmet', 'Elif', 'Zeynep', 'Mustafa', 'Emre', 'Ayse', 'Buse',
      'Burak', 'Can', 'Cem', 'Deniz', 'Derya', 'Ece', 'Gokhan', 'Hande',
      'Ipek', 'Kaan', 'Murat', 'Ozge', 'Selin', 'Tolga', 'Yagmur', 'Berk'
    ];
    const lastNames = [
      'Yilmaz', 'Kaya', 'Demir', 'Celik', 'Sahin', 'Yildiz', 'Yildirim', 'Ozturk',
      'Aydin', 'Ozdemir', 'Arslan', 'Dogan', 'Kilic', 'Aslan', 'Cetin', 'Kara',
      'Koc', 'Kurt', 'Simsek', 'Polat', 'Ozkan', 'Acar', 'Erkmen', 'Guler'
    ];
    const departments = [
      'Information Systems (YBS)',
      'Computer Engineering',
      'Software Engineering',
      'Industrial Engineering',
      'Electrical & Electronics',
      'Business Administration'
    ];
    const companies = [
      'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Spotify', 'Trendyol',
      'Getir', 'Hepsiburada', 'BtcTurk', 'Garanti BBVA Technology', 'Turkcell',
      'Vodafone', 'Siemens', 'Aselsan', 'Baykar', 'Insider', 'Peak Games'
    ];
    const jobTitles = [
      'Software Engineer', 'Frontend Developer', 'Backend Architect',
      'Product Manager', 'Data Analyst', 'Data Engineer', 'DevOps Engineer',
      'Cloud Architect', 'Cybersecurity Analyst', 'Business Systems Analyst',
      'Scrum Master', 'Solutions Architect', 'Full Stack Developer'
    ];
    const cities = ['Istanbul', 'Ankara', 'Izmir', 'London', 'Berlin', 'Amsterdam', 'Dublin', 'San Francisco'];
    const degrees = ['Bachelor', 'Master', 'PhD'];
    const skillsBank = [
      'Node.js', 'Express', 'React', 'Vue', 'Next.js', 'TypeScript', 'JavaScript',
      'Python', 'Django', 'FastAPI', 'Go', 'Docker', 'Kubernetes', 'PostgreSQL',
      'MongoDB', 'Redis', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Git', 'GraphQL',
      'System Architecture', 'Agile', 'Product Strategy', 'Microservices'
    ];

    const firstName = Factory.randomElement(firstNames);
    const lastName = Factory.randomElement(lastNames);
    const fullName = `${firstName} ${lastName}`;
    const gradYear = Factory.randomNumber(2015, 2025);
    const dept = Factory.randomElement(departments);
    const company = Factory.randomElement(companies);
    const role = Factory.randomElement(jobTitles);
    const city = Factory.randomElement(cities);
    const country = ['London', 'Berlin', 'Amsterdam', 'Dublin', 'San Francisco'].includes(city) ? 'International' : 'Turkey';
    const matriculation = `1306${Factory.randomNumber(14, 23)}${Factory.randomNumber(1000, 9999)}`;
    const skills = Factory.randomElements(skillsBank, Factory.randomNumber(3, 6));

    return {
      full_name: fullName,
      student_id: matriculation,
      department: dept,
      graduation_year: gradYear,
      degree: Factory.randomElement(degrees),
      current_company: company,
      job_title: role,
      city: city,
      country: country,
      linkedin_url: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      phone: `+90 5${Factory.randomNumber(30, 59)} ${Factory.randomNumber(100, 999)} ${Factory.randomNumber(10, 99)} ${Factory.randomNumber(10, 99)}`,
      bio: `${fullName} is a ${gradYear} graduate of ${dept} at Istanbul University, currently advancing engineering and product operations at ${company}.`,
      skills: skills,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  recentGraduate() {
    return this.state({
      graduation_year: Factory.randomNumber(2023, 2026),
      degree: 'Bachelor'
    });
  }

  seniorAlumnus() {
    return this.state({
      graduation_year: Factory.randomNumber(2010, 2018),
      degree: Factory.randomElement(['Master', 'PhD']),
      job_title: `Senior ${Factory.randomElement(['Engineer', 'Architect', 'Director', 'Manager'])}`
    });
  }

  department(deptName) {
    return this.state({ department: deptName });
  }

  withSkills(skillsArray) {
    return this.state({ skills: skillsArray });
  }

  /**
   * Persist profile to PostgreSQL database.
   * @param {string} userId - UUID referencing users.id
   * @param {Object} [overrides={}]
   * @returns {Promise<Object>}
   */
  async createForUser(userId, overrides = {}) {
    const data = this.make(overrides);
    const res = await db.query(
      `INSERT INTO alumni_profiles (
        user_id, student_id, full_name, department, graduation_year, degree,
        current_company, job_title, city, country, linkedin_url, phone, bio, skills
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb)
      RETURNING *`,
      [
        userId,
        data.student_id,
        data.full_name,
        data.department,
        data.graduation_year,
        data.degree,
        data.current_company,
        data.job_title,
        data.city,
        data.country,
        data.linkedin_url,
        data.phone,
        data.bio,
        JSON.stringify(data.skills)
      ]
    );

    return res.rows[0];
  }
}

module.exports = new AlumniProfileFactory();
