package com.stackscout.service.impl;

import com.stackscout.dto.LibraryUpdateDto;
import com.stackscout.mapper.SubscriptionMapper;
import com.stackscout.model.Library;
import com.stackscout.model.LibraryUpdate;
import com.stackscout.model.UpdateType;
import com.stackscout.repository.LibraryRepository;
import com.stackscout.repository.LibraryUpdateRepository;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit тесты для LibraryUpdateServiceImpl
 */
@ExtendWith(MockitoExtension.class)
class LibraryUpdateServiceImplTest {

    @Mock
    private LibraryUpdateRepository updateRepository;

    @Mock
    private LibraryRepository libraryRepository;

    @Mock
    private SubscriptionMapper subscriptionMapper;

    @InjectMocks
    private LibraryUpdateServiceImpl libraryUpdateService;

    private Library testLibrary;
    private LibraryUpdate testUpdate;
    private LibraryUpdateDto testUpdateDto;

    @BeforeEach
    void setUp() {
        testLibrary = new Library();
        testLibrary.setId(10L);
        testLibrary.setName("requests");
        testLibrary.setSource("pypi");
        testLibrary.setVersion("2.31.0");

        testUpdate = LibraryUpdate.builder()
                .id(1L)
                .library(testLibrary)
                .oldVersion("1.0.0")
                .newVersion("2.0.0")
                .updateType(UpdateType.MAJOR)
                .changeLog("Breaking changes")
                .build();

        testUpdateDto = LibraryUpdateDto.builder()
                .id(1L)
                .libraryId(10L)
                .libraryName("requests")
                .oldVersion("1.0.0")
                .newVersion("2.0.0")
                .updateType(UpdateType.MAJOR)
                .changeLog("Breaking changes")
                .build();
    }

    @Test
    void getUpdatesForUser_ShouldReturnPagedUpdates() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        Page<LibraryUpdate> updatePage = new PageImpl<>(List.of(testUpdate), pageable, 1);
        when(updateRepository.findUpdatesForUserSubscriptions(1L, pageable)).thenReturn(updatePage);
        when(subscriptionMapper.toDto(testUpdate)).thenReturn(testUpdateDto);

        // When
        Page<LibraryUpdateDto> result = libraryUpdateService.getUpdatesForUser(1L, pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("requests", result.getContent().get(0).getLibraryName());
        verify(updateRepository).findUpdatesForUserSubscriptions(1L, pageable);
    }

    @Test
    void getLibraryUpdates_ShouldReturnPagedUpdates() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        Page<LibraryUpdate> updatePage = new PageImpl<>(List.of(testUpdate), pageable, 1);
        when(updateRepository.findByLibraryIdOrderByUpdateDateDesc(10L, pageable)).thenReturn(updatePage);
        when(subscriptionMapper.toDto(testUpdate)).thenReturn(testUpdateDto);

        // When
        Page<LibraryUpdateDto> result = libraryUpdateService.getLibraryUpdates(10L, pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(UpdateType.MAJOR, result.getContent().get(0).getUpdateType());
        verify(updateRepository).findByLibraryIdOrderByUpdateDateDesc(10L, pageable);
    }

    @Test
    void getRecentUpdatesForUser_ShouldReturnList() {
        // Given
        when(updateRepository.findRecentUpdatesForUser(eq(1L), any(LocalDateTime.class)))
                .thenReturn(List.of(testUpdate));
        when(subscriptionMapper.toDto(testUpdate)).thenReturn(testUpdateDto);

        // When
        List<LibraryUpdateDto> result = libraryUpdateService.getRecentUpdatesForUser(1L, 7);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("2.0.0", result.get(0).getNewVersion());
        verify(updateRepository).findRecentUpdatesForUser(eq(1L), any(LocalDateTime.class));
    }

    @Test
    void getRecentUpdatesForUser_WhenNoUpdates_ShouldReturnEmptyList() {
        // Given
        when(updateRepository.findRecentUpdatesForUser(eq(1L), any(LocalDateTime.class)))
                .thenReturn(List.of());

        // When
        List<LibraryUpdateDto> result = libraryUpdateService.getRecentUpdatesForUser(1L, 30);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void getUpdatesByType_ShouldReturnFilteredUpdates() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        Page<LibraryUpdate> updatePage = new PageImpl<>(List.of(testUpdate), pageable, 1);
        when(updateRepository.findByUpdateTypeOrderByUpdateDateDesc(UpdateType.MAJOR, pageable))
                .thenReturn(updatePage);
        when(subscriptionMapper.toDto(testUpdate)).thenReturn(testUpdateDto);

        // When
        Page<LibraryUpdateDto> result = libraryUpdateService.getUpdatesByType(UpdateType.MAJOR, pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(UpdateType.MAJOR, result.getContent().get(0).getUpdateType());
    }

    @Test
    void createUpdate_ShouldSaveAndReturnDto() {
        // Given
        when(libraryRepository.findById(10L)).thenReturn(Optional.of(testLibrary));
        when(updateRepository.save(any(LibraryUpdate.class))).thenReturn(testUpdate);
        when(subscriptionMapper.toDto(testUpdate)).thenReturn(testUpdateDto);

        // When
        LibraryUpdateDto result = libraryUpdateService.createUpdate(
                10L, "1.0.0", "2.0.0", UpdateType.MAJOR, "Breaking changes", 70, 80);

        // Then
        assertNotNull(result);
        assertEquals("2.0.0", result.getNewVersion());
        verify(libraryRepository).findById(10L);
        verify(updateRepository).save(any(LibraryUpdate.class));
    }

    @Test
    void createUpdate_WhenLibraryNotFound_ShouldThrowException() {
        // Given
        when(libraryRepository.findById(999L)).thenReturn(Optional.empty());

        // When / Then
        assertThrows(jakarta.persistence.EntityNotFoundException.class,
                () -> libraryUpdateService.createUpdate(
                        999L, "1.0.0", "2.0.0", UpdateType.MINOR, null, null, null));
    }

    @Test
    void getLatestUpdate_WhenExists_ShouldReturnDto() {
        // Given
        when(updateRepository.findLatestUpdateByLibraryId(10L)).thenReturn(testUpdate);
        when(subscriptionMapper.toDto(testUpdate)).thenReturn(testUpdateDto);

        // When
        LibraryUpdateDto result = libraryUpdateService.getLatestUpdate(10L);

        // Then
        assertNotNull(result);
        assertEquals("2.0.0", result.getNewVersion());
        verify(updateRepository).findLatestUpdateByLibraryId(10L);
    }

    @Test
    void getLatestUpdate_WhenNoneExists_ShouldReturnNull() {
        // Given
        when(updateRepository.findLatestUpdateByLibraryId(10L)).thenReturn(null);
        when(subscriptionMapper.toDto((com.stackscout.model.LibraryUpdate) null)).thenReturn(null);

        // When
        LibraryUpdateDto result = libraryUpdateService.getLatestUpdate(10L);

        // Then
        assertNull(result);
    }
}
