-- Миграция для добавления подписок и обновлений библиотек
-- V5__add_subscriptions_and_updates.sql

-- Таблица подписок пользователей на библиотеки
CREATE TABLE library_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    library_id BIGINT NOT NULL,
    subscribed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    
    CONSTRAINT fk_subscription_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_subscription_library FOREIGN KEY (library_id) 
        REFERENCES libraries(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_library UNIQUE (user_id, library_id)
);

-- Индексы для быстрого поиска
CREATE INDEX idx_subscription_user ON library_subscriptions(user_id);
CREATE INDEX idx_subscription_library ON library_subscriptions(library_id);

-- Таблица обновлений библиотек
CREATE TABLE library_updates (
    id BIGSERIAL PRIMARY KEY,
    library_id BIGINT NOT NULL,
    old_version VARCHAR(50) NOT NULL,
    new_version VARCHAR(50) NOT NULL,
    update_type VARCHAR(20) NOT NULL CHECK (update_type IN ('MAJOR', 'MINOR', 'PATCH')),
    change_log TEXT,
    old_health_score INTEGER,
    new_health_score INTEGER,
    update_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_update_library FOREIGN KEY (library_id) 
        REFERENCES libraries(id) ON DELETE CASCADE
);

-- Индексы для быстрого поиска и сортировки
CREATE INDEX idx_library_update_library ON library_updates(library_id);
CREATE INDEX idx_library_update_date ON library_updates(update_date DESC);

-- Комментарии для документации
COMMENT ON TABLE library_subscriptions IS 'Подписки пользователей на библиотеки для отслеживания обновлений';
COMMENT ON TABLE library_updates IS 'История обновлений библиотек';
COMMENT ON COLUMN library_updates.update_type IS 'Тип обновления: MAJOR (breaking), MINOR (feature), PATCH (fix)';
