// File: DockerHubServiceImpl.java
package com.stackscout.service.impl;

import com.stackscout.dto.dockerhub.DockerHubDTOs;
import com.stackscout.model.Library;
import com.stackscout.service.DockerHubService;
import com.stackscout.source.SourceAdapter;
import com.stackscout.source.SourceDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

/**
 * Реализация сервиса для взаимодействия с Docker Hub API.
 * Позволяет получать информацию о репозиториях и образах Docker.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DockerHubServiceImpl implements DockerHubService, SourceAdapter {

	private final RestClient restClient;

	/**
	 * Конструктор по умолчанию. Настраивает RestClient для Docker Hub API.
	 */
	public DockerHubServiceImpl() {
		this.restClient = RestClient.builder()
				.baseUrl("https://hub.docker.com/v2/repositories")
				.build();
	}

	/**
	 * Конструктор для внедрения зависимостей в тестах.
	 * 
	 * @param restClientBuilder Билдер для RestClient.
	 */
	public DockerHubServiceImpl(RestClient.Builder restClientBuilder) {
		this.restClient = restClientBuilder
				.baseUrl("https://hub.docker.com/v2/repositories")
				.build();
	}

	/**
	 * Получение информации об образе из Docker Hub.
	 * 
	 * @param imageName Полное имя образа (с пространством имен или без).
	 * @return Объект Library с данными об образе или null в случае ошибки.
	 */
	@Override
	public Library collect(String imageName) {
		String namespace = "library";
		String repository = imageName;

		if (imageName.contains("/")) {
			String[] parts = imageName.split("/", 2);
			namespace = parts[0];
			repository = parts[1];
		}

		try {
			DockerHubDTOs.DockerHubRepository repo = restClient.get()
					.uri("/{namespace}/{repository}", namespace, repository)
					.retrieve()
					.body(DockerHubDTOs.DockerHubRepository.class);
			
			if (repo == null) {
				return null;
			}
			
			return mapToLibrary(repo);
		} catch (Exception e) {
			log.warn("Failed to fetch Docker Hub image info for: {}/{}", namespace, repository, e.getMessage());
			return null;
		}
	}

	private Library mapToLibrary(DockerHubDTOs.DockerHubRepository repo) {
		Library lib = new Library();
		lib.setName(repo.namespace().equals("library") ? repo.name() : repo.namespace() + "/" + repo.name());
		lib.setVersion("latest"); // Docker Hub API doesn't give a single version, defaulting to latest logic
		lib.setSource("dockerhub");
		lib.setLicense(""); // Docker Hub API doesn't consistently provide license in this endpoint
		lib.setHealthScore(0);
		lib.setDescription(repo.description());
		lib.setRepository("https://hub.docker.com/r/" + repo.namespace() + "/" + repo.name());

		if (repo.lastUpdated() != null) {
			lib.setLastRelease(repo.lastUpdated().toString());
		}

		return lib;
	}

	@Override
	public SourceDefinition getDefinition() {
		return new SourceDefinition(
				"dockerhub",
				"Docker Hub",
				"container-registry",
				"Container image registry",
				java.util.List.of("docker")
		);
	}
}
