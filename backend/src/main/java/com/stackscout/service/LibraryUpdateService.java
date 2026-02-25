package com.stackscout.service;

import com.stackscout.dto.LibraryUpdateDto;
import com.stackscout.model.UpdateType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Сервис для работы с обновлениями библиотек
 */
public interface LibraryUpdateService {
    
    /**
     * Получить обновления для подписок пользователя
     */
    Page<LibraryUpdateDto> getUpdatesForUser(Long userId, Pageable pageable);
    
    /**
     * Получить историю обновлений конкретной библиотеки
     */
    Page<LibraryUpdateDto> getLibraryUpdates(Long libraryId, Pageable pageable);
    
    /**
     * Получить последние обновления для пользователя (за последние N дней)
     */
    List<LibraryUpdateDto> getRecentUpdatesForUser(Long userId, Integer days);
    
    /**
     * Получить обновления по типу
     */
    Page<LibraryUpdateDto> getUpdatesByType(UpdateType updateType, Pageable pageable);
    
    /**
     * Создать запись об обновлении библиотеки
     * (вызывается автоматически при обновлении библиотеки)
     */
    LibraryUpdateDto createUpdate(Long libraryId, String oldVersion, String newVersion, 
                                   UpdateType updateType, String changeLog,
                                   Integer oldHealthScore, Integer newHealthScore);
    
    /**
     * Получить последнее обновление библиотеки
     */
    LibraryUpdateDto getLatestUpdate(Long libraryId);
}
