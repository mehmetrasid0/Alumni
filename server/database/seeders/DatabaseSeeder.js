/**
 * ============================================================================
 * Alumni Tracker — Master Database Seeder
 * ============================================================================
 * Architectural Layer: DATABASE / ORCHESTRATOR (DDD Specification)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * 
 * Usage:
 *   node server/database/seeders/DatabaseSeeder.js
 *   node server/database/seeders/DatabaseSeeder.js --clean --alumni=15 --announcements=8
 * ============================================================================
 */

const db = require('../../db');
const UserSeeder = require('./UserSeeder');
const AnnouncementSeeder = require('./AnnouncementSeeder');

class DatabaseSeeder {
  static parseArgs() {
    const args = process.argv.slice(2);
    const options = {
      clean: args.includes('--clean'),
      alumniCount: 10,
      announcementCount: 5
    };

    for (const arg of args) {
      if (arg.startsWith('--alumni=')) {
        options.alumniCount = parseInt(arg.split('=')[1], 10) || 10;
      }
      if (arg.startsWith('--announcements=')) {
        options.announcementCount = parseInt(arg.split('=')[1], 10) || 5;
      }
    }

    return options;
  }

  static async run() {
    const options = this.parseArgs();

    console.log('============================================================================');
    console.log('  ALUMNI TRACKER — DATABASE SEEDER (DDD SPECIFICATION)');
    console.log('  Istanbul University - Management Information Systems (YBS)');
    console.log('============================================================================');
    console.log(`[Config]: Clean Wipe = ${options.clean} | Dynamic Alumni = ${options.alumniCount} | Dynamic Announcements = ${options.announcementCount}\n`);

    try {
      // 1. Verify DB Connection
      const testRes = await db.query('SELECT current_database(), current_user, version()');
      console.log(`[v] Connected to database "${testRes.rows[0].current_database}" as user "${testRes.rows[0].current_user}"`);

      // 2. Clean tables if requested
      if (options.clean) {
        console.log('[*] Cleaning existing records (TRUNCATE CASCADE)...');
        await db.query('TRUNCATE TABLE announcements, alumni_profiles, users RESTART IDENTITY CASCADE');
        console.log('[v] Database tables truncated successfully.');
      }

      // 3. Run User & Profile Seeder
      const userStats = await UserSeeder.run({ dynamicCount: options.alumniCount });
      console.log(`[v] Users seeded: ${userStats.coreUsers} core accounts, ${userStats.factoryUsers} factory alumni.`);

      // 4. Run Announcement Seeder
      const annStats = await AnnouncementSeeder.run(userStats.adminId, { dynamicCount: options.announcementCount });
      console.log(`[v] Announcements seeded: ${annStats.coreAnnouncements} core bulletins, ${annStats.factoryAnnouncements} factory bulletins.\n`);

      // 5. Query and Display Summary Metrics
      const totalUsers = await db.query('SELECT count(*) FROM users');
      const totalProfiles = await db.query('SELECT count(*) FROM alumni_profiles');
      const totalAnnouncements = await db.query('SELECT count(*) FROM announcements');
      const topSkills = await db.query(`
        SELECT skill, count(*) AS count
        FROM alumni_profiles, jsonb_array_elements_text(skills) AS skill
        GROUP BY skill
        ORDER BY count DESC
        LIMIT 5
      `);

      console.log('============================================================================');
      console.log('  DATABASE SEEDING COMPLETED SUCCESSFULLY ✅');
      console.log('============================================================================');
      console.log(`  Total Users:            ${totalUsers.rows[0].count}`);
      console.log(`  Total Alumni Profiles:  ${totalProfiles.rows[0].count}`);
      console.log(`  Total Announcements:    ${totalAnnouncements.rows[0].count}`);
      console.log('----------------------------------------------------------------------------');
      console.log('  Top 5 Seeded Skills in GIN Index:');
      topSkills.rows.forEach((s, idx) => {
        console.log(`    ${idx + 1}. ${s.skill.padEnd(25)} (${s.count} alumni)`);
      });
      console.log('============================================================================\n');

    } catch (err) {
      console.error('\n[x] DatabaseSeeder encountered an error:\n', err);
      process.exitCode = 1;
    } finally {
      await db.pool.end();
    }
  }
}

// Execute directly if run as script
if (require.main === module) {
  DatabaseSeeder.run();
}

module.exports = DatabaseSeeder;
