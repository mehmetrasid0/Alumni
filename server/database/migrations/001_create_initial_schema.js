/**
 * ============================================================================
 * Alumni Tracker — Database Migration (JavaScript Definition)
 * ============================================================================
 * Migration: 001_create_initial_schema.js
 * Description: Defines User, AlumniProfile, and Announcement Models along with
 *              their 1:1 and 1:N relationships.
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * Specification Reference: DDD.md (Sections 5.1, 5.2, 5.3)
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const Models = {
  User: {
    name: 'User',
    tableName: 'users',
    attributes: {
      id: { type: 'UUID', primaryKey: true, defaultValue: 'gen_random_uuid()' },
      email: { type: 'VARCHAR(255)', unique: true, allowNull: false },
      password_hash: { type: 'VARCHAR(255)', allowNull: false },
      role: { type: 'VARCHAR(50)', defaultValue: 'alumni', validate: { isIn: ['alumni', 'admin', 'coordinator'] } },
      created_at: { type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
      updated_at: { type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' }
    }
  },
  AlumniProfile: {
    name: 'AlumniProfile',
    tableName: 'alumni_profiles',
    attributes: {
      id: { type: 'UUID', primaryKey: true, defaultValue: 'gen_random_uuid()' },
      user_id: { type: 'UUID', unique: true, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      student_id: { type: 'VARCHAR(50)', unique: true, allowNull: true },
      full_name: { type: 'VARCHAR(150)', allowNull: false },
      department: { type: 'VARCHAR(100)', allowNull: false },
      graduation_year: { type: 'INTEGER', allowNull: false, validate: { min: 1950, max: 2100 } },
      degree: { type: 'VARCHAR(50)', defaultValue: 'Bachelor', validate: { isIn: ['Bachelor', 'Master', 'PhD', 'Associate'] } },
      current_company: { type: 'VARCHAR(150)', allowNull: true },
      job_title: { type: 'VARCHAR(100)', allowNull: true },
      city: { type: 'VARCHAR(100)', allowNull: true },
      country: { type: 'VARCHAR(100)', defaultValue: 'Turkey' },
      linkedin_url: { type: 'VARCHAR(255)', allowNull: true },
      phone: { type: 'VARCHAR(50)', allowNull: true },
      bio: { type: 'TEXT', allowNull: true },
      skills: { type: 'JSONB', defaultValue: [] },
      created_at: { type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
      updated_at: { type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' }
    }
  },
  Announcement: {
    name: 'Announcement',
    tableName: 'announcements',
    attributes: {
      id: { type: 'SERIAL', primaryKey: true },
      author_id: { type: 'UUID', allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'RESTRICT' },
      title: { type: 'VARCHAR(255)', allowNull: false },
      content: { type: 'TEXT', allowNull: false },
      category: { type: 'VARCHAR(50)', defaultValue: 'General', validate: { isIn: ['Career', 'Event', 'Academic', 'General', 'Networking'] } },
      priority: { type: 'VARCHAR(20)', defaultValue: 'medium', validate: { isIn: ['low', 'medium', 'high', 'urgent'] } },
      status: { type: 'VARCHAR(20)', defaultValue: 'published', validate: { isIn: ['draft', 'published', 'archived'] } },
      target_audience: { type: 'VARCHAR(100)', defaultValue: 'All Alumni' },
      pinned: { type: 'BOOLEAN', defaultValue: false },
      created_at: { type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
      updated_at: { type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' }
    }
  }
};

const Relationships = [
  {
    name: 'User_hasOne_AlumniProfile',
    source: 'User',
    target: 'AlumniProfile',
    type: 'hasOne',
    cardinality: '1:1',
    foreignKey: 'user_id',
    sourceKey: 'id',
    onDelete: 'CASCADE'
  },
  {
    name: 'AlumniProfile_belongsTo_User',
    source: 'AlumniProfile',
    target: 'User',
    type: 'belongsTo',
    cardinality: '1:1',
    foreignKey: 'user_id',
    targetKey: 'id',
    onDelete: 'CASCADE'
  },
  {
    name: 'User_hasMany_Announcements',
    source: 'User',
    target: 'Announcement',
    type: 'hasMany',
    cardinality: '1:N',
    foreignKey: 'author_id',
    sourceKey: 'id'
  },
  {
    name: 'Announcement_belongsTo_User',
    source: 'Announcement',
    target: 'User',
    type: 'belongsTo',
    cardinality: 'N:1',
    foreignKey: 'author_id',
    targetKey: 'id',
    onDelete: 'RESTRICT'
  }
];

async function up(db) {
  const sqlPath = path.resolve(__dirname, '../../../database/migrations/001_create_initial_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  await db.query(sql);
}

async function down(db) {
  await db.query(`
    DROP TABLE IF EXISTS announcements CASCADE;
    DROP TABLE IF EXISTS alumni_profiles CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DELETE FROM schema_migrations WHERE version = '001';
  `);
}

module.exports = {
  version: '001',
  name: 'create_initial_schema',
  Models,
  Relationships,
  up,
  down
};
