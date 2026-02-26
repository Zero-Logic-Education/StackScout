package com.stackscout.service.impl;

import com.stackscout.dto.CreateSubscriptionRequest;
import com.stackscout.dto.LibrarySubscriptionDto;
import com.stackscout.dto.SubscriptionStatusDto;
import com.stackscout.dto.UpdateSubscriptionRequest;
import com.stackscout.mapper.SubscriptionMapper;
import com.stackscout.model.Library;
import com.stackscout.model.LibrarySubscription;
import com.stackscout.model.User;
import com.stackscout.repository.LibraryRepository;
import com.stackscout.repository.LibrarySubscriptionRepository;
import com.stackscout.repository.UserRepository;
import com.stackscout.service.SubscriptionService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * Реализация сервиса подписок
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final LibrarySubscriptionRepository subscriptionRepository;
    private final LibraryRepository libraryRepository;
    private final UserRepository userRepository;
    private final SubscriptionMapper subscriptionMapper;

    @Override
    @Transactional
    public LibrarySubscriptionDto subscribe(Long userId, CreateSubscriptionRequest request) {
        log.info("User {} subscribing to library {}", userId, request.getLibraryId());
        
        // Проверяем, не подписан ли уже
        if (subscriptionRepository.existsByUserIdAndLibraryId(userId, request.getLibraryId())) {
            throw new IllegalStateException("User is already subscribed to this library");
        }
        
        // Проверяем существование пользователя и библиотеки
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        
        Library library = libraryRepository.findById(request.getLibraryId())
                .orElseThrow(() -> new EntityNotFoundException("Library not found with id: " + request.getLibraryId()));
        
        // Создаем подписку
        LibrarySubscription subscription = LibrarySubscription.builder()
                .user(user)
                .library(library)
                .notificationsEnabled(request.getNotificationsEnabled())
                .build();
        
        LibrarySubscription saved = subscriptionRepository.save(subscription);
        log.info("User {} successfully subscribed to library {}", userId, request.getLibraryId());
        
        return subscriptionMapper.toDto(saved);
    }

    @Override
    @Transactional
    public void unsubscribe(Long userId, Long libraryId) {
        log.info("User {} unsubscribing from library {}", userId, libraryId);
        
        if (!subscriptionRepository.existsByUserIdAndLibraryId(userId, libraryId)) {
            throw new EntityNotFoundException("Subscription not found");
        }
        
        subscriptionRepository.deleteByUserIdAndLibraryId(userId, libraryId);
        log.info("User {} successfully unsubscribed from library {}", userId, libraryId);
    }

    @Override
    public Page<LibrarySubscriptionDto> getUserSubscriptions(Long userId, Pageable pageable) {
        log.debug("Getting subscriptions for user {}", userId);
        
        Page<LibrarySubscription> subscriptions = subscriptionRepository.findByUserId(userId, pageable);
        return subscriptions.map(subscriptionMapper::toDto);
    }

    @Override
    public SubscriptionStatusDto getSubscriptionStatus(Long userId, Long libraryId) {
        log.debug("Getting subscription status for user {} and library {}", userId, libraryId);
        
        var subscription = subscriptionRepository.findByUserIdAndLibraryId(userId, libraryId);
        Long subscribersCount = subscriptionRepository.countByLibraryId(libraryId);
        
        return SubscriptionStatusDto.builder()
                .isSubscribed(subscription.isPresent())
                .subscribersCount(subscribersCount)
                .notificationsEnabled(subscription.map(LibrarySubscription::getNotificationsEnabled).orElse(false))
                .build();
    }

    @Override
    @Transactional
    public LibrarySubscriptionDto updateSubscription(Long userId, Long libraryId, UpdateSubscriptionRequest request) {
        log.info("Updating subscription for user {} and library {}", userId, libraryId);
        
        LibrarySubscription subscription = subscriptionRepository.findByUserIdAndLibraryId(userId, libraryId)
                .orElseThrow(() -> new EntityNotFoundException("Subscription not found"));
        
        subscription.setNotificationsEnabled(request.getNotificationsEnabled());
        LibrarySubscription updated = subscriptionRepository.save(subscription);
        
        log.info("Subscription updated for user {} and library {}", userId, libraryId);
        return subscriptionMapper.toDto(updated);
    }

    @Override
    public boolean isSubscribed(Long userId, Long libraryId) {
        return subscriptionRepository.existsByUserIdAndLibraryId(userId, libraryId);
    }

    @Override
    public Long getSubscribersCount(Long libraryId) {
        return subscriptionRepository.countByLibraryId(libraryId);
    }
}
