-- Stage 5: документация и сигналы сообщества
-- Добавляем scraper tasks для мониторинга документации, сообщества и релизов

INSERT INTO scraper_tasks (scraper_name, display_name, source, status, enabled, cron_expression)
VALUES
  ('documentation-scraper', 'Documentation Quality Monitor', 'documentation', 'IDLE', true, '0 0 12 * * *'),
  ('community-signals-scraper', 'Community Health Tracker', 'community-signals', 'IDLE', true, '0 0 13 * * *'),
  ('release-management-scraper', 'Release Management Monitor', 'release-management', 'IDLE', true, '0 0 14 * * *')
ON CONFLICT (scraper_name) DO NOTHING;
