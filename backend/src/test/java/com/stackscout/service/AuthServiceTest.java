package com.stackscout.service;

import com.stackscout.dto.AuthResponse;
import com.stackscout.dto.AuthenticationRequest;
import com.stackscout.dto.RegisterRequest;
import com.stackscout.model.Role;
import com.stackscout.model.User;
import com.stackscout.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit тесты для AuthService
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encoded_password")
                .role(Role.USER)
                .enabled(true)
                .locked(false)
                .build();
    }

    @Test
    void register_ShouldReturnAuthResponse() {
        // Given
        RegisterRequest request = RegisterRequest.builder()
                .username("newuser")
                .email("new@example.com")
                .password("password123")
                .build();

        when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

        // When
        AuthResponse response = authService.register(request);

        // Then
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        verify(userRepository).save(any(User.class));
        verify(jwtService).generateToken(any(User.class));
    }

    @Test
    void register_WithoutRole_ShouldDefaultToUserRole() {
        // Given
        RegisterRequest request = RegisterRequest.builder()
                .username("newuser")
                .email("new@example.com")
                .password("password123")
                .role(null)  // No role specified
                .build();

        when(passwordEncoder.encode(any())).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            assertEquals(Role.USER, saved.getRole(), "Default role should be USER");
            return testUser;
        });
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

        // When
        AuthResponse response = authService.register(request);

        // Then
        assertNotNull(response);
    }

    @Test
    void register_WithExplicitRole_ShouldUseSpecifiedRole() {
        // Given
        RegisterRequest request = RegisterRequest.builder()
                .username("admin")
                .email("admin@example.com")
                .password("adminpass")
                .role(Role.ADMIN)
                .build();

        when(passwordEncoder.encode(any())).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            assertEquals(Role.ADMIN, saved.getRole(), "Should use provided role ADMIN");
            return testUser;
        });
        when(jwtService.generateToken(any(User.class))).thenReturn("admin-jwt-token");

        // When
        AuthResponse response = authService.register(request);

        // Then
        assertNotNull(response);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void authenticate_WithValidCredentials_ShouldReturnAuthResponse() {
        // Given
        AuthenticationRequest request = new AuthenticationRequest();
        request.setUsername("testuser");
        request.setPassword("password123");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null); // auth manager returns authentication object, null means success in mock
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtService.generateToken(testUser)).thenReturn("jwt-token");

        // When
        AuthResponse response = authService.authenticate(request);

        // Then
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByUsername("testuser");
        verify(jwtService).generateToken(testUser);
    }

    @Test
    void authenticate_WithInvalidCredentials_ShouldThrowException() {
        // Given
        AuthenticationRequest request = new AuthenticationRequest();
        request.setUsername("testuser");
        request.setPassword("wrongpassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        // When / Then
        assertThrows(BadCredentialsException.class, () -> authService.authenticate(request));
        verify(userRepository, never()).findByUsername(any());
    }

    @Test
    void authenticate_ShouldCallAuthManagerWithCorrectCredentials() {
        // Given
        AuthenticationRequest request = new AuthenticationRequest();
        request.setUsername("testuser");
        request.setPassword("mypassword");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtService.generateToken(testUser)).thenReturn("jwt-token");

        // When
        authService.authenticate(request);

        // Then
        verify(authenticationManager).authenticate(
                argThat(auth -> {
                    UsernamePasswordAuthenticationToken token = (UsernamePasswordAuthenticationToken) auth;
                    return "testuser".equals(token.getPrincipal()) &&
                           "mypassword".equals(token.getCredentials());
                })
        );
    }
}
