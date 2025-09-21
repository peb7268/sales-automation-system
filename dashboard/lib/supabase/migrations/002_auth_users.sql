-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    image VARCHAR(500),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
    team_id UUID,
    provider VARCHAR(50) DEFAULT 'credentials',
    google_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Create sessions table for NextAuth
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_sessions_session_token ON sessions(session_token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- Update trigger for users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Create policies for sessions
CREATE POLICY "Users can manage their own sessions" ON sessions
    FOR ALL USING (auth.uid() = user_id);

-- Insert default admin user (password: admin123)
-- Password hash created with bcrypt for 'admin123'
INSERT INTO users (email, password_hash, name, role, provider)
VALUES (
    'admin@milehighmarketing.com',
    '$2a$10$rBZkpP6bxU3Y.3pV7F6Ym.xR3wvhW0LXpK7YqQW5XnLjJXxFqKwLW',
    'Admin User',
    'admin',
    'credentials'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample users for testing
INSERT INTO users (email, password_hash, name, role, provider)
VALUES 
    (
        'john@example.com',
        '$2a$10$rBZkpP6bxU3Y.3pV7F6Ym.xR3wvhW0LXpK7YqQW5XnLjJXxFqKwLW',
        'John Doe',
        'manager',
        'credentials'
    ),
    (
        'jane@example.com',
        '$2a$10$rBZkpP6bxU3Y.3pV7F6Ym.xR3wvhW0LXpK7YqQW5XnLjJXxFqKwLW',
        'Jane Smith',
        'user',
        'credentials'
    )
ON CONFLICT (email) DO NOTHING;