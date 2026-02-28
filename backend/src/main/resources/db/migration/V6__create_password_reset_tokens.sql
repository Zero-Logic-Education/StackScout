-- Миграция: Создание таблицы для токенов сброса пароля
-- Версия: 6
-- Описание: Таблица для хранения токенов восстановления пароля

CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы для быстрого поиска
CREATE INDEX idx_token ON password_reset_tokens(token);
CREATE INDEX idx_expiry ON password_reset_tokens(expiry_date);
CREATE INDEX idx_user_id ON password_reset_tokens(user_id);

-- Функция для автоматической очистки истекших токенов (опционально)
CREATE OR REPLACE FUNCTION clean_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM password_reset_tokens
    WHERE expiry_date < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE password_reset_tokens IS 'Токены для восстановления пароля пользователей';
COMMENT ON COLUMN password_reset_tokens.token IS 'Уникальный токен (UUID)';
COMMENT ON COLUMN password_reset_tokens.expiry_date IS 'Дата истечения токена (обычно +24 часа)';
COMMENT ON COLUMN password_reset_tokens.used IS 'Флаг использования токена';
