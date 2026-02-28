package com.stackscout.cli;

import com.stackscout.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * CLI команда для аварийного сброса пароля администратора.
 * 
 * Использование:
 * java -jar backend.jar --reset-admin-password --username=admin --password=newpassword123
 * 
 * Или через Docker:
 * docker-compose exec backend java -jar app.jar --reset-admin-password --username=admin --password=newpassword123
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ResetPasswordCommandLineRunner implements CommandLineRunner {

    private final PasswordResetService passwordResetService;

    @Override
    public void run(String... args) {
        boolean resetPassword = false;
        String username = null;
        String newPassword = null;

        // Парсинг аргументов
        for (String arg : args) {
            if ("--reset-admin-password".equals(arg)) {
                resetPassword = true;
            } else if (arg.startsWith("--username=")) {
                username = arg.substring("--username=".length());
            } else if (arg.startsWith("--password=")) {
                newPassword = arg.substring("--password=".length());
            }
        }

        if (resetPassword) {
            if (username == null || newPassword == null) {
                log.error("Использование: --reset-admin-password --username=<username> --password=<newpassword>");
                System.exit(1);
            }

            if (newPassword != null && newPassword.length() < 8) {
                log.error("Пароль должен содержать минимум 8 символов");
                System.exit(1);
            }

            try {
                log.warn("=".repeat(60));
                log.warn("ВНИМАНИЕ: Выполняется аварийный сброс пароля!");
                log.warn("Пользователь: {}", username);
                log.warn("=".repeat(60));

                passwordResetService.forceResetAdminPassword(username, newPassword);

                log.info("=".repeat(60));
                log.info("Пароль успешно сброшен!");
                log.info("Пользователь: {}", username);
                log.info("Вы можете войти в систему с новым паролем");
                log.info("=".repeat(60));

                System.exit(0);
            } catch (Exception e) {
                log.error("Ошибка при сбросе пароля: {}", e.getMessage(), e);
                System.exit(1);
            }
        }
    }
}
