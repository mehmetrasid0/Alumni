/**
 * ============================================================================
 * Alumni Tracker — Announcement Seeder
 * ============================================================================
 * Architectural Layer: DATABASE / SEEDER (DDD Specification)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * ============================================================================
 */

const db = require('../../db');
const AnnouncementFactory = require('../factories/AnnouncementFactory');

class AnnouncementSeeder {
  /**
   * Run the Announcement Seeder.
   * @param {string} authorId - UUID of the publishing user (Admin)
   * @param {Object} [options={}]
   * @param {number} [options.dynamicCount=5] - Number of random announcements to generate via Factory
   * @returns {Promise<Object>}
   */
  async run(authorId, options = {}) {
    const dynamicCount = options.dynamicCount !== undefined ? options.dynamicCount : 5;
    console.log('  🌱 [AnnouncementSeeder] Seeding core announcements...');

    const coreAnnouncements = [
      {
        title: 'Annual Alumni Homecoming & Networking Gala 2026',
        content: 'Join us on the historic Beyazit Campus for the annual Istanbul University Alumni Reunion. Features keynote addresses from industry leaders, networking dinners, and campus tours.',
        category: 'Event',
        priority: 'high',
        status: 'published',
        targetAudience: 'All Alumni & Faculty',
        pinned: true,
        createdAt: '2026-09-15 09:00:00+03'
      },
      {
        title: 'Tech Career Fair & Executive Mentorship Program',
        content: 'Exclusive career opportunities for YBS and engineering graduates with premier technology firms including Google, Microsoft, and Amazon. Pre-registration is mandatory.',
        category: 'Career',
        priority: 'urgent',
        status: 'published',
        targetAudience: 'Graduates & Final-Year Students',
        pinned: true,
        createdAt: '2026-09-20 11:30:00+03'
      },
      {
        title: 'Guest Lecture: Artificial Intelligence & Enterprise Architecture',
        content: 'Distinguished alumni seminar on modern microservices, cloud telemetry, and AI integration in corporate management information systems.',
        category: 'Academic',
        priority: 'medium',
        status: 'published',
        targetAudience: 'Management Information Systems (YBS)',
        pinned: false,
        createdAt: '2026-09-28 14:15:00+03'
      },
      {
        title: 'Alumni Mentorship Applications Now Open for Fall Semester',
        content: 'Give back to the Istanbul University community by guiding 3rd and 4th-year students through industry transitions and professional career planning.',
        category: 'Networking',
        priority: 'high',
        status: 'published',
        targetAudience: 'Alumni with 2+ Years Experience',
        pinned: false,
        createdAt: '2026-10-01 08:45:00+03'
      },
      {
        title: 'Alumni Survey 2026: Enhancing Departmental Curriculum',
        content: 'We invite all graduates to complete our biennial academic feedback survey to align current course offerings with modern industry requirements.',
        category: 'General',
        priority: 'low',
        status: 'draft',
        targetAudience: 'All Graduates',
        pinned: false,
        createdAt: '2026-10-05 16:20:00+03'
      }
    ];

    let coreCount = 0;
    for (const a of coreAnnouncements) {
      await db.query(
        `INSERT INTO announcements (
          author_id, title, content, category, priority, status, target_audience, pinned, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT DO NOTHING`,
        [
          authorId, a.title, a.content, a.category, a.priority,
          a.status, a.targetAudience, a.pinned, a.createdAt
        ]
      );
      coreCount++;
    }

    let factoryCount = 0;
    if (dynamicCount > 0) {
      console.log(`  🎲 [AnnouncementFactory] Generating ${dynamicCount} dynamic bulletins via Factory...`);
      for (let i = 0; i < dynamicCount; i++) {
        await AnnouncementFactory.createForAuthor(authorId);
        factoryCount++;
      }
    }

    return { coreAnnouncements: coreCount, factoryAnnouncements: factoryCount };
  }
}

module.exports = new AnnouncementSeeder();
