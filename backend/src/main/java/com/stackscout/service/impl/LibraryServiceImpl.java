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
import com.stackscout.service.LicenseService;
import com.stackscout.service.LibraryService;
import com.stackscout.service.LibraryUpdateService;
import com.stackscout.source.SourceRegistryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import io.micrometer.core.annotation.Timed;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.HashSet;
import java.util.Set;
import java.util.function.Function;
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
    private final SourceRegistryService sourceRegistryService;
    private final LicenseService licenseService;
    
    @Override
    @Timed(value = "stackscout.library.operation", extraTags = {"operation", "get_all"})
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
    @Timed(value = "stackscout.library.operation", extraTags = {"operation", "get_by_id"})
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
    @Timed(value = "stackscout.library.operation", extraTags = {"operation", "create"})
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
    @Timed(value = "stackscout.library.operation", extraTags = {"operation", "update"})
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
    @Timed(value = "stackscout.library.operation", extraTags = {"operation", "delete"})
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
    @Timed(value = "stackscout.library.operation", extraTags = {"operation", "search"})
    public Page<LibraryDto> searchLibraries(String query, Pageable pageable) {
        log.debug("Поиск библиотек по запросу: {}", query);
        return libraryRepository.searchByName(query, pageable)
                .map(libraryMapper::toDto);
    }

    @Override
    @Timed(value = "stackscout.library.operation", extraTags = {"operation", "search_with_score"})
    public Page<LibraryDto> searchLibraries(String query, Integer minScore, Pageable pageable) {
        log.debug("Поиск библиотек по запросу: {} с минимальной оценкой: {}", query, minScore);
        return libraryRepository.searchByNameAndMinScore(query, minScore, pageable)
                .map(libraryMapper::toDto);
    }
    
    @Override
    @Timed(value = "stackscout.library.operation", extraTags = {"operation", "search_by_source"})
    public Page<LibraryDto> searchLibrariesBySource(String query, String source, Pageable pageable) {
        log.debug("Поиск библиотек по запросу: {} и источнику: {}", query, source);
        return libraryRepository.searchByNameAndSource(query, source, pageable)
                .map(libraryMapper::toDto);
    }

    @Override
    @Timed(value = "stackscout.library.operation", extraTags = {"operation", "search_by_source_with_score"})
    public Page<LibraryDto> searchLibrariesBySource(String query, String source, Integer minScore, Pageable pageable) {
        log.debug("Поиск библиотек по запросу: {}, источнику: {} и минимальной оценке: {}", query, source, minScore);
        return libraryRepository.searchByNameAndSourceAndMinScore(query, source, minScore, pageable)
                .map(libraryMapper::toDto);
    }
    
    @Override
    @Timed(value = "stackscout.library.operation", extraTags = {"operation", "get_by_source"})
    public Page<LibraryDto> getLibrariesBySource(String source, Pageable pageable) {
        log.debug("Получение библиотек по источнику: {}", source);
        return libraryRepository.findBySource(source, pageable)
                .map(libraryMapper::toDto);
    }

    @Override
    @Timed(value = "stackscout.library.operation", extraTags = {"operation", "get_by_source_with_score"})
    public Page<LibraryDto> getLibrariesBySource(String source, Integer minScore, Pageable pageable) {
        log.debug("Получение библиотек по источнику: {} и минимальной оценке: {}", source, minScore);
        return libraryRepository.findBySourceAndHealthScoreGreaterThanEqual(source, minScore, pageable)
                .map(libraryMapper::toDto);
    }

    @Override
    @Timed(value = "stackscout.library.operation", extraTags = {"operation", "get_all_with_score"})
    public Page<LibraryDto> getAllLibraries(Integer minScore, Pageable pageable) {
        log.debug("Получение всех библиотек с минимальной оценкой: {}", minScore);
        return libraryRepository.findByHealthScoreGreaterThanEqual(minScore, pageable)
                .map(libraryMapper::toDto);
    }
    
    @Override
    @Timed(value = "stackscout.library.operation", extraTags = {"operation", "get_healthy"})
    public List<LibraryDto> getHealthyLibraries(Integer minScore) {
        log.debug("Получение библиотек с минимальной оценкой: {}", minScore);
        return libraryRepository.findByHealthScoreGreaterThanEqual(minScore)
                .stream()
                .map(libraryMapper::toDto)
            .toList();
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
            String numeric = tokens[i].replaceAll("\\D", "");
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
    @Timed(value = "stackscout.library.operation", extraTags = {"operation", "update_moderation"})
    public LibraryDto updateModerationStatus(Long id, com.stackscout.dto.UpdateLibraryModerationRequest request) {
        log.info("Обновление статуса модерации для библиотеки: {}", id);
        @SuppressWarnings("null")
        Library library = libraryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Библиотека не найдена: " + id));
        
        @SuppressWarnings("null")
        Library updated = libraryRepository.save(library);
        return libraryMapper.toDto(updated);
    }

    @Override
    @Transactional
    @Timed(value = "stackscout.library.operation", extraTags = {"operation", "recalculate_health"})
    public LibraryDto recalculateHealthScore(Long id) {
        log.info("Пересчет Health Score для библиотеки: {}", id);
        @SuppressWarnings("null")
        Library library = libraryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Библиотека не найдена: " + id));
        
        log.debug("Пересчет health score для библиотеки: {}", library.getName());
        Library updated = libraryRepository.save(library);
        return libraryMapper.toDto(updated);
    }

    @Override
    @Transactional
    @Timed(value = "stackscout.library.operation", extraTags = {"operation", "bulk_normalize_licenses"})
    public long bulkNormalizeLicenses() {
        log.info("Начало массовой нормализации лицензий");
        
        List<Library> libraries = libraryRepository.findAll();
        long normalizedCount = 0;

        for (Library library : libraries) {
            String currentLicense = library.getLicense();
            String normalizedLicense = licenseService.normalizeLicense(currentLicense);

            if (!Objects.equals(currentLicense, normalizedLicense)) {
                library.setLicense(normalizedLicense);
                libraryRepository.save(library);
                normalizedCount++;
                log.debug("Нормализация лицензии для: {} ({} -> {})", library.getName(), currentLicense, normalizedLicense);
            }
        }
        
        log.info("Массовая нормализация лицензий завершена: изменено {} из {} библиотек", normalizedCount, libraries.size());
        return normalizedCount;
    }

    @Override
    @Transactional
    @Timed(value = "stackscout.library.operation", extraTags = {"operation", "remove_duplicates"})
    public long removeDuplicates() {
        log.info("Начало удаления дубликатов библиотек");
        
        // Дубликаты могут быть определены по названию и источнику
        List<Library> libraries = libraryRepository.findAll().stream()
            .sorted((a, b) -> Long.compare(a.getId(), b.getId()))
            .toList();

        Set<String> seen = new HashSet<>();
        List<Library> duplicates = new java.util.ArrayList<>();

        for (Library library : libraries) {
            String key = (library.getName() == null ? "" : library.getName().trim().toLowerCase())
                + "|" + (library.getSource() == null ? "" : library.getSource().trim().toLowerCase())
                + "|" + (library.getVersion() == null ? "" : library.getVersion().trim().toLowerCase());

            if (!seen.add(key)) {
                duplicates.add(library);
            }
        }

        if (!duplicates.isEmpty()) {
            libraryRepository.deleteAll(duplicates);
        }

        log.debug("Найдено {} библиотек для проверки на дубликаты", libraries.size());
        log.info("Удаление дубликатов завершено: удалено {} записей", duplicates.size());
        return duplicates.size();
    }

    @Override
    public Object getLibrariesStats() {
        List<Library> libraries = libraryRepository.findAll();

        Map<String, Long> sources = libraries.stream()
            .map(Library::getSource)
            .map(this::normalizeSource)
            .filter(Objects::nonNull)
            .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLibraries", (long) libraries.size());
        stats.put("sources", sources);
        stats.put(
            "averageHealthScore",
            libraries.stream()
                .map(Library::getHealthScore)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0));

        return stats;
    }

    private String normalizeSource(String source) {
        if (source == null || source.isBlank()) {
            return null;
        }

        try {
            return sourceRegistryService.normalize(source);
        } catch (IllegalArgumentException ignored) {
            return source.trim().toLowerCase();
        }
    }
}
