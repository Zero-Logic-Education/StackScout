-- Stage 2: расширение источников package registry
-- Добавляем scraper tasks для npm, Maven Central и NuGet

INSERT INTO scraper_tasks (scraper_name, display_name, source, status, enabled, cron_expression)
VALUES
  ('npm-scraper', 'npm Package Scraper', 'npm', 'IDLE', true, '0 0 4 * * *'),
  ('maven-scraper', 'Maven Central Scraper', 'maven', 'IDLE', true, '0 0 5 * * *'),
  ('nuget-scraper', 'NuGet Package Scraper', 'nuget', 'IDLE', true, '0 0 6 * * *')
ON CONFLICT (scraper_name) DO NOTHING;