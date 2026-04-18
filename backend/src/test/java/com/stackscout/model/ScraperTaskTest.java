package com.stackscout.model;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ScraperTaskTest {

    @Test
    void calculateProgress_ShouldCalculateCorrectPercentage() {
        ScraperTask task = new ScraperTask();
        task.setProcessedCount(50);
        task.setTotalCount(100);

        task.calculateProgress();

        assertEquals(50, task.getProgress());
    }

    @Test
    void calculateProgress_ShouldReturn100_WhenAllProcessed() {
        ScraperTask task = new ScraperTask();
        task.setProcessedCount(100);
        task.setTotalCount(100);

        task.calculateProgress();

        assertEquals(100, task.getProgress());
    }

    @Test
    void calculateProgress_ShouldReturn0_WhenTotalIsZero() {
        ScraperTask task = new ScraperTask();
        task.setProcessedCount(0);
        task.setTotalCount(0);

        task.calculateProgress();

        assertEquals(0, task.getProgress());
    }

    @Test
    void calculateProgress_ShouldReturn0_WhenTotalIsNull() {
        ScraperTask task = new ScraperTask();
        task.setProcessedCount(10);
        task.setTotalCount(null);

        task.calculateProgress();

        assertEquals(0, task.getProgress());
    }

    @Test
    void builder_ShouldCreateTaskWithAllFields() {
        LocalDateTime now = LocalDateTime.now();

        ScraperTask task = ScraperTask.builder()
                .id(1L)
                .scraperName("test-scraper")
                .displayName("Test Scraper")
                .source("pypi")
                .status(ScraperTask.ScraperStatus.RUNNING)
                .enabled(true)
                .cronExpression("0 0 * * *")
                .progress(50)
                .processedCount(50)
                .totalCount(100)
                .errorCount(0)
                .lastRunAt(now)
                .build();

        assertNotNull(task);
        assertEquals(1L, task.getId());
        assertEquals("test-scraper", task.getScraperName());
        assertEquals(ScraperTask.ScraperStatus.RUNNING, task.getStatus());
        assertTrue(task.getEnabled());
    }

    @Test
    void scraperStatus_ShouldHaveAllValues() {
        assertEquals(5, ScraperTask.ScraperStatus.values().length);
        assertNotNull(ScraperTask.ScraperStatus.valueOf("IDLE"));
        assertNotNull(ScraperTask.ScraperStatus.valueOf("RUNNING"));
        assertNotNull(ScraperTask.ScraperStatus.valueOf("PAUSED"));
        assertNotNull(ScraperTask.ScraperStatus.valueOf("ERROR"));
        assertNotNull(ScraperTask.ScraperStatus.valueOf("COMPLETED"));
    }
}
