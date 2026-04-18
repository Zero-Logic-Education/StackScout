package com.stackscout.service.impl;

import com.stackscout.dto.CreateLicenseRequest;
import com.stackscout.dto.LicenseDto;
import com.stackscout.exception.ResourceNotFoundException;
import com.stackscout.model.License;
import com.stackscout.repository.LicenseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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

@ExtendWith(MockitoExtension.class)
class LicenseServiceImplTest {

    @Mock
    private LicenseRepository licenseRepository;

    private LicenseServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new LicenseServiceImpl(licenseRepository);
    }

    @Test
    void getAllLicenses_ShouldReturnPagedLicenses() {
        Pageable pageable = PageRequest.of(0, 10);
        License license = createLicense(1L, "MIT", "MIT License");
        Page<License> page = new PageImpl<>(List.of(license), pageable, 1);

        when(licenseRepository.findAll(pageable)).thenReturn(page);

        Page<LicenseDto> result = service.getAllLicenses(pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("MIT", result.getContent().get(0).getName());
        verify(licenseRepository).findAll(pageable);
    }

    @Test
    void getAllLicenses_ShouldThrowException_WhenPageableIsNull() {
        assertThrows(IllegalArgumentException.class, () -> service.getAllLicenses(null));
    }

    @Test
    void getLicenseById_ShouldReturnLicense_WhenExists() {
        Long id = 1L;
        License license = createLicense(id, "Apache-2.0", "Apache License 2.0");

        when(licenseRepository.findById(id)).thenReturn(Optional.of(license));

        LicenseDto result = service.getLicenseById(id);

        assertNotNull(result);
        assertEquals("Apache-2.0", result.getName());
        assertEquals("Apache License 2.0", result.getDescription());
    }

    @Test
    void getLicenseById_ShouldThrowException_WhenNotFound() {
        Long id = 999L;
        when(licenseRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getLicenseById(id));
    }

    @Test
    void getLicenseById_ShouldThrowException_WhenIdIsNull() {
        assertThrows(IllegalArgumentException.class, () -> service.getLicenseById(null));
    }

    @Test
    void createLicense_ShouldCreateAndReturnLicense() {
        CreateLicenseRequest request = new CreateLicenseRequest();
        request.setName("GPL-3.0");
        request.setDescription("GNU General Public License v3.0");

        License savedLicense = createLicense(1L, "GPL-3.0", "GNU General Public License v3.0");
        when(licenseRepository.save(any(License.class))).thenReturn(savedLicense);

        LicenseDto result = service.createLicense(request);

        assertNotNull(result);
        assertEquals("GPL-3.0", result.getName());
        verify(licenseRepository).save(any(License.class));
    }

    @Test
    void updateLicense_ShouldUpdateAndReturnLicense() {
        Long id = 1L;
        CreateLicenseRequest request = new CreateLicenseRequest();
        request.setName("BSD-3-Clause");
        request.setDescription("BSD 3-Clause License");

        License existingLicense = createLicense(id, "BSD-2-Clause", "Old description");
        License updatedLicense = createLicense(id, "BSD-3-Clause", "BSD 3-Clause License");

        when(licenseRepository.findById(id)).thenReturn(Optional.of(existingLicense));
        when(licenseRepository.save(any(License.class))).thenReturn(updatedLicense);

        LicenseDto result = service.updateLicense(id, request);

        assertNotNull(result);
        assertEquals("BSD-3-Clause", result.getName());
        verify(licenseRepository).save(any(License.class));
    }

    @Test
    void updateLicense_ShouldThrowException_WhenNotFound() {
        Long id = 999L;
        CreateLicenseRequest request = new CreateLicenseRequest();
        request.setName("MIT");

        when(licenseRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.updateLicense(id, request));
    }

    @Test
    void deleteLicense_ShouldDeleteLicense_WhenExists() {
        Long id = 1L;
        when(licenseRepository.existsById(id)).thenReturn(true);

        service.deleteLicense(id);

        verify(licenseRepository).deleteById(id);
    }

    @Test
    void deleteLicense_ShouldThrowException_WhenNotFound() {
        Long id = 999L;
        when(licenseRepository.existsById(id)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> service.deleteLicense(id));
        verify(licenseRepository, never()).deleteById(id);
    }

    @Test
    void normalizeLicense_ShouldNormalizeMIT() {
        String result = service.normalizeLicense("mit");
        assertEquals("MIT", result);

        result = service.normalizeLicense("MIT License");
        assertEquals("MIT", result);
    }

    @Test
    void normalizeLicense_ShouldNormalizeApache() {
        String result = service.normalizeLicense("Apache 2.0");
        assertEquals("Apache-2.0", result);

        result = service.normalizeLicense("apache-2.0");
        assertEquals("Apache-2.0", result);
    }

    @Test
    void normalizeLicense_ShouldReturnOriginal_WhenUnknown() {
        String result = service.normalizeLicense("Custom License");
        assertEquals("Custom License", result);
    }

    @Test
    void normalizeLicense_ShouldHandleNull() {
        String result = service.normalizeLicense(null);
        assertEquals("Unknown", result);
    }

    private License createLicense(Long id, String name, String description) {
        License license = new License();
        license.setId(id);
        license.setName(name);
        license.setDescription(description);
        return license;
    }
}
