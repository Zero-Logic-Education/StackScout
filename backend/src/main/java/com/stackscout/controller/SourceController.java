package com.stackscout.controller;

import com.stackscout.source.SourceDefinition;
import com.stackscout.source.SourceRegistryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sources")
@RequiredArgsConstructor
@Tag(name = "Sources", description = "API доступных источников данных")
public class SourceController {

    private final SourceRegistryService sourceRegistryService;

    @GetMapping
    @Operation(summary = "Получить список источников", description = "Возвращает доступные источники парсинга и их метаданные")
    public ResponseEntity<List<SourceDefinition>> getSources() {
        return ResponseEntity.ok(sourceRegistryService.getSources());
    }
}