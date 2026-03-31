// File: LibraryController.java
package com.stackscout.controller;

import com.stackscout.dto.CreateLibraryRequest;
import com.stackscout.dto.HealthMetricsDto;
import com.stackscout.dto.LibraryDto;
import com.stackscout.dto.MetricDetailDto;
import com.stackscout.dto.UpdateLibraryRequest;
import com.stackscout.service.LibraryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;

/**
 * REST контроллер для управления библиотеками
 */
@RestController
@RequestMapping("/api/v1/libraries")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Libraries", description = "API для управления библиотеками")
public class LibraryController {

    private final LibraryService libraryService;

    /**
     * Получить список всех библиотек с поддержкой пагинации и сортировки.
     * 
     * @param page          Номер страницы (по умолчанию 0).
     * @param size          Количество элементов на странице (по умолчанию 10).
     * @param sortBy        Поле для сортировки (по умолчанию "id").
     * @param sortDirection Направление сортировки ("ASC" или "DESC").
     * @return Ответ со списком библиотек и информацией о пагинации.
     */
    @Operation(summary = "Получить все библиотеки", description = "Возвращает список всех библиотек с пагинацией")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllLibraries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        String direction = sortDirection != null ? sortDirection : "ASC";
        Sort.Direction sortDirEnum = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirEnum, sortBy));

        Page<LibraryDto> librariesPage = libraryService.getAllLibraries(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("libraries", librariesPage.getContent());
        response.put("totalElements", librariesPage.getTotalElements());
        response.put("currentPage", librariesPage.getNumber());
        response.put("pageSize", librariesPage.getSize());
        response.put("totalPages", librariesPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    /**
     * Поиск библиотеки по идентификатору.
     * 
     * @param id Уникальный идентификатор библиотеки.
     * @return Объект DTO библиотеки.
     */
    @Operation(summary = "Получить библиотеку по ID", description = "Возвращает детали конкретной библиотеки")
    @GetMapping("/{id}")
    public ResponseEntity<LibraryDto> getLibraryById(@PathVariable Long id) {
        LibraryDto library = libraryService.getLibraryById(id);
        return ResponseEntity.ok(library);
    }

    /**
     * Универсальный поиск библиотек по названию и источнику.
     * 
     * @param query  Поисковый запрос (название).
     * @param source Источник данных (например, "pypi", "npm").
     * @param page   Номер страницы.
     * @param size   Размер страницы.
     * @return Результаты поиска с пагинацией.
     */
    @Operation(summary = "Поиск библиотек", description = "Поиск библиотек по названию и/или источнику")
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchLibraries(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) Integer minHealthScore,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<LibraryDto> result;
        boolean hasMinHealthScore = minHealthScore != null && minHealthScore > 0;

        if (query != null && !query.trim().isEmpty() && source != null && !source.trim().isEmpty() && hasMinHealthScore) {
            result = libraryService.searchLibrariesBySource(query, source, minHealthScore, pageable);
        } else if (query != null && !query.trim().isEmpty() && source != null && !source.trim().isEmpty()) {
            result = libraryService.searchLibrariesBySource(query, source, pageable);
        } else if (query != null && !query.trim().isEmpty() && hasMinHealthScore) {
            result = libraryService.searchLibraries(query, minHealthScore, pageable);
        } else if (query != null && !query.trim().isEmpty()) {
            result = libraryService.searchLibraries(query, pageable);
        } else if (source != null && !source.trim().isEmpty() && hasMinHealthScore) {
            result = libraryService.getLibrariesBySource(source, minHealthScore, pageable);
        } else if (source != null && !source.trim().isEmpty()) {
            result = libraryService.getLibrariesBySource(source, pageable);
        } else if (hasMinHealthScore) {
            result = libraryService.getAllLibraries(minHealthScore, pageable);
        } else {
            result = libraryService.getAllLibraries(pageable);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("libraries", result.getContent());
        response.put("totalElements", result.getTotalElements());
        response.put("currentPage", result.getNumber());
        response.put("totalPages", result.getTotalPages());

        return ResponseEntity.ok(response);
    }

    /**
     * Создание новой записи о библиотеке.
     * 
     * @param request Объект с данными новой библиотеки.
     * @return Созданная библиотека и сообщение об успехе.
     */
    @Operation(summary = "Создать новую библиотеку", description = "Добавляет новую библиотеку в систему")
    @PostMapping
    public ResponseEntity<Map<String, Object>> createLibrary(@Valid @RequestBody CreateLibraryRequest request) {
        LibraryDto createdLibrary = libraryService.createLibrary(request);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Библиотека успешно создана");
        response.put("library", createdLibrary);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Обновление данных существующей библиотеки.
     * 
     * @param id      Идентификатор библиотеки.
     * @param request Новые данные для библиотеки.
     * @return Обновленный объект библиотеки.
     */
    @Operation(summary = "Обновить библиотеку", description = "Обновляет существующую библиотеку")
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateLibrary(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLibraryRequest request) {

        LibraryDto updatedLibrary = libraryService.updateLibrary(id, request);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Библиотека успешно обновлена");
        response.put("library", updatedLibrary);

        return ResponseEntity.ok(response);
    }

    /**
     * Удаление библиотеки из системы.
     * 
     * @param id Идентификатор удаляемой библиотеки.
     * @return Информация об успешном удалении.
     */
    @Operation(summary = "Удалить библиотеку", description = "Удаляет библиотеку из системы")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteLibrary(@PathVariable Long id) {
        libraryService.deleteLibrary(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Библиотека успешно удалена");
        response.put("id", id.toString());

        return ResponseEntity.ok(response);
    }

    /**
     * Получение метрик здоровья для конкретной библиотеки.
     *
     * @param id Идентификатор библиотеки.
     * @return Метрики здоровья библиотеки.
     */
    @Operation(summary = "Получить метрики здоровья библиотеки", description = "Возвращает детальные метрики здоровья конкретной библиотеки")
    @GetMapping("/{id}/health")
    public ResponseEntity<HealthMetricsDto> getLibraryHealth(@PathVariable Long id) {
        LibraryDto library = libraryService.getLibraryById(id);
        
        int overall = clampScore(library.getHealthScore());
        int actualityScore = calculateActualityScore(library);
        int repositoryScore = calculateRepositoryScore(library);
        int communityScore = calculateCommunityScore(library);
        int activityScore = calculateActivityScore(actualityScore, repositoryScore, communityScore, overall);

        String releaseRecency = getReleaseRecencyLabel(library.getLastRelease());
        int descriptionLength = library.getDescription() != null ? library.getDescription().trim().length() : 0;
        boolean hasRepository = library.getRepository() != null && !library.getRepository().isBlank();
        boolean hasLicense = library.getLicense() != null && !library.getLicense().isBlank();
        boolean hasDescription = descriptionLength >= 40;
        int releaseAgeDays = getReleaseAgeDays(library.getLastRelease());
        
        HealthMetricsDto healthMetrics = HealthMetricsDto.builder()
                .actuality(MetricDetailDto.builder()
                        .score(actualityScore)
                        .label("Актуальность")
                        .description("Оценивает свежесть последнего релиза")
                        .details(Map.of(
                                "lastRelease", library.getLastRelease() != null ? library.getLastRelease() : "unknown",
                                "releaseRecency", releaseRecency,
                                "releaseAgeDays", releaseAgeDays >= 0 ? releaseAgeDays : "unknown"
                        ))
                        .build())
                .activity(MetricDetailDto.builder()
                        .score(activityScore)
                        .label("Активность")
                        .description("Композитная оценка динамики проекта")
                        .details(Map.of(
                                "overallHealth", overall,
                                "basis", "actuality+repository+community"
                        ))
                        .build())
                .repository(MetricDetailDto.builder()
                        .score(repositoryScore)
                        .label("Репозиторий")
                        .description("Наличие репозитория и наполненность метаданных")
                        .details(Map.of(
                                "hasRepository", hasRepository,
                                "hasLicense", hasLicense,
                                "hasDescription", hasDescription,
                                "descriptionLength", descriptionLength
                        ))
                        .build())
                .community(MetricDetailDto.builder()
                        .score(communityScore)
                        .label("Сообщество")
                        .description("Косвенная оценка зрелости экосистемы")
                        .details(Map.of(
                                "source", library.getSource() != null ? library.getSource() : "unknown",
                                "hasRepository", hasRepository,
                                "hasLicense", hasLicense
                        ))
                        .build())
                .overallScore(overall)
                .build();
        
        return ResponseEntity.ok(healthMetrics);
    }

    private int clampScore(Integer score) {
        if (score == null) return 0;
        return Math.max(0, Math.min(100, score));
    }

    private int calculateActualityScore(LibraryDto library) {
        int days = getReleaseAgeDays(library.getLastRelease());
        if (days < 0) return 20;
        if (days <= 30) return 100;
        if (days <= 90) return 90;
        if (days <= 180) return 75;
        if (days <= 365) return 55;
        if (days <= 730) return 35;
        return 15;
    }

    private int calculateRepositoryScore(LibraryDto library) {
        int score = 0;

        if (library.getRepository() != null && !library.getRepository().isBlank()) {
            score += 60;
        }

        if (library.getLicense() != null && !library.getLicense().isBlank()) {
            score += 20;
        }

        if (library.getDescription() != null && library.getDescription().trim().length() >= 40) {
            score += 20;
        }

        return Math.min(100, score);
    }

    private int calculateCommunityScore(LibraryDto library) {
        int score = 10;

        String source = library.getSource() != null ? library.getSource().toLowerCase() : "";
        if ("npm".equals(source) || "pypi".equals(source)) {
            score += 30;
        } else if ("maven".equals(source)) {
            score += 25;
        } else {
            score += 20;
        }

        if (library.getRepository() != null && !library.getRepository().isBlank()) {
            score += 35;
        }

        if (library.getLicense() != null && !library.getLicense().isBlank()) {
            score += 25;
        }

        return Math.min(100, score);
    }

    private int calculateActivityScore(int actuality, int repository, int community, int overall) {
        double composite = actuality * 0.45 + repository * 0.25 + community * 0.15 + overall * 0.15;
        return Math.max(0, Math.min(100, (int) Math.round(composite)));
    }

    private String getReleaseRecencyLabel(String release) {
        int days = getReleaseAgeDays(release);
        if (days < 0) return "unknown";
        if (days <= 30) return "fresh";
        if (days <= 180) return "recent";
        if (days <= 365) return "aging";
        return "stale";
    }

    private int getReleaseAgeDays(String release) {
        if (release == null || release.isBlank()) return -1;

        try {
            LocalDateTime dt = LocalDateTime.parse(release);
            return (int) ChronoUnit.DAYS.between(dt.toLocalDate(), LocalDate.now());
        } catch (Exception ignored) {
            // try next format
        }

        try {
            OffsetDateTime odt = OffsetDateTime.parse(release);
            return (int) ChronoUnit.DAYS.between(odt.toLocalDate(), LocalDate.now());
        } catch (Exception ignored) {
            // try next format
        }

        try {
            LocalDate date = LocalDate.parse(release);
            return (int) ChronoUnit.DAYS.between(date, LocalDate.now());
        } catch (Exception ignored) {
            return -1;
        }
    }

    /**
     * Получение списка "здоровых" библиотек (с высоким рейтингом).
     * 
     * @param minScore Минимальный порог рейтинга (по умолчанию 80).
     * @return Список библиотек.
     */
    @Operation(summary = "Получить здоровые библиотеки", description = "Возвращает библиотеки с оценкой здоровья выше заданного порога")
    @GetMapping("/healthy")
    public ResponseEntity<List<LibraryDto>> getHealthyLibraries(
            @RequestParam(defaultValue = "80") Integer minScore) {
        List<LibraryDto> healthyLibraries = libraryService.getHealthyLibraries(minScore);
        return ResponseEntity.ok(healthyLibraries);
    }

    /**
     * Получение общей статистики по всем библиотекам в системе.
     * 
     * @return Статистика по количеству, источникам и среднему рейтингу.
     */
    @Operation(summary = "Статистика библиотек", description = "Возвращает общую статистику по библиотекам")
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Page<LibraryDto> allLibraries = libraryService.getAllLibraries(Pageable.unpaged());
        List<LibraryDto> libraries = allLibraries.getContent();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLibraries", libraries.size());
        stats.put("sources", Map.of(
                "pypi", libraries.stream().filter(l -> "pypi".equals(l.getSource())).count(),
                "npm", libraries.stream().filter(l -> "npm".equals(l.getSource())).count(),
                "dockerhub", libraries.stream().filter(l -> "dockerhub".equals(l.getSource())).count()));
        stats.put("averageHealthScore",
                libraries.stream()
                        .filter(l -> l.getHealthScore() != null)
                        .mapToInt(LibraryDto::getHealthScore)
                        .average()
                        .orElse(0.0));

        return ResponseEntity.ok(stats);
    }
}