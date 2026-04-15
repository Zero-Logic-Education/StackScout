package com.stackscout.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stackscout.dto.*;
import com.stackscout.service.AuthService;
import com.stackscout.service.LibraryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockitoBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration тесты для AuthController
 */
@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @Test
    void register_ShouldReturnAuthResponse() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("new@example.com");
        request.setPassword("password123");

        AuthResponse response = AuthResponse.builder()
                .token("jwt-token-here")
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token-here"));
    }

    @Test
    void login_ShouldReturnAuthResponse() throws Exception {
        AuthenticationRequest request = new AuthenticationRequest();
        request.setUsername("testuser");
        request.setPassword("password123");

        AuthResponse response = AuthResponse.builder()
                .token("jwt-token-here")
                .build();

        when(authService.authenticate(any(AuthenticationRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token-here"));
    }
}

/**
 * Integration тесты для LibraryController
 */
@WebMvcTest(LibraryController.class)
class LibraryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private LibraryService libraryService;

    @Test
    void getAllLibraries_ShouldReturnPagedResponse() throws Exception {
        LibraryDto library = createTestLibrary();
        Page<LibraryDto> page = new PageImpl<>(List.of(library), PageRequest.of(0, 10), 1);

        when(libraryService.getAllLibraries(any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/libraries")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.libraries").isArray())
                .andExpect(jsonPath("$.libraries[0].name").value("requests"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.currentPage").value(0));
    }

    @Test
    void getLibraryById_ShouldReturnLibrary() throws Exception {
        LibraryDto library = createTestLibrary();
        when(libraryService.getLibraryById(1L)).thenReturn(library);

        mockMvc.perform(get("/api/v1/libraries/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("requests"))
                .andExpect(jsonPath("$.source").value("pypi"));
    }

    @Test
    void searchLibraries_ByQuery_ShouldReturnResults() throws Exception {
        LibraryDto library = createTestLibrary();
        Page<LibraryDto> page = new PageImpl<>(List.of(library), PageRequest.of(0, 10), 1);

        when(libraryService.searchLibraries(eq("requests"), any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/libraries/search")
                        .param("query", "requests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.libraries").isArray())
                .andExpect(jsonPath("$.libraries[0].name").value("requests"));
    }

    @Test
    void searchLibraries_BySource_ShouldReturnFilteredResults() throws Exception {
        LibraryDto library = createTestLibrary();
        Page<LibraryDto> page = new PageImpl<>(List.of(library), PageRequest.of(0, 10), 1);

        when(libraryService.getLibrariesBySource(eq("pypi"), any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/libraries/search")
                        .param("source", "pypi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.libraries[0].source").value("pypi"));
    }

    @Test
    void getHealthyLibraries_ShouldReturnFilteredByMinScore() throws Exception {
        LibraryDto library = createTestLibrary();
        library.setHealthScore(85);

        when(libraryService.getHealthyLibraries(80)).thenReturn(List.of(library));

        mockMvc.perform(get("/api/v1/libraries/healthy")
                        .param("minScore", "80"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("requests"))
                .andExpect(jsonPath("$[0].healthScore").value(85));
    }

    @Test
    void getLibraryHealth_ShouldReturnHealthMetrics() throws Exception {
        LibraryDto library = createTestLibrary();
        library.setHealthScore(85);
        library.setLastRelease("2024-01-15T10:00:00");
        library.setRepository("https://github.com/psf/requests");
        library.setDescription("Python HTTP library for humans");
        library.setLicense("MIT");

        when(libraryService.getLibraryById(1L)).thenReturn(library);

        mockMvc.perform(get("/api/v1/libraries/1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overallScore").isNumber())
                .andExpect(jsonPath("$.actuality.score").isNumber())
                .andExpect(jsonPath("$.repository.score").isNumber())
                .andExpect(jsonPath("$.community.score").isNumber());
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
        library.setRepository("https://github.com/psf/requests");
        return library;
    }
}
