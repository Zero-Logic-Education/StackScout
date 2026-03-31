// File: LibraryService.java
package com.stackscout.service;

import com.stackscout.dto.CreateLibraryRequest;
import com.stackscout.dto.LibraryDto;
import com.stackscout.dto.UpdateLibraryRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Сервис для работы с библиотеками
 */
public interface LibraryService {
    
    /**
     * Получить все библиотеки с пагинацией
     */
    Page<LibraryDto> getAllLibraries(Pageable pageable);
    
    /**
     * Получить библиотеку по ID
     */
    LibraryDto getLibraryById(Long id);
    
    /**
     * Создать новую библиотеку
     */
    LibraryDto createLibrary(CreateLibraryRequest request);
    
    /**
     * Обновить существующую библиотеку
     */
    LibraryDto updateLibrary(Long id, UpdateLibraryRequest request);
    
    /**
     * Удалить библиотеку
     */
    void deleteLibrary(Long id);
    
    /**
     * Поиск библиотек по имени
     */
    Page<LibraryDto> searchLibraries(String query, Pageable pageable);

    /**
     * Поиск библиотек по имени с минимальной оценкой здоровья
     */
    Page<LibraryDto> searchLibraries(String query, Integer minScore, Pageable pageable);
    
    /**
     * Поиск библиотек по имени и источнику
     */
    Page<LibraryDto> searchLibrariesBySource(String query, String source, Pageable pageable);

    /**
     * Поиск библиотек по имени и источнику с минимальной оценкой здоровья
     */
    Page<LibraryDto> searchLibrariesBySource(String query, String source, Integer minScore, Pageable pageable);
    
    /**
     * Получить библиотеки по источнику
     */
    Page<LibraryDto> getLibrariesBySource(String source, Pageable pageable);

    /**
     * Получить библиотеки по источнику с минимальной оценкой здоровья
     */
    Page<LibraryDto> getLibrariesBySource(String source, Integer minScore, Pageable pageable);

    /**
     * Получить все библиотеки с минимальной оценкой здоровья
     */
    Page<LibraryDto> getAllLibraries(Integer minScore, Pageable pageable);
    
    /**
     * Получить библиотеки с минимальной оценкой здоровья
     */
    List<LibraryDto> getHealthyLibraries(Integer minScore);
    
    /**
     * Обновить статус модерации библиотеки
     */
    LibraryDto updateModerationStatus(Long id, com.stackscout.dto.UpdateLibraryModerationRequest request);
    
    /**
     * Пересчитать Health Score для библиотеки
     */
    LibraryDto recalculateHealthScore(Long id);
    
    /**
     * Массовая нормализация лицензий
     */
    void bulkNormalizeLicenses();
    
    /**
     * Удалить дубликаты библиотек
     */
    void removeDuplicates();

	Object getLibrariesStats();
}
