package com.stackscout.repository;

import com.stackscout.model.Library;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration тесты для репозиториев с использованием H2 in-memory БД
 */
@DataJpaTest
class RepositoryTest {

    @Autowired
    private LibraryRepository libraryRepository;

    @Autowired
    private UserRepository userRepository;

    private Library testLibrary1;
    private Library testLibrary2;

    @BeforeEach
    void setUp() {
        libraryRepository.deleteAll();

        testLibrary1 = new Library();
        testLibrary1.setName("requests");
        testLibrary1.setVersion("2.31.0");
        testLibrary1.setSource("pypi");
        testLibrary1.setLicense("MIT");
        testLibrary1.setHealthScore(85);
        testLibrary1.setDescription("Python HTTP library for humans");
        testLibrary1.setRepository("https://github.com/psf/requests");

        testLibrary2 = new Library();
        testLibrary2.setName("flask");
        testLibrary2.setVersion("3.0.0");
        testLibrary2.setSource("pypi");
        testLibrary2.setLicense("BSD-3-Clause");
        testLibrary2.setHealthScore(90);
        testLibrary2.setDescription("A lightweight WSGI web application framework");
        testLibrary2.setRepository("https://github.com/pallets/flask");

        libraryRepository.saveAll(List.of(testLibrary1, testLibrary2));
    }

    @Test
    void findByName_ShouldReturnLibrary() {
        Optional<Library> result = libraryRepository.findByName("requests");

        assertTrue(result.isPresent());
        assertEquals("requests", result.get().getName());
        assertEquals("pypi", result.get().getSource());
    }

    @Test
    void findByName_WhenNotExists_ShouldReturnEmpty() {
        Optional<Library> result = libraryRepository.findByName("nonexistent");

        assertTrue(result.isEmpty());
    }

    @Test
    void findBySource_ShouldReturnLibrariesFromSameSource() {
        List<Library> result = libraryRepository.findBySource("pypi");

        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(lib -> "pypi".equals(lib.getSource())));
    }

    @Test
    void findBySource_WithPagination_ShouldReturnCorrectPage() {
        Pageable pageable = PageRequest.of(0, 1);
        Page<Library> result = libraryRepository.findBySource("pypi", pageable);

        assertEquals(1, result.getSize());
        assertEquals(2, result.getTotalElements());
    }

    @Test
    void searchByName_ShouldFindPartialMatches() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Library> result = libraryRepository.searchByName("request", pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("requests", result.getContent().get(0).getName());
    }

    @Test
    void searchByName_WithCaseInsensitivity_ShouldMatch() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Library> result = libraryRepository.searchByName("REQUESTS", pageable);

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void searchByNameAndMinScore_ShouldFilterByScore() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Library> result = libraryRepository.searchByNameAndMinScore("flask", 80, pageable);

        assertEquals(1, result.getTotalElements());
        assertTrue(result.getContent().get(0).getHealthScore() >= 80);
    }

    @Test
    void searchByNameAndSource_ShouldFilterByBoth() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Library> result = libraryRepository.searchByNameAndSource("flask", "pypi", pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("flask", result.getContent().get(0).getName());
        assertEquals("pypi", result.getContent().get(0).getSource());
    }

    @Test
    void findByHealthScoreGreaterThanEqual_ShouldReturnQualifiedLibraries() {
        List<Library> result = libraryRepository.findByHealthScoreGreaterThanEqual(85);

        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(lib -> lib.getHealthScore() >= 85));
    }

    @Test
    void findBySourceAndHealthScoreGreaterThanEqual_ShouldFilterCorrectly() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Library> result = libraryRepository.findBySourceAndHealthScoreGreaterThanEqual("pypi", 90, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals(90, result.getContent().get(0).getHealthScore());
    }

    @Test
    void findByLicense_ShouldReturnLibrariesWithSameLicense() {
        List<Library> result = libraryRepository.findByLicense("MIT");

        assertEquals(1, result.size());
        assertEquals("requests", result.get(0).getName());
    }

    @Test
    void existsByNameAndVersion_ShouldReturnTrue() {
        boolean exists = libraryRepository.existsByNameAndVersion("requests", "2.31.0");

        assertTrue(exists);
    }

    @Test
    void existsByNameAndVersion_WhenNotExists_ShouldReturnFalse() {
        boolean exists = libraryRepository.existsByNameAndVersion("requests", "3.0.0");

        assertFalse(exists);
    }

    @Test
    void findAll_ShouldReturnAllLibraries() {
        List<Library> result = libraryRepository.findAll();

        assertEquals(2, result.size());
    }

    @Test
    void findById_ShouldReturnLibrary() {
        Long id = testLibrary1.getId();
        assertNotNull(id);

        Optional<Library> result = libraryRepository.findById(id);

        assertTrue(result.isPresent());
        assertEquals("requests", result.get().getName());
    }

    @Test
    void deleteById_ShouldRemoveLibrary() {
        Long id = testLibrary1.getId();
        assertNotNull(id);

        libraryRepository.deleteById(id);

        assertFalse(libraryRepository.findById(id).isPresent());
    }

    @Test
    void existsById_ShouldReturnTrueForExistingLibrary() {
        Long id = testLibrary1.getId();
        assertNotNull(id);

        assertTrue(libraryRepository.existsById(id));
    }

    @Test
    void existsById_ShouldReturnFalseForNonExistingLibrary() {
        assertFalse(libraryRepository.existsById(999L));
    }
}
