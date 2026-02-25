package com.stackscout.dto;

import com.stackscout.model.UpdateType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO для обновления библиотеки
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LibraryUpdateDto {
    
    private Long id;
    private Long libraryId;
    private String libraryName;
    private String librarySource;
    private String oldVersion;
    private String newVersion;
    private UpdateType updateType;
    private String changeLog;
    private Integer oldHealthScore;
    private Integer newHealthScore;
    private LocalDateTime updateDate;
}
