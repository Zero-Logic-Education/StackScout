-- Миграция: Добавление таблицы scraper_tasks
-- Версия: 4
-- Описание: Создание таблицы для управления задачами скрейперов

CREATE TABLE scraper_tasks (
    id BIGSERIAL PRIMARY KEY,
    scraper_name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    source VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    cron_expression VARCHAR(100),
    progress INTEGER DEFAULT 0,
    processed_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    current_run_started_at TIMESTAMP,
    last_error TEXT,
    configuration TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_scraper_name ON scraper_tasks(scraper_name);
CREATE INDEX idx_scraper_status ON scraper_tasks(status);
CREATE INDEX idx_scraper_enabled ON scraper_tasks(enabled);

-- Вставка начальных скрейперов
INSERT INTO scraper_tasks (scraper_name, display_name, source, status, enabled, cron_expression) VALUES
('pypi-scraper', 'PyPI Package Scraper', 'pypi', 'IDLE', true, '0 0 2 * * *'),
('dockerhub-scraper', 'Docker Hub Scraper', 'dockerhub', 'IDLE', true, '0 0 3 * * *');

COMMENT ON TABLE scraper_tasks IS 'Задачи скрейперов для парсинга данных из различных источников';
COMMENT ON COLUMN scraper_tasks.scraper_name IS 'Уникальное имя скрейпера';
COMMENT ON COLUMN scraper_tasks.status IS 'Статус: IDLE, RUNNING, PAUSED, ERROR, COMPLETED';
COMMENT ON COLUMN scraper_tasks.cron_expression IS 'Выражение cron для планирования запуска';
