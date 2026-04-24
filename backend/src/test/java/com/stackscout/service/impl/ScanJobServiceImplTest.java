package com.stackscout.service.impl;

import com.stackscout.dto.CreateScanJobRequest;
import com.stackscout.dto.ScanJobDto;
import com.stackscout.exception.ResourceNotFoundException;
import com.stackscout.model.ScanJob;
import com.stackscout.repository.ScanJobRepository;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit тесты для ScanJobServiceImpl
 */
@ExtendWith(MockitoExtension.class)
class ScanJobServiceImplTest {

    @Mock
    private ScanJobRepository scanJobRepository;

    @InjectMocks
    private ScanJobServiceImpl scanJobService;

    private ScanJob testScanJob;

    @BeforeEach
    void setUp() {
        testScanJob = new ScanJob();
        testScanJob.setId(1L);
        testScanJob.setSource("pypi");
        testScanJob.setStatus(ScanJob.ScanStatus.PENDING);
        testScanJob.setPackagesCount(100);
        testScanJob.setProcessedCount(0);
        testScanJob.setFailedCount(0);
        testScanJob.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void getAllScanJobs_ShouldReturnPagedJobs() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<ScanJob> page = new PageImpl<>(List.of(testScanJob), pageable, 1);
        when(scanJobRepository.findAll(pageable)).thenReturn(page);

        // When
        Page<ScanJobDto> result = scanJobService.getAllScanJobs(pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("pypi", result.getContent().get(0).getSource());
        verify(scanJobRepository).findAll(pageable);
    }

    @Test
    void getAllScanJobs_WithNullPageable_ShouldThrowException() {
        assertThrows(IllegalArgumentException.class, () -> scanJobService.getAllScanJobs(null));
    }

    @Test
    void getScanJobById_WhenExists_ShouldReturnDto() {
        // Given
        when(scanJobRepository.findById(1L)).thenReturn(Optional.of(testScanJob));

        // When
        ScanJobDto result = scanJobService.getScanJobById(1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("pypi", result.getSource());
        assertEquals(ScanJob.ScanStatus.PENDING, result.getStatus());
    }

    @Test
    void getScanJobById_WhenNotExists_ShouldThrowException() {
        // Given
        when(scanJobRepository.findById(999L)).thenReturn(Optional.empty());

        // When / Then
        assertThrows(ResourceNotFoundException.class, () -> scanJobService.getScanJobById(999L));
    }

    @Test
    void getScanJobById_WithNullId_ShouldThrowIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> scanJobService.getScanJobById(null));
    }

    @Test
    void createScanJob_ShouldSaveAndReturnDto() {
        // Given
        CreateScanJobRequest request = new CreateScanJobRequest();
        request.setSource("npm");
        request.setPackagesCount(500);

        ScanJob saved = new ScanJob();
        saved.setId(2L);
        saved.setSource("npm");
        saved.setStatus(ScanJob.ScanStatus.PENDING);
        saved.setPackagesCount(500);
        saved.setProcessedCount(0);
        saved.setFailedCount(0);

        when(scanJobRepository.save(any(ScanJob.class))).thenReturn(saved);

        // When
        ScanJobDto result = scanJobService.createScanJob(request);

        // Then
        assertNotNull(result);
        assertEquals("npm", result.getSource());
        assertEquals(ScanJob.ScanStatus.PENDING, result.getStatus());
        assertEquals(0, result.getProcessedCount());
        verify(scanJobRepository).save(any(ScanJob.class));
    }

    @Test
    void updateScanJobStatus_ToRunning_ShouldSetStartedAt() {
        // Given
        when(scanJobRepository.findById(1L)).thenReturn(Optional.of(testScanJob));
        when(scanJobRepository.save(any(ScanJob.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        ScanJobDto result = scanJobService.updateScanJobStatus(1L, ScanJob.ScanStatus.RUNNING);

        // Then
        assertNotNull(result);
        assertEquals(ScanJob.ScanStatus.RUNNING, result.getStatus());
        assertNotNull(result.getStartedAt());
    }

    @Test
    void updateScanJobStatus_ToCompleted_ShouldSetCompletedAt() {
        // Given
        testScanJob.setStatus(ScanJob.ScanStatus.RUNNING);
        testScanJob.setStartedAt(LocalDateTime.now().minusMinutes(5));
        when(scanJobRepository.findById(1L)).thenReturn(Optional.of(testScanJob));
        when(scanJobRepository.save(any(ScanJob.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        ScanJobDto result = scanJobService.updateScanJobStatus(1L, ScanJob.ScanStatus.COMPLETED);

        // Then
        assertNotNull(result);
        assertEquals(ScanJob.ScanStatus.COMPLETED, result.getStatus());
        assertNotNull(result.getCompletedAt());
    }

    @Test
    void updateScanJobStatus_ToFailed_ShouldSetCompletedAt() {
        // Given
        when(scanJobRepository.findById(1L)).thenReturn(Optional.of(testScanJob));
        when(scanJobRepository.save(any(ScanJob.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        ScanJobDto result = scanJobService.updateScanJobStatus(1L, ScanJob.ScanStatus.FAILED);

        // Then
        assertNotNull(result);
        assertEquals(ScanJob.ScanStatus.FAILED, result.getStatus());
        assertNotNull(result.getCompletedAt());
    }

    @Test
    void updateScanJobStatus_WhenNotExists_ShouldThrowException() {
        // Given
        when(scanJobRepository.findById(999L)).thenReturn(Optional.empty());

        // When / Then
        assertThrows(ResourceNotFoundException.class,
                () -> scanJobService.updateScanJobStatus(999L, ScanJob.ScanStatus.RUNNING));
    }

    @Test
    void updateScanJobStatus_WithNullId_ShouldThrowException() {
        assertThrows(IllegalArgumentException.class,
                () -> scanJobService.updateScanJobStatus(null, ScanJob.ScanStatus.RUNNING));
    }

    @Test
    void deleteScanJob_WhenExists_ShouldDelete() {
        // Given
        when(scanJobRepository.existsById(1L)).thenReturn(true);
        doNothing().when(scanJobRepository).deleteById(1L);

        // When / Then
        assertDoesNotThrow(() -> scanJobService.deleteScanJob(1L));
        verify(scanJobRepository).deleteById(1L);
    }

    @Test
    void deleteScanJob_WhenNotExists_ShouldThrowException() {
        // Given
        when(scanJobRepository.existsById(999L)).thenReturn(false);

        // When / Then
        assertThrows(ResourceNotFoundException.class, () -> scanJobService.deleteScanJob(999L));
    }

    @Test
    void deleteScanJob_WithNullId_ShouldThrowException() {
        assertThrows(IllegalArgumentException.class, () -> scanJobService.deleteScanJob(null));
    }

    @Test
    void getScanJobsByStatus_ShouldReturnFilteredJobs() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<ScanJob> page = new PageImpl<>(List.of(testScanJob), pageable, 1);
        when(scanJobRepository.findByStatus(ScanJob.ScanStatus.PENDING, pageable)).thenReturn(page);

        // When
        Page<ScanJobDto> result = scanJobService.getScanJobsByStatus(ScanJob.ScanStatus.PENDING, pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(ScanJob.ScanStatus.PENDING, result.getContent().get(0).getStatus());
    }

    @Test
    void getScanJobsBySource_ShouldReturnFilteredJobs() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<ScanJob> page = new PageImpl<>(List.of(testScanJob), pageable, 1);
        when(scanJobRepository.findBySource("pypi", pageable)).thenReturn(page);

        // When
        Page<ScanJobDto> result = scanJobService.getScanJobsBySource("pypi", pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("pypi", result.getContent().get(0).getSource());
    }

    @Test
    void getRecentJobsBySource_ShouldReturnLimitedList() {
        // Given
        List<ScanJob> jobs = List.of(testScanJob);
        when(scanJobRepository.findRecentJobsBySource(eq("pypi"), any(Pageable.class))).thenReturn(jobs);

        // When
        List<ScanJobDto> result = scanJobService.getRecentJobsBySource("pypi", 5);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("pypi", result.get(0).getSource());
    }

    @Test
    void getStatusStatistics_ShouldReturnStats() {
        // Given
        Object[] stat1 = {ScanJob.ScanStatus.PENDING, 5L};
        Object[] stat2 = {ScanJob.ScanStatus.COMPLETED, 10L};
        when(scanJobRepository.getStatusStatistics()).thenReturn(List.of(stat1, stat2));

        // When
        Map<String, Long> result = scanJobService.getStatusStatistics();

        // Then
        assertNotNull(result);
        assertEquals(5L, result.get("PENDING"));
        assertEquals(10L, result.get("COMPLETED"));
    }

    @Test
    void getStatusStatistics_WhenNoJobs_ShouldReturnEmptyMap() {
        // Given
        when(scanJobRepository.getStatusStatistics()).thenReturn(List.of());

        // When
        Map<String, Long> result = scanJobService.getStatusStatistics();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}
