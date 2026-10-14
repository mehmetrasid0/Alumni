/**
 * ============================================================================
 * Alumni Tracker — Announcement Factory
 * ============================================================================
 * Architectural Layer: DATABASE / FACTORY (DDD Specification)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * ============================================================================
 */

const Factory = require('./Factory');
const db = require('../../db');

class AnnouncementFactory extends Factory {
  definition() {
    const categories = ['Career', 'Event', 'Academic', 'General', 'Networking'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const audiences = [
      'All Alumni',
      'YBS Department Alumni',
      'Graduates & Final-Year Students',
      'Engineering Alumni',
      'Alumni with 3+ Years Experience'
    ];

    const category = Factory.randomElement(categories);
    const headlines = {
      Event: [
        'Annual Alumni Networking Summit & Awards 2026',
        'Beyazit Campus Spring Reunion & Executive Roundtable',
        'Dean’s Reception & Alumni Association General Assembly'
      ],
      Career: [
        'Global Tech Career Fair: Exclusive Openings for Istanbul University Graduates',
        'Executive Mentorship Program: Pair with Fortune 500 Industry Leaders',
        'Fast-Track Management Trainee Opportunities with Partner Companies'
      ],
      Academic: [
        'Guest Lecture Series: Advances in Large Language Models & Cloud Systems',
        'Call for Academic Papers: YBS International Symposium 2026',
        'Master & Doctoral Program Admissions Information Webinar'
      ],
      Networking: [
        'Startup & Angel Investor Matchmaking Session for Graduate Founders',
        'Cross-Industry Alumni Mixer: London & Berlin Chapters',
        'Young Alumni Mentorship Circle: Launching New Cohort'
      ],
      General: [
        'Alumni Digital Identity Card & Library Access Privilege Renewal',
        'University Sports Facilities Exclusive Access for Registered Alumni',
        'Institutional Strategic Plan 2026-2030: Alumni Feedback Survey'
      ]
    };

    const title = Factory.randomElement(headlines[category]);
    const priority = Factory.randomElement(priorities);
    const pinned = priority === 'urgent' || Factory.randomBoolean(0.2);

    return {
      title,
      content: `The Istanbul University Alumni Network cordially invites all eligible members to participate in the upcoming ${title.toLowerCase()}. Detailed program schedule, registration credentials, and venue logistics are accessible through the verified Alumni Portal.`,
      category,
      priority,
      status: 'published',
      target_audience: Factory.randomElement(audiences),
      pinned,
      created_at: Factory.randomDate(2025, 2026),
      updated_at: new Date().toISOString()
    };
  }

  pinned() {
    return this.state({ pinned: true });
  }

  urgent() {
    return this.state({ priority: 'urgent', pinned: true });
  }

  draft() {
    return this.state({ status: 'draft', pinned: false });
  }

  category(cat) {
    return this.state({ category: cat });
  }

  career() {
    return this.state({ category: 'Career', target_audience: 'Graduates & Final-Year Students' });
  }

  event() {
    return this.state({ category: 'Event' });
  }

  /**
   * Persist announcement to PostgreSQL database.
   * @param {string} authorId - UUID referencing users.id
   * @param {Object} [overrides={}]
   * @returns {Promise<Object>}
   */
  async createForAuthor(authorId, overrides = {}) {
    const data = this.make(overrides);
    const res = await db.query(
      `INSERT INTO announcements (
        author_id, title, content, category, priority, status, target_audience, pinned, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        authorId,
        data.title,
        data.content,
        data.category,
        data.priority,
        data.status,
        data.target_audience,
        data.pinned,
        data.created_at
      ]
    );

    return res.rows[0];
  }
}

module.exports = new AnnouncementFactory();
