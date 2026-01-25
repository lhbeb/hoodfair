/**
 * Robust scroll lock utility with reference counting
 * Prevents scroll lock from getting stuck when multiple components use it
 */

let scrollLockCount = 0;
let originalOverflow = '';
let originalDocumentOverflow = '';

/**
 * Lock body scroll (with reference counting)
 * Safe to call multiple times - will only unlock when all locks are released
 */
export function lockScroll(): void {
  if (scrollLockCount === 0) {
    // Store original values
    originalOverflow = document.body.style.overflow;
    originalDocumentOverflow = document.documentElement.style.overflow;

    // Lock scroll
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }
  scrollLockCount++;
}

/**
 * Unlock body scroll (with reference counting)
 * Only unlocks when all locks have been released
 */
export function unlockScroll(): void {
  scrollLockCount = Math.max(0, scrollLockCount - 1);

  if (scrollLockCount === 0) {
    // Restore original values
    document.body.style.overflow = originalOverflow;
    document.documentElement.style.overflow = originalDocumentOverflow;
  }
}

/**
 * Force unlock all scroll locks (emergency reset)
 * Use this if scroll gets stuck
 */
export function forceUnlockScroll(): void {
  scrollLockCount = 0;
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  document.body.style.removeProperty('overflow');
  document.documentElement.style.removeProperty('overflow');
}

/**
 * Check if scroll is currently locked
 */
export function isScrollLocked(): boolean {
  return scrollLockCount > 0;
}

/**
 * Get current lock count (for debugging)
 */
export function getScrollLockCount(): number {
  return scrollLockCount;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use lockScroll/unlockScroll instead
 */
export const preventScrollOnClick = (callback: () => void, shouldScrollToTop: boolean = false) => {
  const activeElement = document.activeElement as HTMLElement;
  if (activeElement) {
    activeElement.blur();
  }

  lockScroll();
  callback();

  requestAnimationFrame(() => {
    unlockScroll();

    if (shouldScrollToTop) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }
  });
};

// Emergency cleanup on page visibility change
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Force unlock when page becomes visible again
      // This helps recover from stuck scroll locks
      if (scrollLockCount > 0) {
        console.warn('[ScrollLock] Detected stuck scroll lock, forcing unlock');
        forceUnlockScroll();
      }
    }
  });

  // Emergency cleanup on page unload
  window.addEventListener('beforeunload', () => {
    forceUnlockScroll();
  });
}
