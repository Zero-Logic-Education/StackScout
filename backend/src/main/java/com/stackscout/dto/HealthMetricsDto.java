package com.stackscout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO для метрик здоровья библиотеки
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthMetricsDto {
    private MetricDetailDto actuality;
    private MetricDetailDto activity;
    private MetricDetailDto repository;
    private MetricDetailDto community;
    private Integer overallScore;
}
