package com.stackscout.mapper;

import com.stackscout.dto.LibrarySubscriptionDto;
import com.stackscout.dto.LibraryUpdateDto;
import com.stackscout.model.LibrarySubscription;
import com.stackscout.model.LibraryUpdate;
import org.springframework.stereotype.Component;

/**
 * Mapper для преобразования сущностей подписок в DTO
 */
@Component
public class SubscriptionMapper {
    
    /**
     * Преобразовать LibrarySubscription в DTO
     */
    public LibrarySubscriptionDto toDto(LibrarySubscription subscription) {
        if (subscription == null) {
            return null;
        }
        
        return LibrarySubscriptionDto.builder()
                .id(subscription.getId())
                .userId(subscription.getUser().getId())
                .libraryId(subscription.getLibrary().getId())
                .libraryName(subscription.getLibrary().getName())
                .librarySource(subscription.getLibrary().getSource())
                .subscribedAt(subscription.getSubscribedAt())
                .notificationsEnabled(subscription.getNotificationsEnabled())
                .build();
    }
    
    /**
     * Преобразовать LibraryUpdate в DTO
     */
    public LibraryUpdateDto toDto(LibraryUpdate update) {
        if (update == null) {
            return null;
        }
        
        return LibraryUpdateDto.builder()
                .id(update.getId())
                .libraryId(update.getLibrary().getId())
                .libraryName(update.getLibrary().getName())
                .librarySource(update.getLibrary().getSource())
                .oldVersion(update.getOldVersion())
                .newVersion(update.getNewVersion())
                .updateType(update.getUpdateType())
                .changeLog(update.getChangeLog())
                .oldHealthScore(update.getOldHealthScore())
                .newHealthScore(update.getNewHealthScore())
                .updateDate(update.getUpdateDate())
                .build();
    }
}
