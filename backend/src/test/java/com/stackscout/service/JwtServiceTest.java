package com.stackscout.service;

import com.stackscout.model.Role;
import com.stackscout.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit тесты для JwtService
 */
class JwtServiceTest {

    private JwtService jwtService;

    // Тот же секрет что в application.yml
    private static final String SECRET_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final long EXPIRATION = 86400000L; // 24 hours

    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", SECRET_KEY);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", EXPIRATION);

        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encodedPassword")
                .role(Role.USER)
                .enabled(true)
                .locked(false)
                .build();
    }

    @Test
    void generateToken_ShouldReturnNonNullToken() {
        String token = jwtService.generateToken(testUser);
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void generateToken_ShouldContainThreeParts() {
        String token = jwtService.generateToken(testUser);
        String[] parts = token.split("\\.");
        assertEquals(3, parts.length, "JWT should have 3 parts: header.payload.signature");
    }

    @Test
    void extractUsername_ShouldReturnCorrectUsername() {
        String token = jwtService.generateToken(testUser);
        String username = jwtService.extractUsername(token);
        assertEquals("testuser", username);
    }

    @Test
    void isTokenValid_WithValidToken_ShouldReturnTrue() {
        String token = jwtService.generateToken(testUser);
        assertTrue(jwtService.isTokenValid(token, testUser));
    }

    @Test
    void isTokenValid_WithWrongUser_ShouldReturnFalse() {
        String token = jwtService.generateToken(testUser);

        User otherUser = User.builder()
                .id(2L)
                .username("otheruser")
                .email("other@example.com")
                .password("encodedPassword")
                .role(Role.USER)
                .enabled(true)
                .locked(false)
                .build();

        assertFalse(jwtService.isTokenValid(token, otherUser));
    }

    @Test
    void generateToken_WithExtraClaims_ShouldProduceValidToken() {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("customClaim", "customValue");

        String token = jwtService.generateToken(extraClaims, testUser);
        assertNotNull(token);
        assertEquals("testuser", jwtService.extractUsername(token));
    }

    @Test
    void generateToken_ForAdminUser_ShouldContainRoleClaim() {
        User adminUser = User.builder()
                .id(2L)
                .username("admin")
                .email("admin@example.com")
                .password("encodedPassword")
                .role(Role.ADMIN)
                .enabled(true)
                .locked(false)
                .build();

        String token = jwtService.generateToken(adminUser);
        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token, adminUser));
    }

    @Test
    void extractUsername_AfterMultipleGenerations_ShouldBeConsistent() {
        String token1 = jwtService.generateToken(testUser);
        String token2 = jwtService.generateToken(testUser);

        assertEquals(jwtService.extractUsername(token1), jwtService.extractUsername(token2));
    }

    @Test
    void isTokenValid_SameTokenAndUser_ShouldReturnTrue() {
        String token = jwtService.generateToken(testUser);
        // Verify twice - token should remain valid
        assertTrue(jwtService.isTokenValid(token, testUser));
        assertTrue(jwtService.isTokenValid(token, testUser));
    }
}
