package com.stackscout.service.impl;

import com.stackscout.dto.CreateScraperTaskRequest;
import com.stackscout.dto.ScraperTaskDto;
import com.stackscout.exception.ResourceNotFoundException;
import com.stackscout.mapper.ScraperTaskMapper;
import com.stackscout.model.ScraperTask;
import com.stackscout.model.ScraperTask.ScraperStatus;
import com.stackscout.repository.ScraperTaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScraperTaskServiceImplTest {

    @Mock
    private ScraperTaskRepository repository;

    @Mock
    private ScraperTaskMapper mapper;

    private ScraperTaskServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new ScraperTaskServiceImpl(repository, mapper);
    }

    @Test
    void getAllScrapers_ShouldReturnAllScrapers() {
        ScraperTask task1 = createScraperTask(1L, "pypi-scraper");
        ScraperTask task2 = createScraperTask(2L, "dockerhub-scraper");
        ScraperTaskDto dto1 = createScraperTaskDto(1L, "pypi-scraper");
        ScraperTaskDto dto2 = createScraperTaskDto(2L, "dockerhub-scraper");

        when(repository.findAll()).thenReturn(List.of(task1, task2));
        when(mapper.toDto(task1)).thenReturn(dto1);
        when(mapper.toDto(task2)).thenReturn(dto2);

        List<ScraperTaskDto> result = service.getAllScrapers();

        assertEquals(2, result.size());
        assertEquals("pypi-scraper", result.get(0).getScraperName());
        assertEquals("dockerhub-scraper", result.get(1).getScraperName());
        verify(repository).findAll();
    }

    @Test
    void getScrapers_ShouldReturnPagedScrapers() {
        Pageable pageable = PageRequest.of(0, 10);
        ScraperTask task = createScraperTask(1L, "npm-scraper");
        ScraperTaskDto dto = createScraperTaskDto(1L, "npm-scraper");
        Page<ScraperTask> page = new PageImpl<>(List.of(task), pageable, 1);

        when(repository.findAll(pageable)).thenReturn(page);
        when(mapper.toDto(task)).thenReturn(dto);

        Page<ScraperTaskDto> result = service.getScrapers(pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("npm-scraper", result.getContent().get(0).getScraperName());
    }

    @Test
    void getScraperById_ShouldReturnScraper_WhenExists() {
        Long id = 1L;
        ScraperTask task = createScraperTask(id, "maven-scraper");
        ScraperTaskDto dto = createScraperTaskDto(id, "maven-scraper");

        when(repository.findById(id)).thenReturn(Optional.of(task));
        when(mapper.toDto(task)).thenReturn(dto);

        ScraperTaskDto result = service.getScraperById(id);

        assertNotNull(result);
        assertEquals(id, result.getId());
        assertEquals("maven-scraper", result.getScraperName());
    }

    @Test
    void getScraperById_ShouldThrowException_WhenNotFound() {
        Long id = 999L;
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getScraperById(id));
    }

    @Test
    void getScraperByName_ShouldReturnScraper_WhenExists() {
        String name = "github-scraper";
        ScraperTask task = createScraperTask(1L, name);
        ScraperTaskDto dto = createScraperTaskDto(1L, name);

        when(repository.findByScraperName(name)).thenReturn(Optional.of(task));
        when(mapper.toDto(task)).thenReturn(dto);

        ScraperTaskDto result = service.getScraperByName(name);

        assertNotNull(result);
        assertEquals(name, result.getScraperName());
    }

    @Test
    void getScraperByName_ShouldThrowException_WhenNotFound() {
        String name = "unknown-scraper";
        when(repository.findByScraperName(name)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getScraperByName(name));
    }

    @Test
    void createScraper_ShouldCreateAndReturnScraper() {
        CreateScraperTaskRequest request = CreateScraperTaskRequest.builder()
                .scraperName("nuget-scraper")
                .displayName("NuGet Scraper")
                .source("nuget")
                .enabled(true)
                .cronExpression("0 0 * * *")
                .configuration("{}")
                .build();

        ScraperTask savedTask = createScraperTask(1L, "nuget-scraper");
        ScraperTaskDto dto = createScraperTaskDto(1L, "nuget-scraper");

        when(repository.save(any(ScraperTask.class))).thenReturn(savedTask);
        when(mapper.toDto(savedTask)).thenReturn(dto);

        ScraperTaskDto result = service.createScraper(request);

        assertNotNull(result);
        assertEquals("nuget-scraper", result.getScraperName());

        ArgumentCaptor<ScraperTask> captor = ArgumentCaptor.forClass(ScraperTask.class);
        verify(repository).save(captor.capture());

        ScraperTask captured = captor.getValue();
        assertEquals("nuget-scraper", captured.getScraperName());
        assertEquals("NuGet Scraper", captured.getDisplayName());
        assertEquals("nuget", captured.getSource());
        assertEquals(ScraperStatus.IDLE, captured.getStatus());
        assertTrue(captured.getEnabled());
        assertEquals(0, captured.getProgress());
        assertEquals(0, captured.getProcessedCount());
    }

    @Test
    void updateScraper_ShouldUpdateAndReturnScraper() {
        Long id = 1L;
        CreateScraperTaskRequest request = CreateScraperTaskRequest.builder()
                .scraperName("gitlab-scraper")
                .displayName("GitLab Scraper Updated")
                .source("gitlab")
                .enabled(false)
                .cronExpression("0 */12 * * *")
                .configuration("{\"updated\":true}")
                .build();

        ScraperTask existingTask = createScraperTask(id, "gitlab-scraper");
        ScraperTask updatedTask = createScraperTask(id, "gitlab-scraper");
        updatedTask.setDisplayName("GitLab Scraper Updated");
        ScraperTaskDto dto = createScraperTaskDto(id, "gitlab-scraper");

        when(repository.findById(id)).thenReturn(Optional.of(existingTask));
        when(repository.save(any(ScraperTask.class))).thenReturn(updatedTask);
        when(mapper.toDto(updatedTask)).thenReturn(dto);

        ScraperTaskDto result = service.updateScraper(id, request);

        assertNotNull(result);
        verify(repository).save(existingTask);
    }

    @Test
    void updateScraper_ShouldThrowException_WhenNotFound() {
        Long id = 999L;
        CreateScraperTaskRequest request = CreateScraperTaskRequest.builder()
                .scraperName("test")
                .displayName("Test")
                .source("test")
                .build();

        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.updateScraper(id, request));
    }

    @Test
    void deleteScraper_ShouldDeleteScraper_WhenExists() {
        Long id = 1L;
        when(repository.existsById(id)).thenReturn(true);

        service.deleteScraper(id);

        verify(repository).deleteById(id);
    }

    @Test
    void deleteScraper_ShouldThrowException_WhenNotFound() {
        Long id = 999L;
        when(repository.existsById(id)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> service.deleteScraper(id));
        verify(repository, never()).deleteById(id);
    }

    @Test
    void getActiveScrapers_ShouldReturnOnlyEnabledScrapers() {
        ScraperTask task1 = createScraperTask(1L, "active-scraper");
        task1.setEnabled(true);
        ScraperTaskDto dto1 = createScraperTaskDto(1L, "active-scraper");

        when(repository.findByEnabledTrue()).thenReturn(List.of(task1));
        when(mapper.toDto(task1)).thenReturn(dto1);

        List<ScraperTaskDto> result = service.getActiveScrapers();

        assertEquals(1, result.size());
        assertEquals("active-scraper", result.get(0).getScraperName());
    }

    @Test
    void updateScraperStatus_ShouldUpdateStatus() {
        String scraperName = "osv-scraper";
        ScraperTask task = createScraperTask(1L, scraperName);

        when(repository.findByScraperName(scraperName)).thenReturn(Optional.of(task));
        when(repository.save(any(ScraperTask.class))).thenReturn(task);

        service.updateScraperStatus(scraperName, "RUNNING", 50, 100, 200, null);

        ArgumentCaptor<ScraperTask> captor = ArgumentCaptor.forClass(ScraperTask.class);
        verify(repository).save(captor.capture());

        ScraperTask updated = captor.getValue();
        assertEquals(ScraperStatus.RUNNING, updated.getStatus());
        assertEquals(50, updated.getProgress());
        assertEquals(100, updated.getProcessedCount());
        assertEquals(200, updated.getTotalCount());
        assertNotNull(updated.getCurrentRunStartedAt());
    }

    @Test
    void updateScraperStatus_ShouldHandleError() {
        String scraperName = "nvd-scraper";
        ScraperTask task = createScraperTask(1L, scraperName);
        task.setErrorCount(0);

        when(repository.findByScraperName(scraperName)).thenReturn(Optional.of(task));
        when(repository.save(any(ScraperTask.class))).thenReturn(task);

        service.updateScraperStatus(scraperName, "ERROR", null, null, null, "Connection timeout");

        ArgumentCaptor<ScraperTask> captor = ArgumentCaptor.forClass(ScraperTask.class);
        verify(repository).save(captor.capture());

        ScraperTask updated = captor.getValue();
        assertEquals(ScraperStatus.ERROR, updated.getStatus());
        assertEquals("Connection timeout", updated.getLastError());
        assertEquals(1, updated.getErrorCount());
    }

    @Test
    void updateScraperStatus_ShouldCalculateProgress() {
        String scraperName = "documentation-scraper";
        ScraperTask task = createScraperTask(1L, scraperName);

        when(repository.findByScraperName(scraperName)).thenReturn(Optional.of(task));
        when(repository.save(any(ScraperTask.class))).thenReturn(task);

        service.updateScraperStatus(scraperName, "RUNNING", null, 75, 100, null);

        ArgumentCaptor<ScraperTask> captor = ArgumentCaptor.forClass(ScraperTask.class);
        verify(repository).save(captor.capture());

        ScraperTask updated = captor.getValue();
        assertEquals(75, updated.getProgress());
    }

    private ScraperTask createScraperTask(Long id, String name) {
        return ScraperTask.builder()
                .id(id)
                .scraperName(name)
                .displayName(name + " Display")
                .source("test-source")
                .status(ScraperStatus.IDLE)
                .enabled(true)
                .progress(0)
                .processedCount(0)
                .totalCount(0)
                .errorCount(0)
                .build();
    }

    private ScraperTaskDto createScraperTaskDto(Long id, String name) {
        return ScraperTaskDto.builder()
                .id(id)
                .scraperName(name)
                .displayName(name + " Display")
                .source("test-source")
                .status(ScraperStatus.IDLE)
                .enabled(true)
                .build();
    }
}
