package com.stackscout.dto;

import com.stackscout.model.ModerationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

/**
 * Запрос на обновление статуса модерации библиотеки
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLibraryModerationRequest {

    @NotNull(message = "Статус модерации обязателен")
    private ModerationStatus moderationStatus;

    private String moderationNotes;
}
