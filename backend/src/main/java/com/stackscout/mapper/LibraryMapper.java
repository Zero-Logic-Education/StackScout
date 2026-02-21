// File: LibraryMapper.java
package com.stackscout.mapper;

import com.stackscout.dto.CreateLibraryRequest;
import com.stackscout.dto.LibraryDto;
import com.stackscout.dto.UpdateLibraryRequest;
import com.stackscout.model.Library;
import org.springframework.stereotype.Component;

/**
 * Маппер для преобразования между сущностью Library и объектами передачи данных
 * (DTO).
 */
@Component
public class LibraryMapper {

    /**
     * Конвертация Entity в DTO
     */
    public LibraryDto toDto(Library library) {
        if (library == null) {
            return null;
        }

        return new LibraryDto(
                library.getId(),
                library.getName(),
                library.getVersion(),
                library.getSource(),
                library.getLicense(),
                library.getHealthScore(),
                library.getLastRelease(),
                library.getRepository(),
                library.getDescription(),
                library.getCreatedAt() != null ? library.getCreatedAt().toString() : null,
                library.getUpdatedAt() != null ? library.getUpdatedAt().toString() : null);
    }

    /**
     * Конвертация CreateRequest в Entity
     */
    public Library toEntity(CreateLibraryRequest request) {
        if (request == null) {
            return null;
        }

        Library library = new Library();
        library.setName(request.getName());
        library.setVersion(request.getVersion());
        library.setSource(request.getSource());
        library.setLicense(request.getLicense());
        library.setHealthScore(request.getHealthScore());
        library.setLastRelease(request.getLastRelease());
        library.setRepository(request.getRepository());
        library.setDescription(request.getDescription());

        return library;
    }

    /**
     * Обновление Entity из UpdateRequest
     */
    public void updateEntityFromDto(Library library, UpdateLibraryRequest request) {
        if (library == null || request == null) {
            return;
        }

        if (request.getName() != null) {
            library.setName(request.getName());
        }
        if (request.getVersion() != null) {
            library.setVersion(request.getVersion());
        }
        if (request.getSource() != null) {
            library.setSource(request.getSource());
        }
        if (request.getLicense() != null) {
            library.setLicense(request.getLicense());
        }
        if (request.getHealthScore() != null) {
            library.setHealthScore(request.getHealthScore());
        }
        if (request.getLastRelease() != null) {
            library.setLastRelease(request.getLastRelease());
        }
        if (request.getRepository() != null) {
            library.setRepository(request.getRepository());
        }
        if (request.getDescription() != null) {
            library.setDescription(request.getDescription());
        }
    }
}
