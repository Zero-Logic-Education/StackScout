package com.stackscout.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stackscout.dto.*;
import com.stackscout.service.LibraryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockitoBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
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

    @Test
    @WithMockUser
    void getAllLibraries_ShouldReturnPagedResponse() throws Exception {
        // Given
        LibraryDto library = createTestLibrary();
        Page<LibraryDto> page = new PageImpl<>(List.of(library), PageRequest.of(0, 10), 1);

        when(libraryService.getAllLibraries(any())).thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/v1/admin/libraries")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.libraries").isArray())
                .andExpect(jsonPath("$.libraries[0].name").value("requests"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser
    void createLibrary_ShouldReturnCreatedLibrary() throws Exception {
        // Given
        CreateLibraryRequest request = new CreateLibraryRequest();
        request.setName("flask");
        request.setVersion("3.0.0");
        request.setSource("pypi");

        LibraryDto created = new LibraryDto();
        created.setId(2L);
        created.setName("flask");
        created.setVersion("3.0.0");
        created.setSource("pypi");

        when(libraryService.createLibrary(any())).thenReturn(created);

        // When & Then
        mockMvc.perform(post("/api/v1/admin/libraries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.library.name").value("flask"))
                .andExpect(jsonPath("$.library.id").value(2));
    }

    @Test
    @WithMockUser
    void updateLibrary_ShouldReturnUpdatedLibrary() throws Exception {
        // Given
        UpdateLibraryRequest request = new UpdateLibraryRequest();
        request.setVersion("2.32.0");

        LibraryDto updated = createTestLibrary();
        updated.setVersion("2.32.0");

        when(libraryService.updateLibrary(any(), any())).thenReturn(updated);

        // When & Then
        mockMvc.perform(put("/api/v1/admin/libraries/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.library.version").value("2.32.0"));
    }

    @Test
    @WithMockUser
    void deleteLibrary_ShouldReturnSuccessMessage() throws Exception {
        // Given
        // (service method will be called)

        // When & Then
        mockMvc.perform(delete("/api/v1/admin/libraries/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Библиотека успешно удалена"))
                .andExpect(jsonPath("$.id").value("1"));
    }

    @Test
    @WithMockUser
    void updateModerationStatus_ShouldReturnUpdatedLibrary() throws Exception {
        // Given
        UpdateLibraryModerationRequest request = new UpdateLibraryModerationRequest();
        // request.setModerationStatus("APPROVED");

        LibraryDto updated = createTestLibrary();

        when(libraryService.updateModerationStatus(any(), any())).thenReturn(updated);

        // When & Then
        mockMvc.perform(patch("/api/v1/admin/libraries/1/moderation")
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
