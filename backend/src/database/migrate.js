require('dotenv').config();
const { query } = require('./db');

const migrate = async () => {
  console.log('🚀 Running database migrations...');

  await query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'applicant' CHECK (role IN ('applicant','hr_staff','committee_member','admin')),
      avatar_url TEXT,
      phone VARCHAR(20),
      is_active BOOLEAN DEFAULT false,
      is_verified BOOLEAN DEFAULT false,
      verification_token VARCHAR(255),
      reset_token VARCHAR(255),
      reset_token_expires TIMESTAMPTZ,
      last_login TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS job_vacancies (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR(255) NOT NULL,
      department VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      requirements TEXT NOT NULL,
      responsibilities TEXT,
      location VARCHAR(100),
      job_type VARCHAR(50) DEFAULT 'full_time' CHECK (job_type IN ('full_time','part_time','contract','internship','remote')),
      salary_min DECIMAL(10,2),
      salary_max DECIMAL(10,2),
      deadline DATE NOT NULL,
      status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('draft','open','closed','cancelled')),
      positions_available INTEGER DEFAULT 1,
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS applications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job_id UUID REFERENCES job_vacancies(id) ON DELETE CASCADE,
      applicant_id UUID REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted','under_review','shortlisted','interview_scheduled','interviewed','offered','hired','rejected','withdrawn')),
      cover_letter TEXT,
      cv_url TEXT,
      cv_public_id TEXT,
      additional_docs JSONB DEFAULT '[]',
      notes TEXT,
      submitted_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(job_id, applicant_id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
      evaluator_id UUID REFERENCES users(id) ON DELETE SET NULL,
      technical_score INTEGER CHECK (technical_score BETWEEN 1 AND 10),
      communication_score INTEGER CHECK (communication_score BETWEEN 1 AND 10),
      experience_score INTEGER CHECK (experience_score BETWEEN 1 AND 10),
      overall_score DECIMAL(4,2),
      recommendation VARCHAR(50) CHECK (recommendation IN ('strongly_recommend','recommend','neutral','not_recommend','strongly_not_recommend')),
      comments TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(application_id, evaluator_id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info','success','warning','error','application','job')),
      is_read BOOLEAN DEFAULT false,
      link TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(50),
      entity_id UUID,
      old_values JSONB,
      new_values JSONB,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS interviews (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
      scheduled_by UUID REFERENCES users(id) ON DELETE SET NULL,
      interview_date TIMESTAMPTZ NOT NULL,
      interview_type VARCHAR(50) DEFAULT 'in_person' CHECK (interview_type IN ('in_person','video','phone')),
      location TEXT,
      meeting_link TEXT,
      notes TEXT,
      status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','rescheduled')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Indexes for performance
  await query(`
    CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
    CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON applications(applicant_id);
    CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_job_vacancies_status ON job_vacancies(status);
  `);

  console.log('✅ Migrations completed successfully!');
  process.exit(0);
};

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
