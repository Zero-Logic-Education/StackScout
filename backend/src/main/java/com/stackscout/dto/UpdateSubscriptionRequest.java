package com.stackscout.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request для обновления настроек подписки
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSubscriptionRequest {
    
    @NotNull(message = "Notifications enabled flag is required")
    private Boolean notificationsEnabled;
}
