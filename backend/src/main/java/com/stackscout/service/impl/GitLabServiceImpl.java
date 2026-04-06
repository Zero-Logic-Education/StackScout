package com.stackscout.service.impl;

import com.stackscout.model.Library;
import com.stackscout.source.SourceAdapter;
import com.stackscout.source.SourceDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GitLabServiceImpl implements SourceAdapter {

    private final RestClient.Builder restClientBuilder;

    @Value("${gitlab.api.token:}")
    private String gitlabToken;

    @Value("${gitlab.api.host:https://gitlab.com}")
    private String gitlabHost;

    @Override
    public Library collect(String identifier) {
        // identifier format: "group/project" or "group/subgroup/project"
        // GitLab API requires URL-encoded project path: "group%2Fproject" or "group%2Fsubgroup%2Fproject"
        if (!identifier.contains("/")) {
            log.warn("Invalid GitLab identifier format: {}. Expected 'group/project' or 'group/subgroup/project'", identifier);
            return null;
        }

        try {
            RestClient client = buildRestClient();
            String encodedPath = identifier.replace("/", "%2F");

            // Fetch project data
            @SuppressWarnings("unchecked")
            Map<String, Object> projectData = (Map<String, Object>) client.get()
                    .uri("/projects/{id}", encodedPath)
                    .retrieve()
                    .body(Map.class);

            if (projectData == null || projectData.isEmpty()) {
                return null;
            }

            // Fetch repository contributors
            long contributorsCount = getContributorsCount(client, encodedPath);

            Library library = new Library();
            library.setName(stringOrDefault(projectData.get("name"), identifier));
            library.setVersion(stringOrDefault(projectData.get("default_branch"), "main"));
            library.setSource("gitlab");

            // Build rich description from project metadata
            String description = buildDescription(projectData, contributorsCount);
            library.setDescription(description);

            // Calculate health score
            double healthScore = calculateHealthScore(projectData, contributorsCount);
            library.setHealthScore((int) healthScore);

            return library;

        } catch (Exception e) {
            log.warn("Failed to fetch GitLab project info for {}: {}", identifier, e.getMessage());
            return null;
        }
    }

    @Override
    public SourceDefinition getDefinition() {
        return new SourceDefinition(
                "gitlab",
                "GitLab",
                "repository",
                "Monitor GitLab projects for health metrics: stars, forks, contributors, commits, and activity trends",
                java.util.List.of("gl", "gitlab-repo", "gitlab-project")
        );
    }

    private RestClient buildRestClient() {
        RestClient.Builder builder = restClientBuilder
                .baseUrl(gitlabHost + "/api/v4");

        if (gitlabToken != null && !gitlabToken.isBlank()) {
            builder.defaultHeader("PRIVATE-TOKEN", gitlabToken);
        }

        return builder.build();
    }

    private long getContributorsCount(RestClient client, String encodedPath) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = (Map<String, Object>) client.get()
                    .uri("/projects/{id}/statistics", encodedPath)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("commit_count")) {
                // Note: GitLab doesn't directly expose contributor count in the simple way
                // We could use /projects/{id}/members but that requires pagination
                // For now, we'll estimate or fetch separately
                return 0L;
            }

            return 0L;
        } catch (Exception e) {
            log.debug("Could not fetch contributors count for {}: {}", encodedPath, e.getMessage());
            return 0L;
        }
    }

    private String buildDescription(Map<String, Object> projectData, long contributors) {
        StringBuilder sb = new StringBuilder();

        String projectDescription = stringOrNull(projectData.get("description"));
        if (projectDescription != null && !projectDescription.isBlank()) {
            sb.append(projectDescription).append(" | ");
        }

        sb.append("⭐ Stars: ").append(projectData.getOrDefault("star_count", 0));
        sb.append(" | 🍴 Forks: ").append(projectData.getOrDefault("forks_count", 0));

        // Get member count if available
        Object memberCount = projectData.get("members_count");
        if (memberCount != null) {
            sb.append(" | 👥 Members: ").append(memberCount);
        }

        Object lastActivityAt = projectData.get("last_activity_at");
        if (lastActivityAt != null) {
            sb.append(" | 📅 Updated: ").append(lastActivityAt);
        }

        return sb.toString();
    }

    private double calculateHealthScore(Map<String, Object> projectData, long contributors) {
        double score = 50.0; // baseline

        // Stars: +up to 20 points
        long stars = longOrDefault(projectData.get("star_count"), 0);
        if (stars > 10000) score += 20;
        else if (stars > 1000) score += 15;
        else if (stars > 100) score += 10;
        else if (stars > 10) score += 5;

        // Forks: +up to 15 points
        long forks = longOrDefault(projectData.get("forks_count"), 0);
        if (forks > 1000) score += 15;
        else if (forks > 100) score += 10;
        else if (forks > 10) score += 5;

        // Open issues (low is good): -up to 10 points
        long openIssues = longOrDefault(projectData.get("open_issues_count"), 0);
        if (openIssues > 1000) score -= 10;
        else if (openIssues > 100) score -= 5;

        // Archived status: -50 points
        boolean archived = booleanOrDefault(projectData.get("archived"), false);
        if (archived) score -= 50;

        // Member count: +bonus for active communities
        long members = longOrDefault(projectData.get("members_count"), 0);
        if (members > 50) score += 10;
        else if (members > 10) score += 5;

        // Visibility public is more valuable: +5 points
        String visibility = stringOrNull(projectData.get("visibility"));
        if ("public".equals(visibility)) {
            score += 5;
        }

        // Clamp score to 0-100
        return Math.max(0, Math.min(100, score));
    }

    private String stringOrDefault(Object value, String defaultValue) {
        return value != null ? value.toString() : defaultValue;
    }

    private String stringOrNull(Object value) {
        return value != null ? value.toString() : null;
    }

    private long longOrDefault(Object value, long defaultValue) {
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return defaultValue;
    }

    private boolean booleanOrDefault(Object value, boolean defaultValue) {
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        return defaultValue;
    }
}
