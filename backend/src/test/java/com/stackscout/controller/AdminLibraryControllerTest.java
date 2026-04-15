package com.stackscout.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stackscout.config.JwtAuthenticationFilter;
import com.stackscout.dto.*;
import com.stackscout.service.LibraryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration тесты для AdminLibraryController
 */
@WebMvcTest(AdminLibraryController.class)
class AdminLibraryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private LibraryService libraryService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllLibraries_ShouldReturnPagedResponse() throws Exception {
        // Given
        LibraryDto library = createTestLibrary();
        Page<LibraryDto> page = new PageImpl<>(List.of(library), PageRequest.of(0, 10), 1);

        when(libraryService.getAllLibraries(any())).thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/admin/libraries")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].name").value("requests"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createLibrary_ShouldReturnCreatedLibrary() throws Exception {
        // Given
        LibraryDto library = createTestLibrary();
        when(libraryService.getLibraryById(1L)).thenReturn(library);

        // When & Then
        mockMvc.perform(get("/api/admin/libraries/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("requests"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateLibrary_ShouldReturnUpdatedLibrary() throws Exception {
        // Given
        LibraryDto updated = createTestLibrary();
        updated.setHealthScore(92);

        when(libraryService.recalculateHealthScore(1L)).thenReturn(updated);

        // When & Then
        mockMvc.perform(post("/api/admin/libraries/1/recalculate-health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.healthScore").value(92));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteLibrary_ShouldReturnSuccessMessage() throws Exception {
        // When & Then
        mockMvc.perform(delete("/api/admin/libraries/1"))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateModerationStatus_ShouldReturnUpdatedLibrary() throws Exception {
        // Given
        UpdateLibraryModerationRequest request = new UpdateLibraryModerationRequest();
        request.setModerationStatus(com.stackscout.model.ModerationStatus.VERIFIED);
        request.setModerationNotes("Looks good");

        LibraryDto updated = createTestLibrary();

        when(libraryService.updateModerationStatus(eq(1L), any())).thenReturn(updated);

        // When & Then
        mockMvc.perform(patch("/api/admin/libraries/1/moderation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("requests"));
    }

    private LibraryDto createTestLibrary() {
        LibraryDto library = new LibraryDto();
        library.setId(1L);
        library.setName("requests");
        library.setVersion("2.31.0");
        library.setSource("pypi");
        library.setLicense("MIT");
        library.setHealthScore(85);
        library.setDescription("Python HTTP library");
        return library;
    }
}
