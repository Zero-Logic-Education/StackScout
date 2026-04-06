package com.stackscout.service.impl;

import com.stackscout.model.Library;
import com.stackscout.source.SourceAdapter;
import com.stackscout.source.SourceDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NpmServiceImpl implements SourceAdapter {

    private final RestClient restClient;

    public NpmServiceImpl() {
        this.restClient = RestClient.builder()
                .baseUrl("https://registry.npmjs.org")
                .build();
    }

    public NpmServiceImpl(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .baseUrl("https://registry.npmjs.org")
                .build();
    }

    @Override
    @SuppressWarnings("unchecked")
    public Library collect(String identifier) {
        try {
            Map<String, Object> response = restClient.get()
                    .uri("/{packageName}", identifier)
                    .retrieve()
                    .body(Map.class);

            if (response == null || response.isEmpty()) {
                return null;
            }

            String packageName = stringOrDefault(response.get("name"), identifier);
            Map<String, Object> distTags = asMap(response.get("dist-tags"));
            String latestVersion = stringOrDefault(distTags.get("latest"), "latest");

            Map<String, Object> versions = asMap(response.get("versions"));
            Map<String, Object> latestMeta = asMap(versions.get(latestVersion));

            Library library = new Library();
            library.setName(packageName);
            library.setVersion(latestVersion);
            library.setSource("npm");
            library.setDescription(
                    firstNonBlank(
                            stringOrNull(latestMeta.get("description")),
                            stringOrNull(response.get("description"))));
            library.setLicense(
                    firstNonBlank(
                            stringOrNull(latestMeta.get("license")),
                            stringOrNull(response.get("license"))));
            library.setRepository(extractRepositoryUrl(latestMeta, response));

            Map<String, Object> time = asMap(response.get("time"));
            String latestRelease = firstNonBlank(
                    stringOrNull(time.get("latest")),
                    stringOrNull(latestMeta.get("date")));
            library.setLastRelease(latestRelease);

            return library;
        } catch (Exception e) {
            log.warn("Failed to fetch npm package info for {}: {}", identifier, e.getMessage());
            return null;
        }
    }

    @Override
    public SourceDefinition getDefinition() {
        return new SourceDefinition(
                "npm",
                "npm",
                "package-registry",
                "Node.js package registry",
                List.of("node", "nodejs"));
    }

    private static String extractRepositoryUrl(Map<String, Object> latestMeta, Map<String, Object> root) {
        Object repository = latestMeta.get("repository");
        if (repository == null) {
            repository = root.get("repository");
        }

        if (repository instanceof String text && !text.isBlank()) {
            return text;
        }

        if (repository instanceof Map<?, ?> map) {
            Object url = map.get("url");
            if (url instanceof String value && !value.isBlank()) {
                return value;
            }
        }

        return null;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> asMap(Object value) {
        if (value instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return Map.of();
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private static String stringOrDefault(Object value, String fallback) {
        String parsed = stringOrNull(value);
        return parsed == null || parsed.isBlank() ? fallback : parsed;
    }

    private static String stringOrNull(Object value) {
        if (value instanceof String text) {
            return text;
        }
        return null;
    }
}