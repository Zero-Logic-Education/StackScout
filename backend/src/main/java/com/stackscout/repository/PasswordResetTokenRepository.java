package com.stackscout.repository;

import com.stackscout.model.PasswordResetToken;
import com.stackscout.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Репозиторий для управления токенами сброса пароля
 */
@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    /**
     * Найти токен по значению
     */
    Optional<PasswordResetToken> findByToken(String token);

    /**
     * Найти все токены пользователя
     */
    List<PasswordResetToken> findByUser(User user);

    /**
     * Удалить истекшие токены
     */
    void deleteByExpiryDateBefore(LocalDateTime date);

    /**
     * Найти валидный токен (не использован и не истек)
     */
    Optional<PasswordResetToken> findByTokenAndUsedFalseAndExpiryDateAfter(
            String token, LocalDateTime currentDate);
}
