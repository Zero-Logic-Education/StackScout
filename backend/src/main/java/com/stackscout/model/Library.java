// File: Library.java
package com.stackscout.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Сущность, представляющая библиотеку или пакет в системе.
 * Содержит информацию о названии, версии, источнике, лицензии и рейтинге
 * здоровья.
 */
@Entity
@Table(name = "libraries", indexes = {
        @Index(name = "idx_library_name", columnList = "name"),
        @Index(name = "idx_library_source", columnList = "source"),
        @Index(name = "idx_library_health_score", columnList = "health_score")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Library {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 50)
    private String version;

    @Column(nullable = false, length = 50)
    private String source; // pypi, npm, dockerhub

    @Column(name = "license_name", length = 100)
    private String license;

    @Column(name = "health_score")
    private Integer healthScore;

    @Column(name = "last_release", length = 50)
    private String lastRelease;

    @Column(length = 500)
    private String repository;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "moderation_status", length = 50)
    @Builder.Default
    private ModerationStatus moderationStatus = ModerationStatus.PENDING;

    @Column(name = "moderated_by")
    private Long moderatedBy;

    @Column(name = "moderated_at")
    private LocalDateTime moderatedAt;

    @Column(name = "moderation_notes", columnDefinition = "TEXT")
    private String moderationNotes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
