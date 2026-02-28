package com.stackscout.messaging;

import com.stackscout.config.RabbitMQConfig;
import com.stackscout.dto.ScraperCommandDto;
import com.stackscout.model.Library;
import com.stackscout.repository.LibraryRepository;
import com.stackscout.service.CollectorService;
import com.stackscout.service.ScraperTaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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
        String source;
        List<String> packages = buildPackageList(scraperName);

        if (scraperName.contains("pypi")) {
            source = "pypi";
        } else if (scraperName.contains("docker")) {
            source = "dockerhub";
        } else {
            log.warn("Неизвестный скрейпер: {}", scraperName);
            return;
        }

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
    private List<String> buildPackageList(String scraperName) {
        List<String> preset = scraperName.contains("pypi") ? POPULAR_PYPI_PACKAGES : POPULAR_DOCKER_IMAGES;
        String source   = scraperName.contains("pypi") ? "pypi" : "dockerhub";

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

    private void safeUpdateStatus(String scraperName, String status, Integer progress,
                                   Integer processed, Integer total, String error) {
        try {
            scraperTaskService.updateScraperStatus(scraperName, status, progress, processed, total, error);
        } catch (Exception ex) {
            log.warn("Не удалось обновить статус скрейпера {}: {}", scraperName, ex.getMessage());
        }
    }
}
