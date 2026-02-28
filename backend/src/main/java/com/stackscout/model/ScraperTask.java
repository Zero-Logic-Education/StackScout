package com.stackscout.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Сущность, представляющая задачу скрейпера.
 * Отличается от ScanJob тем, что отслеживает конкретный экземпляр скрейпера
 * и его настройки расписания.
 */
@Entity
@Table(name = "scraper_tasks", indexes = {
        @Index(name = "idx_scraper_name", columnList = "scraperName"),
        @Index(name = "idx_scraper_status", columnList = "status"),
        @Index(name = "idx_scraper_enabled", columnList = "enabled")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScraperTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Уникальное имя скрейпера (например: pypi-scraper, dockerhub-scraper)
     */
    @Column(nullable = false, unique = true, length = 100)
    private String scraperName;

    /**
     * Человеко-читаемое название
     */
    @Column(nullable = false, length = 200)
    private String displayName;

    /**
     * Источник данных (pypi, dockerhub, npm, etc.)
     */
    @Column(nullable = false, length = 50)
    private String source;

    /**
     * Текущий статус скрейпера
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ScraperStatus status;

    /**
     * Включен ли скрейпер
     */
    @Column(nullable = false)
    private Boolean enabled;

    /**
     * Cron-выражение для планирования
     */
    @Column(length = 100)
    private String cronExpression;

    /**
     * Текущий прогресс выполнения (0-100)
     */
    @Column
    private Integer progress;

    /**
     * Количество обработанных элементов
     */
    @Column
    private Integer processedCount;

    /**
     * Общее количество элементов
     */
    @Column
    private Integer totalCount;

    /**
     * Количество ошибок
     */
    @Column
    private Integer errorCount;

    /**
     * Время последнего запуска
     */
    @Column
    private LocalDateTime lastRunAt;

    /**
     * Время следующего запланированного запуска
     */
    @Column
    private LocalDateTime nextRunAt;

    /**
     * Время начала текущего выполнения
     */
    @Column
    private LocalDateTime currentRunStartedAt;

    /**
     * Лог последней ошибки
     */
    @Column(columnDefinition = "TEXT")
    private String lastError;

    /**
     * Конфигурация в JSON
     */
    @Column(columnDefinition = "TEXT")
    private String configuration;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Статусы скрейпера
     */
    public enum ScraperStatus {
        IDLE,           // Бездействует
        RUNNING,        // Выполняется
        PAUSED,         // На паузе
        ERROR,          // Ошибка
        COMPLETED       // Завершено
    }

    /**
     * Вычисляет прогресс в процентах
     */
    public void calculateProgress() {
        if (totalCount != null && totalCount > 0 && processedCount != null) {
            this.progress = (int) ((processedCount * 100.0) / totalCount);
        } else {
            this.progress = 0;
        }
    }
}
