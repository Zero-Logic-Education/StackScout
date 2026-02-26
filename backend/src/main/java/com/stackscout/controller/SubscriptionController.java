package com.stackscout.controller;

import com.stackscout.dto.CreateSubscriptionRequest;
import com.stackscout.dto.LibrarySubscriptionDto;
import com.stackscout.dto.SubscriptionStatusDto;
import com.stackscout.dto.UpdateSubscriptionRequest;
import com.stackscout.model.User;
import com.stackscout.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST контроллер для управления подписками на библиотеки
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
@Tag(name = "Subscriptions", description = "API для управления подписками на библиотеки")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping("/{libraryId}")
    @Operation(summary = "Подписаться на библиотеку")
    public ResponseEntity<Map<String, Object>> subscribe(
            @PathVariable Long libraryId,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        
        CreateSubscriptionRequest request = CreateSubscriptionRequest.builder()
                .libraryId(libraryId)
                .notificationsEnabled(true)
                .build();
        
        LibrarySubscriptionDto subscription = subscriptionService.subscribe(user.getId(), request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Successfully subscribed to library");
        response.put("subscription", subscription);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{libraryId}")
    @Operation(summary = "Отписаться от библиотеки")
    public ResponseEntity<Map<String, Object>> unsubscribe(
            @PathVariable Long libraryId,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        subscriptionService.unsubscribe(user.getId(), libraryId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Successfully unsubscribed from library");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Получить все подписки пользователя")
    public ResponseEntity<Page<LibrarySubscriptionDto>> getUserSubscriptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "subscribedAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        
        Sort sort = sortDirection.equalsIgnoreCase("ASC") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<LibrarySubscriptionDto> subscriptions = subscriptionService.getUserSubscriptions(user.getId(), pageable);
        
        return ResponseEntity.ok(subscriptions);
    }

    @GetMapping("/{libraryId}/status")
    @Operation(summary = "Получить статус подписки на библиотеку")
    public ResponseEntity<SubscriptionStatusDto> getSubscriptionStatus(
            @PathVariable Long libraryId,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        SubscriptionStatusDto status = subscriptionService.getSubscriptionStatus(user.getId(), libraryId);
        
        return ResponseEntity.ok(status);
    }

    @PutMapping("/{libraryId}/notifications")
    @Operation(summary = "Включить/выключить уведомления для подписки")
    public ResponseEntity<LibrarySubscriptionDto> updateNotifications(
            @PathVariable Long libraryId,
            @Valid @RequestBody UpdateSubscriptionRequest request,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        LibrarySubscriptionDto updated = subscriptionService.updateSubscription(
                user.getId(), libraryId, request);
        
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/count/{libraryId}")
    @Operation(summary = "Получить количество подписчиков библиотеки")
    public ResponseEntity<Map<String, Long>> getSubscribersCount(@PathVariable Long libraryId) {
        Long count = subscriptionService.getSubscribersCount(libraryId);
        
        Map<String, Long> response = new HashMap<>();
        response.put("subscribersCount", count);
        
        return ResponseEntity.ok(response);
    }
}
