package com.stackscout.service.impl;

import com.stackscout.model.Library;
import com.stackscout.source.SourceAdapter;
import com.stackscout.source.SourceDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MavenCentralServiceImpl implements SourceAdapter {

    private final RestClient restClient;

    public MavenCentralServiceImpl() {
        this.restClient = RestClient.builder()
                .baseUrl("https://search.maven.org")
                .build();
    }

    public MavenCentralServiceImpl(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .baseUrl("https://search.maven.org")
                .build();
    }

    @Override
    @SuppressWarnings("unchecked")
    public Library collect(String identifier) {
        try {
            String query = toQuery(identifier);
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            Map<String, Object> response = restClient.get()
                    .uri("/solrsearch/select?q=" + encodedQuery + "&rows=1&wt=json")
                    .retrieve()
                    .body(Map.class);

            if (response == null || response.isEmpty()) {
                return null;
            }

            Map<String, Object> responseBody = asMap(response.get("response"));
            List<Object> docs = asList(responseBody.get("docs"));
            if (docs.isEmpty()) {
                return null;
            }

            Map<String, Object> doc = asMap(docs.get(0));
            String groupId = stringOrDefault(doc.get("g"), "");
            String artifactId = stringOrDefault(doc.get("a"), identifier);
            String latestVersion = stringOrDefault(doc.get("latestVersion"), "latest");
            Long timestamp = longOrNull(doc.get("timestamp"));

            Library library = new Library();
            library.setName(groupId.isBlank() ? artifactId : groupId + ":" + artifactId);
            library.setVersion(latestVersion);
            library.setSource("maven");
            library.setDescription("Maven Central artifact");
            library.setRepository(groupId.isBlank() ? null
                    : "https://repo1.maven.org/maven2/" + groupId.replace('.', '/') + "/" + artifactId + "/");
            library.setLastRelease(timestamp != null ? Instant.ofEpochMilli(timestamp).toString() : null);

            return library;
        } catch (Exception e) {
            log.warn("Failed to fetch Maven Central artifact info for {}: {}", identifier, e.getMessage());
            return null;
        }
    }

    @Override
    public SourceDefinition getDefinition() {
        return new SourceDefinition(
                "maven",
                "Maven Central",
                "package-registry",
                "Java package registry",
                List.of("mvn", "maven-central"));
    }

    private static String toQuery(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return "";
        }

        if (identifier.contains(":")) {
            String[] parts = identifier.split(":", 2);
            String group = parts[0].trim();
            String artifact = parts[1].trim();
            return "g:\"" + group + "\" AND a:\"" + artifact + "\"";
        }

        return "a:\"" + identifier.trim() + "\"";
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

    private static String stringOrDefault(Object value, String fallback) {
        if (value instanceof String text && !text.isBlank()) {
            return text;
        }
        return fallback;
    }

    private static Long longOrNull(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        return null;
    }
}