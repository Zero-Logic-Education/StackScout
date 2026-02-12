"use client";

import { Toaster } from "react-hot-toast";

/**
 * Toast Provider для отображения уведомлений
 * Используется react-hot-toast для красивых и настраиваемых уведомлений
 */
export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        // Дефолтные опции для всех уведомлений
        duration: 4000,
        style: {
          background: "#242424",
          color: "#e0e0e0",
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          padding: "16px",
          fontSize: "14px",
        },
        // Опции для успешных уведомлений
        success: {
          duration: 3000,
          iconTheme: {
            primary: "#4caf50",
            secondary: "#fff",
          },
        },
        // Опции для ошибок
        error: {
          duration: 5000,
          iconTheme: {
            primary: "#f44336",
            secondary: "#fff",
          },
        },
        // Опции для загрузки
        loading: {
          iconTheme: {
            primary: "#4caf50",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
