package com.stackscout.service;

import com.stackscout.dto.AdminResetPasswordRequest;
import com.stackscout.dto.AdminUpdateUserRequest;
import com.stackscout.dto.AdminUpdateUserStatusRequest;
import com.stackscout.dto.AdminUserDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminUserService {
    Page<AdminUserDto> getAll(Pageable pageable);
    AdminUserDto getById(Long id);
    AdminUserDto updateUser(Long id, AdminUpdateUserRequest request);
    AdminUserDto updateStatus(Long id, AdminUpdateUserStatusRequest request);
    AdminUserDto resetPassword(Long id, AdminResetPasswordRequest request);
    void deleteUser(Long id);
}
