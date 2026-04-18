package com.stackscout.mapper;

import com.stackscout.dto.ScraperTaskDto;
import com.stackscout.model.ScraperTask;
import com.stackscout.model.ScraperTask.ScraperStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ScraperTaskMapperTest {

    private ScraperTaskMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new ScraperTaskMapper();
    }

    @Test
    void toDto_ShouldMapAllFields() {
        LocalDateTime now = LocalDateTime.now();
        ScraperTask entity = ScraperTask.builder()
                .id(1L)
                .scraperName("test-scraper")
                .displayName("Test Scraper")
                .source("pypi")
                .status(ScraperStatus.RUNNING)
                .enabled(true)
                .cronExpression("0 0 * * *")
                .progress(50)
                .processedCount(100)
                .totalCount(200)
                .errorCount(5)
                .lastRunAt(now)
                .nextRunAt(now.plusHours(1))
                .currentRunStartedAt(now.minusMinutes(30))
                .lastError("Test error")
                .configuration("{\"key\":\"value\"}")
                .createdAt(now.minusDays(1))
                .updatedAt(now)
                .build();

        ScraperTaskDto dto = mapper.toDto(entity);

        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals("test-scraper", dto.getScraperName());
        assertEquals("Test Scraper", dto.getDisplayName());
        assertEquals("pypi", dto.getSource());
        assertEquals(ScraperStatus.RUNNING, dto.getStatus());
        assertTrue(dto.getEnabled());
        assertEquals("0 0 * * *", dto.getCronExpression());
        assertEquals(50, dto.getProgress());
        assertEquals(100, dto.getProcessedCount());
        assertEquals(200, dto.getTotalCount());
        assertEquals(5, dto.getErrorCount());
        assertEquals(now, dto.getLastRunAt());
        assertEquals(now.plusHours(1), dto.getNextRunAt());
        assertEquals(now.minusMinutes(30), dto.getCurrentRunStartedAt());
        assertEquals("Test error", dto.getLastError());
        assertEquals("{\"key\":\"value\"}", dto.getConfiguration());
        assertEquals(now.minusDays(1), dto.getCreatedAt());
        assertEquals(now, dto.getUpdatedAt());
    }

    @Test
    void toDto_ShouldReturnNull_WhenEntityIsNull() {
        ScraperTaskDto dto = mapper.toDto(null);
        assertNull(dto);
    }

    @Test
    void toEntity_ShouldMapAllFields() {
        LocalDateTime now = LocalDateTime.now();
        ScraperTaskDto dto = ScraperTaskDto.builder()
                .id(1L)
                .scraperName("test-scraper")
                .displayName("Test Scraper")
                .source("dockerhub")
                .status(ScraperStatus.IDLE)
                .enabled(false)
                .cronExpression("0 */6 * * *")
                .progress(0)
                .processedCount(0)
                .totalCount(0)
                .errorCount(0)
                .lastRunAt(now.minusHours(6))
                .nextRunAt(now)
                .currentRunStartedAt(null)
                .lastError(null)
                .configuration(null)
                .createdAt(now.minusDays(7))
                .updatedAt(now.minusHours(1))
                .build();

        ScraperTask entity = mapper.toEntity(dto);

        assertNotNull(entity);
        assertEquals(1L, entity.getId());
        assertEquals("test-scraper", entity.getScraperName());
        assertEquals("Test Scraper", entity.getDisplayName());
        assertEquals("dockerhub", entity.getSource());
        assertEquals(ScraperStatus.IDLE, entity.getStatus());
        assertFalse(entity.getEnabled());
        assertEquals("0 */6 * * *", entity.getCronExpression());
        assertEquals(0, entity.getProgress());
        assertEquals(0, entity.getProcessedCount());
        assertEquals(0, entity.getTotalCount());
        assertEquals(0, entity.getErrorCount());
        assertEquals(now.minusHours(6), entity.getLastRunAt());
        assertEquals(now, entity.getNextRunAt());
        assertNull(entity.getCurrentRunStartedAt());
        assertNull(entity.getLastError());
        assertNull(entity.getConfiguration());
    }

    @Test
    void toEntity_ShouldReturnNull_WhenDtoIsNull() {
        ScraperTask entity = mapper.toEntity(null);
        assertNull(entity);
    }

    @Test
    void toDto_ShouldHandleMinimalEntity() {
        ScraperTask entity = ScraperTask.builder()
                .id(2L)
                .scraperName("minimal-scraper")
                .displayName("Minimal")
                .source("npm")
                .status(ScraperStatus.IDLE)
                .enabled(true)
                .build();

        ScraperTaskDto dto = mapper.toDto(entity);

        assertNotNull(dto);
        assertEquals(2L, dto.getId());
        assertEquals("minimal-scraper", dto.getScraperName());
        assertNull(dto.getCronExpression());
        assertNull(dto.getProgress());
    }
}
