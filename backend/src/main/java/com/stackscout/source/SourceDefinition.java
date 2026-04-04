package com.stackscout.source;

import java.util.List;

public record SourceDefinition(
        String key,
        String displayName,
        String category,
        String description,
        List<String> aliases) {
}