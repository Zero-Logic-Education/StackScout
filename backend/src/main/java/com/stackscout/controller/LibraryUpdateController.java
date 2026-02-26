package com.stackscout.controller;

import com.stackscout.dto.LibraryUpdateDto;
import com.stackscout.model.UpdateType;
import com.stackscout.model.User;
import com.stackscout.service.LibraryUpdateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST контроллер для получения обновлений библиотек
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/library-updates")
@RequiredArgsConstructor
@Tag(name = "Library Updates", description = "API для получения обновлений библиотек")
public class LibraryUpdateController {

    private final LibraryUpdateService updateService;

    @GetMapping
    @Operation(summary = "Получить обновления для подписанных библиотек")
    public ResponseEntity<Page<LibraryUpdateDto>> getUpdatesForUser(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("updateDate").descending());
        Page<LibraryUpdateDto> updates = updateService.getUpdatesForUser(user.getId(), pageable);
        
        return ResponseEntity.ok(updates);
    }

    @GetMapping("/library/{libraryId}")
    @Operation(summary = "Получить историю обновлений конкретной библиотеки")
    public ResponseEntity<Page<LibraryUpdateDto>> getLibraryUpdates(
            @PathVariable Long libraryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("updateDate").descending());
        Page<LibraryUpdateDto> updates = updateService.getLibraryUpdates(libraryId, pageable);
        
        return ResponseEntity.ok(updates);
    }

    @GetMapping("/recent")
    @Operation(summary = "Получить последние обновления за N дней")
    public ResponseEntity<List<LibraryUpdateDto>> getRecentUpdates(
            @RequestParam(defaultValue = "7") Integer days,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        List<LibraryUpdateDto> updates = updateService.getRecentUpdatesForUser(user.getId(), days);
        
        return ResponseEntity.ok(updates);
    }

    @GetMapping("/by-type")
    @Operation(summary = "Получить обновления по типу")
    public ResponseEntity<Page<LibraryUpdateDto>> getUpdatesByType(
            @RequestParam UpdateType updateType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("updateDate").descending());
        Page<LibraryUpdateDto> updates = updateService.getUpdatesByType(updateType, pageable);
        
        return ResponseEntity.ok(updates);
    }

    @GetMapping("/library/{libraryId}/latest")
    @Operation(summary = "Получить последнее обновление библиотеки")
    public ResponseEntity<LibraryUpdateDto> getLatestUpdate(@PathVariable Long libraryId) {
        LibraryUpdateDto update = updateService.getLatestUpdate(libraryId);
        
        if (update == null) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(update);
    }

    @GetMapping("/stats")
    @Operation(summary = "Получить статистику обновлений")
    public ResponseEntity<Map<String, Object>> getUpdateStats(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        // Получаем последние обновления за разные периоды
        List<LibraryUpdateDto> last7Days = updateService.getRecentUpdatesForUser(user.getId(), 7);
        List<LibraryUpdateDto> last30Days = updateService.getRecentUpdatesForUser(user.getId(), 30);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("last7Days", last7Days.size());
        stats.put("last30Days", last30Days.size());
        stats.put("recentUpdates", last7Days);
        
        return ResponseEntity.ok(stats);
    }
}
