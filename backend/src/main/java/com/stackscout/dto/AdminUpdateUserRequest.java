package com.stackscout.dto;

import com.stackscout.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUpdateUserRequest {
    private String username;
    private String email;
    private String password;
    private Role role;
    private Boolean enabled;
    private Boolean locked;
}
