package com.stackscout.service;

import com.stackscout.dto.ScraperCommandDto;

/**
 * Сервис для отправки команд скрейперам через RabbitMQ
 */
public interface ScraperCommandService {

    /**
     * Запустить скрейпер
     */
    void startScraper(String scraperName, Long userId);

    /**
     * Остановить скрейпер
     */
    void stopScraper(String scraperName, Long userId);

    /**
     * Приостановить скрейпер
     */
    void pauseScraper(String scraperName, Long userId);

    /**
     * Возобновить скрейпер
     */
    void resumeScraper(String scraperName, Long userId);

    /**
     * Перезапустить скрейпер
     */
    void restartScraper(String scraperName, Long userId);

    /**
     * Отправить команду
     */
    void sendCommand(ScraperCommandDto command);
}
