package com.stackscout.service.impl;

import com.stackscout.dto.AdminResetPasswordRequest;
import com.stackscout.dto.AdminUpdateUserRequest;
import com.stackscout.dto.AdminUpdateUserStatusRequest;
import com.stackscout.dto.AdminUserDto;
import com.stackscout.exception.ResourceNotFoundException;
import com.stackscout.model.User;
import com.stackscout.repository.UserRepository;
import com.stackscout.service.AdminUserService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public Page<AdminUserDto> getAll(@NonNull Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserDto getById(@NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return toDto(user);
    }

    @Override
    public AdminUserDto updateUser(@NonNull Long id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        if (request.getUsername() != null) {
            user.setUsername(request.getUsername());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        return toDto(userRepository.save(user));
    }

    @Override
    public AdminUserDto updateStatus(@NonNull Long id, AdminUpdateUserStatusRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }
        if (request.getLocked() != null) {
            user.setLocked(request.getLocked());
        }

        return toDto(userRepository.save(user));
    }

    @Override
    public AdminUserDto resetPassword(@NonNull Long id, AdminResetPasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        return toDto(userRepository.save(user));
    }

    @Override
    public void deleteUser(@NonNull Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found: " + id);
        }
        userRepository.deleteById(id);
    }

    private AdminUserDto toDto(@NonNull User user) {
        return AdminUserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .enabled(user.getEnabled())
                .locked(user.getLocked())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
