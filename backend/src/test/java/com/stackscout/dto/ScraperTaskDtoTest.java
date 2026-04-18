package com.stackscout.dto;

import com.stackscout.model.ScraperTask.ScraperStatus;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ScraperTaskDtoTest {

    @Test
    void builder_ShouldCreateDtoWithAllFields() {
        LocalDateTime now = LocalDateTime.now();

        ScraperTaskDto dto = ScraperTaskDto.builder()
                .id(1L)
                .scraperName("test-scraper")
                .displayName("Test Scraper")
                .source("pypi")
                .status(ScraperStatus.RUNNING)
                .enabled(true)
                .cronExpression("0 0 * * *")
                .progress(75)
                .processedCount(75)
                .totalCount(100)
                .errorCount(2)
                .lastRunAt(now)
                .nextRunAt(now.plusHours(1))
                .currentRunStartedAt(now.minusMinutes(30))
                .lastError("Test error")
                .configuration("{\"key\":\"value\"}")
                .createdAt(now.minusDays(1))
                .updatedAt(now)
                .build();

        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals("test-scraper", dto.getScraperName());
        assertEquals("Test Scraper", dto.getDisplayName());
        assertEquals("pypi", dto.getSource());
        assertEquals(ScraperStatus.RUNNING, dto.getStatus());
        assertTrue(dto.getEnabled());
        assertEquals("0 0 * * *", dto.getCronExpression());
        assertEquals(75, dto.getProgress());
        assertEquals(75, dto.getProcessedCount());
        assertEquals(100, dto.getTotalCount());
        assertEquals(2, dto.getErrorCount());
        assertEquals(now, dto.getLastRunAt());
        assertEquals("Test error", dto.getLastError());
    }

    @Test
    void settersAndGetters_ShouldWorkCorrectly() {
        ScraperTaskDto dto = new ScraperTaskDto();

        dto.setId(2L);
        dto.setScraperName("npm-scraper");
        dto.setDisplayName("NPM Scraper");
        dto.setSource("npm");
        dto.setStatus(ScraperStatus.IDLE);
        dto.setEnabled(false);
        dto.setProgress(0);

        assertEquals(2L, dto.getId());
        assertEquals("npm-scraper", dto.getScraperName());
        assertEquals("NPM Scraper", dto.getDisplayName());
        assertEquals("npm", dto.getSource());
        assertEquals(ScraperStatus.IDLE, dto.getStatus());
        assertFalse(dto.getEnabled());
        assertEquals(0, dto.getProgress());
    }
}
