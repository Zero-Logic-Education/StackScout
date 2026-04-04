-- Stage 3: расширение источников репозиториев
-- Добавляем scraper tasks для GitHub и GitLab

INSERT INTO scraper_tasks (scraper_name, display_name, source, status, enabled, cron_expression)
VALUES
  ('github-scraper', 'GitHub Repository Monitor', 'github', 'IDLE', true, '0 0 7 * * *'),
  ('gitlab-scraper', 'GitLab Project Monitor', 'gitlab', 'IDLE', true, '0 0 8 * * *')
ON CONFLICT (scraper_name) DO NOTHING;
