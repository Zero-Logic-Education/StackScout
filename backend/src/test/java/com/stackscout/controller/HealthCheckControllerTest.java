package com.stackscout.controller;

import com.stackscout.config.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Тесты для HealthCheckController
 */
@WebMvcTest(HealthCheckController.class)
@AutoConfigureMockMvc(addFilters = false)
class HealthCheckControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void health_ShouldReturnUpStatus() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("StackScout API"))
                .andExpect(jsonPath("$.version").value("1.0.0"))
                .andExpect(jsonPath("$.environment").value("development"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void ping_ShouldReturnPong() throws Exception {
        mockMvc.perform(get("/api/v1/ping"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("pong"))
                .andExpect(jsonPath("$.timestamp").exists());
    }
}
