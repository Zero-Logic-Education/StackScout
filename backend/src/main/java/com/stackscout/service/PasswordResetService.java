package com.stackscout.service;

import com.stackscout.dto.PasswordResetConfirmDto;
import com.stackscout.dto.PasswordResetRequestDto;

/**
 * Сервис для сброса пароля
 */
public interface PasswordResetService {

    /**
     * Инициировать сброс пароля
     */
    void initiatePasswordReset(PasswordResetRequestDto request);

    /**
     * Подтвердить сброс пароля
     */
    void confirmPasswordReset(PasswordResetConfirmDto request);

    /**
     * Принудительный сброс пароля администратора (для использования из CLI)
     */
    void forceResetAdminPassword(String username, String newPassword);
}
