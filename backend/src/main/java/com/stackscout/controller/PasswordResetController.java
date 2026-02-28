package com.stackscout.controller;

import com.stackscout.dto.PasswordResetConfirmDto;
import com.stackscout.dto.PasswordResetRequestDto;
import com.stackscout.service.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST контроллер для сброса пароля
 */
@Slf4j
@RestController
@RequestMapping("/api/auth/password-reset")
@RequiredArgsConstructor
@Tag(name = "Password Reset", description = "API для сброса пароля")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/request")
    @Operation(summary = "Запрос на сброс пароля", 
               description = "Отправляет email с токеном для сброса пароля")
    public ResponseEntity<Void> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequestDto request) {
        log.info("POST /api/auth/password-reset/request для email: {}", request.getEmail());
        passwordResetService.initiatePasswordReset(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/confirm")
    @Operation(summary = "Подтверждение сброса пароля",
               description = "Устанавливает новый пароль используя токен")
    public ResponseEntity<Void> confirmPasswordReset(
            @Valid @RequestBody PasswordResetConfirmDto request) {
        log.info("POST /api/auth/password-reset/confirm");
        passwordResetService.confirmPasswordReset(request);
        return ResponseEntity.ok().build();
    }
}
