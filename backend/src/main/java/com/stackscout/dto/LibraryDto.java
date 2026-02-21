package com.stackscout.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Объект передачи данных (DTO) для представления информации о библиотеке в
 * ответах API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LibraryDto {

    private Long id;
    private String name;
    private String version;
    private String source;
    private String license;
    private Integer healthScore;
    private String lastRelease;
    private String repository;
    private String description;
    private String createdAt;
    private String updatedAt;
}
