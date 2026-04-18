package com.stackscout.service.impl;

import com.stackscout.config.RabbitMQConfig;
import com.stackscout.dto.ScraperCommandDto;
import com.stackscout.dto.ScraperCommandDto.CommandType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScraperCommandServiceImplTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    private ScraperCommandServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new ScraperCommandServiceImpl(rabbitTemplate);
    }

    @Test
    void startScraper_ShouldSendStartCommand() {
        String scraperName = "pypi-scraper";
        Long userId = 1L;

        service.startScraper(scraperName, userId);

        ArgumentCaptor<ScraperCommandDto> captor = ArgumentCaptor.forClass(ScraperCommandDto.class);
        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMQConfig.SCRAPER_COMMAND_EXCHANGE),
                eq("scraper.command." + scraperName),
                captor.capture()
        );

        ScraperCommandDto command = captor.getValue();
        assertEquals(CommandType.START, command.getCommandType());
        assertEquals(scraperName, command.getScraperName());
        assertEquals(userId, command.getUserId());
    }

    @Test
    void stopScraper_ShouldSendStopCommand() {
        String scraperName = "dockerhub-scraper";
        Long userId = 2L;

        service.stopScraper(scraperName, userId);

        ArgumentCaptor<ScraperCommandDto> captor = ArgumentCaptor.forClass(ScraperCommandDto.class);
        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMQConfig.SCRAPER_COMMAND_EXCHANGE),
                eq("scraper.command." + scraperName),
                captor.capture()
        );

        ScraperCommandDto command = captor.getValue();
        assertEquals(CommandType.STOP, command.getCommandType());
        assertEquals(scraperName, command.getScraperName());
        assertEquals(userId, command.getUserId());
    }

    @Test
    void pauseScraper_ShouldSendPauseCommand() {
        String scraperName = "npm-scraper";
        Long userId = 3L;

        service.pauseScraper(scraperName, userId);

        ArgumentCaptor<ScraperCommandDto> captor = ArgumentCaptor.forClass(ScraperCommandDto.class);
        verify(rabbitTemplate).convertAndSend(
                anyString(),
                anyString(),
                captor.capture()
        );

        ScraperCommandDto command = captor.getValue();
        assertEquals(CommandType.PAUSE, command.getCommandType());
        assertEquals(scraperName, command.getScraperName());
    }

    @Test
    void resumeScraper_ShouldSendResumeCommand() {
        String scraperName = "maven-scraper";
        Long userId = 4L;

        service.resumeScraper(scraperName, userId);

        ArgumentCaptor<ScraperCommandDto> captor = ArgumentCaptor.forClass(ScraperCommandDto.class);
        verify(rabbitTemplate).convertAndSend(
                anyString(),
                anyString(),
                captor.capture()
        );

        assertEquals(CommandType.RESUME, captor.getValue().getCommandType());
    }

    @Test
    void restartScraper_ShouldSendRestartCommand() {
        String scraperName = "github-scraper";
        Long userId = 5L;

        service.restartScraper(scraperName, userId);

        ArgumentCaptor<ScraperCommandDto> captor = ArgumentCaptor.forClass(ScraperCommandDto.class);
        verify(rabbitTemplate).convertAndSend(
                anyString(),
                anyString(),
                captor.capture()
        );

        assertEquals(CommandType.RESTART, captor.getValue().getCommandType());
    }

    @Test
    void sendCommand_ShouldSendToCorrectExchangeAndRoutingKey() {
        ScraperCommandDto command = ScraperCommandDto.builder()
                .commandType(CommandType.START)
                .scraperName("test-scraper")
                .userId(1L)
                .build();

        service.sendCommand(command);

        verify(rabbitTemplate).convertAndSend(
                RabbitMQConfig.SCRAPER_COMMAND_EXCHANGE,
                "scraper.command.test-scraper",
                command
        );
    }

    @Test
    void sendCommand_ShouldThrowException_WhenRabbitMQFails() {
        ScraperCommandDto command = ScraperCommandDto.builder()
                .commandType(CommandType.START)
                .scraperName("failing-scraper")
                .userId(1L)
                .build();

        doThrow(new RuntimeException("RabbitMQ connection failed"))
                .when(rabbitTemplate).convertAndSend(anyString(), anyString(), any(ScraperCommandDto.class));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            service.sendCommand(command);
        });

        assertTrue(exception.getMessage().contains("Не удалось отправить команду скрейперу"));
    }
}
