package com.stackscout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

/**
 * Запрос на создание/обновление скрейпера
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateScraperTaskRequest {

    @NotBlank(message = "Имя скрейпера обязательно")
    private String scraperName;

    @NotBlank(message = "Отображаемое имя обязательно")
    private String displayName;

    @NotBlank(message = "Источник обязателен")
    private String source;

    private Boolean enabled;

    private String cronExpression;

    private String configuration;
}
