package com.stackscout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO для подписки на библиотеку
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LibrarySubscriptionDto {
    
    private Long id;
    private Long userId;
    private Long libraryId;
    private String libraryName;
    private String librarySource;
    private LocalDateTime subscribedAt;
    private Boolean notificationsEnabled;
}
