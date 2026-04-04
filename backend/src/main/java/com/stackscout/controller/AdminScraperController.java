package com.stackscout.controller;

import com.stackscout.dto.CreateScraperTaskRequest;
import com.stackscout.dto.ScraperTaskDto;
import com.stackscout.dto.ScanRequest;
import com.stackscout.repository.UserRepository;
import com.stackscout.service.CollectorService;
import com.stackscout.service.ScraperCommandService;
import com.stackscout.service.ScraperTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private final CollectorService collectorService;
    private final UserRepository userRepository;

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

    /**
     * Запуск сбора конкретных пакетов для данного скрейпера.
     * Пакеты ставятся в очередь через CollectorService.
     */
    @PostMapping("/{scraperName}/scan-packages")
    @Operation(summary = "Сканировать конкретные пакеты")
    public ResponseEntity<Map<String, Object>> scanPackages(
            @PathVariable String scraperName,
            @RequestBody ScanRequest request) {
        log.info("POST /api/admin/scrapers/{}/scan-packages - сканирование {} пакетов",
                scraperName, request.getPackages() != null ? request.getPackages().size() : 0);

        if (request.getPackages() == null || request.getPackages().isEmpty()) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Список пакетов не может быть пустым");
            return ResponseEntity.badRequest().body(err);
        }

        String source = request.getSource();
        if (source == null || source.isBlank()) {
            try {
                // Берем source из конфигурации скрейпера, если он не передан в запросе.
                source = scraperTaskService.getScraperByName(scraperName).getSource();
            } catch (Exception e) {
                // Fallback по имени скрейпера для обратной совместимости.
                source = scraperName.contains("docker") ? "dockerhub" : "pypi";
            }
        }

        collectorService.collectBulk(source, request.getPackages());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Пакеты поставлены в очередь на сканирование");
        response.put("scraperName", scraperName);
        response.put("source", source);
        response.put("count", request.getPackages().size());
        response.put("packages", request.getPackages());
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    private Long getUserId(Authentication authentication) {
        if (authentication != null && authentication.getName() != null) {
            try {
                return userRepository.findByUsername(authentication.getName())
                        .map(user -> user.getId())
                        .orElse(1L);
            } catch (Exception e) {
                log.warn("Не удалось получить ID пользователя по username {}: {}", authentication.getName(), e.getMessage());
            }
        }
        return 1L;
    }
}
