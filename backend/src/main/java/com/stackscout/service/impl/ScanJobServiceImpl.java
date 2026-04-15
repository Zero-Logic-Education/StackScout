// File: ScanJobServiceImpl.java
package com.stackscout.service.impl;

import com.stackscout.dto.CreateScanJobRequest;
import com.stackscout.dto.ScanJobDto;
import com.stackscout.exception.ResourceNotFoundException;
import com.stackscout.model.ScanJob;
import com.stackscout.repository.ScanJobRepository;
import com.stackscout.service.ScanJobService;
import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Реализация сервиса для управления задачами сканирования.
 * Позволяет создавать, обновлять и отслеживать прогресс задач на сбор данных.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScanJobServiceImpl implements ScanJobService {

    private final ScanJobRepository scanJobRepository;

    @Override
    @Timed(value = "stackscout.scan_job.operation", extraTags = {"operation", "get_all"})
    public Page<ScanJobDto> getAllScanJobs(Pageable pageable) {
        log.debug("Получение всех задач сканирования с пагинацией: {}", pageable);
        if (pageable == null) {
            throw new IllegalArgumentException("Pageable не может быть null");
        }
        return scanJobRepository.findAll(pageable)
                .map(this::toDto);
    }

    @Override
    @Timed(value = "stackscout.scan_job.operation", extraTags = {"operation", "get_by_id"})
    public ScanJobDto getScanJobById(Long id) {
        log.debug("Поиск задачи сканирования с ID: {}", id);
        if (id == null) {
            throw new IllegalArgumentException("ID не может быть null");
        }
        ScanJob scanJob = scanJobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Задача сканирования не найдена с ID: " + id));
        return toDto(scanJob);
    }

    @Override
    @Transactional
    @Timed(value = "stackscout.scan_job.operation", extraTags = {"operation", "create"})
    public ScanJobDto createScanJob(CreateScanJobRequest request) {
        log.info("Создание новой задачи сканирования для источника: {}", request.getSource());

        ScanJob scanJob = new ScanJob();
        scanJob.setSource(request.getSource());
        scanJob.setStatus(ScanJob.ScanStatus.PENDING);
        scanJob.setPackagesCount(request.getPackagesCount());
        scanJob.setProcessedCount(0);
        scanJob.setFailedCount(0);

        ScanJob savedJob = scanJobRepository.save(scanJob);

        log.info("Задача сканирования успешно создана с ID: {}", savedJob.getId());
        return toDto(savedJob);
    }

    @Override
    @Transactional
    @Timed(value = "stackscout.scan_job.operation", extraTags = {"operation", "update_status"})
    public ScanJobDto updateScanJobStatus(Long id, ScanJob.ScanStatus status) {
        log.info("Обновление статуса задачи {} на {}", id, status);
        if (id == null) {
            throw new IllegalArgumentException("ID не может быть null");
        }

        ScanJob scanJob = scanJobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Задача сканирования не найдена с ID: " + id));

        scanJob.setStatus(status);

        if (status == ScanJob.ScanStatus.RUNNING && scanJob.getStartedAt() == null) {
            scanJob.setStartedAt(LocalDateTime.now());
        }

        if (status == ScanJob.ScanStatus.COMPLETED || status == ScanJob.ScanStatus.FAILED) {
            scanJob.setCompletedAt(LocalDateTime.now());
        }

        ScanJob updatedJob = scanJobRepository.save(scanJob);

        log.info("Статус задачи успешно обновлен: {}", id);
        return toDto(updatedJob);
    }

    @Override
    @Transactional
    @Timed(value = "stackscout.scan_job.operation", extraTags = {"operation", "delete"})
    public void deleteScanJob(Long id) {
        log.info("Удаление задачи сканирования с ID: {}", id);
        if (id == null) {
            throw new IllegalArgumentException("ID не может быть null");
        }

        if (!scanJobRepository.existsById(id)) {
            throw new ResourceNotFoundException("Задача сканирования не найдена с ID: " + id);
        }

        scanJobRepository.deleteById(id);
        log.info("Задача сканирования успешно удалена: {}", id);
    }

    @Override
    @Timed(value = "stackscout.scan_job.operation", extraTags = {"operation", "get_by_status"})
    public Page<ScanJobDto> getScanJobsByStatus(ScanJob.ScanStatus status, Pageable pageable) {
        log.debug("Получение задач по статусу: {}", status);
        return scanJobRepository.findByStatus(status, pageable)
                .map(this::toDto);
    }

    @Override
    @Timed(value = "stackscout.scan_job.operation", extraTags = {"operation", "get_by_source"})
    public Page<ScanJobDto> getScanJobsBySource(String source, Pageable pageable) {
        log.debug("Получение задач по источнику: {}", source);
        return scanJobRepository.findBySource(source, pageable)
                .map(this::toDto);
    }

    @Override
    @Timed(value = "stackscout.scan_job.operation", extraTags = {"operation", "get_recent_by_source"})
    public List<ScanJobDto> getRecentJobsBySource(String source, int limit) {
        log.debug("Получение последних {} задач для источника: {}", limit, source);
        return scanJobRepository.findRecentJobsBySource(source, PageRequest.of(0, limit))
                .stream()
                .map(this::toDto)
            .toList();
    }

    @Override
    @Timed(value = "stackscout.scan_job.operation", extraTags = {"operation", "get_statistics"})
    public Map<String, Long> getStatusStatistics() {
        log.debug("Получение статистики по статусам");
        List<Object[]> stats = scanJobRepository.getStatusStatistics();

        Map<String, Long> result = new HashMap<>();
        for (Object[] stat : stats) {
            ScanJob.ScanStatus status = (ScanJob.ScanStatus) stat[0];
            Long count = (Long) stat[1];
            result.put(status.name(), count);
        }

        return result;
    }

    // Вспомогательный метод для маппинга

    private ScanJobDto toDto(ScanJob scanJob) {
        return new ScanJobDto(
                scanJob.getId(),
                scanJob.getSource(),
                scanJob.getStatus(),
                scanJob.getPackagesCount(),
                scanJob.getProcessedCount(),
                scanJob.getFailedCount(),
                scanJob.getStartedAt(),
                scanJob.getCompletedAt(),
                scanJob.getErrorMessage(),
                scanJob.getCreatedAt(),
                scanJob.getUpdatedAt());
    }
}
