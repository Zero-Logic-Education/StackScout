'use client';

import { usePreviousPage } from '@/lib/hooks/usePreviousPage';

/**
 * Component that tracks page navigation for redirect after login/register
 */
export default function PageTracker() {
  usePreviousPage();
  return null;
}
