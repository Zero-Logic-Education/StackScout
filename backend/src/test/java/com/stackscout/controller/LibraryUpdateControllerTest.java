package com.stackscout.controller;

import com.stackscout.config.JwtAuthenticationFilter;
import com.stackscout.dto.LibraryUpdateDto;
import com.stackscout.model.Role;
import com.stackscout.model.UpdateType;
import com.stackscout.model.User;
import com.stackscout.service.LibraryUpdateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Тесты для LibraryUpdateController
 */
@WebMvcTest(LibraryUpdateController.class)
@AutoConfigureMockMvc(addFilters = false)
class LibraryUpdateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private LibraryUpdateService updateService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private LibraryUpdateDto testUpdate;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUpdate = new LibraryUpdateDto();
        testUpdate.setId(1L);
        testUpdate.setLibraryId(10L);
        testUpdate.setUpdateType(UpdateType.MAJOR);
        testUpdate.setOldVersion("1.0.0");
        testUpdate.setNewVersion("2.0.0");

        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encoded")
                .role(Role.USER)
                .enabled(true)
                .locked(false)
                .build();
    }

    @Test
    void getLibraryUpdates_ShouldReturnPage() throws Exception {
        Page<LibraryUpdateDto> page = new PageImpl<>(List.of(testUpdate), PageRequest.of(0, 20), 1);
        when(updateService.getLibraryUpdates(eq(10L), any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/library-updates/library/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].libraryId").value(10));
    }

    @Test
    void getLibraryUpdates_WithPagination_ShouldWork() throws Exception {
        Page<LibraryUpdateDto> page = new PageImpl<>(List.of(testUpdate), PageRequest.of(1, 5), 6);
        when(updateService.getLibraryUpdates(eq(10L), any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/library-updates/library/10")
                        .param("page", "1")
                        .param("size", "5"))
                .andExpect(status().isOk());
    }

    @Test
    void getUpdatesByType_ShouldReturnFilteredUpdates() throws Exception {
        Page<LibraryUpdateDto> page = new PageImpl<>(List.of(testUpdate), PageRequest.of(0, 20), 1);
        when(updateService.getUpdatesByType(eq(UpdateType.MAJOR), any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/library-updates/by-type")
                        .param("updateType", "MAJOR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void getLatestUpdate_WhenExists_ShouldReturnUpdate() throws Exception {
        when(updateService.getLatestUpdate(10L)).thenReturn(testUpdate);

        mockMvc.perform(get("/api/v1/library-updates/library/10/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.newVersion").value("2.0.0"));
    }

    @Test
    void getLatestUpdate_WhenNotExists_ShouldReturn204() throws Exception {
        when(updateService.getLatestUpdate(999L)).thenReturn(null);

        mockMvc.perform(get("/api/v1/library-updates/library/999/latest"))
                .andExpect(status().isNoContent());
    }

    @Test
    void getUpdateStats_WithoutAuth_ShouldReturnEmptyStats() throws Exception {
        mockMvc.perform(get("/api/v1/library-updates/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.last7Days").value(0))
                .andExpect(jsonPath("$.last30Days").value(0))
                .andExpect(jsonPath("$.recentUpdates").isArray());
    }

    @Test
    void getUpdateStats_WithAuth_ShouldReturnUserStats() throws Exception {
        when(updateService.getRecentUpdatesForUser(eq(1L), eq(7))).thenReturn(List.of(testUpdate));
        when(updateService.getRecentUpdatesForUser(eq(1L), eq(30))).thenReturn(List.of(testUpdate, testUpdate));

        mockMvc.perform(get("/api/v1/library-updates/stats")
                        .with(authAsDomainUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.last7Days").value(1))
                .andExpect(jsonPath("$.last30Days").value(2));
    }

    private RequestPostProcessor authAsDomainUser() {
        return request -> {
            request.setUserPrincipal(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                    testUser, null, testUser.getAuthorities()));
            return request;
        };
    }
}
