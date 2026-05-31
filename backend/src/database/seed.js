require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('./db');
const { v4: uuidv4 } = require('uuid');

const seed = async () => {
  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const hrPassword = await bcrypt.hash('Hr@123456', 12);
  const applicantPassword = await bcrypt.hash('App@123456', 12);

  // Seed admin
  const adminId = uuidv4();
  await query(`
    INSERT INTO users (id, email, password, first_name, last_name, role, is_active, is_verified)
    VALUES ($1, 'admin@jobtracker.com', $2, 'System', 'Admin', 'admin', true, true)
    ON CONFLICT (email) DO NOTHING
  `, [adminId, adminPassword]);

  // Seed HR staff
  const hrId = uuidv4();
  await query(`
    INSERT INTO users (id, email, password, first_name, last_name, role, is_active, is_verified)
    VALUES ($1, 'hr@jobtracker.com', $2, 'Jane', 'HR', 'hr_staff', true, true)
    ON CONFLICT (email) DO NOTHING
  `, [hrId, hrPassword]);

  // Seed committee member
  const committeeId = uuidv4();
  await query(`
    INSERT INTO users (id, email, password, first_name, last_name, role, is_active, is_verified)
    VALUES ($1, 'committee@jobtracker.com', $2, 'John', 'Committee', 'committee_member', true, true)
    ON CONFLICT (email) DO NOTHING
  `, [committeeId, applicantPassword]);

  // Seed applicant
  const applicantId = uuidv4();
  await query(`
    INSERT INTO users (id, email, password, first_name, last_name, role, is_active, is_verified)
    VALUES ($1, 'applicant@jobtracker.com', $2, 'Alice', 'Smith', 'applicant', true, true)
    ON CONFLICT (email) DO NOTHING
  `, [applicantId, applicantPassword]);

  // Seed job vacancies
  const hrResult = await query(`SELECT id FROM users WHERE email = 'hr@jobtracker.com'`);
  const hrUserId = hrResult.rows[0]?.id;

  await query(`
    INSERT INTO job_vacancies (title, department, description, requirements, responsibilities, location, job_type, salary_min, salary_max, deadline, status, positions_available, created_by)
    VALUES 
    ('Senior Software Engineer', 'Engineering', 'We are looking for a skilled Senior Software Engineer to join our team.', 
     'Bachelor degree in CS, 5+ years experience, proficiency in Node.js and React', 
     'Design and implement scalable backend services, mentor junior developers',
     'Addis Ababa', 'full_time', 80000, 120000, NOW() + INTERVAL '30 days', 'open', 2, $1),
    ('Product Manager', 'Product', 'Lead product strategy and roadmap for our core platform.',
     'MBA or equivalent, 3+ years PM experience, strong analytical skills',
     'Define product vision, work with engineering and design teams',
     'Remote', 'full_time', 70000, 100000, NOW() + INTERVAL '45 days', 'open', 1, $1),
    ('UX Designer', 'Design', 'Create beautiful and intuitive user experiences.',
     'Portfolio required, 3+ years UX experience, proficiency in Figma',
     'Conduct user research, create wireframes and prototypes',
     'Addis Ababa', 'full_time', 50000, 75000, NOW() + INTERVAL '20 days', 'open', 1, $1)
    ON CONFLICT DO NOTHING
  `, [hrUserId]);

  console.log('✅ Database seeded successfully!');
  console.log('📧 Test accounts:');
  console.log('   Admin:     admin@jobtracker.com / Admin@123');
  console.log('   HR Staff:  hr@jobtracker.com / Hr@123456');
  console.log('   Committee: committee@jobtracker.com / App@123456');
  console.log('   Applicant: applicant@jobtracker.com / App@123456');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
