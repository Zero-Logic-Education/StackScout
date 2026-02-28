"use client";

import { useEffect } from "react";
import { Button, CircularProgress, Tooltip } from "@mui/material";
import {
  Add as AddIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useLibrarySubscription } from "@/lib/hooks";
import { useAuthStore } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface SubscribeButtonProps {
  libraryId: number;
  libraryName: string;
  variant?: "contained" | "outlined" | "text";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  onSubscriptionChange?: (isSubscribed: boolean) => void;
}

/**
 * Кнопка подписки/отписки на библиотеку
 */
export default function SubscribeButton({
  libraryId,
  libraryName,
  variant = "outlined",
  size = "medium",
  fullWidth = false,
  onSubscriptionChange,
}: SubscribeButtonProps) {
  const {
    isLoading,
    error,
    status,
    subscribe,
    unsubscribe,
    fetchSubscriptionStatus,
  } = useLibrarySubscription(libraryId);

  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Загрузить статус подписки при монтировании
  useEffect(() => {
    let isMounted = true;

    const loadStatus = async () => {
      if (!isAuthenticated) {
        return;
      }
      if (isMounted) {
        await fetchSubscriptionStatus();
      }
    };

    loadStatus();

    return () => {
      isMounted = false;
    };
  }, [fetchSubscriptionStatus, isAuthenticated]);

  const isSubscribed = status?.isSubscribed ?? false;

  // Обработать нажатие на кнопку
  const handleClick = async () => {
    try {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      if (isSubscribed) {
        await unsubscribe();
        onSubscriptionChange?.(false);
      } else {
        await subscribe();
        onSubscriptionChange?.(true);
      }
      await fetchSubscriptionStatus();
    } catch {
    }
  };

  const buttonVariant = isSubscribed ? "contained" : variant;
  const buttonColor = isSubscribed ? "primary" : "primary";

  return (
    <Tooltip
      title={
        isSubscribed
          ? `Вы подписаны на ${libraryName}. Нажмите, чтобы отписаться`
          : "Подпишитесь для отслеживания обновлений"
      }
    >
      <Button
        variant={buttonVariant}
        color={buttonColor}
        size={size}
        fullWidth={fullWidth}
        onClick={handleClick}
        disabled={isLoading}
        startIcon={
          isLoading ? (
            <CircularProgress size={16} />
          ) : isSubscribed ? (
            <CheckIcon />
          ) : (
            <AddIcon />
          )
        }
        sx={{
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "scale(1.02)",
          },
        }}
      >
        {isLoading
          ? "Загрузка..."
          : isSubscribed
          ? "Подписан"
          : "Подписаться"}
      </Button>
    </Tooltip>
  );
}
