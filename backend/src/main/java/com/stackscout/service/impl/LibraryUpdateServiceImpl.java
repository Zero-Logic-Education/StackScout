package com.stackscout.service.impl;

import com.stackscout.dto.LibraryUpdateDto;
import com.stackscout.mapper.SubscriptionMapper;
import com.stackscout.model.Library;
import com.stackscout.model.LibraryUpdate;
import com.stackscout.model.UpdateType;
import com.stackscout.repository.LibraryRepository;
import com.stackscout.repository.LibraryUpdateRepository;
import com.stackscout.service.LibraryUpdateService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Реализация сервиса обновлений библиотек
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LibraryUpdateServiceImpl implements LibraryUpdateService {

    private final LibraryUpdateRepository updateRepository;
    private final LibraryRepository libraryRepository;
    private final SubscriptionMapper subscriptionMapper;

    @Override
    public Page<LibraryUpdateDto> getUpdatesForUser(Long userId, Pageable pageable) {
        log.debug("Getting updates for user {}", userId);
        
        Page<LibraryUpdate> updates = updateRepository.findUpdatesForUserSubscriptions(userId, pageable);
        return updates.map(subscriptionMapper::toDto);
    }

    @Override
    public Page<LibraryUpdateDto> getLibraryUpdates(Long libraryId, Pageable pageable) {
        log.debug("Getting updates for library {}", libraryId);
        
        Page<LibraryUpdate> updates = updateRepository.findByLibraryIdOrderByUpdateDateDesc(libraryId, pageable);
        return updates.map(subscriptionMapper::toDto);
    }

    @Override
    public List<LibraryUpdateDto> getRecentUpdatesForUser(Long userId, Integer days) {
        log.debug("Getting recent updates for user {} (last {} days)", userId, days);
        
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<LibraryUpdate> updates = updateRepository.findRecentUpdatesForUser(userId, since);
        
        return updates.stream()
                .map(subscriptionMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Page<LibraryUpdateDto> getUpdatesByType(UpdateType updateType, Pageable pageable) {
        log.debug("Getting updates by type {}", updateType);
        
        Page<LibraryUpdate> updates = updateRepository.findByUpdateTypeOrderByUpdateDateDesc(updateType, pageable);
        return updates.map(subscriptionMapper::toDto);
    }

    @Override
    @Transactional
    @SuppressWarnings("null")
    public LibraryUpdateDto createUpdate(Long libraryId, String oldVersion, String newVersion,
                                         UpdateType updateType, String changeLog,
                                         Integer oldHealthScore, Integer newHealthScore) {
        log.info("Creating update for library {}: {} -> {}", libraryId, oldVersion, newVersion);
        
        Library library = libraryRepository.findById(libraryId)
                .orElseThrow(() -> new EntityNotFoundException("Library not found with id: " + libraryId));
        
        LibraryUpdate update = LibraryUpdate.builder()
                .library(library)
                .oldVersion(oldVersion)
                .newVersion(newVersion)
                .updateType(updateType)
                .changeLog(changeLog)
                .oldHealthScore(oldHealthScore)
                .newHealthScore(newHealthScore)
                .build();
        
        LibraryUpdate saved = updateRepository.save(update);
        log.info("Update created for library {}", libraryId);
        
        return subscriptionMapper.toDto(saved);
    }

    @Override
    public LibraryUpdateDto getLatestUpdate(Long libraryId) {
        log.debug("Getting latest update for library {}", libraryId);
        
        LibraryUpdate latestUpdate = updateRepository.findLatestUpdateByLibraryId(libraryId);
        return subscriptionMapper.toDto(latestUpdate);
    }
}
