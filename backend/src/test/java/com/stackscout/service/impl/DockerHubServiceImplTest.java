// File: DockerHubServiceImplTest.java
package com.stackscout.service.impl;

import com.stackscout.model.Library;
import com.stackscout.service.DockerHubService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withResourceNotFound;

/**
 * Тесты для DockerHubServiceImpl.
 * Проверяют корректность получения информации об образах из Docker Hub API.
 */
class DockerHubServiceImplTest {

	private DockerHubService dockerHubService;
	private MockRestServiceServer mockServer;

	@BeforeEach
	void setUp() {
		RestClient.Builder builder = RestClient.builder();
		mockServer = MockRestServiceServer.bindTo(builder).build();
		dockerHubService = new DockerHubServiceImpl(builder);
	}

	@Test
	void getImageInfo_ShouldReturnLibrary_WhenImageExists_Official() {
		// Arrange
		String jsonResponse = """
				{
				    "user": "library",
				    "name": "nginx",
				    "namespace": "library",
				    "description": "Official build of Nginx.",
				    "star_count": 1000,
				    "pull_count": 5000000,
				    "last_updated": "2024-01-20T10:00:00.000Z",
				    "hub_user": "library"
				}
				""";

		mockServer.expect(requestTo("https://hub.docker.com/v2/repositories/library/nginx"))
				.andRespond(withSuccess(jsonResponse, MediaType.APPLICATION_JSON));

		// Act
		Library result = dockerHubService.collect("nginx");

		// Assert
		assertNotNull(result);
		assertEquals("nginx", result.getName());
		assertEquals("dockerhub", result.getSource());
		assertEquals("Official build of Nginx.", result.getDescription());
		assertEquals("https://hub.docker.com/r/library/nginx", result.getRepository());
	}

	@Test
	void getImageInfo_ShouldReturnLibrary_WhenImageExists_Custom() {
		// Arrange
		String jsonResponse = """
				{
				    "user": "mysql",
				    "name": "mysql-server",
				    "namespace": "mysql",
				    "description": "MySQL Server",
				    "star_count": 500,
				    "pull_count": 100000,
				    "last_updated": "2024-01-15T12:00:00.000Z",
				    "hub_user": "mysql"
				}
				""";

		mockServer.expect(requestTo("https://hub.docker.com/v2/repositories/mysql/mysql-server"))
				.andRespond(withSuccess(jsonResponse, MediaType.APPLICATION_JSON));

		// Act
		Library result = dockerHubService.collect("mysql/mysql-server");

		// Assert
		assertNotNull(result);
		assertEquals("mysql/mysql-server", result.getName());
	}

	@Test
	void getImageInfo_ShouldReturnEmpty_WhenImageNotFound() {
		// Arrange
		mockServer.expect(requestTo("https://hub.docker.com/v2/repositories/library/unknown"))
				.andRespond(withResourceNotFound());

		// Act
		Library result = dockerHubService.collect("unknown");

		// Assert
		assertNull(result);
	}
}
