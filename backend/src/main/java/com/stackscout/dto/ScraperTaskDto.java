package com.stackscout.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.stackscout.model.ScraperTask.ScraperStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO для отображения информации о скрейпере
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScraperTaskDto {

    private Long id;
    private String scraperName;
    private String displayName;
    private String source;
    private ScraperStatus status;
    private Boolean enabled;
    private String cronExpression;
    private Integer progress;
    private Integer processedCount;
    private Integer totalCount;
    private Integer errorCount;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastRunAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime nextRunAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime currentRunStartedAt;

    private String lastError;
    private String configuration;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
