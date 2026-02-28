// File: LicenseServiceImpl.java
package com.stackscout.service.impl;

import com.stackscout.dto.CreateLicenseRequest;
import com.stackscout.dto.LicenseDto;
import com.stackscout.exception.ResourceNotFoundException;
import com.stackscout.model.License;
import com.stackscout.repository.LicenseRepository;
import com.stackscout.service.LicenseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Реализация сервиса для управления лицензиями.
 * Обеспечивает CRUD операции, поиск по типу и нормализацию названий лицензий.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LicenseServiceImpl implements LicenseService {

    private final LicenseRepository licenseRepository;

    /**
     * Получить все лицензии с пагинацией.
     * 
     * @param pageable Объект с параметрами пагинации.
     * @return Страница лицензий.
     */
    @Override
    public Page<LicenseDto> getAllLicenses(Pageable pageable) {
        log.debug("Получение всех лицензий с пагинацией: {}", pageable);
        if (pageable == null) {
            throw new IllegalArgumentException("Pageable не может быть null");
        }
        return licenseRepository.findAll(pageable)
                .map(this::toDto);
    }

    @Override
    public LicenseDto getLicenseById(Long id) {
        log.debug("Поиск лицензии с ID: {}", id);
        if (id == null) {
            throw new IllegalArgumentException("ID не может быть null");
        }
        License license = licenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Лицензия не найдена с ID: " + id));
        return toDto(license);
    }

    @Override
    @Transactional
    public LicenseDto createLicense(CreateLicenseRequest request) {
        log.info("Создание новой лицензии: {}", request.getName());

        License license = toEntity(request);
        if (license == null) {
            throw new IllegalArgumentException("License не может быть null");
        }
        License savedLicense = licenseRepository.save(license);

        log.info("Лицензия успешно создана с ID: {}", savedLicense.getId());
        return toDto(savedLicense);
    }

    @Override
    @Transactional
    @SuppressWarnings("null")
    public LicenseDto updateLicense(Long id, CreateLicenseRequest request) {
        log.info("Обновление лицензии с ID: {}", id);
        if (id == null) {
            throw new IllegalArgumentException("ID не может быть null");
        }

        License license = licenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Лицензия не найдена с ID: " + id));

        updateEntityFromDto(license, request);
        License updatedLicense = Objects.requireNonNull(licenseRepository.save(license));

        log.info("Лицензия успешно обновлена: {}", id);
        return toDto(updatedLicense);
    }

    @Override
    @Transactional
    public void deleteLicense(Long id) {
        log.info("Удаление лицензии с ID: {}", id);
        if (id == null) {
            throw new IllegalArgumentException("ID не может быть null");
        }

        if (!licenseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Лицензия не найдена с ID: " + id);
        }

        licenseRepository.deleteById(id);
        log.info("Лицензия успешно удалена: {}", id);
    }

    @Override
    public LicenseDto findByName(String name) {
        log.debug("Поиск лицензии по имени: {}", name);
        License license = licenseRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Лицензия не найдена с именем: " + name));
        return toDto(license);
    }

    @Override
    public List<LicenseDto> getLicensesByType(License.LicenseType type) {
        log.debug("Получение лицензий по типу: {}", type);
        return licenseRepository.findByLicenseType(type)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<LicenseDto> getOsiApprovedLicenses() {
        log.debug("Получение OSI-одобренных лицензий");
        return licenseRepository.findByIsOsiApproved(true)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public String normalizeLicense(String licenseName) {
        if (licenseName == null || licenseName.isBlank()) {
            return "Unknown";
        }

        String normalized = licenseName.trim();

        // Common variations map
        if (normalized.equalsIgnoreCase("MIT License") || normalized.equalsIgnoreCase("The MIT License") || normalized.toUpperCase().contains("MIT")) {
            return "MIT";
        }
        if (normalized.equalsIgnoreCase("Apache License 2.0") || normalized.equalsIgnoreCase("Apache 2.0") || normalized.toUpperCase().contains("APACHE")) {
            return "Apache-2.0";
        }
        if (normalized.equalsIgnoreCase("GNU General Public License v3.0") || normalized.equalsIgnoreCase("GPLv3") || normalized.toUpperCase().contains("GPL")) {
            return "GPL-3.0";
        }
        if (normalized.equalsIgnoreCase("BSD 3-Clause \"New\" or \"Revised\" License") || normalized.toUpperCase().contains("BSD")) {
            return "BSD-3-Clause";
        }

        return normalized;
    }

    // Вспомогательные методы для маппинга

    private LicenseDto toDto(License license) {
        return new LicenseDto(
                license.getId(),
                license.getName(),
                license.getLicenseType(),
                license.getDescription(),
                license.getIsOsiApproved(),
                license.getCommercialUseAllowed(),
                license.getUrl(),
                license.getCreatedAt(),
                license.getUpdatedAt());
    }

    private License toEntity(CreateLicenseRequest request) {
        License license = new License();
        license.setName(request.getName());
        license.setLicenseType(request.getLicenseType());
        license.setDescription(request.getDescription());
        license.setIsOsiApproved(request.getIsOsiApproved());
        license.setCommercialUseAllowed(request.getCommercialUseAllowed());
        license.setUrl(request.getUrl());
        return license;
    }

    private void updateEntityFromDto(License license, CreateLicenseRequest request) {
        if (request.getName() != null) {
            license.setName(request.getName());
        }
        if (request.getLicenseType() != null) {
            license.setLicenseType(request.getLicenseType());
        }
        if (request.getDescription() != null) {
            license.setDescription(request.getDescription());
        }
        if (request.getIsOsiApproved() != null) {
            license.setIsOsiApproved(request.getIsOsiApproved());
        }
        if (request.getCommercialUseAllowed() != null) {
            license.setCommercialUseAllowed(request.getCommercialUseAllowed());
        }
        if (request.getUrl() != null) {
            license.setUrl(request.getUrl());
        }
    }
}
