package com.stackscout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Запрос на сброс пароля пользователя администратором
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminResetPasswordRequest {
    
    @NotBlank(message = "Новый пароль обязателен")
    @Size(min = 8, message = "Пароль должен содержать минимум 8 символов")
    private String newPassword;
}
