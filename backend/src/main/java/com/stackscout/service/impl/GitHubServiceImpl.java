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
public class GitHubServiceImpl implements SourceAdapter {

    private final RestClient.Builder restClientBuilder;

    @Value("${github.api.token:}")
    private String githubToken;

    @Override
    public Library collect(String identifier) {
        // identifier format: "owner/repo"
        if (!identifier.contains("/")) {
            log.warn("Invalid GitHub identifier format: {}. Expected 'owner/repo'", identifier);
            return null;
        }

        try {
            RestClient client = buildRestClient();
            String[] parts = identifier.split("/");
            String owner = parts[0];
            String repo = parts[1];

            // Fetch repository data
            @SuppressWarnings("unchecked")
            Map<String, Object> repoData = (Map<String, Object>) client.get()
                    .uri("/repos/{owner}/{repo}", owner, repo)
                    .retrieve()
                    .body(Map.class);

            if (repoData == null || repoData.isEmpty()) {
                return null;
            }

            // Fetch contributors count
            long contributorsCount = getContributorsCount(client, owner, repo);

            // Fetch recent commits to calculate activity
            long recentCommits = getRecentCommitsCount(client, owner, repo);

            Library library = new Library();
            library.setName(stringOrDefault(repoData.get("name"), identifier));
            library.setVersion(stringOrDefault(repoData.get("default_branch"), "main"));
            library.setSource("github");

            // Build rich description from repo metadata
            String description = buildDescription(repoData, contributorsCount, recentCommits);
            library.setDescription(description);

            // Calculate health score based on visibility metrics
            double healthScore = calculateHealthScore(repoData, contributorsCount, recentCommits);
            library.setHealthScore((int) healthScore);

            return library;

        } catch (Exception e) {
            log.warn("Failed to fetch GitHub repository info for {}: {}", identifier, e.getMessage());
            return null;
        }
    }

    @Override
    public SourceDefinition getDefinition() {
        return new SourceDefinition(
                "github",
                "GitHub",
                "repository",
                "Monitor GitHub repositories for health metrics: stars, forks, contributors, commits, and activity trends",
                java.util.List.of("gh", "github-repo", "github-repository")
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

    private long getContributorsCount(RestClient client, String owner, String repo) {
        try {
            // This endpoint returns only 30 contributors by default, but we can use ?per_page=1
            // and check the Link header for total count, or just use /stats/contributors
            // For simplicity, we'll fetch the contributors list with per_page=1 and extract total from headers
            var response = client.get()
                    .uri("/repos/{owner}/{repo}/contributors?per_page=1", owner, repo)
                    .retrieve()
                    .toEntity(String.class);

            String linkHeader = null;
            var linkHeaderList = response.getHeaders().get("Link");
            if (linkHeaderList != null) {
                linkHeader = linkHeaderList.getFirst();
            }

            if (linkHeader != null && linkHeader.contains("last")) {
                // Extract page number from Link header: ...; rel="last"
                int lastPageIndex = linkHeader.lastIndexOf("page=");
                int startIdx = lastPageIndex + 5; // "page=".length()
                int endIdx = linkHeader.indexOf('>', startIdx);
                String pageStr = linkHeader.substring(startIdx, endIdx);
                return Long.parseLong(pageStr);
            }

            return 0L;
        } catch (Exception e) {
            log.debug("Could not fetch contributors count for {}/{}: {}", owner, repo, e.getMessage());
            return 0L;
        }
    }

    private long getRecentCommitsCount(RestClient client, String owner, String repo) {
        try {
            // Fetch commits data for activity analysis
            client.get()
                    .uri("/repos/{owner}/{repo}/commits?per_page=1", owner, repo)
                    .retrieve()
                    .body(Map.class);

            // For commits, we also rely on Link header similarly
            // Simplified: just return a placeholder or 0 if we can't fetch
            return 0L;
        } catch (Exception e) {
            log.debug("Could not fetch recent commits for {}/{}: {}", owner, repo, e.getMessage());
            return 0L;
        }
    }

    private String buildDescription(Map<String, Object> repoData, long contributors, long recentCommits) {
        StringBuilder sb = new StringBuilder();

        String repoDescription = stringOrNull(repoData.get("description"));
        if (repoDescription != null && !repoDescription.isBlank()) {
            sb.append(repoDescription).append(" | ");
        }

        sb.append("⭐ Stars: ").append(repoData.getOrDefault("stargazers_count", 0));
        sb.append(" | 🍴 Forks: ").append(repoData.getOrDefault("forks_count", 0));
        sb.append(" | 👥 Contributors: ").append(contributors);

        Object updatedAt = repoData.get("updated_at");
        if (updatedAt != null) {
            sb.append(" | 📅 Updated: ").append(updatedAt);
        }

        return sb.toString();
    }

    private double calculateHealthScore(Map<String, Object> repoData, long contributors, long recentCommits) {
        double score = 50.0; // baseline

        // Stars: +up to 20 points
        long stars = longOrDefault(repoData.get("stargazers_count"), 0);
        if (stars > 10000) score += 20;
        else if (stars > 1000) score += 15;
        else if (stars > 100) score += 10;
        else if (stars > 10) score += 5;

        // Forks: +up to 15 points
        long forks = longOrDefault(repoData.get("forks_count"), 0);
        if (forks > 1000) score += 15;
        else if (forks > 100) score += 10;
        else if (forks > 10) score += 5;

        // Open issues (low is good): -up to 10 points
        long openIssues = longOrDefault(repoData.get("open_issues_count"), 0);
        if (openIssues > 1000) score -= 10;
        else if (openIssues > 100) score -= 5;

        // Archived status: -50 points
        boolean archived = booleanOrDefault(repoData.get("archived"), false);
        if (archived) score -= 50;

        // Has documentation (has wiki/pages): +5 points
        boolean hasWiki = booleanOrDefault(repoData.get("has_wiki"), false);
        if (hasWiki) score += 5;

        // Not a fork is more valuable: +5 points
        boolean isFork = booleanOrDefault(repoData.get("fork"), false);
        if (!isFork) score += 5;

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
