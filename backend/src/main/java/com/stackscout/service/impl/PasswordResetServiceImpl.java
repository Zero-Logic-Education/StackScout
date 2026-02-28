package com.stackscout.service.impl;

import com.stackscout.dto.PasswordResetConfirmDto;
import com.stackscout.dto.PasswordResetRequestDto;
import com.stackscout.exception.ResourceNotFoundException;
import com.stackscout.model.PasswordResetToken;
import com.stackscout.model.User;
import com.stackscout.repository.PasswordResetTokenRepository;
import com.stackscout.repository.UserRepository;
import com.stackscout.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Реализация сервиса сброса пароля
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    private static final int TOKEN_EXPIRY_HOURS = 24;

    @Override
    @Transactional
    @SuppressWarnings("null")
    public void initiatePasswordReset(PasswordResetRequestDto request) {
        log.info("Инициализация сброса пароля для email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден с email: " + request.getEmail()));

        // Генерируем токен
        String token = UUID.randomUUID().toString();

        // Создаем запись токена
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(TOKEN_EXPIRY_HOURS))
                .used(false)
                .build();

        tokenRepository.save(resetToken);

        // emailService.sendPasswordResetEmail(user.getEmail(), token);
        log.info("Email с токеном сброса должен быть отправлен на: {}", user.getEmail());

        log.info("Токен сброса пароля создан для пользователя: {}", user.getUsername());
        log.debug("Токен (для разработки): {}", token);
    }

    @Override
    @Transactional
    public void confirmPasswordReset(PasswordResetConfirmDto request) {
        log.info("Подтверждение сброса пароля");

        PasswordResetToken resetToken = tokenRepository
                .findByTokenAndUsedFalseAndExpiryDateAfter(request.getToken(), LocalDateTime.now())
                .orElseThrow(() -> new IllegalArgumentException("Недействительный или истекший токен"));

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Отмечаем токен как использованный
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        log.info("Пароль успешно сброшен для пользователя: {}", user.getUsername());
    }

    @Override
    @Transactional
    public void forceResetAdminPassword(String username, String newPassword) {
        log.warn("ПРИНУДИТЕЛЬНЫЙ СБРОС ПАРОЛЯ для пользователя: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден: " + username));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setLocked(false);
        user.setEnabled(true);
        userRepository.save(user);

        log.info("Пароль успешно сброшен принудительно для: {}", username);
    }
}
