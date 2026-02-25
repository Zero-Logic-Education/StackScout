package com.stackscout.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request для создания подписки
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSubscriptionRequest {
    
    @NotNull(message = "Library ID is required")
    private Long libraryId;
    
    @Builder.Default
    private Boolean notificationsEnabled = true;
}
