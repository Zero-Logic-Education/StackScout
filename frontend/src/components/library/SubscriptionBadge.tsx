"use client";

import { Chip, Tooltip } from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";

interface SubscriptionBadgeProps {
  isSubscribed: boolean;
  subscribersCount: number;
  variant?: "filled" | "outlined";
  size?: "small" | "medium";
}

/**
 * Бейдж индикатор подписки
 */
export default function SubscriptionBadge({
  isSubscribed,
  subscribersCount,
  variant = "filled",
  size = "small",
}: SubscriptionBadgeProps) {
  if (!isSubscribed && subscribersCount === 0) {
    return null;
  }

  return (
    <Tooltip
      title={
        isSubscribed
          ? `Вы подписаны. Всего подписчиков: ${subscribersCount}`
          : `Подписчиков: ${subscribersCount}`
      }
    >
      <Chip
        icon={isSubscribed ? <NotificationsIcon /> : undefined}
        label={`${subscribersCount} подписчик${
          subscribersCount === 1 ? "" : subscribersCount < 5 ? "а" : "ов"
        }`}
        color={isSubscribed ? "primary" : "default"}
        variant={variant}
        size={size}
        sx={{
          fontWeight: isSubscribed ? 600 : 400,
        }}
      />
    </Tooltip>
  );
}
