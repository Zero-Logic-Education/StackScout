// File: PyPiServiceImpl.java
package com.stackscout.service.impl;

import com.stackscout.dto.pypi.PyPiDTOs;
import com.stackscout.model.Library;
import com.stackscout.service.PyPiService;
import com.stackscout.source.SourceAdapter;
import com.stackscout.source.SourceDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Реализация сервиса для взаимодействия с PyPI (Python Package Index) API.
 * Позволяет получать информацию о Python-пакетах, их версиях и лицензиях.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PyPiServiceImpl implements PyPiService, SourceAdapter {

	private final RestClient restClient;
	/**
	 * Конструктор по умолчанию. Настраивает RestClient для PyPI API.
	 */
	public PyPiServiceImpl() {
		this.restClient = RestClient.builder()
				.baseUrl("https://pypi.org/pypi")
				.build();
	}

	/**
	 * Конструктор для внедрения зависимостей в тестах.
	 * 
	 * @param restClientBuilder Билдер для RestClient.
	 */
	public PyPiServiceImpl(RestClient.Builder restClientBuilder) {
		this.restClient = restClientBuilder
				.baseUrl("https://pypi.org/pypi")
				.build();
	}

	/**
	 * Получение информации о пакете из PyPI.
	 * 
	 * @param packageName Имя пакета.
	 * @return Объект Library с данными о пакете или null в случае ошибки.
	 */
	@Override
	public Library collect(String packageName) {
		try {
			PyPiDTOs.PyPiResponse response = restClient.get()
					.uri("/{package}/json", packageName)
					.retrieve()
					.body(PyPiDTOs.PyPiResponse.class);
			
			if (response == null) {
				return null;
			}
			
			return mapToLibrary(response);
		} catch (Exception e) {
			log.warn("Failed to fetch PyPI package info for: {}", packageName, e.getMessage());
			return null;
		}
	}

	@Override
	public SourceDefinition getDefinition() {
		return new SourceDefinition(
				"pypi",
				"PyPI",
				"package-registry",
				"Python package registry",
				java.util.List.of("python")
		);
	}

	private Library mapToLibrary(PyPiDTOs.PyPiResponse response) {
		PyPiDTOs.PyPiInfo info = response.info();

		Library lib = new Library();
		lib.setName(info.name());
		lib.setVersion(info.version());
		lib.setSource("pypi");
		lib.setLicense(info.license());
		lib.setHealthScore(0); // Calculator will be implemented later
		lib.setDescription(info.summary());

		// Find repository URL
		String repoUrl = info.homePage();
		if (info.projectUrls() != null) {
			for (Map.Entry<String, String> entry : info.projectUrls().entrySet()) {
				String key = entry.getKey().toLowerCase();
				String value = entry.getValue();
				if (key.contains("source") || key.contains("repository") || key.contains("github")
						|| key.contains("gitlab")) {
					repoUrl = value;
					break;
				}
			}
		}
		lib.setRepository(repoUrl);

		// Find last release date
		if (response.releases() != null && response.releases().containsKey(info.version())) {
			var releases = response.releases().get(info.version());
			if (releases != null && !releases.isEmpty()) {
				String uploadTime = releases.get(0).uploadTime();
				lib.setLastRelease(uploadTime);
			}
		}

		return lib;
	}
}
