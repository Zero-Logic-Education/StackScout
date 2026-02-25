package com.stackscout.repository;

import com.stackscout.model.LibrarySubscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Репозиторий для работы с подписками на библиотеки
 */
public interface LibrarySubscriptionRepository extends JpaRepository<LibrarySubscription, Long> {
    
    /**
     * Найти подписку пользователя на конкретную библиотеку
     */
    Optional<LibrarySubscription> findByUserIdAndLibraryId(Long userId, Long libraryId);
    
    /**
     * Проверить существование подписки
     */
    boolean existsByUserIdAndLibraryId(Long userId, Long libraryId);
    
    /**
     * Получить все подписки пользователя
     */
    Page<LibrarySubscription> findByUserId(Long userId, Pageable pageable);
    
    /**
     * Получить все подписки пользователя (список)
     */
    List<LibrarySubscription> findByUserId(Long userId);
    
    /**
     * Получить количество подписчиков библиотеки
     */
    Long countByLibraryId(Long libraryId);
    
    /**
     * Получить всех подписчиков библиотеки с включенными уведомлениями
     */
    @Query("SELECT ls FROM LibrarySubscription ls WHERE ls.library.id = :libraryId AND ls.notificationsEnabled = true")
    List<LibrarySubscription> findSubscribersWithNotificationsEnabled(@Param("libraryId") Long libraryId);
    
    /**
     * Удалить подписку пользователя на библиотеку
     */
    void deleteByUserIdAndLibraryId(Long userId, Long libraryId);
}
