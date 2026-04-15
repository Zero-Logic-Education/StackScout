-- StackScout PostgreSQL Initialization Script
-- Синхронизировано с Flyway миграциями (V1-V13)

-- Включить необходимые расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ═══════════════════════════════════════════
-- V1: Initial Schema (libraries)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS libraries (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL,
    license_name VARCHAR(100),
    health_score INTEGER,
    last_release VARCHAR(50),
    repository VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_library_name ON libraries(name);
CREATE INDEX IF NOT EXISTS idx_library_source ON libraries(source);
CREATE INDEX IF NOT EXISTS idx_library_health_score ON libraries(health_score);

-- ═══════════════════════════════════════════
-- V2: Licenses and compatibility
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS licenses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    classification VARCHAR(50) NOT NULL,
    url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS license_compatibility (
    id BIGSERIAL PRIMARY KEY,
    license_id BIGINT NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    compatible_with_id BIGINT NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    is_compatible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставить стандартные лицензии
INSERT INTO licenses (name, description, classification) VALUES
('MIT', 'MIT License', 'PERMISSIVE'),
('Apache-2.0', 'Apache License 2.0', 'PERMISSIVE'),
('GPL-3.0', 'GNU General Public License v3', 'COPYLEFT'),
('GPL-2.0', 'GNU General Public License v2', 'COPYLEFT'),
('AGPL-3.0', 'GNU Affero General Public License v3', 'COPYLEFT'),
('BSD-3-Clause', 'BSD 3-Clause License', 'PERMISSIVE'),
('BSD-2-Clause', 'BSD 2-Clause License', 'PERMISSIVE'),
('ISC', 'ISC License', 'PERMISSIVE'),
('MPL-2.0', 'Mozilla Public License 2.0', 'COPYLEFT'),
('LGPL-3.0', 'GNU Lesser General Public License v3', 'COPYLEFT'),
('Unlicense', 'The Unlicense', 'PERMISSIVE'),
('CC0-1.0', 'Creative Commons Zero v1.0', 'PERMISSIVE')
ON CONFLICT (name) DO NOTHING;

-- ═══════════════════════════════════════════
-- V3: Scan jobs
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS scan_jobs (
    id BIGSERIAL PRIMARY KEY,
    library_id BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    scan_type VARCHAR(50),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    result TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════
-- V4: Users
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ═══════════════════════════════════════════
-- V5: Scraper tasks
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS scraper_tasks (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    source VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    progress INTEGER DEFAULT 0,
    total_packages INTEGER DEFAULT 0,
    processed_packages INTEGER DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- ═══════════════════════════════════════════
-- V6: Moderation fields on libraries
-- ═══════════════════════════════════════════
ALTER TABLE libraries ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE libraries ADD COLUMN IF NOT EXISTS moderation_notes TEXT;
ALTER TABLE libraries ADD COLUMN IF NOT EXISTS moderated_by BIGINT REFERENCES users(id);
ALTER TABLE libraries ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP;

-- ═══════════════════════════════════════════
-- V7: Subscriptions and library updates
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS library_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    library_id BIGINT NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(user_id, library_id)
);

CREATE TABLE IF NOT EXISTS library_updates (
    id BIGSERIAL PRIMARY KEY,
    library_id BIGINT NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    old_version VARCHAR(50) NOT NULL,
    new_version VARCHAR(50) NOT NULL,
    update_type VARCHAR(50) NOT NULL,
    update_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    old_health_score INTEGER,
    new_health_score INTEGER,
    changelog TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON library_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_library_id ON library_subscriptions(library_id);
CREATE INDEX IF NOT EXISTS idx_updates_library_id ON library_updates(library_id);

-- ═══════════════════════════════════════════
-- V8: User status fields
-- ═══════════════════════════════════════════
ALTER TABLE users ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked BOOLEAN NOT NULL DEFAULT FALSE;

-- ═══════════════════════════════════════════
-- V9: Password reset tokens
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);

-- ═══════════════════════════════════════════
-- V10-V13: Stage 2-5 sources (additional columns)
-- ═══════════════════════════════════════════
-- Эти миграции расширяют список источников данных
-- и не добавляют новых таблиц, только конфигурацию

-- ═══════════════════════════════════════════
-- Триггеры для updated_at
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_libraries_updated_at BEFORE UPDATE ON libraries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Коммент для отслеживания версии
COMMENT ON SCHEMA public IS 'StackScout Database Schema v13.0 (Synced with Flyway)';
