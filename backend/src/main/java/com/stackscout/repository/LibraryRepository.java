// File: LibraryRepository.java
package com.stackscout.repository;

import com.stackscout.model.Library;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Репозиторий для доступа к данным библиотек (бизнес-модель Library).
 */
@Repository
public interface LibraryRepository extends JpaRepository<Library, Long> {

    /**
     * Найти библиотеку по имени
     */
    Optional<Library> findByName(String name);

    /**
     * Найти библиотеки по источнику (pypi, npm, dockerhub)
     */
    List<Library> findBySource(String source);

    /**
     * Найти библиотеки по источнику с пагинацией
     */
    Page<Library> findBySource(String source, Pageable pageable);

    /**
     * Поиск библиотек по имени (частичное совпадение)
     */
    @Query("SELECT l FROM Library l WHERE LOWER(l.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Library> searchByName(@Param("query") String query, Pageable pageable);

        @Query("SELECT l FROM Library l WHERE LOWER(l.name) LIKE LOWER(CONCAT('%', :query, '%')) AND l.healthScore >= :minScore")
        Page<Library> searchByNameAndMinScore(@Param("query") String query, @Param("minScore") Integer minScore,
            Pageable pageable);

    /**
     * Поиск библиотек по имени и источнику
     */
    @Query("SELECT l FROM Library l WHERE LOWER(l.name) LIKE LOWER(CONCAT('%', :query, '%')) AND l.source = :source")
    Page<Library> searchByNameAndSource(@Param("query") String query, @Param("source") String source,
            Pageable pageable);

        @Query("SELECT l FROM Library l WHERE LOWER(l.name) LIKE LOWER(CONCAT('%', :query, '%')) AND l.source = :source AND l.healthScore >= :minScore")
        Page<Library> searchByNameAndSourceAndMinScore(@Param("query") String query, @Param("source") String source,
            @Param("minScore") Integer minScore, Pageable pageable);

        Page<Library> findBySourceAndHealthScoreGreaterThanEqual(String source, Integer minScore, Pageable pageable);

        Page<Library> findByHealthScoreGreaterThanEqual(Integer minScore, Pageable pageable);

    /**
     * Найти библиотеки с оценкой здоровья выше определенного значения
     */
    List<Library> findByHealthScoreGreaterThanEqual(Integer minScore);

    /**
     * Найти библиотеки по лицензии
     */
    List<Library> findByLicense(String license);

    /**
     * Проверить существование библиотеки по имени и версии
     */
    boolean existsByNameAndVersion(String name, String version);
}