-- Add username column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(32) UNIQUE;

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Update existing users to have a username based on their email
UPDATE users 
SET username = SPLIT_PART(email, '@', 1) 
WHERE username IS NULL;

-- Add constraint to ensure username is unique and not null for new records
-- (We'll handle this in the application logic for now)