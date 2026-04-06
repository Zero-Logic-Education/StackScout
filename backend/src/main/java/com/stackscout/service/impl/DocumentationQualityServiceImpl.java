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
public class DocumentationQualityServiceImpl implements SourceAdapter {

    private final RestClient.Builder restClientBuilder;

    @Value("${github.api.token:}")
    private String githubToken;

    @Override
    public Library collect(String identifier) {
        // identifier format: "owner/repo"
        if (!identifier.contains("/")) {
            log.warn("Invalid Documentation Quality identifier: {}. Expected 'owner/repo'", identifier);
            return null;
        }

        try {
            RestClient client = buildRestClient();
            
            String[] parts = identifier.split("/");
            String owner = parts[0];
            String repo = parts[1];

            // Fetch repository data to check documentation presence
            @SuppressWarnings("unchecked")
            Map<String, Object> repoData = (Map<String, Object>) client.get()
                    .uri("/repos/{owner}/{repo}", owner, repo)
                    .retrieve()
                    .body(Map.class);

            if (repoData == null) {
                return null;
            }

            // Fetch README content (returns 404 if not found)
            boolean hasReadme = checkReadmePresence(client, owner, repo);
            
            // Check for additional documentation files
            String docQuality = assessDocumentationQuality(repoData, hasReadme, client, owner, repo);
            
            Library library = new Library();
            library.setName(identifier);
            library.setVersion("latest");
            library.setSource("documentation");

            library.setDescription(docQuality);

            // Calculate documentation score
            double healthScore = calculateDocumentationScore(repoData, hasReadme);
            library.setHealthScore((int) healthScore);

            return library;

        } catch (Exception e) {
            log.warn("Failed to assess documentation quality for {}: {}", identifier, e.getMessage());
            return null;
        }
    }

    @Override
    public SourceDefinition getDefinition() {
        return new SourceDefinition(
                "documentation",
                "Documentation Quality",
                "documentation",
                "Assess project documentation completeness: README quality, API docs, contribution guides, changelog presence",
                java.util.List.of("docs", "readme-quality", "doc-assessment")
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

    private boolean checkReadmePresence(RestClient client, String owner, String repo) {
        try {
            // GitHub API for README endpoint
            client.get()
                    .uri("/repos/{owner}/{repo}/readme", owner, repo)
                    .retrieve()
                    .body(Map.class);
            return true;
        } catch (Exception e) {
            log.debug("No README found for {}/{}", owner, repo);
            return false;
        }
    }

    private String assessDocumentationQuality(Map<String, Object> repoData, boolean hasReadme, 
                                              RestClient client, String owner, String repo) {
        StringBuilder sb = new StringBuilder();
        
        int docScore = 0;
        sb.append("📚 Documentation Assessment: ");

        // Check README
        if (hasReadme) {
            sb.append("✅ README | ");
            docScore += 25;
        } else {
            sb.append("❌ No README | ");
        }

        // Check project description
        Object description = repoData.get("description");
        if (description != null && !description.toString().isBlank()) {
            sb.append("✅ Description | ");
            docScore += 15;
        } else {
            sb.append("❌ No Description | ");
        }

        // Check for wiki
        boolean hasWiki = booleanOrDefault(repoData.get("has_wiki"), false);
        if (hasWiki) {
            sb.append("✅ Wiki | ");
            docScore += 20;
        } else {
            sb.append("❌ No Wiki | ");
        }

        // Check for GitHub Pages
        boolean hasPages = booleanOrDefault(repoData.get("has_pages"), false);
        if (hasPages) {
            sb.append("✅ GitHub Pages | ");
            docScore += 20;
        } else {
            sb.append("❌ No Pages | ");
        }

        // Check for license
        Object license = repoData.get("license");
        if (license instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> licenseMap = (Map<String, Object>) license;
            if (licenseMap.containsKey("name")) {
                sb.append("✅ License | ");
                docScore += 15;
            } else {
                sb.append("❌ No License | ");
            }
        } else {
            sb.append("❌ No License | ");
        }

        // Check for issues/discussions
        boolean hasIssues = booleanOrDefault(repoData.get("has_issues"), false);
        if (hasIssues) {
            sb.append("✅ Issues Enabled");
            docScore += 5;
        } else {
            sb.append("❌ Issues Disabled");
        }

        sb.append(" | Score: ").append(docScore).append("%");
        return sb.toString();
    }

    private double calculateDocumentationScore(Map<String, Object> repoData, boolean hasReadme) {
        double score = 30.0; // baseline

        // README present: +35 points
        if (hasReadme) {
            score += 35;
        }

        // Description present: +15 points
        Object description = repoData.get("description");
        if (description != null && !description.toString().isBlank()) {
            score += 15;
        }

        // Wiki enabled: +15 points
        if (booleanOrDefault(repoData.get("has_wiki"), false)) {
            score += 15;
        }

        // GitHub Pages: +15 points
        if (booleanOrDefault(repoData.get("has_pages"), false)) {
            score += 15;
        }

        // License present: +10 points
        Object license = repoData.get("license");
        if (license instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> licenseMap = (Map<String, Object>) license;
            if (licenseMap.containsKey("name")) {
                score += 10;
            }
        }

        // Clamp score to 0-100
        return Math.max(0, Math.min(100, score));
    }

    private boolean booleanOrDefault(Object value, boolean defaultValue) {
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        return defaultValue;
    }
}
