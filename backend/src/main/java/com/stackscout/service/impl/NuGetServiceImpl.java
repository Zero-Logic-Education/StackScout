package com.stackscout.service.impl;

import com.stackscout.model.Library;
import com.stackscout.source.SourceAdapter;
import com.stackscout.source.SourceDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NuGetServiceImpl implements SourceAdapter {

    private final RestClient restClient;

    public NuGetServiceImpl() {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.nuget.org")
                .build();
    }

    public NuGetServiceImpl(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .baseUrl("https://api.nuget.org")
                .build();
    }

    @Override
    @SuppressWarnings("unchecked")
    public Library collect(String identifier) {
        try {
            String packageId = identifier.trim();
            String normalizedId = packageId.toLowerCase(Locale.ROOT);

            Map<String, Object> versionsResponse = restClient.get()
                    .uri("/v3-flatcontainer/{id}/index.json", normalizedId)
                    .retrieve()
                    .body(Map.class);

            List<Object> versions = asList(versionsResponse != null ? versionsResponse.get("versions") : null);
            if (versions.isEmpty()) {
                return null;
            }

            String latestVersion = String.valueOf(versions.get(versions.size() - 1));
            Map<String, Object> leaf = restClient.get()
                    .uri("/v3/registration5-semver1/{id}/{version}.json", normalizedId, latestVersion)
                    .retrieve()
                    .body(Map.class);
            Map<String, Object> catalogEntry = asMap(leaf != null ? leaf.get("catalogEntry") : null);

            Library library = new Library();
            library.setName(packageId);
            library.setVersion(latestVersion);
            library.setSource("nuget");
            library.setDescription(stringOrNull(catalogEntry.get("description")));
            library.setLicense(firstNonBlank(
                    stringOrNull(catalogEntry.get("licenseExpression")),
                    stringOrNull(catalogEntry.get("licenseUrl"))));
            library.setRepository(firstNonBlank(
                    stringOrNull(catalogEntry.get("projectUrl")),
                    stringOrNull(catalogEntry.get("iconUrl"))));
            library.setLastRelease(stringOrNull(catalogEntry.get("published")));

            return library;
        } catch (Exception e) {
            log.warn("Failed to fetch NuGet package info for {}: {}", identifier, e.getMessage());
            return null;
        }
    }

    @Override
    public SourceDefinition getDefinition() {
        return new SourceDefinition(
                "nuget",
                "NuGet",
                "package-registry",
                ".NET package registry",
                List.of("dotnet"));
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> asMap(Object value) {
        if (value instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return Map.of();
    }

    @SuppressWarnings("unchecked")
    private static List<Object> asList(Object value) {
        if (value instanceof List<?> list) {
            return (List<Object>) list;
        }
        return List.of();
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private static String stringOrNull(Object value) {
        if (value instanceof String text) {
            return text;
        }
        return null;
    }
}