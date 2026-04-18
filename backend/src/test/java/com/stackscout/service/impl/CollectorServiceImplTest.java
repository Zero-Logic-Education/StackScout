package com.stackscout.service.impl;

import com.stackscout.messaging.CollectorProducer;
import com.stackscout.model.Library;
import com.stackscout.repository.LibraryRepository;
import com.stackscout.service.HealthScoreService;
import com.stackscout.service.LicenseService;
import com.stackscout.source.SourceAdapter;
import com.stackscout.source.SourceDefinition;
import com.stackscout.source.SourceRegistryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CollectorServiceImplTest {

    @Mock
    private LicenseService licenseService;

    @Mock
    private HealthScoreService healthScoreService;

    @Mock
    private LibraryRepository libraryRepository;

    @Mock
    private CollectorProducer collectorProducer;

    @Mock
    private SourceRegistryService sourceRegistryService;

    @Mock
    private SourceAdapter sourceAdapter;

    private CollectorServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new CollectorServiceImpl(
                licenseService,
                healthScoreService,
                libraryRepository,
                collectorProducer,
                sourceRegistryService
        );
    }

    @Test
    void collect_ShouldCollectAndSaveNewLibrary() {
        String source = "pypi";
        String name = "requests";
        Library library = createLibrary(name, "2.31.0", "Apache-2.0");
        SourceDefinition definition = new SourceDefinition("pypi", "PyPI", "https://pypi.org", "pypi", List.of());

        when(sourceRegistryService.getRequiredAdapter(source)).thenReturn(sourceAdapter);
        when(sourceAdapter.collect(name)).thenReturn(library);
        when(sourceAdapter.getDefinition()).thenReturn(definition);
        when(licenseService.normalizeLicense("Apache-2.0")).thenReturn("Apache-2.0");
        when(healthScoreService.calculateScore(library)).thenReturn(85);
        when(libraryRepository.findByName(name)).thenReturn(Optional.empty());
        when(libraryRepository.save(any(Library.class))).thenReturn(library);

        Library result = service.collect(source, name);

        assertNotNull(result);
        assertEquals("requests", result.getName());
        assertEquals(85, result.getHealthScore());
        assertEquals("pypi", result.getSource());
        verify(libraryRepository).save(any(Library.class));
    }

    @Test
    void collect_ShouldUpdateExistingLibrary() {
        String source = "npm";
        String name = "react";
        Library existingLibrary = createLibrary(name, "17.0.0", "MIT");
        existingLibrary.setId(1L);
        Library newLibrary = createLibrary(name, "18.0.0", "MIT");
        SourceDefinition definition = new SourceDefinition("npm", "npm", "https://npmjs.com", "npm", List.of());

        when(sourceRegistryService.getRequiredAdapter(source)).thenReturn(sourceAdapter);
        when(sourceAdapter.collect(name)).thenReturn(newLibrary);
        when(sourceAdapter.getDefinition()).thenReturn(definition);
        when(licenseService.normalizeLicense("MIT")).thenReturn("MIT");
        when(healthScoreService.calculateScore(newLibrary)).thenReturn(90);
        when(libraryRepository.findByName(name)).thenReturn(Optional.of(existingLibrary));
        when(libraryRepository.save(any(Library.class))).thenReturn(newLibrary);

        Library result = service.collect(source, name);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(libraryRepository).save(argThat(lib -> lib.getId().equals(1L)));
    }

    @Test
    void collect_ShouldReturnNull_WhenAdapterReturnsNull() {
        String source = "dockerhub";
        String name = "unknown-image";

        when(sourceRegistryService.getRequiredAdapter(source)).thenReturn(sourceAdapter);
        when(sourceAdapter.collect(name)).thenReturn(null);

        Library result = service.collect(source, name);

        assertNull(result);
        verify(libraryRepository, never()).save(any());
    }

    @Test
    void collect_ShouldNormalizeLicense() {
        String source = "maven";
        String name = "spring-boot";
        Library library = createLibrary(name, "3.0.0", "apache 2.0");
        SourceDefinition definition = new SourceDefinition("maven", "Maven", "https://maven.org", "maven", List.of());

        when(sourceRegistryService.getRequiredAdapter(source)).thenReturn(sourceAdapter);
        when(sourceAdapter.collect(name)).thenReturn(library);
        when(sourceAdapter.getDefinition()).thenReturn(definition);
        when(licenseService.normalizeLicense("apache 2.0")).thenReturn("Apache-2.0");
        when(healthScoreService.calculateScore(library)).thenReturn(80);
        when(libraryRepository.findByName(name)).thenReturn(Optional.empty());
        when(libraryRepository.save(any(Library.class))).thenReturn(library);

        Library result = service.collect(source, name);

        verify(licenseService).normalizeLicense("apache 2.0");
        assertEquals("Apache-2.0", result.getLicense());
    }

    @Test
    void collect_ShouldCalculateHealthScore() {
        String source = "github";
        String name = "kubernetes/kubernetes";
        Library library = createLibrary(name, "1.28.0", "Apache-2.0");
        SourceDefinition definition = new SourceDefinition("github", "GitHub", "https://github.com", "github", List.of());

        when(sourceRegistryService.getRequiredAdapter(source)).thenReturn(sourceAdapter);
        when(sourceAdapter.collect(name)).thenReturn(library);
        when(sourceAdapter.getDefinition()).thenReturn(definition);
        when(licenseService.normalizeLicense(anyString())).thenReturn("Apache-2.0");
        when(healthScoreService.calculateScore(library)).thenReturn(95);
        when(libraryRepository.findByName(name)).thenReturn(Optional.empty());
        when(libraryRepository.save(any(Library.class))).thenReturn(library);

        Library result = service.collect(source, name);

        verify(healthScoreService).calculateScore(library);
        assertEquals(95, result.getHealthScore());
    }

    @Test
    void collectBulk_ShouldQueueAllPackages() {
        String source = "pypi";
        List<String> packages = List.of("requests", "numpy", "pandas");

        when(sourceRegistryService.normalize(source)).thenReturn("pypi");

        service.collectBulk(source, packages);

        verify(collectorProducer, times(3)).sendScanRequest(eq("pypi"), anyString());
        verify(collectorProducer).sendScanRequest("pypi", "requests");
        verify(collectorProducer).sendScanRequest("pypi", "numpy");
        verify(collectorProducer).sendScanRequest("pypi", "pandas");
    }

    @Test
    void collectBulk_ShouldNormalizeSource() {
        String source = "PYPI";
        List<String> packages = List.of("flask");

        when(sourceRegistryService.normalize(source)).thenReturn("pypi");

        service.collectBulk(source, packages);

        verify(sourceRegistryService).normalize("PYPI");
        verify(collectorProducer).sendScanRequest("pypi", "flask");
    }

    @Test
    void collectBulk_ShouldHandleEmptyList() {
        String source = "npm";
        List<String> packages = List.of();

        when(sourceRegistryService.normalize(source)).thenReturn("npm");

        service.collectBulk(source, packages);

        verify(collectorProducer, never()).sendScanRequest(anyString(), anyString());
    }

    private Library createLibrary(String name, String version, String license) {
        Library library = new Library();
        library.setName(name);
        library.setVersion(version);
        library.setLicense(license);
        library.setDescription("Test library");
        return library;
    }
}
