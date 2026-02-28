// File: CollectorController.java
package com.stackscout.controller;

import com.stackscout.dto.ErrorResponse;
import com.stackscout.dto.ScanRequest;
import com.stackscout.service.CollectorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Контроллер для управления процессом сбора данных (collector).
 * Обрабатывает запросы на запуск сканирования отдельных пакетов.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/collector")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Collector", description = "API запуска сбора данных из внешних источников")
public class CollectorController {

    private final CollectorService collectorService;

    /**
     * Запуск сканирования конкретных пакетов (только для ADMIN).
     * Если список packages пуст, возвращает ошибку.
     */
    @PostMapping("/scan")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Запустить сканирование пакетов", description = "Асинхронно собирает метаданные указанных пакетов")
    public ResponseEntity<?> startScan(@RequestBody ScanRequest request) {
        try {
            if (request.getSource() == null || request.getSource().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Источник (source) обязателен", LocalDateTime.now()));
            }

            List<String> packages = request.getPackages();
            if (packages == null || packages.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Список пакетов (packages) не может быть пустым", LocalDateTime.now()));
            }

            log.info("Запрос на сканирование {} пакетов из {}", packages.size(), request.getSource());

            // Асинхронная постановка в очередь RabbitMQ
            collectorService.collectBulk(request.getSource(), packages);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Сканирование поставлено в очередь");
            response.put("source", request.getSource());
            response.put("packages", packages);
            response.put("count", packages.size());
            response.put("status", "queued");
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
        } catch (Exception e) {
            log.error("Ошибка при запуске сканирования: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Ошибка при запуске сканирования: " + e.getMessage(), LocalDateTime.now()));
        }
    }

    /**
     * Синхронный сбор одного пакета (только для ADMIN).
     * Возвращает результат немедленно.
     */
    @PostMapping("/collect")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Собрать один пакет синхронно")
    public ResponseEntity<?> collectSingle(
            @RequestParam String source,
            @RequestParam String name) {
        try {
            log.info("Синхронный сбор пакета {} из {}", name, source);
            var library = collectorService.collect(source, name);

            if (library == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Пакет не найден: " + name, LocalDateTime.now()));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Пакет успешно собран");
            response.put("library", library);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Ошибка при сборе пакета {}: {}", name, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Ошибка: " + e.getMessage(), LocalDateTime.now()));
        }
    }

    /**
     * Получение статуса коллектора.
     */
    @GetMapping("/status")
    @Operation(summary = "Статус коллектора")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("collectorStatus", "active");
        status.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(status);
    }
}
