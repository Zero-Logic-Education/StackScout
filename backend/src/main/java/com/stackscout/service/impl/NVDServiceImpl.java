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
public class NVDServiceImpl implements SourceAdapter {

    private final RestClient.Builder restClientBuilder;

    @Override
    public Library collect(String identifier) {
        // identifier format: "cpe:product:version" or "product:version"
        // Since NVD works with CPE identifiers, we'll search for vulnerabilities affecting the product
        // e.g., "apache-log4j:2.14.1"
        
        if (!identifier.contains(":")) {
            log.warn("Invalid NVD identifier format: {}. Expected 'product:version'", identifier);
            return null;
        }

        try {
            RestClient client = buildRestClient();
            
            String[] parts = identifier.split(":");
            String product = parts[0];
            String version = parts.length > 1 ? parts[1] : "";

            // Search CVEs by keyword (product name)
            // NVD API /rest/json/cves/2.0 accepts keywordSearch parameter
            String queryString = String.format("%s %s", product, version).trim();
            
            // Note: NVD's public API is rate-limited
            // For production, recommend using NVD API key
            @SuppressWarnings("unchecked")
            Map<String, Object> response = (Map<String, Object>) client.get()
                    .uri("/cves/2.0?keywordSearch={keyword}", queryString)
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                return null;
            }

            // Parse CVE items
            List<Map<String, Object>> vulnerabilities = extractCVEVulnerabilities(response);
            
            Library library = new Library();
            library.setName(product);
            library.setVersion(version);
            library.setSource("nvd");

            // Build description with CVE summary
            String description = buildCVEDescription(vulnerabilities, product, version);
            library.setDescription(description);

            // Calculate health score based on CVSS severity
            double healthScore = calculateSecurityScore(vulnerabilities);
            library.setHealthScore((int) healthScore);

            return library;

        } catch (Exception e) {
            log.warn("Failed to fetch NVD CVE info for {}: {}", identifier, e.getMessage());
            return null;
        }
    }

    @Override
    public SourceDefinition getDefinition() {
        return new SourceDefinition(
                "nvd",
                "NVD/CVE Database",
                "security",
                "National Vulnerability Database: comprehensive repository of vulnerability metadata with CVSS scoring and impact analysis",
                java.util.List.of("cve", "national-vulnerability-database", "cvss")
        );
    }

    private RestClient buildRestClient() {
        return restClientBuilder
                .baseUrl("https://services.nvd.nist.gov/rest/json")
                .build();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractCVEVulnerabilities(Map<String, Object> response) {
        if (response.containsKey("vulnerabilities")) {
            Object vulns = response.get("vulnerabilities");
            if (vulns instanceof List) {
                return (List<Map<String, Object>>) vulns;
            }
        }
        return List.of();
    }

    private String buildCVEDescription(List<Map<String, Object>> vulnerabilities, String product, String version) {
        if (vulnerabilities.isEmpty()) {
            return "✅ No known CVEs found for " + product + " " + version;
        }

        StringBuilder sb = new StringBuilder();
        sb.append("⚠️ Found ").append(vulnerabilities.size()).append(" CVEs for ").append(product);
        if (!version.isBlank()) {
            sb.append("@").append(version);
        }

        // Count by CVSS score severity
        long critical = 0;
        long high = 0;
        long medium = 0;

        for (Map<String, Object> vuln : vulnerabilities) {
            Object cveData = vuln.get("cve");
            if (cveData instanceof Map) {
                @SuppressWarnings("unchecked")
                double cvssScore = extractCVSSScore((Map<String, Object>) cveData);
                if (cvssScore >= 9.0) critical++;
                else if (cvssScore >= 7.0) high++;
                else if (cvssScore >= 4.0) medium++;
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

        return sb.toString();
    }

    private double extractCVSSScore(Map<String, Object> cveData) {
        Object metrics = cveData.get("metrics");
        if (!(metrics instanceof Map)) {
            return 0.0;
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> metricsMap = (Map<String, Object>) metrics;
        
        // Try cvssMetricV31, then cvssMetricV3, then cvssMetricV2
        for (String metricKey : new String[]{"cvssMetricV31", "cvssMetricV3", "cvssMetricV2"}) {
            if (metricsMap.containsKey(metricKey)) {
                Object metricList = metricsMap.get(metricKey);
                if (metricList instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> metrics_list = (List<Map<String, Object>>) metricList;
                    if (!metrics_list.isEmpty()) {
                        Map<String, Object> metric = metrics_list.get(0);
                        Object cvssData = metric.get("cvssData");
                        if (cvssData instanceof Map) {
                            @SuppressWarnings("unchecked")
                            Object baseScore = ((Map<String, Object>) cvssData).get("baseScore");
                            if (baseScore instanceof Number) {
                                return ((Number) baseScore).doubleValue();
                            }
                        }
                    }
                }
            }
        }

        return 0.0;
    }

    private double calculateSecurityScore(List<Map<String, Object>> vulnerabilities) {
        if (vulnerabilities.isEmpty()) {
            return 85.0;
        }

        double score = 50.0;

        // Count by CVSS severity
        long critical = 0;
        long high = 0;
        long medium = 0;
        long low = 0;

        for (Map<String, Object> vuln : vulnerabilities) {
            Object cveData = vuln.get("cve");
            if (!(cveData instanceof Map)) continue;
            
            @SuppressWarnings("unchecked")
            double cvssScore = extractCVSSScore((Map<String, Object>) cveData);
            if (cvssScore >= 9.0) critical++;
            else if (cvssScore >= 7.0) high++;
            else if (cvssScore >= 4.0) medium++;
            else low++;
        }

        // Deductions based on CVSS severity
        score -= critical * 25;
        score -= high * 15;
        score -= medium * 8;
        score -= low * 2;

        return Math.max(0, Math.min(100, score));
    }
}
