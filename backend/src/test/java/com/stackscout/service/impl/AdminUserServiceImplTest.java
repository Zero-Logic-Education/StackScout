package com.stackscout.service.impl;

import com.stackscout.dto.*;
import com.stackscout.exception.ResourceNotFoundException;
import com.stackscout.model.Role;
import com.stackscout.model.User;
import com.stackscout.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit тесты для AdminUserServiceImpl
 */
@ExtendWith(MockitoExtension.class)
class AdminUserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminUserServiceImpl adminUserService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("admin");
        testUser.setEmail("admin@stackscout.com");
        testUser.setPassword("$2a$10$encodedpassword");
        testUser.setRole(Role.ADMIN);
        testUser.setEnabled(true);
        testUser.setLocked(false);
        testUser.setCreatedAt(LocalDateTime.now().minusDays(30));
        testUser.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void getAll_ShouldReturnPagedUsers() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> userPage = new PageImpl<>(List.of(testUser), pageable, 1);
        when(userRepository.findAll(pageable)).thenReturn(userPage);

        // When
        Page<AdminUserDto> result = adminUserService.getAll(pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("admin", result.getContent().get(0).getUsername());
        verify(userRepository).findAll(pageable);
    }

    @Test
    void getById_WhenExists_ShouldReturnUserDto() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        AdminUserDto result = adminUserService.getById(1L);

        assertNotNull(result);
        assertEquals("admin", result.getUsername());
        assertEquals(Role.ADMIN, result.getRole());
    }

    @Test
    void getById_WhenNotExists_ShouldThrowResourceNotFoundException() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> adminUserService.getById(999L));
    }

    @Test
    void updateUser_ShouldUpdateAllFields() {
        // Given
        AdminUpdateUserRequest request = new AdminUpdateUserRequest();
        request.setUsername("newadmin");
        request.setEmail("new@stackscout.com");
        request.setPassword("newpassword");
        request.setRole(Role.USER);
        request.setEnabled(false);
        request.setLocked(true);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("newpassword")).thenReturn("$2a$10$newencodedpassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        AdminUserDto result = adminUserService.updateUser(1L, request);

        // Then
        assertNotNull(result);
        verify(userRepository).save(testUser);
        assertEquals("newadmin", testUser.getUsername());
        assertEquals("new@stackscout.com", testUser.getEmail());
        assertEquals(Role.USER, testUser.getRole());
        assertFalse(testUser.getEnabled());
        assertTrue(testUser.getLocked());
    }

    @Test
    void updateUser_WithPartialFields_ShouldUpdateOnlyProvidedFields() {
        // Given
        AdminUpdateUserRequest request = new AdminUpdateUserRequest();
        request.setUsername("updatedusername");
        // Other fields are null

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(testUser)).thenReturn(testUser);

        // When
        AdminUserDto result = adminUserService.updateUser(1L, request);

        // Then
        assertNotNull(result);
        assertEquals("updatedusername", testUser.getUsername());
        assertEquals("admin@stackscout.com", testUser.getEmail()); // unchanged
        assertEquals(Role.ADMIN, testUser.getRole()); // unchanged
    }

    @Test
    void updateUser_WhenNotExists_ShouldThrowResourceNotFoundException() {
        AdminUpdateUserRequest request = new AdminUpdateUserRequest();
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> adminUserService.updateUser(999L, request));
    }

    @Test
    void updateStatus_ShouldUpdateEnabledAndLocked() {
        // Given
        AdminUpdateUserStatusRequest request = new AdminUpdateUserStatusRequest();
        request.setEnabled(false);
        request.setLocked(true);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(testUser)).thenReturn(testUser);

        // When
        AdminUserDto result = adminUserService.updateStatus(1L, request);

        // Then
        assertNotNull(result);
        assertFalse(testUser.getEnabled());
        assertTrue(testUser.getLocked());
    }

    @Test
    void updateStatus_WithPartialFields_ShouldUpdateOnlyProvidedFields() {
        // Given
        AdminUpdateUserStatusRequest request = new AdminUpdateUserStatusRequest();
        request.setEnabled(false);
        // locked is null

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(testUser)).thenReturn(testUser);

        // When
        AdminUserDto result = adminUserService.updateStatus(1L, request);

        // Then
        assertFalse(testUser.getEnabled());
        assertFalse(testUser.getLocked()); // unchanged
    }

    @Test
    void resetPassword_ShouldEncodeAndSaveNewPassword() {
        // Given
        AdminResetPasswordRequest request = new AdminResetPasswordRequest();
        request.setNewPassword("newsecurepassword");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("newsecurepassword")).thenReturn("$2a$10$newpasswordhash");
        when(userRepository.save(testUser)).thenReturn(testUser);

        // When
        AdminUserDto result = adminUserService.resetPassword(1L, request);

        // Then
        assertNotNull(result);
        verify(passwordEncoder).encode("newsecurepassword");
        verify(userRepository).save(testUser);
    }

    @Test
    void deleteUser_WhenExists_ShouldDelete() {
        when(userRepository.existsById(1L)).thenReturn(true);
        doNothing().when(userRepository).deleteById(1L);

        assertDoesNotThrow(() -> adminUserService.deleteUser(1L));
        verify(userRepository).deleteById(1L);
    }

    @Test
    void deleteUser_WhenNotExists_ShouldThrowResourceNotFoundException() {
        when(userRepository.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> adminUserService.deleteUser(999L));
        verify(userRepository, never()).deleteById(any());
    }
}
