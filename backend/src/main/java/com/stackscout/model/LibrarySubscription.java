package com.stackscout.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Сущность подписки пользователя на библиотеку
 */
@Entity
@Table(name = "library_subscriptions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "library_id"}),
        indexes = {
            @Index(name = "idx_subscription_user", columnList = "user_id"),
            @Index(name = "idx_subscription_library", columnList = "library_id")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LibrarySubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "library_id", nullable = false)
    private Library library;

    @CreationTimestamp
    @Column(name = "subscribed_at", nullable = false, updatable = false)
    private LocalDateTime subscribedAt;

    @Column(name = "notifications_enabled", nullable = false)
    @Builder.Default
    private Boolean notificationsEnabled = true;
}
