package com.stackscout.source;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class SourceRegistryService {

    private final List<SourceAdapter> adapters;
    private Map<String, SourceAdapter> adapterIndex = Map.of();

    @PostConstruct
    void init() {
        Map<String, SourceAdapter> index = new HashMap<>();

        for (SourceAdapter adapter : adapters) {
            SourceDefinition definition = adapter.getDefinition();
            register(index, definition.key(), adapter);
            if (definition.aliases() != null) {
                for (String alias : definition.aliases()) {
                    register(index, alias, adapter);
                }
            }
        }

        adapterIndex = Map.copyOf(index);
    }

    public List<SourceDefinition> getSources() {
        return adapters.stream()
                .map(SourceAdapter::getDefinition)
                .sorted((left, right) -> left.displayName().compareToIgnoreCase(right.displayName()))
                .toList();
    }

    public boolean isSupported(String source) {
        if (source == null || source.isBlank()) {
            return false;
        }

        try {
            return adapterIndex.containsKey(normalize(source));
        } catch (IllegalArgumentException ignored) {
            return false;
        }
    }

    public String normalize(String source) {
        if (source == null || source.isBlank()) {
            throw new IllegalArgumentException("Source cannot be blank");
        }

        String normalized = source.trim().toLowerCase(Locale.ROOT);
        SourceAdapter adapter = adapterIndex.get(normalized);
        if (adapter == null) {
            throw new IllegalArgumentException("Unsupported source: " + source);
        }

        return adapter.getDefinition().key();
    }

    public SourceAdapter getRequiredAdapter(String source) {
        String normalized = normalize(source);
        SourceAdapter adapter = adapterIndex.get(normalized);
        if (adapter == null) {
            throw new IllegalArgumentException("Unsupported source: " + source);
        }
        return adapter;
    }

    private void register(Map<String, SourceAdapter> index, String sourceKey, SourceAdapter adapter) {
        if (sourceKey == null || sourceKey.isBlank() || adapter == null) {
            return;
        }

        String normalized = sourceKey.trim().toLowerCase(Locale.ROOT);
        SourceAdapter existing = index.get(normalized);
        if (existing != null && !Objects.equals(existing.getDefinition().key(), adapter.getDefinition().key())) {
            throw new IllegalStateException("Duplicate source key registration: " + sourceKey);
        }

        index.put(normalized, adapter);
    }
}