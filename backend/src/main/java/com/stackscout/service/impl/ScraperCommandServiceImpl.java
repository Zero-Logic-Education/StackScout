package com.stackscout.service.impl;

import com.stackscout.config.RabbitMQConfig;
import com.stackscout.dto.ScraperCommandDto;
import com.stackscout.dto.ScraperCommandDto.CommandType;
import com.stackscout.service.ScraperCommandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

/**
 * Реализация сервиса отправки команд скрейперам
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ScraperCommandServiceImpl implements ScraperCommandService {

    private final RabbitTemplate rabbitTemplate;

    @Override
    public void startScraper(String scraperName, Long userId) {
        log.info("Отправка команды START для скрейпера: {}", scraperName);
        sendCommand(ScraperCommandDto.builder()
                .commandType(CommandType.START)
                .scraperName(scraperName)
                .userId(userId)
                .build());
    }

    @Override
    public void stopScraper(String scraperName, Long userId) {
        log.info("Отправка команды STOP для скрейпера: {}", scraperName);
        sendCommand(ScraperCommandDto.builder()
                .commandType(CommandType.STOP)
                .scraperName(scraperName)
                .userId(userId)
                .build());
    }

    @Override
    public void pauseScraper(String scraperName, Long userId) {
        log.info("Отправка команды PAUSE для скрейпера: {}", scraperName);
        sendCommand(ScraperCommandDto.builder()
                .commandType(CommandType.PAUSE)
                .scraperName(scraperName)
                .userId(userId)
                .build());
    }

    @Override
    public void resumeScraper(String scraperName, Long userId) {
        log.info("Отправка команды RESUME для скрейпера: {}", scraperName);
        sendCommand(ScraperCommandDto.builder()
                .commandType(CommandType.RESUME)
                .scraperName(scraperName)
                .userId(userId)
                .build());
    }

    @Override
    public void restartScraper(String scraperName, Long userId) {
        log.info("Отправка команды RESTART для скрейпера: {}", scraperName);
        sendCommand(ScraperCommandDto.builder()
                .commandType(CommandType.RESTART)
                .scraperName(scraperName)
                .userId(userId)
                .build());
    }

    @Override
    public void sendCommand(ScraperCommandDto command) {
        log.debug("Отправка команды в RabbitMQ: {}", command);
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.SCRAPER_COMMAND_EXCHANGE,
                    "scraper.command." + command.getScraperName(),
                    command
            );
            log.info("Команда успешно отправлена: {} для {}", 
                    command.getCommandType(), command.getScraperName());
        } catch (Exception e) {
            log.error("Ошибка отправки команды в RabbitMQ", e);
            throw new RuntimeException("Не удалось отправить команду скрейперу", e);
        }
    }
}
