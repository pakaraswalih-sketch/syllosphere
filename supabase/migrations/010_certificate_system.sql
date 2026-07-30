-- Migration: 010_certificate_system.sql
-- Description: Adds certificate tracking columns to the user_progress table

ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS certificate_unlocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS certificate_id VARCHAR UNIQUE,
ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS course_name VARCHAR DEFAULT 'Syllogism',
ADD COLUMN IF NOT EXISTS issued_by VARCHAR DEFAULT 'Syllosphere Learning Platform';

-- Create an index on certificate_id to allow fast verification lookups in the future
CREATE INDEX IF NOT EXISTS idx_user_progress_certificate_id ON user_progress(certificate_id);
