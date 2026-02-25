package com.stackscout.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Сущность, представляющая обновление библиотеки
 */
@Entity
@Table(name = "library_updates",
        indexes = {
            @Index(name = "idx_library_update_library", columnList = "library_id"),
            @Index(name = "idx_library_update_date", columnList = "update_date")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LibraryUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "library_id", nullable = false)
    private Library library;

    @Column(name = "old_version", nullable = false, length = 50)
    private String oldVersion;

    @Column(name = "new_version", nullable = false, length = 50)
    private String newVersion;

    @Enumerated(EnumType.STRING)
    @Column(name = "update_type", nullable = false, length = 20)
    private UpdateType updateType;

    @Column(name = "change_log", columnDefinition = "TEXT")
    private String changeLog;

    @Column(name = "old_health_score")
    private Integer oldHealthScore;

    @Column(name = "new_health_score")
    private Integer newHealthScore;

    @CreationTimestamp
    @Column(name = "update_date", nullable = false, updatable = false)
    private LocalDateTime updateDate;
}
