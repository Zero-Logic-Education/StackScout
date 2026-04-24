package com.stackscout.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stackscout.config.JwtAuthenticationFilter;
import com.stackscout.dto.CreateLicenseRequest;
import com.stackscout.dto.LicenseDto;
import com.stackscout.exception.ResourceNotFoundException;
import com.stackscout.model.License;
import com.stackscout.service.LicenseService;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Тесты для LicenseController
 */
@WebMvcTest(LicenseController.class)
@AutoConfigureMockMvc(addFilters = false)
class LicenseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private LicenseService licenseService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private LicenseDto testLicense;

    @BeforeEach
    void setUp() {
        testLicense = new LicenseDto();
        testLicense.setId(1L);
        testLicense.setName("MIT");
        testLicense.setLicenseType(License.LicenseType.PERMISSIVE);
        testLicense.setDescription("MIT License");
        testLicense.setIsOsiApproved(true);
        testLicense.setCommercialUseAllowed(true);
    }

    @Test
    void getAllLicenses_ShouldReturnPagedResponse() throws Exception {
        Page<LicenseDto> page = new PageImpl<>(List.of(testLicense), PageRequest.of(0, 10), 1);
        when(licenseService.getAllLicenses(any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/licenses")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.licenses").isArray())
                .andExpect(jsonPath("$.licenses[0].name").value("MIT"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.currentPage").value(0));
    }

    @Test
    void getAllLicenses_DefaultParams_ShouldWork() throws Exception {
        Page<LicenseDto> page = new PageImpl<>(List.of(testLicense), PageRequest.of(0, 10), 1);
        when(licenseService.getAllLicenses(any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/licenses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.licenses").isArray());
    }

    @Test
    void getLicenseById_WhenExists_ShouldReturnLicense() throws Exception {
        when(licenseService.getLicenseById(1L)).thenReturn(testLicense);

        mockMvc.perform(get("/api/v1/licenses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("MIT"));
    }

    @Test
    void getLicenseById_WhenNotExists_ShouldReturn404() throws Exception {
        when(licenseService.getLicenseById(999L))
                .thenThrow(new ResourceNotFoundException("License not found"));

        mockMvc.perform(get("/api/v1/licenses/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createLicense_ShouldReturn201() throws Exception {
        CreateLicenseRequest request = new CreateLicenseRequest();
        request.setName("Apache-2.0");
        request.setLicenseType(License.LicenseType.PERMISSIVE);

        when(licenseService.createLicense(any(CreateLicenseRequest.class))).thenReturn(testLicense);

        mockMvc.perform(post("/api/v1/licenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Лицензия успешно создана"))
                .andExpect(jsonPath("$.license").exists());
    }

    @Test
    void updateLicense_ShouldReturnUpdatedLicense() throws Exception {
        CreateLicenseRequest request = new CreateLicenseRequest();
        request.setName("MIT Updated");
        request.setLicenseType(License.LicenseType.PERMISSIVE);

        LicenseDto updated = new LicenseDto();
        updated.setId(1L);
        updated.setName("MIT Updated");

        when(licenseService.updateLicense(eq(1L), any(CreateLicenseRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/v1/licenses/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Лицензия успешно обновлена"))
                .andExpect(jsonPath("$.license.name").value("MIT Updated"));
    }

    @Test
    void deleteLicense_ShouldReturn200() throws Exception {
        doNothing().when(licenseService).deleteLicense(1L);

        mockMvc.perform(delete("/api/v1/licenses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Лицензия успешно удалена"))
                .andExpect(jsonPath("$.id").value("1"));
    }

    @Test
    void findByName_ShouldReturnLicense() throws Exception {
        when(licenseService.findByName("MIT")).thenReturn(testLicense);

        mockMvc.perform(get("/api/v1/licenses/search")
                        .param("name", "MIT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("MIT"));
    }

    @Test
    void getLicensesByType_ShouldReturnList() throws Exception {
        when(licenseService.getLicensesByType(License.LicenseType.PERMISSIVE))
                .thenReturn(List.of(testLicense));

        mockMvc.perform(get("/api/v1/licenses/type/PERMISSIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("MIT"));
    }

    @Test
    void getOsiApprovedLicenses_ShouldReturnList() throws Exception {
        when(licenseService.getOsiApprovedLicenses()).thenReturn(List.of(testLicense));

        mockMvc.perform(get("/api/v1/licenses/osi-approved"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].isOsiApproved").value(true));
    }
}
