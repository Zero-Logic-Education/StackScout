package com.stackscout.dto;

import com.stackscout.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDto {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private Boolean enabled;
    private Boolean locked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
