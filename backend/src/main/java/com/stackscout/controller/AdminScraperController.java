package com.stackscout.controller;

import com.stackscout.dto.CreateScraperTaskRequest;
import com.stackscout.dto.ScraperTaskDto;
import com.stackscout.service.ScraperCommandService;
import com.stackscout.service.ScraperTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST контроллер для управления скрейперами (только для ADMIN)
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/scrapers")
@RequiredArgsConstructor
@Tag(name = "Admin Scrapers", description = "API управления скрейперами")
@PreAuthorize("hasRole('ADMIN')")
public class AdminScraperController {

    private final ScraperTaskService scraperTaskService;
    private final ScraperCommandService scraperCommandService;

    @GetMapping
    @Operation(summary = "Получить все скрейперы", description = "Возвращает список всех скрейперов")
    public ResponseEntity<List<ScraperTaskDto>> getAllScrapers() {
        log.debug("GET /api/admin/scrapers - получение всех скрейперов");
        return ResponseEntity.ok(scraperTaskService.getAllScrapers());
    }

    @GetMapping("/paginated")
    @Operation(summary = "Получить скрейперы с пагинацией")
    public ResponseEntity<Page<ScraperTaskDto>> getScrapers(Pageable pageable) {
        log.debug("GET /api/admin/scrapers/paginated - получение скрейперов с пагинацией");
        return ResponseEntity.ok(scraperTaskService.getScrapers(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить скрейпер по ID")
    public ResponseEntity<ScraperTaskDto> getScraperById(@PathVariable Long id) {
        log.debug("GET /api/admin/scrapers/{} - получение скрейпера", id);
        return ResponseEntity.ok(scraperTaskService.getScraperById(id));
    }

    @GetMapping("/name/{scraperName}")
    @Operation(summary = "Получить скрейпер по имени")
    public ResponseEntity<ScraperTaskDto> getScraperByName(@PathVariable String scraperName) {
        log.debug("GET /api/admin/scrapers/name/{} - получение скрейпера", scraperName);
        return ResponseEntity.ok(scraperTaskService.getScraperByName(scraperName));
    }

    @GetMapping("/active")
    @Operation(summary = "Получить активные скрейперы")
    public ResponseEntity<List<ScraperTaskDto>> getActiveScrapers() {
        log.debug("GET /api/admin/scrapers/active - получение активных скрейперов");
        return ResponseEntity.ok(scraperTaskService.getActiveScrapers());
    }

    @PostMapping
    @Operation(summary = "Создать новый скрейпер")
    public ResponseEntity<ScraperTaskDto> createScraper(@Valid @RequestBody CreateScraperTaskRequest request) {
        log.info("POST /api/admin/scrapers - создание скрейпера: {}", request.getScraperName());
        return ResponseEntity.ok(scraperTaskService.createScraper(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Обновить скрейпер")
    public ResponseEntity<ScraperTaskDto> updateScraper(
            @PathVariable Long id,
            @Valid @RequestBody CreateScraperTaskRequest request) {
        log.info("PUT /api/admin/scrapers/{} - обновление скрейпера", id);
        return ResponseEntity.ok(scraperTaskService.updateScraper(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить скрейпер")
    public ResponseEntity<Void> deleteScraper(@PathVariable Long id) {
        log.info("DELETE /api/admin/scrapers/{} - удаление скрейпера", id);
        scraperTaskService.deleteScraper(id);
        return ResponseEntity.noContent().build();
    }

    // === Команды управления скрейперами ===

    @PostMapping("/{scraperName}/start")
    @Operation(summary = "Запустить скрейпер")
    public ResponseEntity<Void> startScraper(
            @PathVariable String scraperName,
            Authentication authentication) {
        log.info("POST /api/admin/scrapers/{}/start - запуск скрейпера", scraperName);
        Long userId = getUserId(authentication);
        scraperCommandService.startScraper(scraperName, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{scraperName}/stop")
    @Operation(summary = "Остановить скрейпер")
    public ResponseEntity<Void> stopScraper(
            @PathVariable String scraperName,
            Authentication authentication) {
        log.info("POST /api/admin/scrapers/{}/stop - остановка скрейпера", scraperName);
        Long userId = getUserId(authentication);
        scraperCommandService.stopScraper(scraperName, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{scraperName}/pause")
    @Operation(summary = "Приостановить скрейпер")
    public ResponseEntity<Void> pauseScraper(
            @PathVariable String scraperName,
            Authentication authentication) {
        log.info("POST /api/admin/scrapers/{}/pause - пауза скрейпера", scraperName);
        Long userId = getUserId(authentication);
        scraperCommandService.pauseScraper(scraperName, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{scraperName}/resume")
    @Operation(summary = "Возобновить скрейпер")
    public ResponseEntity<Void> resumeScraper(
            @PathVariable String scraperName,
            Authentication authentication) {
        log.info("POST /api/admin/scrapers/{}/resume - возобновление скрейпера", scraperName);
        Long userId = getUserId(authentication);
        scraperCommandService.resumeScraper(scraperName, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{scraperName}/restart")
    @Operation(summary = "Перезапустить скрейпер")
    public ResponseEntity<Void> restartScraper(
            @PathVariable String scraperName,
            Authentication authentication) {
        log.info("POST /api/admin/scrapers/{}/restart - перезапуск скрейпера", scraperName);
        Long userId = getUserId(authentication);
        scraperCommandService.restartScraper(scraperName, userId);
        return ResponseEntity.ok().build();
    }

    private Long getUserId(Authentication authentication) {
        // TODO: Извлечь ID пользователя из токена
        return 1L; // Заглушка
    }
}
