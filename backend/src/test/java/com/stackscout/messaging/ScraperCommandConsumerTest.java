package com.stackscout.messaging;

import com.stackscout.dto.ScraperCommandDto;
import com.stackscout.dto.ScraperCommandDto.CommandType;
import com.stackscout.dto.ScraperTaskDto;
import com.stackscout.model.Library;
import com.stackscout.model.ScraperTask.ScraperStatus;
import com.stackscout.repository.LibraryRepository;
import com.stackscout.service.CollectorService;
import com.stackscout.service.ScraperTaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScraperCommandConsumerTest {

    @Mock
    private CollectorService collectorService;

    @Mock
    private ScraperTaskService scraperTaskService;

    @Mock
    private LibraryRepository libraryRepository;

    private ScraperCommandConsumer consumer;

    @BeforeEach
    void setUp() {
        consumer = new ScraperCommandConsumer(collectorService, scraperTaskService, libraryRepository);
    }

    @Test
    void handleScraperCommand_ShouldExecuteStart_WhenCommandIsStart() {
        ScraperCommandDto command = ScraperCommandDto.builder()
                .commandType(CommandType.START)
                .scraperName("pypi-scraper")
                .userId(1L)
                .build();

        ScraperTaskDto scraperTask = ScraperTaskDto.builder()
                .scraperName("pypi-scraper")
                .source("pypi")
                .enabled(true)
                .build();

        when(scraperTaskService.getScraperByName("pypi-scraper")).thenReturn(scraperTask);
        when(libraryRepository.findBySource("pypi")).thenReturn(List.of());

        consumer.handleScraperCommand(command);

        verify(scraperTaskService, atLeastOnce()).updateScraperStatus(
                eq("pypi-scraper"),
                anyString(),
                anyInt(),
                anyInt(),
                anyInt(),
                isNull()
        );
    }

    @Test
    void handleScraperCommand_ShouldExecuteStop_WhenCommandIsStop() {
        ScraperCommandDto command = ScraperCommandDto.builder()
                .commandType(CommandType.STOP)
                .scraperName("dockerhub-scraper")
                .userId(1L)
                .build();

        consumer.handleScraperCommand(command);

        verify(scraperTaskService).updateScraperStatus(
                eq("dockerhub-scraper"),
                eq("IDLE"),
                eq(0),
                isNull(),
                isNull(),
                isNull()
        );
    }

    @Test
    void handleScraperCommand_ShouldExecutePause_WhenCommandIsPause() {
        ScraperCommandDto command = ScraperCommandDto.builder()
                .commandType(CommandType.PAUSE)
                .scraperName("npm-scraper")
                .userId(1L)
                .build();

        consumer.handleScraperCommand(command);

        verify(scraperTaskService).updateScraperStatus(
                eq("npm-scraper"),
                eq("PAUSED"),
                isNull(),
                isNull(),
                isNull(),
                isNull()
        );
    }

    @Test
    void handleScraperCommand_ShouldExecuteStart_WhenCommandIsResume() {
        ScraperCommandDto command = ScraperCommandDto.builder()
                .commandType(CommandType.RESUME)
                .scraperName("maven-scraper")
                .userId(1L)
                .build();

        ScraperTaskDto scraperTask = ScraperTaskDto.builder()
                .scraperName("maven-scraper")
                .source("maven")
                .enabled(true)
                .build();

        when(scraperTaskService.getScraperByName("maven-scraper")).thenReturn(scraperTask);
        when(libraryRepository.findBySource("maven")).thenReturn(List.of());

        consumer.handleScraperCommand(command);

        verify(scraperTaskService, atLeastOnce()).updateScraperStatus(
                eq("maven-scraper"),
                anyString(),
                anyInt(),
                anyInt(),
                anyInt(),
                isNull()
        );
    }

    @Test
    void handleScraperCommand_ShouldExecuteStart_WhenCommandIsRestart() {
        ScraperCommandDto command = ScraperCommandDto.builder()
                .commandType(CommandType.RESTART)
                .scraperName("github-scraper")
                .userId(1L)
                .build();

        ScraperTaskDto scraperTask = ScraperTaskDto.builder()
                .scraperName("github-scraper")
                .source("github")
                .enabled(true)
                .build();

        when(scraperTaskService.getScraperByName("github-scraper")).thenReturn(scraperTask);
        when(libraryRepository.findBySource("github")).thenReturn(List.of());

        consumer.handleScraperCommand(command);

        verify(scraperTaskService, atLeastOnce()).updateScraperStatus(
                eq("github-scraper"),
                anyString(),
                anyInt(),
                anyInt(),
                anyInt(),
                isNull()
        );
    }

    @Test
    void handleScraperCommand_ShouldCollectPackages_WhenSourceHasPresets() {
        ScraperCommandDto command = ScraperCommandDto.builder()
                .commandType(CommandType.START)
                .scraperName("pypi-scraper")
                .userId(1L)
                .build();

        ScraperTaskDto scraperTask = ScraperTaskDto.builder()
                .scraperName("pypi-scraper")
                .source("pypi")
                .enabled(true)
                .build();

        when(scraperTaskService.getScraperByName("pypi-scraper")).thenReturn(scraperTask);
        when(libraryRepository.findBySource("pypi")).thenReturn(List.of());

        consumer.handleScraperCommand(command);

        verify(collectorService, atLeast(1)).collect(eq("pypi"), anyString());
    }

    @Test
    void handleScraperCommand_ShouldHandleExistingLibraries() {
        ScraperCommandDto command = ScraperCommandDto.builder()
                .commandType(CommandType.START)
                .scraperName("dockerhub-scraper")
                .userId(1L)
                .build();

        ScraperTaskDto scraperTask = ScraperTaskDto.builder()
                .scraperName("dockerhub-scraper")
                .source("dockerhub")
                .enabled(true)
                .build();

        Library existingLib = new Library();
        existingLib.setName("nginx");
        existingLib.setSource("dockerhub");

        when(scraperTaskService.getScraperByName("dockerhub-scraper")).thenReturn(scraperTask);
        when(libraryRepository.findBySource("dockerhub")).thenReturn(List.of(existingLib));

        consumer.handleScraperCommand(command);

        verify(collectorService, atLeast(1)).collect(eq("dockerhub"), anyString());
    }

    @Test
    void handleScraperCommand_ShouldSetErrorStatus_WhenExceptionOccurs() {
        ScraperCommandDto command = ScraperCommandDto.builder()
                .commandType(CommandType.START)
                .scraperName("failing-scraper")
                .userId(1L)
                .build();

        when(scraperTaskService.getScraperByName("failing-scraper"))
                .thenThrow(new RuntimeException("Scraper not found"));

        consumer.handleScraperCommand(command);

        verify(scraperTaskService).updateScraperStatus(
                eq("failing-scraper"),
                eq("ERROR"),
                eq(0),
                eq(0),
                eq(0),
                anyString()
        );
    }

    @Test
    void handleScraperCommand_ShouldHandleUnknownCommand() {
        ScraperCommandDto command = ScraperCommandDto.builder()
                .commandType(CommandType.UPDATE_CONFIG)
                .scraperName("test-scraper")
                .userId(1L)
                .build();

        consumer.handleScraperCommand(command);

        verify(scraperTaskService, never()).updateScraperStatus(
                anyString(), anyString(), anyInt(), anyInt(), anyInt(), anyString()
        );
    }

    @Test
    void handleScraperCommand_ShouldCompleteSuccessfully_WhenAllPackagesCollected() {
        ScraperCommandDto command = ScraperCommandDto.builder()
                .commandType(CommandType.START)
                .scraperName("npm-scraper")
                .userId(1L)
                .build();

        ScraperTaskDto scraperTask = ScraperTaskDto.builder()
                .scraperName("npm-scraper")
                .source("npm")
                .enabled(true)
                .build();

        when(scraperTaskService.getScraperByName("npm-scraper")).thenReturn(scraperTask);
        when(libraryRepository.findBySource("npm")).thenReturn(List.of());

        consumer.handleScraperCommand(command);

        ArgumentCaptor<String> statusCaptor = ArgumentCaptor.forClass(String.class);
        verify(scraperTaskService, atLeastOnce()).updateScraperStatus(
                eq("npm-scraper"),
                statusCaptor.capture(),
                anyInt(),
                anyInt(),
                anyInt(),
                isNull()
        );

        List<String> statuses = statusCaptor.getAllValues();
        assertTrue(statuses.contains("RUNNING") || statuses.contains("COMPLETED"));
    }

    @Test
    void handleScraperCommand_ShouldSetCompletedStatus_WhenNoPackagesToScan() {
        ScraperCommandDto command = ScraperCommandDto.builder()
                .commandType(CommandType.START)
                .scraperName("empty-scraper")
                .userId(1L)
                .build();

        ScraperTaskDto scraperTask = ScraperTaskDto.builder()
                .scraperName("empty-scraper")
                .source("unknown-source")
                .enabled(true)
                .build();

        when(scraperTaskService.getScraperByName("empty-scraper")).thenReturn(scraperTask);
        when(libraryRepository.findBySource("unknown-source")).thenReturn(List.of());

        consumer.handleScraperCommand(command);

        verify(scraperTaskService).updateScraperStatus(
                eq("empty-scraper"),
                eq("COMPLETED"),
                eq(100),
                eq(0),
                eq(0),
                isNull()
        );
    }
}
