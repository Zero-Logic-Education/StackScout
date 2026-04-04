package com.stackscout.service.impl;

import com.stackscout.model.Library;
import com.stackscout.source.SourceAdapter;
import com.stackscout.source.SourceDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReleaseManagementServiceImpl implements SourceAdapter {

    private final RestClient.Builder restClientBuilder;

    @Value("${github.api.token:}")
    private String githubToken;

    @Override
    public Library collect(String identifier) {
        // identifier format: "owner/repo"
        if (!identifier.contains("/")) {
            log.warn("Invalid Release Management identifier: {}. Expected 'owner/repo'", identifier);
            return null;
        }

        try {
            RestClient client = buildRestClient();
            
            String[] parts = identifier.split("/");
            String owner = parts[0];
            String repo = parts[1];

            // Fetch releases and tags
            List<Map<String, Object>> releases = fetchReleases(client, owner, repo);
            List<Map<String, Object>> tags = fetchTags(client, owner, repo);
            
            // Check for changelog
            boolean hasChangelog = checkChangelogPresence(client, owner, repo);

            Library library = new Library();
            library.setName(identifier);
            library.setVersion("latest");
            library.setSource("release-management");

            // Build description with release information
            String description = buildReleaseDescription(releases, tags, hasChangelog);
            library.setDescription(description);

            // Calculate release health score
            double healthScore = calculateReleaseScore(releases, tags, hasChangelog);
            library.setHealthScore((int) healthScore);

            return library;

        } catch (Exception e) {
            log.warn("Failed to fetch release management info for {}: {}", identifier, e.getMessage());
            return null;
        }
    }

    @Override
    public SourceDefinition getDefinition() {
        return new SourceDefinition(
                "release-management",
                "Release Management",
                "documentation",
                "Monitor release quality: changelog presence, release notes quality, version tagging, semantic versioning compliance",
                java.util.List.of("releases", "changelog", "version-management", "semantic-versioning")
        );
    }

    private RestClient buildRestClient() {
        RestClient.Builder builder = restClientBuilder
                .baseUrl("https://api.github.com");

        if (githubToken != null && !githubToken.isBlank()) {
            builder.defaultHeader("Authorization", "Bearer " + githubToken);
        }

        return builder.build();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchReleases(RestClient client, String owner, String repo) {
        try {
            Map<String, Object> response = (Map<String, Object>) client.get()
                    .uri("/repos/{owner}/{repo}/releases?per_page=10", owner, repo)
                    .retrieve()
                    .body(Map.class);

            if (response instanceof List) {
                return (List<Map<String, Object>>) response;
            }
            return List.of();
        } catch (Exception e) {
            log.debug("Could not fetch releases: {}", e.getMessage());
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchTags(RestClient client, String owner, String repo) {
        try {
            Map<String, Object> response = (Map<String, Object>) client.get()
                    .uri("/repos/{owner}/{repo}/tags?per_page=10", owner, repo)
                    .retrieve()
                    .body(Map.class);

            if (response instanceof List) {
                return (List<Map<String, Object>>) response;
            }
            return List.of();
        } catch (Exception e) {
            log.debug("Could not fetch tags: {}", e.getMessage());
            return List.of();
        }
    }

    private boolean checkChangelogPresence(RestClient client, String owner, String repo) {
        try {
            // Try to fetch common changelog files
            for (String filename : new String[]{"CHANGELOG.md", "CHANGELOG.txt", "HISTORY.md", "RELEASES.md", "NEWS.md"}) {
                try {
                    client.get()
                            .uri("/repos/{owner}/{repo}/contents/{filename}", owner, repo, filename)
                            .retrieve()
                            .body(Map.class);
                    return true;
                } catch (Exception e) {
                    // Continue to next filename
                }
            }
            return false;
        } catch (Exception e) {
            log.debug("Could not check for changelog: {}", e.getMessage());
            return false;
        }
    }

    private String buildReleaseDescription(List<Map<String, Object>> releases, 
                                          List<Map<String, Object>> tags,
                                          boolean hasChangelog) {
        StringBuilder sb = new StringBuilder();
        sb.append("📦 Release Management: ");

        // Release count
        if (!releases.isEmpty()) {
            sb.append("✅ ").append(releases.size()).append(" releases | ");
            
            // Latest release info
            Map<String, Object> latestRelease = releases.get(0);
            String releaseName = stringOrDefault(latestRelease.get("name"), 
                                                 stringOrDefault(latestRelease.get("tag_name"), "latest"));
            sb.append("Latest: ").append(releaseName).append(" | ");
            
            // Check if latest has release notes
            Object body = latestRelease.get("body");
            if (body != null && !body.toString().isBlank()) {
                sb.append("✅ Release notes | ");
            } else {
                sb.append("❌ No release notes | ");
            }
        } else {
            sb.append("⚠️ No releases | ");
        }

        // Tags count
        if (!tags.isEmpty()) {
            sb.append("🏷️ ").append(tags.size()).append(" tags");
        }

        // Changelog
        if (hasChangelog) {
            sb.append(" | ✅ Changelog");
        }

        return sb.toString();
    }

    private double calculateReleaseScore(List<Map<String, Object>> releases, 
                                        List<Map<String, Object>> tags,
                                        boolean hasChangelog) {
        double score = 40.0;

        // Release count bonus
        if (!releases.isEmpty()) {
            if (releases.size() >= 10) score += 20;
            else if (releases.size() >= 5) score += 15;
            else if (releases.size() >= 2) score += 10;
        }

        // Release notes quality
        if (!releases.isEmpty()) {
            Map<String, Object> latestRelease = releases.get(0);
            Object body = latestRelease.get("body");
            if (body != null && body.toString().length() > 100) {
                score += 20; // Good release notes
            } else if (body != null && !body.toString().isBlank()) {
                score += 10; // Has some release notes
            }
        }

        // Tags consistency with releases
        if (!tags.isEmpty() && !releases.isEmpty()) {
            if (tags.size() >= releases.size() * 0.8) {
                score += 15; // Good tag consistency
            }
        }

        // Changelog presence
        if (hasChangelog) {
            score += 15;
        }

        // Recent release activity (last release within 6 months)
        if (!releases.isEmpty()) {
            Map<String, Object> latestRelease = releases.get(0);
            Object publishedAt = latestRelease.get("published_at");
            if (publishedAt != null) {
                try {
                    var releaseDate = OffsetDateTime.parse(publishedAt.toString()).toLocalDateTime();
                    var monthsOld = java.time.temporal.ChronoUnit.MONTHS.between(releaseDate, java.time.LocalDateTime.now());
                    if (monthsOld < 1) score += 10;
                    else if (monthsOld > 24) score -= 10;
                } catch (Exception e) {
                    log.debug("Could not parse release date: {}", e.getMessage());
                }
            }
        }

        return Math.max(0, Math.min(100, score));
    }

    private String stringOrDefault(Object value, String defaultValue) {
        return value != null ? value.toString() : defaultValue;
    }
}
