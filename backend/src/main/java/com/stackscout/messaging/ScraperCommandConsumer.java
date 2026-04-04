package com.stackscout.messaging;

import com.stackscout.config.RabbitMQConfig;
import com.stackscout.dto.ScraperCommandDto;
import com.stackscout.dto.ScraperTaskDto;
import com.stackscout.model.Library;
import com.stackscout.repository.LibraryRepository;
import com.stackscout.service.CollectorService;
import com.stackscout.service.ScraperTaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Потребитель команд управления скрейперами.
 * Обрабатывает команды START/STOP/PAUSE/RESUME/RESTART из очереди RabbitMQ
 * и реально запускает сбор данных через CollectorService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ScraperCommandConsumer {

    private final CollectorService collectorService;
    private final ScraperTaskService scraperTaskService;
    private final LibraryRepository libraryRepository;

    /**
     * Предустановленные популярные PyPI-пакеты для начального сканирования
     */
    private static final List<String> POPULAR_PYPI_PACKAGES = List.of(
            "requests", "numpy", "pandas", "scipy", "matplotlib",
            "django", "flask", "fastapi", "pillow", "scikit-learn",
            "celery", "sqlalchemy", "pytest", "boto3", "cryptography",
            "pydantic", "aiohttp", "httpx", "click", "uvicorn",
            "gunicorn", "redis", "rich", "typer", "loguru"
    );

    /**
     * Предустановленные популярные Docker-образы для начального сканирования
     */
    private static final List<String> POPULAR_DOCKER_IMAGES = List.of(
            "nginx", "redis", "postgres", "mysql", "mongo",
            "rabbitmq", "node", "python", "ubuntu", "alpine",
            "grafana/grafana", "prom/prometheus", "traefik", "wordpress", "jenkins"
    );

        private static final List<String> POPULAR_NPM_PACKAGES = List.of(
            "react", "next", "typescript", "express", "axios",
            "lodash", "rxjs", "vite", "jest", "eslint"
        );

        private static final List<String> POPULAR_MAVEN_ARTIFACTS = List.of(
            "org.springframework.boot:spring-boot-starter-web",
            "org.springframework:spring-core",
            "com.fasterxml.jackson.core:jackson-databind",
            "org.apache.commons:commons-lang3",
            "ch.qos.logback:logback-classic"
        );

        private static final List<String> POPULAR_NUGET_PACKAGES = List.of(
            "Newtonsoft.Json", "Serilog", "Dapper", "AutoMapper", "MediatR"
        );

        private static final List<String> POPULAR_GITHUB_REPOS = List.of(
            "spring-projects/spring-boot",
            "microsoft/vscode",
            "kubernetes/kubernetes",
            "nodejs/node",
            "vercel/next.js"
        );

        private static final List<String> POPULAR_GITLAB_REPOS = List.of(
            "gitlab-org/gitlab",
            "gitlab-org/charts/gitlab",
            "gitlab-org/cluster-integration/helm-install-image"
        );

        private static final List<String> POPULAR_OSV_TARGETS = List.of(
            "npm:lodash@4.17.21",
            "Maven:org.apache.logging.log4j:log4j-core@2.17.0",
            "PyPI:requests@2.31.0"
        );

        private static final List<String> POPULAR_NVD_TARGETS = List.of(
            "log4j:2.17.0",
            "openssl:3.0.0",
            "nginx:1.24.0"
        );

        private static final List<String> POPULAR_GH_ADVISORY_REPOS = List.of(
            "spring-projects/spring-boot",
            "vercel/next.js",
            "nodejs/node"
        );

        private static final List<String> POPULAR_DOCUMENTATION_REPOS = List.of(
            "spring-projects/spring-boot",
            "vercel/next.js",
            "microsoft/vscode"
        );

        private static final Map<String, List<String>> PRESET_IDENTIFIERS = new HashMap<>();

        static {
        PRESET_IDENTIFIERS.put("pypi", POPULAR_PYPI_PACKAGES);
        PRESET_IDENTIFIERS.put("dockerhub", POPULAR_DOCKER_IMAGES);
        PRESET_IDENTIFIERS.put("npm", POPULAR_NPM_PACKAGES);
        PRESET_IDENTIFIERS.put("maven", POPULAR_MAVEN_ARTIFACTS);
        PRESET_IDENTIFIERS.put("nuget", POPULAR_NUGET_PACKAGES);
        PRESET_IDENTIFIERS.put("github", POPULAR_GITHUB_REPOS);
        PRESET_IDENTIFIERS.put("gitlab", POPULAR_GITLAB_REPOS);
        PRESET_IDENTIFIERS.put("osv", POPULAR_OSV_TARGETS);
        PRESET_IDENTIFIERS.put("nvd", POPULAR_NVD_TARGETS);
        PRESET_IDENTIFIERS.put("github-advisories", POPULAR_GH_ADVISORY_REPOS);
        PRESET_IDENTIFIERS.put("documentation", POPULAR_DOCUMENTATION_REPOS);
        PRESET_IDENTIFIERS.put("community-signals", POPULAR_DOCUMENTATION_REPOS);
        PRESET_IDENTIFIERS.put("release-management", POPULAR_DOCUMENTATION_REPOS);
        }

    @RabbitListener(queues = RabbitMQConfig.SCRAPER_COMMAND_QUEUE)
    public void handleScraperCommand(ScraperCommandDto command) {
        log.info("Получена команда {} для скрейпера {}", command.getCommandType(), command.getScraperName());

        try {
            switch (command.getCommandType()) {
                case START, RESTART -> executeStart(command.getScraperName());
                case STOP            -> executeStop(command.getScraperName());
                case PAUSE           -> executePause(command.getScraperName());
                case RESUME          -> executeStart(command.getScraperName());
                default              -> log.warn("Неизвестная команда: {}", command.getCommandType());
            }
        } catch (Exception e) {
            log.error("Ошибка при обработке команды {} для {}: {}",
                    command.getCommandType(), command.getScraperName(), e.getMessage(), e);
            safeUpdateStatus(command.getScraperName(), "ERROR", null, null, null, e.getMessage());
        }
    }

    // -------------------------------------------------------------------------

    private void executeStart(String scraperName) {
        String source = resolveSource(scraperName);
        if (source == null) {
            log.warn("Не удалось определить source для скрейпера {}", scraperName);
            safeUpdateStatus(scraperName, "ERROR", 0, 0, 0, "Unknown scraper source");
            return;
        }

        List<String> packages = buildPackageList(source);

        if (packages.isEmpty()) {
            log.warn("Нет пакетов для сканирования скрейпером {}", scraperName);
            safeUpdateStatus(scraperName, "COMPLETED", 100, 0, 0, null);
            return;
        }

        log.info("Запуск скрейпера {}: {} пакетов из {}", scraperName, packages.size(), source);
        safeUpdateStatus(scraperName, "RUNNING", 0, 0, packages.size(), null);

        int processed = 0;
        int errors = 0;
        int total = packages.size();

        for (String pkg : packages) {
            try {
                collectorService.collect(source, pkg);
                processed++;
                log.debug("Собран пакет {}/{}: {}", processed, total, pkg);
            } catch (Exception e) {
                errors++;
                log.warn("Ошибка сбора пакета {}: {}", pkg, e.getMessage());
            }

            // Обновляем прогресс каждые 5 пакетов
            if ((processed + errors) % 5 == 0 || processed + errors == total) {
                int progress = (int) (((processed + errors) * 100.0) / total);
                safeUpdateStatus(scraperName, "RUNNING", progress, processed, total, null);
            }
        }

        String finalStatus = (processed == 0) ? "ERROR" : "COMPLETED";
        safeUpdateStatus(scraperName, finalStatus, 100, processed, total, null);
        log.info("Скрейпер {} завершил работу: собрано {}/{}, ошибок: {}",
                scraperName, processed, total, errors);
    }

    private void executeStop(String scraperName) {
        safeUpdateStatus(scraperName, "IDLE", 0, null, null, null);
        log.info("Скрейпер {} остановлен", scraperName);
    }

    private void executePause(String scraperName) {
        safeUpdateStatus(scraperName, "PAUSED", null, null, null, null);
        log.info("Скрейпер {} приостановлен", scraperName);
    }

    /**
     * Строит список пакетов: сначала уже существующие в БД (обновление),
     * затем добавляет популярные пакеты которых ещё нет в БД (начальное наполнение).
     */
    private List<String> buildPackageList(String source) {
        List<String> preset = PRESET_IDENTIFIERS.getOrDefault(source, List.of());

        // Пакеты, уже сохранённые в БД для этого источника
        List<String> existing = libraryRepository.findBySource(source).stream()
                .map(Library::getName)
                .toList();

        // Объединяем: существующие + новые из преcета (без дублей)
        List<String> merged = new ArrayList<>(preset);
        for (String pkg : existing) {
            if (!merged.contains(pkg)) {
                merged.add(pkg);
            }
        }
        return merged;
    }

    private String resolveSource(String scraperName) {
        try {
            ScraperTaskDto scraper = scraperTaskService.getScraperByName(scraperName);
            if (scraper.getSource() != null && !scraper.getSource().isBlank()) {
                return scraper.getSource();
            }
        } catch (Exception e) {
            log.warn("Не удалось получить source скрейпера {}: {}", scraperName, e.getMessage());
        }

        if (scraperName.contains("pypi")) return "pypi";
        if (scraperName.contains("docker")) return "dockerhub";
        if (scraperName.contains("npm")) return "npm";
        if (scraperName.contains("maven")) return "maven";
        if (scraperName.contains("nuget")) return "nuget";
        if (scraperName.contains("github-advisories")) return "github-advisories";
        if (scraperName.contains("github")) return "github";
        if (scraperName.contains("gitlab")) return "gitlab";
        if (scraperName.contains("osv")) return "osv";
        if (scraperName.contains("nvd")) return "nvd";
        if (scraperName.contains("documentation")) return "documentation";
        if (scraperName.contains("community-signals")) return "community-signals";
        if (scraperName.contains("release-management")) return "release-management";
        return null;
    }

    private void safeUpdateStatus(String scraperName, String status, Integer progress,
                                   Integer processed, Integer total, String error) {
        try {
            scraperTaskService.updateScraperStatus(scraperName, status, progress, processed, total, error);
        } catch (Exception ex) {
            log.warn("Не удалось обновить статус скрейпера {}: {}", scraperName, ex.getMessage());
        }
    }
}
