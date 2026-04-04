package com.stackscout.service.impl;

import com.stackscout.model.Library;
import com.stackscout.source.SourceAdapter;
import com.stackscout.source.SourceDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OSVServiceImpl implements SourceAdapter {

    private final RestClient.Builder restClientBuilder;

    @Override
    public Library collect(String identifier) {
        // identifier format: "ecosystem:package@version" or "package@version"
        // e.g., "npm:lodash@4.17.20" or just "lodash@4.17.20"
        if (!identifier.contains("@")) {
            log.warn("Invalid OSV identifier format: {}. Expected 'package@version' or 'ecosystem:package@version'", identifier);
            return null;
        }

        try {
            RestClient client = buildRestClient();
            
            // Parse identifier
            String[] parts = identifier.split("@");
            String packagePart = parts[0]; // could be "ecosystem:package" or just "package"
            String version = parts[1];

            String ecosystem = "npm";
            String packageName = packagePart;
            
            // Extract ecosystem if present
            if (packagePart.contains(":")) {
                String[] ecosystemParts = packagePart.split(":");
                ecosystem = ecosystemParts[0];
                packageName = ecosystemParts[1];
            }

            // Build query payload for OSV API
            Map<String, Object> queryPayload = buildQueryPayload(ecosystem, packageName, version);

            // Query OSV API - using ParameterizedTypeReference to avoid unchecked cast warning
            Map<String, Object> response = client.post()
                    .uri("/query")
                    .body(queryPayload)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response == null) {
                return null;
            }

            // Parse vulnerabilities
            List<Map<String, Object>> vulnerabilities = extractVulnerabilities(response);
            
            Library library = new Library();
            library.setName(packageName);
            library.setVersion(version);
            library.setSource("osv");

            // Build description with vulnerability summary
            String description = buildVulnerabilityDescription(vulnerabilities, packageName, version);
            library.setDescription(description);

            // Calculate health score based on vulnerability severity
            double healthScore = calculateSecurityScore(vulnerabilities);
            library.setHealthScore((int) healthScore);

            return library;

        } catch (Exception e) {
            log.warn("Failed to fetch OSV vulnerability info for {}: {}", identifier, e.getMessage());
            return null;
        }
    }

    @Override
    public SourceDefinition getDefinition() {
        return new SourceDefinition(
                "osv",
                "OSV Database",
                "security",
                "Open Source Vulnerabilities: unified database for security advisories affecting open source projects",
                java.util.List.of("osv-db", "open-source-vulnerabilities")
        );
    }

    private RestClient buildRestClient() {
        return restClientBuilder
                .baseUrl("https://api.osv.dev/v1")
                .build();
    }

    private Map<String, Object> buildQueryPayload(String ecosystem, String packageName, String version) {
        return Map.of(
                "package", Map.of(
                        "ecosystem", ecosystem,
                        "name", packageName
                ),
                "version", version
        );
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractVulnerabilities(Map<String, Object> response) {
        if (response.containsKey("vulns")) {
            Object vulns = response.get("vulns");
            if (vulns instanceof List) {
                return (List<Map<String, Object>>) vulns;
            }
        }
        return List.of();
    }

    private String buildVulnerabilityDescription(List<Map<String, Object>> vulnerabilities, String packageName, String version) {
        if (vulnerabilities.isEmpty()) {
            return "✅ No known vulnerabilities found for " + packageName + "@" + version;
        }

        StringBuilder sb = new StringBuilder();
        sb.append("⚠️ Found ").append(vulnerabilities.size()).append(" vulnerabilities for ").append(packageName).append("@").append(version);

        // Count by severity
        long critical = vulnerabilities.stream()
                .filter(v -> isSeverity(v, "CRITICAL"))
                .count();
        long high = vulnerabilities.stream()
                .filter(v -> isSeverity(v, "HIGH"))
                .count();
        long medium = vulnerabilities.stream()
                .filter(v -> isSeverity(v, "MEDIUM"))
                .count();

        if (critical > 0) {
            sb.append(" | 🔴 CRITICAL: ").append(critical);
        }
        if (high > 0) {
            sb.append(" | 🟠 HIGH: ").append(high);
        }
        if (medium > 0) {
            sb.append(" | 🟡 MEDIUM: ").append(medium);
        }

        return sb.toString();
    }

    private boolean isSeverity(Map<String, Object> vuln, String severity) {
        Object details = vuln.get("affected");
        if (details instanceof List) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> affectedList = (List<Map<String, Object>>) details;
            for (Map<String, Object> affected : affectedList) {
                if (severity.equals(affected.get("severity"))) {
                    return true;
                }
            }
        }
        return false;
    }

    private double calculateSecurityScore(List<Map<String, Object>> vulnerabilities) {
        if (vulnerabilities.isEmpty()) {
            return 85.0; // Good score if no vulnerabilities
        }

        double score = 50.0;

        // Count vulnerabilities by severity
        long critical = 0;
        long high = 0;
        long medium = 0;
        long low = 0;

        for (Map<String, Object> vuln : vulnerabilities) {
            Object details = vuln.get("affected");
            if (!(details instanceof List)) continue;
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> affectedList = (List<Map<String, Object>>) details;
            for (Map<String, Object> affected : affectedList) {
                Object severity = affected.get("severity");
                if ("CRITICAL".equals(severity)) critical++;
                else if ("HIGH".equals(severity)) high++;
                else if ("MEDIUM".equals(severity)) medium++;
                else low++;
            }
        }

        // Deductions for vulnerabilities
        score -= critical * 25; // -25 per CRITICAL
        score -= high * 15;     // -15 per HIGH
        score -= medium * 8;    // -8 per MEDIUM
        score -= low * 2;       // -2 per LOW

        return Math.max(0, Math.min(100, score));
    }
}
