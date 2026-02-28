package com.stackscout.mapper;

import com.stackscout.dto.ScraperTaskDto;
import com.stackscout.model.ScraperTask;
import org.springframework.stereotype.Component;

/**
 * Маппер для ScraperTask
 */
@Component
public class ScraperTaskMapper {

    public ScraperTaskDto toDto(ScraperTask entity) {
        if (entity == null) {
            return null;
        }

        return ScraperTaskDto.builder()
                .id(entity.getId())
                .scraperName(entity.getScraperName())
                .displayName(entity.getDisplayName())
                .source(entity.getSource())
                .status(entity.getStatus())
                .enabled(entity.getEnabled())
                .cronExpression(entity.getCronExpression())
                .progress(entity.getProgress())
                .processedCount(entity.getProcessedCount())
                .totalCount(entity.getTotalCount())
                .errorCount(entity.getErrorCount())
                .lastRunAt(entity.getLastRunAt())
                .nextRunAt(entity.getNextRunAt())
                .currentRunStartedAt(entity.getCurrentRunStartedAt())
                .lastError(entity.getLastError())
                .configuration(entity.getConfiguration())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public ScraperTask toEntity(ScraperTaskDto dto) {
        if (dto == null) {
            return null;
        }

        return ScraperTask.builder()
                .id(dto.getId())
                .scraperName(dto.getScraperName())
                .displayName(dto.getDisplayName())
                .source(dto.getSource())
                .status(dto.getStatus())
                .enabled(dto.getEnabled())
                .cronExpression(dto.getCronExpression())
                .progress(dto.getProgress())
                .processedCount(dto.getProcessedCount())
                .totalCount(dto.getTotalCount())
                .errorCount(dto.getErrorCount())
                .lastRunAt(dto.getLastRunAt())
                .nextRunAt(dto.getNextRunAt())
                .currentRunStartedAt(dto.getCurrentRunStartedAt())
                .lastError(dto.getLastError())
                .configuration(dto.getConfiguration())
                .build();
    }
}
