// File: StackScoutApplicationTests.java
package com.stackscout;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Тесты для проверки корректности загрузки контекста приложения.
 */
@SpringBootTest
@ActiveProfiles("test")
class StackScoutApplicationTests {

    @Test
    void contextLoads() {
        // Test that the application context loads successfully
    }
}