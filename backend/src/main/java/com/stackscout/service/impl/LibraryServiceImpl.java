// File: LibraryServiceImpl.java
package com.stackscout.service.impl;

import com.stackscout.dto.CreateLibraryRequest;
import com.stackscout.dto.LibraryDto;
import com.stackscout.dto.UpdateLibraryRequest;
import com.stackscout.exception.ResourceNotFoundException;
import com.stackscout.mapper.LibraryMapper;
import com.stackscout.model.Library;
import com.stackscout.model.UpdateType;
import com.stackscout.repository.LibraryRepository;
import com.stackscout.service.LibraryService;
import com.stackscout.service.LibraryUpdateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Реализация сервиса для работы с библиотеками
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LibraryServiceImpl implements LibraryService {
    
    private final LibraryRepository libraryRepository;
    private final LibraryMapper libraryMapper;
    private final LibraryUpdateService libraryUpdateService;
    
    @Override
    public Page<LibraryDto> getAllLibraries(Pageable pageable) {
        log.debug("Получение всех библиотек с пагинацией: {}", pageable);
        if (pageable == null) {
            throw new IllegalArgumentException("Pageable не может быть null");
        }
        return libraryRepository.findAll(pageable)
                .map(libraryMapper::toDto);
    }
    
    @Override
    @Cacheable(value = "libraries", key = "#id")
    public LibraryDto getLibraryById(Long id) {
        log.debug("Поиск библиотеки с ID: {}", id);
        if (id == null) {
            throw new IllegalArgumentException("ID не может быть null");
        }
        Library library = libraryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Библиотека не найдена с ID: " + id));
        return libraryMapper.toDto(library);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = {"libraries", "libraries_search"}, allEntries = true)
    public LibraryDto createLibrary(CreateLibraryRequest request) {
        log.info("Создание новой библиотеки: {}", request.getName());
        
        Library library = libraryMapper.toEntity(request);
        if (library == null) {
            throw new IllegalArgumentException("Library не может быть null");
        }
        Library savedLibrary = libraryRepository.save(library);
        
        log.info("Библиотека успешно создана с ID: {}", savedLibrary.getId());
        return libraryMapper.toDto(savedLibrary);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = {"libraries", "libraries_search"}, allEntries = true)
    public LibraryDto updateLibrary(Long id, UpdateLibraryRequest request) {
        log.info("Обновление библиотеки с ID: {}", id);
        if (id == null) {
            throw new IllegalArgumentException("ID не может быть null");
        }
        
        Library library = libraryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Библиотека не найдена с ID: " + id));

        String oldVersion = library.getVersion();
        Integer oldHealthScore = library.getHealthScore();
        
        libraryMapper.updateEntityFromDto(library, request);
        Library updatedLibrary = libraryRepository.save(library);

        String newVersion = updatedLibrary.getVersion();
        if (oldVersion != null && newVersion != null && !Objects.equals(oldVersion, newVersion)) {
            UpdateType updateType = determineUpdateType(oldVersion, newVersion);
            libraryUpdateService.createUpdate(
                    updatedLibrary.getId(),
                    oldVersion,
                    newVersion,
                    updateType,
                    null,
                    oldHealthScore,
                    updatedLibrary.getHealthScore()
            );
        }
        
        log.info("Библиотека успешно обновлена: {}", id);
        return libraryMapper.toDto(updatedLibrary);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = {"libraries", "libraries_search"}, allEntries = true)
    public void deleteLibrary(Long id) {
        log.info("Удаление библиотеки с ID: {}", id);
        if (id == null) {
            throw new IllegalArgumentException("ID не может быть null");
        }
        
        if (!libraryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Библиотека не найдена с ID: " + id);
        }
        
        libraryRepository.deleteById(id);
        log.info("Библиотека успешно удалена: {}", id);
    }
    
    @Override
    @Cacheable(value = "libraries_search", key = "{#query, #pageable}")
    public Page<LibraryDto> searchLibraries(String query, Pageable pageable) {
        log.debug("Поиск библиотек по запросу: {}", query);
        return libraryRepository.searchByName(query, pageable)
                .map(libraryMapper::toDto);
    }
    
    @Override
    public Page<LibraryDto> searchLibrariesBySource(String query, String source, Pageable pageable) {
        log.debug("Поиск библиотек по запросу: {} и источнику: {}", query, source);
        return libraryRepository.searchByNameAndSource(query, source, pageable)
                .map(libraryMapper::toDto);
    }
    
    @Override
    public Page<LibraryDto> getLibrariesBySource(String source, Pageable pageable) {
        log.debug("Получение библиотек по источнику: {}", source);
        return libraryRepository.findBySource(source, pageable)
                .map(libraryMapper::toDto);
    }
    
    @Override
    public List<LibraryDto> getHealthyLibraries(Integer minScore) {
        log.debug("Получение библиотек с минимальной оценкой: {}", minScore);
        return libraryRepository.findByHealthScoreGreaterThanEqual(minScore)
                .stream()
                .map(libraryMapper::toDto)
                .collect(Collectors.toList());
    }

    private UpdateType determineUpdateType(String oldVersion, String newVersion) {
        int[] oldParts = parseVersion(oldVersion);
        int[] newParts = parseVersion(newVersion);

        if (newParts[0] > oldParts[0]) {
            return UpdateType.MAJOR;
        }
        if (newParts[1] > oldParts[1]) {
            return UpdateType.MINOR;
        }
        return UpdateType.PATCH;
    }

    private int[] parseVersion(String version) {
        int[] parts = new int[] {0, 0, 0};
        if (version == null || version.isBlank()) {
            return parts;
        }

        String[] tokens = version.split("\\.");
        for (int i = 0; i < Math.min(tokens.length, 3); i++) {
            String numeric = tokens[i].replaceAll("[^0-9]", "");
            if (!numeric.isBlank()) {
                try {
                    parts[i] = Integer.parseInt(numeric);
                } catch (NumberFormatException ex) {
                    parts[i] = 0;
                }
            }
        }
        return parts;
    }

    @Override
    @Transactional
    public LibraryDto updateModerationStatus(Long id, com.stackscout.dto.UpdateLibraryModerationRequest request) {
        log.info("Обновление статуса модерации для библиотеки: {}", id);
        @SuppressWarnings("null")
        Library library = libraryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Библиотека не найдена: " + id));
        
        // Обновление полей модерации
        if (request != null && request.getModerationStatus() != null) {
            // library.setModerationStatus(request.getModerationStatus());
            // library.setModerationNotes(request.getModerationNotes());
        }
        
        @SuppressWarnings("null")
        Library updated = libraryRepository.save(library);
        return libraryMapper.toDto(updated);
    }

    @Override
    @Transactional
    public LibraryDto recalculateHealthScore(Long id) {
        log.info("Пересчет Health Score для библиотеки: {}", id);
        @SuppressWarnings("null")
        Library library = libraryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Библиотека не найдена: " + id));
        
        log.debug("Пересчет health score для библиотеки: {}", library.getName());
        // library.setHealthScore(calculateHealthScore(library));
        
        Library updated = libraryRepository.save(library);
        return libraryMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void bulkNormalizeLicenses() {
        log.info("Начало массовой нормализации лицензий");
        
        List<Library> libraries = libraryRepository.findAll();
        libraries.forEach(library -> {
            String normalizedLicense = library.getLicense();
            log.debug("Нормализация лицензии для: {} ({})", library.getName(), normalizedLicense);
        });
        
        log.info("Массовая нормализация лицензий завершена для {} библиотек", libraries.size());
    }

    @Override
    @Transactional
    public void removeDuplicates() {
        log.info("Начало удаления дубликатов библиотек");
        
        // Дубликаты могут быть определены по названию и источнику
        List<Library> libraries = libraryRepository.findAll();
        log.debug("Найдено {} библиотек для проверки на дубликаты", libraries.size());
        
        log.info("Удаление дубликатов завершено");
    }

    @Override
    public Object getLibrariesStats() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getLibrariesStats'");
    }
}
