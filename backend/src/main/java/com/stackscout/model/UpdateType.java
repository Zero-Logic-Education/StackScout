package com.stackscout.model;

/**
 * Тип обновления библиотеки согласно семантическому версионированию
 */
public enum UpdateType {
    MAJOR,  // Breaking changes
    MINOR,  // Новый функционал (обратно совместимый)
    PATCH   // Исправления ошибок
}
