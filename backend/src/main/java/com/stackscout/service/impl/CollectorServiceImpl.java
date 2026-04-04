// File: CollectorServiceImpl.java
package com.stackscout.service.impl;

import com.stackscout.model.Library;
import com.stackscout.repository.LibraryRepository;
import com.stackscout.messaging.CollectorProducer;
import com.stackscout.service.*;
import com.stackscout.source.SourceAdapter;
import com.stackscout.source.SourceRegistryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Сервис-оркестратор, координирующий сбор данных из различных источников.
 * Выполняет нормализацию данных, расчет рейтинга и сохранение результатов в базу данных.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CollectorServiceImpl implements CollectorService {

	private final LicenseService licenseService;
	private final HealthScoreService healthScoreService;
	private final LibraryRepository libraryRepository;
	private final CollectorProducer collectorProducer;
	private final SourceRegistryService sourceRegistryService;

	@Override
	@Transactional
	public Library collect(String source, String name) {
		log.info("Collecting metadata for package {} from {}", name, source);

		SourceAdapter adapter = sourceRegistryService.getRequiredAdapter(source);
		Library library = adapter.collect(name);

		if (library == null) {
			log.warn("No metadata found for {} from {}", name, source);
			return null;
		}

		// Normalize license
		if (library.getLicense() != null) {
			String normalizedLicense = licenseService.normalizeLicense(library.getLicense());
			library.setLicense(normalizedLicense);
		}

		// Calculate health score
		Integer healthScore = healthScoreService.calculateScore(library);
		library.setHealthScore(healthScore);

		// Save or update
		Library existing = libraryRepository.findByName(name).orElse(null);
		if (existing != null) {
			library.setId(existing.getId());
		}
		library.setSource(adapter.getDefinition().key());

		return libraryRepository.save(library);
	}

	@Override
	public void collectBulk(String source, List<String> names) {
		log.info("Queuing bulk scan for {} packages from {}", names.size(), source);
		String normalizedSource = sourceRegistryService.normalize(source);
		for (String name : names) {
			collectorProducer.sendScanRequest(normalizedSource, name);
		}
	}
}
