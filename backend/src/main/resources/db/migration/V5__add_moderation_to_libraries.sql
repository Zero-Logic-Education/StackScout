-- Миграция: Добавление полей модерации в таблицу libraries
-- Версия: 5
-- Описание: Расширение таблицы библиотек полями для модерации

-- Добавление новых колонок
ALTER TABLE libraries
ADD COLUMN moderation_status VARCHAR(50) DEFAULT 'PENDING',
ADD COLUMN moderated_by BIGINT,
ADD COLUMN moderated_at TIMESTAMP,
ADD COLUMN moderation_notes TEXT;

-- Добавление индекса для быстрой фильтрации по статусу модерации
CREATE INDEX idx_library_moderation_status ON libraries(moderation_status);

-- Добавление foreign key на таблицу users (если нужен hard constraint)
-- ALTER TABLE libraries
-- ADD CONSTRAINT fk_moderated_by FOREIGN KEY (moderated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Обновление существующих записей - установить статус VERIFIED для библиотек с health_score > 70
UPDATE libraries
SET moderation_status = 'VERIFIED'
WHERE health_score > 70 AND moderation_status = 'PENDING';

COMMENT ON COLUMN libraries.moderation_status IS 'Статус модерации: PENDING, VERIFIED, NEEDS_REVIEW, ARCHIVED';
COMMENT ON COLUMN libraries.moderated_by IS 'ID пользователя, который провел модерацию';
COMMENT ON COLUMN libraries.moderated_at IS 'Дата и время модерации';
COMMENT ON COLUMN libraries.moderation_notes IS 'Заметки модератора';
