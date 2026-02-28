package com.stackscout.repository;

import com.stackscout.model.ScraperTask;
import com.stackscout.model.ScraperTask.ScraperStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Репозиторий для управления ScraperTask
 */
@Repository
public interface ScraperTaskRepository extends JpaRepository<ScraperTask, Long> {

    /**
     * Найти скрейпер по имени
     */
    Optional<ScraperTask> findByScraperName(String scraperName);

    /**
     * Найти все активные скрейперы
     */
    List<ScraperTask> findByEnabledTrue();

    /**
     * Найти скрейперы по статусу
     */
    List<ScraperTask> findByStatus(ScraperStatus status);

    /**
     * Найти скрейперы по источнику
     */
    List<ScraperTask> findBySource(String source);

    /**
     * Найти активные скрейперы, которые выполняются
     */
    List<ScraperTask> findByEnabledTrueAndStatus(ScraperStatus status);
}
