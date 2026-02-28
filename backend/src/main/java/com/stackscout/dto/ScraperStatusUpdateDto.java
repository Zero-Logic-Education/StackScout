package com.stackscout.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.stackscout.model.ScraperTask.ScraperStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Обновление статуса скрейпера (для WebSocket/SSE)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScraperStatusUpdateDto {

    private String scraperName;
    private ScraperStatus status;
    private Integer progress;
    private Integer processedCount;
    private Integer totalCount;
    private Integer errorCount;
    private String lastError;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    /**
     * Лог для отображения в реальном времени
     */
    private String logMessage;
}
