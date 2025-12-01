import React from 'react';

/**
 * Mobile Touch Optimizations for Portal
 * Enhances touch interactions, gestures, and mobile UX
 */

/**
 * Swipe Gesture Handler
 * Detects and handles swipe gestures on mobile devices
 */
export class SwipeGestureHandler {
    private startX = 0;
    private startY = 0;
    private startTime = 0;
    private element: HTMLElement;
    private threshold = 50; // Minimum distance for swipe
    private maxTime = 300; // Maximum time for swipe (ms)
    private onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void;

    constructor(
        element: HTMLElement,
        onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void
    ) {
        this.element = element;
        this.onSwipe = onSwipe;
        this.attachListeners();
    }

    private attachListeners(): void {
        this.element.addEventListener('touchstart', this.handleTouchStart);
        this.element.addEventListener('touchend', this.handleTouchEnd);
    }

    private handleTouchStart = (e: TouchEvent): void => {
        const touch = e.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        this.startTime = Date.now();
    };

    private handleTouchEnd = (e: TouchEvent): void => {
        const touch = e.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;
        const endTime = Date.now();

        const deltaX = endX - this.startX;
        const deltaY = endY - this.startY;
        const deltaTime = endTime - this.startTime;

        // Check if it's a valid swipe
        if (deltaTime > this.maxTime) return;

        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // Determine swipe direction
        if (absX > this.threshold && absX > absY) {
            // Horizontal swipe
            if (deltaX > 0) {
                this.onSwipe('right');
            } else {
                this.onSwipe('left');
            }
        } else if (absY > this.threshold && absY > absX) {
            // Vertical swipe
            if (deltaY > 0) {
                this.onSwipe('down');
            } else {
                this.onSwipe('up');
            }
        }
    };

    destroy(): void {
        this.element.removeEventListener('touchstart', this.handleTouchStart);
        this.element.removeEventListener('touchend', this.handleTouchEnd);
    }
}

/**
 * Pull to Refresh Implementation
 * Implements pull-to-refresh for mobile dashboards
 */
export class PullToRefresh {
    private element: HTMLElement;
    private onRefresh: () => Promise<void>;
    private threshold = 80; // Pull distance to trigger refresh
    private startY = 0;
    private currentY = 0;
    private isRefreshing = false;
    private indicator: HTMLElement | null = null;

    constructor(element: HTMLElement, onRefresh: () => Promise<void>) {
        this.element = element;
        this.onRefresh = onRefresh;
        this.createIndicator();
        this.attachListeners();
    }

    private createIndicator(): void {
        this.indicator = document.createElement('div');
        this.indicator.className = 'pull-to-refresh-indicator';
        this.indicator.style.cssText = `
      position: absolute;
      top: -60px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: top 0.3s;
    `;
        this.indicator.innerHTML = `
      <svg class="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    `;

        if (this.element.parentElement) {
            this.element.parentElement.style.position = 'relative';
            this.element.parentElement.insertBefore(this.indicator, this.element);
        }
    }

    private attachListeners(): void {
        this.element.addEventListener('touchstart', this.handleTouchStart);
        this.element.addEventListener('touchmove', this.handleTouchMove);
        this.element.addEventListener('touchend', this.handleTouchEnd);
    }

    private handleTouchStart = (e: TouchEvent): void => {
        if (this.element.scrollTop === 0 && !this.isRefreshing) {
            this.startY = e.touches[0].clientY;
        }
    };

    private handleTouchMove = (e: TouchEvent): void => {
        if (this.isRefreshing) return;

        this.currentY = e.touches[0].clientY;
        const pullDistance = this.currentY - this.startY;

        if (pullDistance > 0 && this.element.scrollTop === 0) {
            e.preventDefault();

            // Update indicator position
            if (this.indicator) {
                const indicatorY = Math.min(pullDistance - 60, 20);
                this.indicator.style.top = `${indicatorY}px`;
            }
        }
    };

    private handleTouchEnd = async (): Promise<void> => {
        const pullDistance = this.currentY - this.startY;

        if (pullDistance > this.threshold && !this.isRefreshing) {
            this.isRefreshing = true;

            // Show indicator
            if (this.indicator) {
                this.indicator.style.top = '20px';
            }

            try {
                await this.onRefresh();
            } finally {
                setTimeout(() => {
                    if (this.indicator) {
                        this.indicator.style.top = '-60px';
                    }
                    this.isRefreshing = false;
                }, 500);
            }
        } else {
            // Reset indicator
            if (this.indicator) {
                this.indicator.style.top = '-60px';
            }
        }

        this.startY = 0;
        this.currentY = 0;
    };

    destroy(): void {
        this.element.removeEventListener('touchstart', this.handleTouchStart);
        this.element.removeEventListener('touchmove', this.handleTouchMove);
        this.element.removeEventListener('touchend', this.handleTouchEnd);

        if (this.indicator && this.indicator.parentElement) {
            this.indicator.parentElement.removeChild(this.indicator);
        }
    }
}

/**
 * Touch Feedback Enhancement
 * Adds visual feedback for touch interactions
 */
export function enhanceTouchFeedback(element: HTMLElement): void {
    element.addEventListener('touchstart', function (this: HTMLElement) {
        this.style.opacity = '0.7';
        this.style.transform = 'scale(0.98)';
    });

    element.addEventListener('touchend', function (this: HTMLElement) {
        this.style.opacity = '1';
        this.style.transform = 'scale(1)';
    });

    element.addEventListener('touchcancel', function (this: HTMLElement) {
        this.style.opacity = '1';
        this.style.transform = 'scale(1)';
    });

    // Add transition for smooth feedback
    element.style.transition = 'opacity 0.2s, transform 0.2s';
}

/**
 * Prevent Double Tap Zoom
 * Prevents accidental zoom on double tap for specific elements
 */
export function preventDoubleTapZoom(element: HTMLElement): void {
    let lastTap = 0;

    element.addEventListener('touchend', (e) => {
        const currentTime = Date.now();
        const tapLength = currentTime - lastTap;

        if (tapLength < 300 && tapLength > 0) {
            e.preventDefault();
        }

        lastTap = currentTime;
    });
}

/**
 * Mobile-Optimized Scrolling
 * Enables smooth, momentum-based scrolling
 */
export function optimizeScrolling(element: HTMLElement): void {
    (element.style as any).webkitOverflowScrolling = 'touch';
    element.style.overflowY = 'auto';
}

/**
 * React Hook: useswipeGesture
 */
export function useSwipeGesture(
    onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void
) {
    const elementRef = React.useRef<HTMLElement>(null);

    React.useEffect(() => {
        if (!elementRef.current) return;

        const handler = new SwipeGestureHandler(elementRef.current, onSwipe);

        return () => {
            handler.destroy();
        };
    }, [onSwipe]);

    return elementRef;
}

/**
 * React Hook: usePullToRefresh
 */
export function usePullToRefresh(onRefresh: () => Promise<void>) {
    const elementRef = React.useRef<HTMLElement>(null);

    React.useEffect(() => {
        if (!elementRef.current) return;

        const ptr = new PullToRefresh(elementRef.current, onRefresh);

        return () => {
            ptr.destroy();
        };
    }, [onRefresh]);

    return elementRef;
}


const mobileOptimizations = {
    SwipeGestureHandler,
    PullToRefresh,
    enhanceTouchFeedback,
    preventDoubleTapZoom,
    optimizeScrolling,
    useSwipeGesture,
    usePullToRefresh,
};

export default mobileOptimizations;
