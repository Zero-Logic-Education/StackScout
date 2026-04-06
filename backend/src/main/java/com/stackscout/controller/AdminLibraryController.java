package com.stackscout.controller;

import com.stackscout.dto.UpdateLibraryModerationRequest;
import com.stackscout.dto.LibraryDto;
import com.stackscout.service.LibraryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST контроллер для административного управления библиотеками
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/libraries")
@RequiredArgsConstructor
@Tag(name = "Admin Libraries", description = "API управления библиотеками для администраторов")
@PreAuthorize("hasRole('ADMIN')")
public class AdminLibraryController {

    private final LibraryService libraryService;

    @GetMapping
    @Operation(summary = "Получить все библиотеки с пагинацией")
    public ResponseEntity<Page<LibraryDto>> getAllLibraries(Pageable pageable) {
        log.debug("GET /api/admin/libraries - получение библиотек");
        return ResponseEntity.ok(libraryService.getAllLibraries(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить библиотеку по ID")
    public ResponseEntity<LibraryDto> getLibraryById(@PathVariable Long id) {
        log.debug("GET /api/admin/libraries/{}", id);
        return ResponseEntity.ok(libraryService.getLibraryById(id));
    }

    @PatchMapping("/{id}/moderation")
    @Operation(summary = "Обновить статус модерации библиотеки")
    public ResponseEntity<LibraryDto> updateModerationStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLibraryModerationRequest request) {
        log.info("PATCH /api/admin/libraries/{}/moderation", id);
        LibraryDto updated = libraryService.updateModerationStatus(id, request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/recalculate-health")
    @Operation(summary = "Пересчитать Health Score для библиотеки")
    public ResponseEntity<LibraryDto> recalculateHealthScore(@PathVariable Long id) {
        log.info("POST /api/admin/libraries/{}/recalculate-health", id);
        LibraryDto updated = libraryService.recalculateHealthScore(id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить библиотеку")
    public ResponseEntity<Void> deleteLibrary(@PathVariable Long id) {
        log.info("DELETE /api/admin/libraries/{}", id);
        libraryService.deleteLibrary(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk-normalize-licenses")
    @Operation(summary = "Массовая нормализация лицензий")
    public ResponseEntity<Map<String, Object>> bulkNormalizeLicenses() {
        log.info("POST /api/admin/libraries/bulk-normalize-licenses");
        long normalizedCount = libraryService.bulkNormalizeLicenses();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("normalizedCount", normalizedCount);
        response.put("message", "Нормализация лицензий завершена");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/remove-duplicates")
    @Operation(summary = "Удалить дубликаты библиотек")
    public ResponseEntity<Map<String, Object>> removeDuplicates() {
        log.info("DELETE /api/admin/libraries/remove-duplicates");
        long removedCount = libraryService.removeDuplicates();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("removedCount", removedCount);
        response.put("message", "Удаление дубликатов завершено");
        return ResponseEntity.ok(response);
    }
}
