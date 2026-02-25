package com.stackscout.service;

import com.stackscout.dto.CreateSubscriptionRequest;
import com.stackscout.dto.LibrarySubscriptionDto;
import com.stackscout.dto.SubscriptionStatusDto;
import com.stackscout.dto.UpdateSubscriptionRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Сервис для работы с подписками на библиотеки
 */
public interface SubscriptionService {
    
    /**
     * Подписаться на библиотеку
     */
    LibrarySubscriptionDto subscribe(Long userId, CreateSubscriptionRequest request);
    
    /**
     * Отписаться от библиотеки
     */
    void unsubscribe(Long userId, Long libraryId);
    
    /**
     * Получить все подписки пользователя
     */
    Page<LibrarySubscriptionDto> getUserSubscriptions(Long userId, Pageable pageable);
    
    /**
     * Получить статус подписки на библиотеку
     */
    SubscriptionStatusDto getSubscriptionStatus(Long userId, Long libraryId);
    
    /**
     * Обновить настройки подписки (уведомления)
     */
    LibrarySubscriptionDto updateSubscription(Long userId, Long libraryId, UpdateSubscriptionRequest request);
    
    /**
     * Проверить, подписан ли пользователь на библиотеку
     */
    boolean isSubscribed(Long userId, Long libraryId);
    
    /**
     * Получить количество подписчиков библиотеки
     */
    Long getSubscribersCount(Long libraryId);
}
