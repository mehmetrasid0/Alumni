/**
 * ============================================================================
 * Alumni Tracker — Database Migration Runner
 * ============================================================================
 * Architectural Layer: DATABASE / MIGRATOR (DDD Specification)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * Specification Reference: DDD.md
 * 
 * Usage:
 *   node database/migrate.js
 *   node database/migrate.js --status
 *   npm run db:migrate
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const db = require('../db');

class MigrationRunner {
  static getMigrationsDir() {
    return path.resolve(__dirname, '../../database/migrations');
  }

  static async ensureMigrationsTable() {
    await db.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  static async getAppliedMigrations() {
    await this.ensureMigrationsTable();
    const res = await db.query('SELECT version, name, applied_at FROM schema_migrations ORDER BY version ASC');
    return res.rows;
  }

  static async run() {
    const isStatusOnly = process.argv.includes('--status');
    const migrationsDir = this.getMigrationsDir();

    console.log('============================================================================');
    console.log('  ALUMNI TRACKER — DATABASE MIGRATION ENGINE (DDD SPECIFICATION)');
    console.log('  Istanbul University - Management Information Systems (YBS)');
    console.log('============================================================================\n');

    if (!fs.existsSync(migrationsDir)) {
      console.error(`[x] Migrations directory does not exist: ${migrationsDir}`);
      process.exitCode = 1;
      return;
    }

    try {
      // 1. Verify DB connection
      const testRes = await db.query('SELECT current_database(), current_user');
      console.log(`[v] Connected to database "${testRes.rows[0].current_database}" as user "${testRes.rows[0].current_user}"\n`);

      // 2. Fetch applied migrations
      const applied = await this.getAppliedMigrations();
      const appliedVersions = new Set(applied.map(m => m.version));

      // 3. Scan migrations directory
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      if (isStatusOnly) {
        console.log('Migration Status:');
        console.log('----------------------------------------------------------------------------');
        files.forEach(file => {
          const version = file.split('_')[0];
          const isApplied = appliedVersions.has(version);
          const status = isApplied ? '[APPLIED]' : '[PENDING]';
          console.log(`  ${status.padEnd(12)} ${file}`);
        });
        console.log('----------------------------------------------------------------------------\n');
        return;
      }

      // 4. Apply pending migrations
      let appliedCount = 0;
      const jsMigrationsDir = path.resolve(__dirname, 'migrations');

      for (const file of files) {
        const version = file.split('_')[0];
        if (appliedVersions.has(version)) {
          console.log(`[-] Skipping already applied migration: ${file}`);
          continue;
        }

        console.log(`[*] Executing migration: ${file}...`);

        // Check if rich JavaScript model definition exists
        const jsFile = fs.existsSync(jsMigrationsDir) 
          ? fs.readdirSync(jsMigrationsDir).find(f => f.startsWith(`${version}_`) && f.endsWith('.js'))
          : null;

        if (jsFile) {
          const migrationMod = require(path.join(jsMigrationsDir, jsFile));
          if (migrationMod.Model) {
            console.log(`    ┌─ Defined Model: ${migrationMod.Model.modelName} (Table: ${migrationMod.Model.tableName})`);
            const attrCount = Object.keys(migrationMod.Model.attributes || {}).length;
            console.log(`    ├─ Attributes:    ${attrCount} fields with invariants & constraints`);
          }
          if (migrationMod.Relationships && migrationMod.Relationships.length > 0) {
            console.log('    ├─ Relationships:');
            migrationMod.Relationships.forEach(rel => {
              console.log(`    │  • ${rel.source} ${rel.cardinality} ${rel.target} [${rel.name}] (${rel.description || ''})`);
            });
            console.log('    └─────────────────────────────────────────────────────────────');
          }
        }

        const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

        // Execute raw SQL migration file
        await db.query(sqlContent);
        appliedCount++;
        console.log(`[v] Successfully applied migration: ${file}\n`);
      }

      console.log('============================================================================');
      if (appliedCount > 0) {
        console.log(`  MIGRATIONS COMPLETED: ${appliedCount} migration(s) applied successfully ✅`);
      } else {
        console.log('  DATABASE IS UP TO DATE: No pending migrations to apply. ✅');
      }
      console.log('============================================================================\n');

    } catch (err) {
      console.error('\n[x] MigrationRunner encountered a database error:\n', err);
      process.exitCode = 1;
    } finally {
      await db.pool.end();
    }
  }
}

if (require.main === module) {
  MigrationRunner.run();
}

module.exports = MigrationRunner;
