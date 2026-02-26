package com.stackscout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO для деталей метрики здоровья библиотеки
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MetricDetailDto {
    private Integer score;
    private String label;
    private String description;
    private Map<String, Object> details;
}
