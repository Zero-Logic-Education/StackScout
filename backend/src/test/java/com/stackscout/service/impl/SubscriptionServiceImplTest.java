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
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit тесты для SubscriptionServiceImpl
 */
@ExtendWith(MockitoExtension.class)
class SubscriptionServiceImplTest {

    @Mock
    private LibrarySubscriptionRepository subscriptionRepository;

    @Mock
    private LibraryRepository libraryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SubscriptionMapper subscriptionMapper;

    @InjectMocks
    private SubscriptionServiceImpl subscriptionService;

    private User testUser;
    private Library testLibrary;
    private LibrarySubscription testSubscription;
    private LibrarySubscriptionDto testSubscriptionDto;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        testLibrary = new Library();
        testLibrary.setId(1L);
        testLibrary.setName("requests");
        testLibrary.setSource("pypi");

        testSubscription = LibrarySubscription.builder()
                .id(1L)
                .user(testUser)
                .library(testLibrary)
                .notificationsEnabled(true)
                .build();

        testSubscriptionDto = new LibrarySubscriptionDto();
        testSubscriptionDto.setId(1L);
        testSubscriptionDto.setLibraryId(1L);
        testSubscriptionDto.setLibraryName("requests");
        testSubscriptionDto.setNotificationsEnabled(true);
    }

    @Test
    void subscribe_ShouldCreateSubscription() {
        // Given
        CreateSubscriptionRequest request = new CreateSubscriptionRequest();
        request.setLibraryId(1L);
        request.setNotificationsEnabled(true);

        when(subscriptionRepository.existsByUserIdAndLibraryId(1L, 1L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(libraryRepository.findById(1L)).thenReturn(Optional.of(testLibrary));
        when(subscriptionRepository.save(any(LibrarySubscription.class))).thenReturn(testSubscription);
        when(subscriptionMapper.toDto(testSubscription)).thenReturn(testSubscriptionDto);

        // When
        LibrarySubscriptionDto result = subscriptionService.subscribe(1L, request);

        // Then
        assertNotNull(result);
        assertEquals("requests", result.getLibraryName());
        assertTrue(result.getNotificationsEnabled());
        verify(subscriptionRepository).save(any(LibrarySubscription.class));
    }

    @Test
    void subscribe_WhenAlreadySubscribed_ShouldThrowException() {
        CreateSubscriptionRequest request = new CreateSubscriptionRequest();
        request.setLibraryId(1L);

        when(subscriptionRepository.existsByUserIdAndLibraryId(1L, 1L)).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> subscriptionService.subscribe(1L, request));
        verify(subscriptionRepository, never()).save(any());
    }

    @Test
    void subscribe_WhenUserNotFound_ShouldThrowEntityNotFoundException() {
        CreateSubscriptionRequest request = new CreateSubscriptionRequest();
        request.setLibraryId(1L);

        when(subscriptionRepository.existsByUserIdAndLibraryId(1L, 1L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> subscriptionService.subscribe(1L, request));
    }

    @Test
    void subscribe_WhenLibraryNotFound_ShouldThrowEntityNotFoundException() {
        CreateSubscriptionRequest request = new CreateSubscriptionRequest();
        request.setLibraryId(1L);

        when(subscriptionRepository.existsByUserIdAndLibraryId(1L, 1L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(libraryRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> subscriptionService.subscribe(1L, request));
    }

    @Test
    void unsubscribe_ShouldDeleteSubscription() {
        when(subscriptionRepository.existsByUserIdAndLibraryId(1L, 1L)).thenReturn(true);
        doNothing().when(subscriptionRepository).deleteByUserIdAndLibraryId(1L, 1L);

        assertDoesNotThrow(() -> subscriptionService.unsubscribe(1L, 1L));
        verify(subscriptionRepository).deleteByUserIdAndLibraryId(1L, 1L);
    }

    @Test
    void unsubscribe_WhenSubscriptionNotFound_ShouldThrowEntityNotFoundException() {
        when(subscriptionRepository.existsByUserIdAndLibraryId(1L, 1L)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> subscriptionService.unsubscribe(1L, 1L));
    }

    @Test
    void getUserSubscriptions_ShouldReturnPagedSubscriptions() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<LibrarySubscription> subscriptionPage = new PageImpl<>(List.of(testSubscription), pageable, 1);

        when(subscriptionRepository.findByUserId(1L, pageable)).thenReturn(subscriptionPage);
        when(subscriptionMapper.toDto(testSubscription)).thenReturn(testSubscriptionDto);

        // When
        Page<LibrarySubscriptionDto> result = subscriptionService.getUserSubscriptions(1L, pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("requests", result.getContent().get(0).getLibraryName());
    }

    @Test
    void getSubscriptionStatus_WhenSubscribed_ShouldReturnCorrectStatus() {
        // Given
        when(subscriptionRepository.findByUserIdAndLibraryId(1L, 1L)).thenReturn(Optional.of(testSubscription));
        when(subscriptionRepository.countByLibraryId(1L)).thenReturn(5L);

        // When
        SubscriptionStatusDto result = subscriptionService.getSubscriptionStatus(1L, 1L);

        // Then
        assertTrue(result.isSubscribed());
        assertEquals(5L, result.getSubscribersCount());
        assertTrue(result.getNotificationsEnabled());
    }

    @Test
    void getSubscriptionStatus_WhenNotSubscribed_ShouldReturnFalse() {
        when(subscriptionRepository.findByUserIdAndLibraryId(1L, 1L)).thenReturn(Optional.empty());
        when(subscriptionRepository.countByLibraryId(1L)).thenReturn(3L);

        SubscriptionStatusDto result = subscriptionService.getSubscriptionStatus(1L, 1L);

        assertFalse(result.isSubscribed());
        assertEquals(3L, result.getSubscribersCount());
    }

    @Test
    void updateSubscription_ShouldReturnUpdatedDto() {
        // Given
        UpdateSubscriptionRequest request = new UpdateSubscriptionRequest();
        request.setNotificationsEnabled(false);

        when(subscriptionRepository.findByUserIdAndLibraryId(1L, 1L)).thenReturn(Optional.of(testSubscription));
        when(subscriptionRepository.save(testSubscription)).thenReturn(testSubscription);
        when(subscriptionMapper.toDto(testSubscription)).thenReturn(testSubscriptionDto);

        // When
        LibrarySubscriptionDto result = subscriptionService.updateSubscription(1L, 1L, request);

        // Then
        assertNotNull(result);
        assertFalse(testSubscription.getNotificationsEnabled());
        verify(subscriptionRepository).save(testSubscription);
    }

    @Test
    void updateSubscription_WhenNotFound_ShouldThrowEntityNotFoundException() {
        UpdateSubscriptionRequest request = new UpdateSubscriptionRequest();
        when(subscriptionRepository.findByUserIdAndLibraryId(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> 
            subscriptionService.updateSubscription(1L, 1L, request));
    }

    @Test
    void isSubscribed_ShouldReturnTrue() {
        when(subscriptionRepository.existsByUserIdAndLibraryId(1L, 1L)).thenReturn(true);

        assertTrue(subscriptionService.isSubscribed(1L, 1L));
    }

    @Test
    void getSubscribersCount_ShouldReturnCount() {
        when(subscriptionRepository.countByLibraryId(1L)).thenReturn(10L);

        assertEquals(10L, subscriptionService.getSubscribersCount(1L));
    }
}
