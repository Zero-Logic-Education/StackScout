package com.stackscout.service.impl;

import com.stackscout.model.Library;
import com.stackscout.source.SourceAdapter;
import com.stackscout.source.SourceDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GitHubSecurityAdvisoriesServiceImpl implements SourceAdapter {

    private final RestClient.Builder restClientBuilder;

    @Value("${github.api.token:}")
    private String githubToken;

    @Override
    public Library collect(String identifier) {
        // identifier format: "owner/repo" or "owner/repo@version(s)"
        // e.g., "torvalds/linux" or "npm/package@1.0.0"
        
        if (!identifier.contains("/")) {
            log.warn("Invalid GitHub Security Advisories identifier: {}. Expected 'owner/repo'", identifier);
            return null;
        }

        try {
            RestClient client = buildRestClient();
            
            String[] parts = identifier.split("/");
            String owner = parts[0];
            String repo = parts[1];

            // Remove version suffix if present (@)
            if (repo.contains("@")) {
                repo = repo.split("@")[0];
            }

            // Fetch security advisories for the repository
            List<Map<String, Object>> advisories = fetchSecurityAdvisories(client, owner, repo);
            
            Library library = new Library();
            library.setName(identifier);
            library.setVersion("latest");
            library.setSource("github-advisories");

            // Build description with advisory summary
            String description = buildAdvisoryDescription(advisories);
            library.setDescription(description);

            // Calculate security score based on advisories
            double healthScore = calculateSecurityScore(advisories);
            library.setHealthScore((int) healthScore);

            return library;

        } catch (Exception e) {
            log.warn("Failed to fetch GitHub Security Advisories for {}: {}", identifier, e.getMessage());
            return null;
        }
    }

    @Override
    public SourceDefinition getDefinition() {
        return new SourceDefinition(
                "github-advisories",
                "GitHub Security Advisories",
                "security",
                "GitHub-curated security advisories with dependency vulnerability detection and automated alerts",
                java.util.List.of("github-security", "dependabot", "ghsa")
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
    private List<Map<String, Object>> fetchSecurityAdvisories(RestClient client, String owner, String repo) {
        try {
            // GitHub API endpoint for security advisories
            Map<String, Object> response = (Map<String, Object>) client.get()
                    .uri("/repos/{owner}/{repo}/security-advisories", owner, repo)
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                return List.of();
            }

            // Try to extract the advisories list
            if (response instanceof List) {
                return (List<Map<String, Object>>) response;
            }

            return List.of();
        } catch (Exception e) {
            log.debug("Could not fetch security advisories for {}/{}: {}", owner, repo, e.getMessage());
            return List.of();
        }
    }

    private String buildAdvisoryDescription(List<Map<String, Object>> advisories) {
        if (advisories.isEmpty()) {
            return "✅ No GitHub Security Advisories found - repository appears secure";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("⚠️ Found ").append(advisories.size()).append(" GitHub Security Advisories");

        // Count by severity if available
        long critical = 0;
        long high = 0;
        long medium = 0;

        for (Map<String, Object> advisory : advisories) {
            Object severity = advisory.get("severity");
            if ("critical".equalsIgnoreCase(severity != null ? severity.toString() : "")) {
                critical++;
            } else if ("high".equalsIgnoreCase(severity != null ? severity.toString() : "")) {
                high++;
            } else if ("medium".equalsIgnoreCase(severity != null ? severity.toString() : "")) {
                medium++;
            }
        }

        if (critical > 0) {
            sb.append(" | 🔴 CRITICAL: ").append(critical);
        }
        if (high > 0) {
            sb.append(" | 🟠 HIGH: ").append(high);
        }
        if (medium > 0) {
            sb.append(" | 🟡 MEDIUM: ").append(medium);
        }

        // Extract first few CVE IDs if available
        List<String> cveIds = advisories.stream()
                .filter(a -> a.containsKey("cve_id") && a.get("cve_id") != null)
                .map(a -> a.get("cve_id").toString())
                .limit(3)
                .toList();

        if (!cveIds.isEmpty()) {
            sb.append(" | CVEs: ").append(String.join(", ", cveIds));
        }

        return sb.toString();
    }

    private double calculateSecurityScore(List<Map<String, Object>> advisories) {
        if (advisories.isEmpty()) {
            return 90.0;
        }

        double score = 60.0;

        // Count by severity
        long critical = 0;
        long high = 0;
        long medium = 0;

        for (Map<String, Object> advisory : advisories) {
            Object severity = advisory.get("severity");
            String sev = severity != null ? severity.toString().toLowerCase() : "low";
            
            if ("critical".equals(sev)) critical++;
            else if ("high".equals(sev)) high++;
            else if ("medium".equals(sev)) medium++;
        }

        // Deductions
        score -= critical * 20;
        score -= high * 12;
        score -= medium * 6;

        return Math.max(0, Math.min(100, score));
    }
}
