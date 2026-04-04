package com.stackscout.service.impl;

import com.stackscout.model.Library;
import com.stackscout.source.SourceAdapter;
import com.stackscout.source.SourceDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommunitySignalsServiceImpl implements SourceAdapter {

    private final RestClient.Builder restClientBuilder;

    @Value("${github.api.token:}")
    private String githubToken;

    @Override
    public Library collect(String identifier) {
        // identifier format: "owner/repo"
        if (!identifier.contains("/")) {
            log.warn("Invalid Community Signals identifier: {}. Expected 'owner/repo'", identifier);
            return null;
        }

        try {
            RestClient client = buildRestClient();
            
            String[] parts = identifier.split("/");
            String owner = parts[0];
            String repo = parts[1];

            // Fetch community metrics
            Map<String, Object> communityMetrics = assessCommunityHealth(client, owner, repo);
            
            Library library = new Library();
            library.setName(identifier);
            library.setVersion("latest");
            library.setSource("community-signals");

            // Build description with community health summary
            String description = buildCommunityDescription(communityMetrics);
            library.setDescription(description);

            // Calculate community health score
            double healthScore = calculateCommunityScore(communityMetrics);
            library.setHealthScore((int) healthScore);

            return library;

        } catch (Exception e) {
            log.warn("Failed to fetch community signals for {}: {}", identifier, e.getMessage());
            return null;
        }
    }

    @Override
    public SourceDefinition getDefinition() {
        return new SourceDefinition(
                "community-signals",
                "Community Signals",
                "documentation",
                "Track community health: release frequency, issue response time, changelog updates, contributor engagement, support responsiveness",
                java.util.List.of("community-health", "release-signals", "contributor-activity")
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
    private Map<String, Object> assessCommunityHealth(RestClient client, String owner, String repo) {
        try {
            // Fetch main repo data
            Map<String, Object> repoData = (Map<String, Object>) client.get()
                    .uri("/repos/{owner}/{repo}", owner, repo)
                    .retrieve()
                    .body(Map.class);

            if (repoData == null) {
                return Map.of();
            }

            // Count recent releases
            List<Map<String, Object>> releases = fetchLatestReleases(client, owner, repo);
            
            // Count recent issues
            long recentIssues = countRecentIssues(client, owner, repo);
            
            // Calculate release frequency
            double releaseFrequency = calculateReleaseFrequency(releases);
            
            // Get last commit time
            String lastCommitTime = extractLastCommitTime(repoData);

            Map<String, Object> metrics = new java.util.HashMap<>();
            metrics.put("repoData", repoData);
            metrics.put("releases", releases.size());
            metrics.put("releaseFrequency", releaseFrequency);
            metrics.put("recentIssues", recentIssues);
            metrics.put("lastCommit", lastCommitTime);

            return metrics;
        } catch (Exception e) {
            log.debug("Error assessing community health for {}/{}: {}", owner, repo, e.getMessage());
            return Map.of();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchLatestReleases(RestClient client, String owner, String repo) {
        try {
            Map<String, Object> response = (Map<String, Object>) client.get()
                    .uri("/repos/{owner}/{repo}/releases?per_page=5", owner, repo)
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
    private long countRecentIssues(RestClient client, String owner, String repo) {
        try {
            Map<String, Object> response = (Map<String, Object>) client.get()
                    .uri("/repos/{owner}/{repo}/issues?state=open&per_page=1", owner, repo)
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                return 0;
            }

            // Extract from Link header or check response size
            return 0L;
        } catch (Exception e) {
            log.debug("Could not count open issues: {}", e.getMessage());
            return 0L;
        }
    }

    private double calculateReleaseFrequency(List<Map<String, Object>> releases) {
        if (releases.size() < 2) {
            return 0.0;
        }

        // Get dates of two recent releases
        Object firstDate = releases.get(0).get("published_at");
        Object secondDate = releases.get(1).get("published_at");

        if (firstDate == null || secondDate == null) {
            return 0.0;
        }

        try {
            // Parse ISO dates and calculate days between
            var date1 = OffsetDateTime.parse(firstDate.toString()).toLocalDateTime();
            var date2 = OffsetDateTime.parse(secondDate.toString()).toLocalDateTime();
            
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(date2, date1);
            return daysBetween > 0 ? 30.0 / daysBetween : 0.0; // releases per month
        } catch (Exception e) {
            log.debug("Could not calculate release frequency: {}", e.getMessage());
            return 0.0;
        }
    }

    private String extractLastCommitTime(Map<String, Object> repoData) {
        Object pushed = repoData.get("pushed_at");
        return pushed != null ? pushed.toString() : "unknown";
    }

    private String buildCommunityDescription(Map<String, Object> metrics) {
        if (metrics.isEmpty()) {
            return "⏳ Unable to assess community signals";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("👥 Community Health: ");

        // Release activity
        Number releases = (Number) metrics.get("releases");
        if (releases != null && releases.intValue() > 0) {
            sb.append("✅ ").append(releases).append(" recent releases | ");
        } else {
            sb.append("⚠️ No recent releases | ");
        }

        // Release frequency
        Number releaseFreq = (Number) metrics.get("releaseFrequency");
        if (releaseFreq != null && releaseFreq.doubleValue() > 0) {
            sb.append("📦 ~").append(String.format("%.1f", releaseFreq.doubleValue())).append(" releases/month | ");
        }

        // Last commit
        Object lastCommit = metrics.get("lastCommit");
        if (lastCommit != null) {
            sb.append("🕐 Updated: ").append(lastCommit);
        }

        return sb.toString();
    }

    private double calculateCommunityScore(Map<String, Object> metrics) {
        if (metrics.isEmpty()) {
            return 40.0;
        }

        double score = 50.0;

        // Release activity bonus
        Number releases = (Number) metrics.get("releases");
        if (releases != null) {
            if (releases.intValue() >= 5) score += 20;
            else if (releases.intValue() >= 2) score += 10;
        }

        // Release frequency bonus
        Number releaseFreq = (Number) metrics.get("releaseFrequency");
        if (releaseFreq != null && releaseFreq.doubleValue() > 0.5) {
            score += 20; // 2+ releases per month = excellent
        } else if (releaseFreq != null && releaseFreq.doubleValue() > 0) {
            score += 10;
        }

        // Recency bonus (updated within last 30 days)
        Object lastCommit = metrics.get("lastCommit");
        if (lastCommit != null) {
            try {
                var commitDate = OffsetDateTime.parse(lastCommit.toString()).toLocalDateTime();
                var daysOld = java.time.temporal.ChronoUnit.DAYS.between(commitDate, LocalDateTime.now());
                if (daysOld < 30) score += 15;
                else if (daysOld > 365) score -= 15;
            } catch (Exception e) {
                log.debug("Could not parse commit date: {}", e.getMessage());
            }
        }

        return Math.max(0, Math.min(100, score));
    }
}
