package com.stackscout.repository;

import com.stackscout.model.LibraryUpdate;
import com.stackscout.model.UpdateType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Репозиторий для работы с обновлениями библиотек
 */
public interface LibraryUpdateRepository extends JpaRepository<LibraryUpdate, Long> {
    
    /**
     * Получить все обновления конкретной библиотеки
     */
    Page<LibraryUpdate> findByLibraryIdOrderByUpdateDateDesc(Long libraryId, Pageable pageable);
    
    /**
     * Получить обновления для библиотек, на которые подписан пользователь
     */
    @Query("SELECT lu FROM LibraryUpdate lu " +
           "WHERE lu.library.id IN " +
           "(SELECT ls.library.id FROM LibrarySubscription ls WHERE ls.user.id = :userId) " +
           "ORDER BY lu.updateDate DESC")
    Page<LibraryUpdate> findUpdatesForUserSubscriptions(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * Получить обновления по типу
     */
    Page<LibraryUpdate> findByUpdateTypeOrderByUpdateDateDesc(UpdateType updateType, Pageable pageable);
    
    /**
     * Получить последние обновления для библиотек пользователя после определенной даты
     */
    @Query("SELECT lu FROM LibraryUpdate lu " +
           "WHERE lu.library.id IN " +
           "(SELECT ls.library.id FROM LibrarySubscription ls WHERE ls.user.id = :userId) " +
           "AND lu.updateDate > :since " +
           "ORDER BY lu.updateDate DESC")
    List<LibraryUpdate> findRecentUpdatesForUser(@Param("userId") Long userId, 
                                                   @Param("since") LocalDateTime since);
    
    /**
     * Получить последнее обновление библиотеки
     */
    @Query("SELECT lu FROM LibraryUpdate lu WHERE lu.library.id = :libraryId " +
           "ORDER BY lu.updateDate DESC LIMIT 1")
    LibraryUpdate findLatestUpdateByLibraryId(@Param("libraryId") Long libraryId);
    
    /**
     * Получить количество обновлений библиотеки за период
     */
    @Query("SELECT COUNT(lu) FROM LibraryUpdate lu " +
           "WHERE lu.library.id = :libraryId " +
           "AND lu.updateDate BETWEEN :startDate AND :endDate")
    Long countUpdatesByLibraryAndDateRange(@Param("libraryId") Long libraryId,
                                            @Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);
}
