import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth";

// Pages that should not be saved as previous page
const EXCLUDED_PAGES = ["/login", "/register", "/admin/login", "/forgot-password"];

/**
 * Hook that tracks the current page and saves it as previousPage
 * This allows redirecting to the previous page after login/register
 */
export const usePreviousPage = () => {
  const pathname = usePathname();
  const setPreviousPage = useAuthStore((state) => state.setPreviousPage);

  useEffect(() => {
    // Only save pages that should be remembered
    if (!EXCLUDED_PAGES.includes(pathname)) {
      setPreviousPage(pathname);
    }
  }, [pathname, setPreviousPage]);
};
