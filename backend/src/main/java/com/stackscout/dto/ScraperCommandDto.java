package com.stackscout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Команда для управления скрейпером
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScraperCommandDto {

    /**
     * Тип команды
     */
    private CommandType commandType;

    /**
     * Имя скрейпера
     */
    private String scraperName;

    /**
     * Дополнительные параметры (JSON)
     */
    private String parameters;

    /**
     * ID пользователя, инициировавшего команду
     */
    private Long userId;

    public enum CommandType {
        START,          // Запустить скрейпер
        STOP,           // Остановить скрейпер
        PAUSE,          // Приостановить скрейпер
        RESUME,         // Возобновить скрейпер
        RESTART,        // Перезапустить скрейпер
        UPDATE_CONFIG   // Обновить конфигурацию
    }
}
