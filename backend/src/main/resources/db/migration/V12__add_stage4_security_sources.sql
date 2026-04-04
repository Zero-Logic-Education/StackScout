-- Stage 4: безопасность и уязвимости
-- Добавляем scraper tasks для OSV, NVD и GitHub Security Advisories

INSERT INTO scraper_tasks (scraper_name, display_name, source, status, enabled, cron_expression)
VALUES
  ('osv-scraper', 'OSV Vulnerability Scanner', 'osv', 'IDLE', true, '0 0 9 * * *'),
  ('nvd-scraper', 'NVD/CVE Scanner', 'nvd', 'IDLE', true, '0 0 10 * * *'),
  ('github-advisories-scraper', 'GitHub Security Advisories Monitor', 'github-advisories', 'IDLE', true, '0 0 11 * * *')
ON CONFLICT (scraper_name) DO NOTHING;
