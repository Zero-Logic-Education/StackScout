package com.stackscout.source;

import com.stackscout.model.Library;

public interface SourceAdapter {
    SourceDefinition getDefinition();

    Library collect(String identifier);
}