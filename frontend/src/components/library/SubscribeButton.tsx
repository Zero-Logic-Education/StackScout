"use client";

import { useState, useEffect } from "react";
import { Button, CircularProgress, Tooltip } from "@mui/material";
import {
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  Add as AddIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useLibrarySubscription } from "@/lib/hooks";
import { toast } from "react-hot-toast";
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

  const [isSubscribed, setIsSubscribed] = useState(false);

  // Загрузить статус подписки при монтировании
  useEffect(() => {
    let isMounted = true;

    const loadStatus = async () => {
      if (!isAuthenticated) {
        if (isMounted) {
          setIsSubscribed(false);
        }
        return;
      }
      const statusData = await fetchSubscriptionStatus();
      if (isMounted && statusData) {
        setIsSubscribed(statusData.isSubscribed);
      }
    };

    loadStatus();

    return () => {
      isMounted = false;
    };
  }, [fetchSubscriptionStatus, isAuthenticated]);

  // Обновить локальное состояние при изменении статуса
  useEffect(() => {
    if (status) {
      setIsSubscribed(status.isSubscribed);
    }
  }, [status]);

  // Обработать нажатие на кнопку
  const handleClick = async () => {
    try {
      if (!isAuthenticated) {
        toast.error("Войдите, чтобы управлять подписками");
        router.push("/login");
        return;
      }
      if (isSubscribed) {
        await unsubscribe();
        toast.success(`Вы отписались от ${libraryName}`);
        setIsSubscribed(false);
        onSubscriptionChange?.(false);
      } else {
        await subscribe();
        toast.success(`Вы подписались на ${libraryName}`);
        setIsSubscribed(true);
        onSubscriptionChange?.(true);
      }
    } catch (err) {
      toast.error(error || "Произошла ошибка");
    }
  };

  const buttonVariant = isSubscribed ? "contained" : variant;
  const buttonColor = isSubscribed ? "primary" : "primary";

  return (
    <Tooltip
      title={
        isSubscribed
          ? "Вы подписаны. Нажмите, чтобы отписаться"
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
