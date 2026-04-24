package com.stackscout.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stackscout.config.JwtAuthenticationFilter;
import com.stackscout.dto.LibrarySubscriptionDto;
import com.stackscout.dto.SubscriptionStatusDto;
import com.stackscout.dto.UpdateSubscriptionRequest;
import com.stackscout.model.Role;
import com.stackscout.model.User;
import com.stackscout.service.SubscriptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Тесты для SubscriptionController
 */
@WebMvcTest(SubscriptionController.class)
@AutoConfigureMockMvc(addFilters = false)
class SubscriptionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private SubscriptionService subscriptionService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private User testUser;
    private LibrarySubscriptionDto testSubscription;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encoded")
                .role(Role.USER)
                .enabled(true)
                .locked(false)
                .build();

        testSubscription = LibrarySubscriptionDto.builder()
                .id(1L)
                .userId(1L)
                .libraryId(10L)
                .libraryName("requests")
                .librarySource("pypi")
                .subscribedAt(LocalDateTime.now())
                .notificationsEnabled(true)
                .build();
    }

    @Test
    void subscribe_ShouldReturn201() throws Exception {
        when(subscriptionService.subscribe(eq(1L), any())).thenReturn(testSubscription);

        mockMvc.perform(post("/api/v1/subscriptions/10")
                                                .with(authAsDomainUser()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Successfully subscribed to library"))
                .andExpect(jsonPath("$.subscription").exists());
    }

    @Test
    void unsubscribe_ShouldReturn200() throws Exception {
        doNothing().when(subscriptionService).unsubscribe(eq(1L), eq(10L));

        mockMvc.perform(delete("/api/v1/subscriptions/10")
                                                .with(authAsDomainUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Successfully unsubscribed from library"));
    }

    @Test
    void getUserSubscriptions_WithAuth_ShouldReturnPage() throws Exception {
        Page<LibrarySubscriptionDto> page = new PageImpl<>(
                List.of(testSubscription), PageRequest.of(0, 20), 1);
        when(subscriptionService.getUserSubscriptions(eq(1L), any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/subscriptions")
                        .with(authAsDomainUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].libraryName").value("requests"));
    }

    @Test
    void getUserSubscriptions_WithoutAuth_ShouldReturnEmptyPage() throws Exception {
        mockMvc.perform(get("/api/v1/subscriptions"))
                .andExpect(status().isOk());
    }

    @Test
    void getSubscriptionStatus_ShouldReturnStatus() throws Exception {
        SubscriptionStatusDto status = SubscriptionStatusDto.builder()
                .isSubscribed(true)
                .notificationsEnabled(true)
                .subscribersCount(5L)
                .build();

        when(subscriptionService.getSubscriptionStatus(eq(1L), eq(10L))).thenReturn(status);

        mockMvc.perform(get("/api/v1/subscriptions/10/status")
                        .with(authAsDomainUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isSubscribed").value(true))
                .andExpect(jsonPath("$.subscribersCount").value(5));
    }

    @Test
    void updateNotifications_ShouldReturnUpdatedSubscription() throws Exception {
        UpdateSubscriptionRequest request = new UpdateSubscriptionRequest();
        request.setNotificationsEnabled(false);

        LibrarySubscriptionDto updated = LibrarySubscriptionDto.builder()
                .id(1L)
                .userId(1L)
                .libraryId(10L)
                .libraryName("requests")
                .notificationsEnabled(false)
                .build();

        when(subscriptionService.updateSubscription(eq(1L), eq(10L), any())).thenReturn(updated);

        mockMvc.perform(put("/api/v1/subscriptions/10/notifications")
                        .with(authAsDomainUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notificationsEnabled").value(false));
    }

    @Test
    void getSubscribersCount_ShouldReturnCount() throws Exception {
        when(subscriptionService.getSubscribersCount(10L)).thenReturn(42L);

        mockMvc.perform(get("/api/v1/subscriptions/count/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subscribersCount").value(42));
    }

        private RequestPostProcessor authAsDomainUser() {
                return request -> {
                        request.setUserPrincipal(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                        testUser, null, testUser.getAuthorities()));
                        return request;
                };
        }
}
