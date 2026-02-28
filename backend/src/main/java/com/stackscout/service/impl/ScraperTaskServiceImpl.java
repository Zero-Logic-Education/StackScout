package com.stackscout.service.impl;

import com.stackscout.dto.CreateScraperTaskRequest;
import com.stackscout.dto.ScraperTaskDto;
import com.stackscout.exception.ResourceNotFoundException;
import com.stackscout.mapper.ScraperTaskMapper;
import com.stackscout.model.ScraperTask;
import com.stackscout.model.ScraperTask.ScraperStatus;
import com.stackscout.repository.ScraperTaskRepository;
import com.stackscout.service.ScraperTaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Реализация сервиса управления задачами скрейперов
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScraperTaskServiceImpl implements ScraperTaskService {

    private final ScraperTaskRepository scraperTaskRepository;
    private final ScraperTaskMapper scraperTaskMapper;

    @Override
    public List<ScraperTaskDto> getAllScrapers() {
        log.debug("Получение всех скрейперов");
        return scraperTaskRepository.findAll().stream()
                .map(scraperTaskMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @SuppressWarnings("null")
    public Page<ScraperTaskDto> getScrapers(Pageable pageable) {
        log.debug("Получение скрейперов с пагинацией: {}", pageable);
        return scraperTaskRepository.findAll(pageable)
                .map(scraperTaskMapper::toDto);
    }

    @Override
    @SuppressWarnings("null")
    public ScraperTaskDto getScraperById(Long id) {
        log.debug("Получение скрейпера по ID: {}", id);
        ScraperTask scraper = scraperTaskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Скрейпер не найден с ID: " + id));
        return scraperTaskMapper.toDto(scraper);
    }

    @Override
    public ScraperTaskDto getScraperByName(String scraperName) {
        log.debug("Получение скрейпера по имени: {}", scraperName);
        ScraperTask scraper = scraperTaskRepository.findByScraperName(scraperName)
                .orElseThrow(() -> new ResourceNotFoundException("Скрейпер не найден: " + scraperName));
        return scraperTaskMapper.toDto(scraper);
    }

    @Override
    @Transactional
    @SuppressWarnings("null")
    public ScraperTaskDto createScraper(CreateScraperTaskRequest request) {
        log.info("Создание нового скрейпера: {}", request.getScraperName());

        ScraperTask scraper = ScraperTask.builder()
                .scraperName(request.getScraperName())
                .displayName(request.getDisplayName())
                .source(request.getSource())
                .status(ScraperStatus.IDLE)
                .enabled(request.getEnabled() != null ? request.getEnabled() : true)
                .cronExpression(request.getCronExpression())
                .configuration(request.getConfiguration())
                .progress(0)
                .processedCount(0)
                .totalCount(0)
                .errorCount(0)
                .build();

        ScraperTask saved = scraperTaskRepository.save(scraper);
        log.info("Скрейпер создан: {}", saved.getId());

        return scraperTaskMapper.toDto(saved);
    }

    @Override
    @Transactional
    @SuppressWarnings("null")
    public ScraperTaskDto updateScraper(Long id, CreateScraperTaskRequest request) {
        log.info("Обновление скрейпера: {}", id);

        ScraperTask scraper = scraperTaskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Скрейпер не найден с ID: " + id));

        scraper.setDisplayName(request.getDisplayName());
        scraper.setSource(request.getSource());
        scraper.setEnabled(request.getEnabled());
        scraper.setCronExpression(request.getCronExpression());
        scraper.setConfiguration(request.getConfiguration());

        ScraperTask updated = scraperTaskRepository.save(scraper);
        log.info("Скрейпер обновлен: {}", id);

        return scraperTaskMapper.toDto(updated);
    }

    @Override
    @Transactional
    @SuppressWarnings("null")
    public void deleteScraper(Long id) {
        log.info("Удаление скрейпера: {}", id);
        if (!scraperTaskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Скрейпер не найден с ID: " + id);
        }
        scraperTaskRepository.deleteById(id);
        log.info("Скрейпер удален: {}", id);
    }

    @Override
    public List<ScraperTaskDto> getActiveScrapers() {
        log.debug("Получение активных скрейперов");
        return scraperTaskRepository.findByEnabledTrue().stream()
                .map(scraperTaskMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @SuppressWarnings("null")
    public void updateScraperStatus(String scraperName, String statusStr, Integer progress,
                                   Integer processedCount, Integer totalCount, String error) {
        log.debug("Обновление статуса скрейпера {}: {}", scraperName, statusStr);

        ScraperTask scraper = scraperTaskRepository.findByScraperName(scraperName)
                .orElseThrow(() -> new ResourceNotFoundException("Скрейпер не найден: " + scraperName));

        if (statusStr != null) {
            scraper.setStatus(ScraperStatus.valueOf(statusStr));
        }

        if (progress != null) {
            scraper.setProgress(progress);
        }

        if (processedCount != null) {
            scraper.setProcessedCount(processedCount);
        }

        if (totalCount != null) {
            scraper.setTotalCount(totalCount);
            scraper.calculateProgress();
        }

        if (error != null) {
            scraper.setLastError(error);
            scraper.setErrorCount((scraper.getErrorCount() != null ? scraper.getErrorCount() : 0) + 1);
        }

        if (ScraperStatus.RUNNING.name().equals(statusStr) && scraper.getCurrentRunStartedAt() == null) {
            scraper.setCurrentRunStartedAt(LocalDateTime.now());
        } else if (ScraperStatus.COMPLETED.name().equals(statusStr) || ScraperStatus.ERROR.name().equals(statusStr)) {
            scraper.setLastRunAt(LocalDateTime.now());
            scraper.setCurrentRunStartedAt(null);
        }

        scraperTaskRepository.save(scraper);
    }
}
