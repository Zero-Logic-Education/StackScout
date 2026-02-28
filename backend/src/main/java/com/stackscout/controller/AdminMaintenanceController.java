package com.stackscout.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST контроллер для регламентных работ
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/maintenance")
@RequiredArgsConstructor
@Tag(name = "Admin Maintenance", description = "API для регламентных работ")
@PreAuthorize("hasRole('ADMIN')")
public class AdminMaintenanceController {

    private final CacheManager cacheManager;

    @PostMapping("/clear-cache")
    @Operation(summary = "Очистить кэш", description = "Очищает все кэши Redis")
    public ResponseEntity<Map<String, Object>> clearCache() {
        log.info("POST /api/admin/maintenance/clear-cache");
        
        int clearedCaches = 0;
        for (String cacheName : cacheManager.getCacheNames()) {
            @SuppressWarnings("null")
            var cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
                clearedCaches++;
                log.info("Кэш очищен: {}", cacheName);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("clearedCaches", clearedCaches);
        response.put("message", "Кэши успешно очищены");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/cache-stats")
    @Operation(summary = "Статистика кэша")
    public ResponseEntity<Map<String, Object>> getCacheStats() {
        log.debug("GET /api/admin/maintenance/cache-stats");

        Map<String, Object> stats = new HashMap<>();
        stats.put("cacheNames", cacheManager.getCacheNames());
        
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/health-check")
    @Operation(summary = "Проверка здоровья системы")
    public ResponseEntity<Map<String, String>> healthCheck() {
        log.debug("POST /api/admin/maintenance/health-check");
        
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", java.time.LocalDateTime.now().toString());
        
        return ResponseEntity.ok(health);
    }
}
