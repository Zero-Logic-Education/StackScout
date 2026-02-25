package com.stackscout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO для статуса подписки пользователя на библиотеку
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionStatusDto {
    
    private Boolean isSubscribed;
    private Long subscribersCount;
    private Boolean notificationsEnabled;
}
