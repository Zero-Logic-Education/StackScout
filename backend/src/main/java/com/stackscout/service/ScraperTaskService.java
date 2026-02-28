package com.stackscout.service;

import com.stackscout.dto.CreateScraperTaskRequest;
import com.stackscout.dto.ScraperTaskDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Сервис для управления задачами скрейперов
 */
public interface ScraperTaskService {

    /**
     * Получить все скрейперы
     */
    List<ScraperTaskDto> getAllScrapers();

    /**
     * Получить скрейперы с пагинацией
     */
    Page<ScraperTaskDto> getScrapers(Pageable pageable);

    /**
     * Получить скрейпер по ID
     */
    ScraperTaskDto getScraperById(Long id);

    /**
     * Получить скрейпер по имени
     */
    ScraperTaskDto getScraperByName(String scraperName);

    /**
     * Создать новый скрейпер
     */
    ScraperTaskDto createScraper(CreateScraperTaskRequest request);

    /**
     * Обновить скрейпер
     */
    ScraperTaskDto updateScraper(Long id, CreateScraperTaskRequest request);

    /**
     * Удалить скрейпер
     */
    void deleteScraper(Long id);

    /**
     * Получить активные скрейперы
     */
    List<ScraperTaskDto> getActiveScrapers();

    /**
     * Обновить статус скрейпера
     */
    void updateScraperStatus(String scraperName, String status, Integer progress, 
                           Integer processedCount, Integer totalCount, String error);
}
