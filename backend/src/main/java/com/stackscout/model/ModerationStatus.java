package com.stackscout.model;

/**
 * Статус модерации библиотеки
 */
public enum ModerationStatus {
    PENDING,        // Ожидает проверки
    VERIFIED,       // Проверено
    NEEDS_REVIEW,   // Требует уточнения
    ARCHIVED        // В архиве
}
