package com.stackscout.controller;

import com.stackscout.dto.AdminResetPasswordRequest;
import com.stackscout.dto.AdminUpdateUserRequest;
import com.stackscout.dto.AdminUpdateUserStatusRequest;
import com.stackscout.dto.AdminUserDto;
import com.stackscout.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<Page<AdminUserDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminUserService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminUserService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminUserDto> updateUser(
            @PathVariable Long id,
            @RequestBody AdminUpdateUserRequest request) {
        return ResponseEntity.ok(adminUserService.updateUser(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AdminUserDto> updateStatus(
            @PathVariable Long id,
            @RequestBody AdminUpdateUserStatusRequest request) {
        return ResponseEntity.ok(adminUserService.updateStatus(id, request));
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<AdminUserDto> resetPassword(
            @PathVariable Long id,
            @RequestBody AdminResetPasswordRequest request) {
        return ResponseEntity.ok(adminUserService.resetPassword(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
