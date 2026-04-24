package com.stackscout.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stackscout.config.JwtAuthenticationFilter;
import com.stackscout.dto.CreateScanJobRequest;
import com.stackscout.dto.ScanJobDto;
import com.stackscout.model.ScanJob;
import com.stackscout.service.ScanJobService;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Тесты для ScanJobController
 */
@WebMvcTest(ScanJobController.class)
@AutoConfigureMockMvc(addFilters = false)
class ScanJobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ScanJobService scanJobService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private ScanJobDto testScanJob;

    @BeforeEach
    void setUp() {
        testScanJob = new ScanJobDto();
        testScanJob.setId(1L);
        testScanJob.setSource("pypi");
        testScanJob.setStatus(ScanJob.ScanStatus.PENDING);
        testScanJob.setPackagesCount(100);
        testScanJob.setProcessedCount(0);
        testScanJob.setFailedCount(0);
    }

    @Test
    void getAllScanJobs_ShouldReturnPagedResponse() throws Exception {
        Page<ScanJobDto> page = new PageImpl<>(List.of(testScanJob), PageRequest.of(0, 10), 1);
        when(scanJobService.getAllScanJobs(any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/scan-jobs")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jobs").isArray())
                .andExpect(jsonPath("$.jobs[0].source").value("pypi"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.currentPage").value(0));
    }

    @Test
    void getAllScanJobs_DefaultParams_ShouldWork() throws Exception {
        Page<ScanJobDto> page = new PageImpl<>(List.of(testScanJob), PageRequest.of(0, 10), 1);
        when(scanJobService.getAllScanJobs(any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/scan-jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jobs").isArray());
    }

    @Test
    void getScanJobById_ShouldReturnJob() throws Exception {
        when(scanJobService.getScanJobById(1L)).thenReturn(testScanJob);

        mockMvc.perform(get("/api/v1/scan-jobs/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.source").value("pypi"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void createScanJob_ShouldReturn201() throws Exception {
        CreateScanJobRequest request = new CreateScanJobRequest();
        request.setSource("npm");

        ScanJobDto created = new ScanJobDto();
        created.setId(2L);
        created.setSource("npm");
        created.setStatus(ScanJob.ScanStatus.PENDING);

        when(scanJobService.createScanJob(any(CreateScanJobRequest.class))).thenReturn(created);

        mockMvc.perform(post("/api/v1/scan-jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Задача сканирования успешно создана"))
                .andExpect(jsonPath("$.job.source").value("npm"));
    }

    @Test
    void updateScanJobStatus_ShouldReturnUpdatedJob() throws Exception {
        ScanJobDto updated = new ScanJobDto();
        updated.setId(1L);
        updated.setSource("pypi");
        updated.setStatus(ScanJob.ScanStatus.COMPLETED);

        when(scanJobService.updateScanJobStatus(eq(1L), eq(ScanJob.ScanStatus.COMPLETED))).thenReturn(updated);

        mockMvc.perform(patch("/api/v1/scan-jobs/1/status")
                        .param("status", "COMPLETED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Статус задачи успешно обновлен"))
                .andExpect(jsonPath("$.job.status").value("COMPLETED"));
    }

    @Test
    void deleteScanJob_ShouldReturn200() throws Exception {
        doNothing().when(scanJobService).deleteScanJob(1L);

        mockMvc.perform(delete("/api/v1/scan-jobs/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Задача сканирования успешно удалена"))
                .andExpect(jsonPath("$.id").value("1"));
    }

    @Test
    void getScanJobsByStatus_ShouldReturnFilteredJobs() throws Exception {
        Page<ScanJobDto> page = new PageImpl<>(List.of(testScanJob), PageRequest.of(0, 10), 1);
        when(scanJobService.getScanJobsByStatus(eq(ScanJob.ScanStatus.PENDING), any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/scan-jobs/status/PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jobs").isArray())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void getScanJobsBySource_ShouldReturnFilteredJobs() throws Exception {
        Page<ScanJobDto> page = new PageImpl<>(List.of(testScanJob), PageRequest.of(0, 10), 1);
        when(scanJobService.getScanJobsBySource(eq("pypi"), any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/scan-jobs/source/pypi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jobs").isArray());
    }

    @Test
    void getRecentJobs_ShouldReturnList() throws Exception {
        when(scanJobService.getRecentJobsBySource(eq("pypi"), eq(5))).thenReturn(List.of(testScanJob));

        mockMvc.perform(get("/api/v1/scan-jobs/recent")
                        .param("source", "pypi")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].source").value("pypi"));
    }

    @Test
    void getStatistics_ShouldReturnStats() throws Exception {
        Map<String, Long> stats = new HashMap<>();
        stats.put("PENDING", 5L);
        stats.put("COMPLETED", 10L);
        stats.put("FAILED", 2L);

        when(scanJobService.getStatusStatistics()).thenReturn(stats);

        mockMvc.perform(get("/api/v1/scan-jobs/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.PENDING").value(5))
                .andExpect(jsonPath("$.COMPLETED").value(10));
    }

    @Test
    void getScanJobDto_Progress_ShouldCalculateCorrectly() {
        ScanJobDto job = new ScanJobDto();
        job.setPackagesCount(100);
        job.setProcessedCount(50);

        assertEquals(50.0, job.getProgress());
    }

    @Test
    void getScanJobDto_Progress_WithZeroPackages_ShouldReturnZero() {
        ScanJobDto job = new ScanJobDto();
        job.setPackagesCount(0);

        assertEquals(0.0, job.getProgress());
    }

    @Test
    void getScanJobDto_Progress_WithNullPackages_ShouldReturnZero() {
        ScanJobDto job = new ScanJobDto();
        job.setPackagesCount(null);

        assertEquals(0.0, job.getProgress());
    }
}
