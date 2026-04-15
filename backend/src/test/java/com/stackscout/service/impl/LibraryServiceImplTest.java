package com.stackscout.service.impl;

import com.stackscout.dto.CreateLibraryRequest;
import com.stackscout.dto.LibraryDto;
import com.stackscout.dto.UpdateLibraryRequest;
import com.stackscout.exception.ResourceNotFoundException;
import com.stackscout.mapper.LibraryMapper;
import com.stackscout.model.Library;
import com.stackscout.repository.LibraryRepository;
import com.stackscout.service.LicenseService;
import com.stackscout.service.LibraryUpdateService;
import com.stackscout.source.SourceRegistryService;
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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit тесты для LibraryServiceImpl
 */
@ExtendWith(MockitoExtension.class)
class LibraryServiceImplTest {

    @Mock
    private LibraryRepository libraryRepository;

    @Mock
    private LibraryMapper libraryMapper;

    @Mock
    private LibraryUpdateService libraryUpdateService;

    @Mock
    private SourceRegistryService sourceRegistryService;

    @Mock
    private LicenseService licenseService;

    @InjectMocks
    private LibraryServiceImpl libraryService;

    private Library testLibrary;
    private LibraryDto testLibraryDto;

    @BeforeEach
    void setUp() {
        testLibrary = new Library();
        testLibrary.setId(1L);
        testLibrary.setName("requests");
        testLibrary.setVersion("2.31.0");
        testLibrary.setSource("pypi");
        testLibrary.setLicense("MIT");
        testLibrary.setHealthScore(85);
        testLibrary.setDescription("Python HTTP library");

        testLibraryDto = new LibraryDto();
        testLibraryDto.setId(1L);
        testLibraryDto.setName("requests");
        testLibraryDto.setVersion("2.31.0");
        testLibraryDto.setSource("pypi");
        testLibraryDto.setLicense("MIT");
        testLibraryDto.setHealthScore(85);
        testLibraryDto.setDescription("Python HTTP library");
    }

    @Test
    void getAllLibraries_ShouldReturnPagedLibraries() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Library> libraryPage = new PageImpl<>(List.of(testLibrary), pageable, 1);
        when(libraryRepository.findAll(pageable)).thenReturn(libraryPage);
        when(libraryMapper.toDto(testLibrary)).thenReturn(testLibraryDto);

        // When
        Page<LibraryDto> result = libraryService.getAllLibraries(pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("requests", result.getContent().get(0).getName());
        verify(libraryRepository).findAll(pageable);
        verify(libraryMapper).toDto(testLibrary);
    }

    @Test
    void getAllLibraries_WithNullPageable_ShouldThrowException() {
        assertThrows(IllegalArgumentException.class, () -> libraryService.getAllLibraries(null));
    }

    @Test
    void getLibraryById_WhenExists_ShouldReturnLibraryDto() {
        // Given
        when(libraryRepository.findById(1L)).thenReturn(Optional.of(testLibrary));
        when(libraryMapper.toDto(testLibrary)).thenReturn(testLibraryDto);

        // When
        LibraryDto result = libraryService.getLibraryById(1L);

        // Then
        assertNotNull(result);
        assertEquals("requests", result.getName());
        verify(libraryRepository).findById(1L);
    }

    @Test
    void getLibraryById_WhenNotExists_ShouldThrowResourceNotFoundException() {
        when(libraryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> libraryService.getLibraryById(999L));
    }

    @Test
    void getLibraryById_WithNullId_ShouldThrowException() {
        assertThrows(IllegalArgumentException.class, () -> libraryService.getLibraryById(null));
    }

    @Test
    void createLibrary_ShouldReturnCreatedLibraryDto() {
        // Given
        CreateLibraryRequest request = new CreateLibraryRequest();
        request.setName("flask");
        request.setVersion("3.0.0");
        request.setSource("pypi");

        Library mappedLibrary = new Library();
        mappedLibrary.setName("flask");
        mappedLibrary.setVersion("3.0.0");
        mappedLibrary.setSource("pypi");

        Library savedLibrary = new Library();
        savedLibrary.setId(2L);
        savedLibrary.setName("flask");
        savedLibrary.setVersion("3.0.0");
        savedLibrary.setSource("pypi");

        LibraryDto savedDto = new LibraryDto();
        savedDto.setId(2L);
        savedDto.setName("flask");
        savedDto.setVersion("3.0.0");
        savedDto.setSource("pypi");

        when(libraryMapper.toEntity(request)).thenReturn(mappedLibrary);
        when(libraryRepository.save(mappedLibrary)).thenReturn(savedLibrary);
        when(libraryMapper.toDto(savedLibrary)).thenReturn(savedDto);

        // When
        LibraryDto result = libraryService.createLibrary(request);

        // Then
        assertNotNull(result);
        assertEquals("flask", result.getName());
        assertEquals(2L, result.getId());
        verify(libraryRepository).save(mappedLibrary);
    }

    @Test
    void updateLibrary_WhenExists_ShouldReturnUpdatedDto() {
        // Given
        UpdateLibraryRequest request = new UpdateLibraryRequest();
        request.setVersion("2.32.0");

        when(libraryRepository.findById(1L)).thenReturn(Optional.of(testLibrary));
        when(libraryRepository.save(any(Library.class))).thenReturn(testLibrary);
        when(libraryMapper.toDto(testLibrary)).thenReturn(testLibraryDto);
        doNothing().when(libraryMapper).updateEntityFromDto(any(Library.class), any(UpdateLibraryRequest.class));

        // When
        LibraryDto result = libraryService.updateLibrary(1L, request);

        // Then
        assertNotNull(result);
        verify(libraryRepository).save(testLibrary);
    }

    @Test
    void updateLibrary_WhenNotExists_ShouldThrowResourceNotFoundException() {
        when(libraryRepository.findById(999L)).thenReturn(Optional.empty());
        UpdateLibraryRequest request = new UpdateLibraryRequest();

        assertThrows(ResourceNotFoundException.class, () -> libraryService.updateLibrary(999L, request));
    }

    @Test
    void deleteLibrary_WhenExists_ShouldSucceed() {
        when(libraryRepository.existsById(1L)).thenReturn(true);
        doNothing().when(libraryRepository).deleteById(1L);

        assertDoesNotThrow(() -> libraryService.deleteLibrary(1L));
        verify(libraryRepository).deleteById(1L);
    }

    @Test
    void deleteLibrary_WhenNotExists_ShouldThrowResourceNotFoundException() {
        when(libraryRepository.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> libraryService.deleteLibrary(999L));
    }

    @Test
    void searchLibraries_ShouldReturnPagedResults() {
        // Given
        String query = "request";
        Pageable pageable = PageRequest.of(0, 10);
        Page<Library> libraryPage = new PageImpl<>(List.of(testLibrary), pageable, 1);

        when(libraryRepository.searchByName(query, pageable)).thenReturn(libraryPage);
        when(libraryMapper.toDto(testLibrary)).thenReturn(testLibraryDto);

        // When
        Page<LibraryDto> result = libraryService.searchLibraries(query, pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(libraryRepository).searchByName(query, pageable);
    }

    @Test
    void getLibrariesStats_ShouldReturnCorrectStats() {
        // Given
        when(libraryRepository.findAll()).thenReturn(List.of(testLibrary));
        when(sourceRegistryService.normalize("pypi")).thenReturn("pypi");

        // When
        Object stats = libraryService.getLibrariesStats();

        // Then
        assertNotNull(stats);
        assertInstanceOf(java.util.Map.class, stats);
        @SuppressWarnings("unchecked")
        java.util.Map<String, Object> statsMap = (java.util.Map<String, Object>) stats;
        assertEquals(1L, statsMap.get("totalLibraries"));
        assertEquals(85.0, statsMap.get("averageHealthScore"));
    }
}
