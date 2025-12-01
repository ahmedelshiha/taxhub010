/**
 * Performance Monitoring Setup for Production
 * Tracks Core Web Vitals, custom metrics, and user experience
 */

// Core Web Vitals monitoring
export interface PerformanceMetrics {
  // Core Web Vitals
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  FCP: number; // First Contentful Paint
  TTFB: number; // Time to First Byte

  // Custom metrics
  pageLoadTime: number;
  apiResponseTime: number;
  renderTime: number;
}

export interface PerformanceReport {
  metrics: PerformanceMetrics;
  url: string;
  timestamp: number;
  userAgent: string;
  connection?: string;
}

/**
 * Performance Monitor class
 * Collects and reports performance metrics
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Partial<PerformanceMetrics> = {};
  private reportEndpoint = '/api/monitoring/performance';

  private constructor() {
    this.initializeMonitoring();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();

    // Monitor page load
    this.monitorPageLoad();

    // Monitor API calls
    this.monitorAPIPerformance();

    // Report on page unload
    this.setupReporting();
  }

  /**
   * Monitor Core Web Vitals using web-vitals library pattern
   */
  private monitorCoreWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Use PerformanceObserver for modern browsers
    try {
      // LCP - Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.metrics.LCP = lastEntry.renderTime || lastEntry.loadTime;
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // FID - First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.FID = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });

      // CLS - Cumulative Layout Shift
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
            this.metrics.CLS = clsScore;
          }
        });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // FCP - First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.FCP = entry.startTime;
          }
        });
      });
      fcpObserver.observe({ type: 'paint', buffered: true });

    } catch (error) {
      console.warn('PerformanceObserver not supported', error);
    }

    // TTFB - Time to First Byte
    if (performance.timing) {
      const ttfb = performance.timing.responseStart - performance.timing.requestStart;
      this.metrics.TTFB = ttfb;
    }
  }

  /**
   * Monitor page load performance
   */
  private monitorPageLoad(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as any;

        if (perfData) {
          this.metrics.pageLoadTime = perfData.loadEventEnd - perfData.fetchStart;
          this.metrics.renderTime = perfData.domInteractive - perfData.fetchStart;
        }
      }, 0);
    });
  }

  /**
   * Monitor API call performance
   */
  private monitorAPIPerformance(): void {
    if (typeof window === 'undefined') return;

    // Intercept fetch calls
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const startTime = performance.now();

      try {
        const response = await originalFetch.apply(window, args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Track API response time
        this.metrics.apiResponseTime = duration;

        // Report slow API calls (> 1s)
        if (duration > 1000) {
          this.reportSlowAPI(args[0] as string, duration);
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.reportAPIError(args[0] as string, duration, error);
        throw error;
      }
    };
  }

  /**
   * Setup automatic reporting
   */
  private setupReporting(): void {
    if (typeof window === 'undefined') return;

    // Report on visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.report();
      }
    });

    // Report on page unload
    window.addEventListener('beforeunload', () => {
      this.report(true); // Use sendBeacon for reliability
    });

    // Report every 30 seconds for long sessions
    setInterval(() => {
      this.report();
    }, 30000);
  }

  /**
   * Report metrics to backend
   */
  private report(useBeacon = false): void {
    if (Object.keys(this.metrics).length === 0) return;

    const report: PerformanceReport = {
      metrics: this.metrics as PerformanceMetrics,
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType,
    };

    if (useBeacon && navigator.sendBeacon) {
      // Use sendBeacon for reliability on page unload
      navigator.sendBeacon(
        this.reportEndpoint,
        JSON.stringify(report)
      );
    } else {
      // Use fetch for normal reporting
      fetch(this.reportEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      }).catch((error) => {
        console.error('Failed to report performance metrics:', error);
      });
    }
  }

  /**
   * Report slow API call
   */
  private reportSlowAPI(url: string, duration: number): void {
    fetch('/api/monitoring/slow-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        duration,
        timestamp: Date.now(),
      }),
    }).catch(() => {
      // Silently fail
    });
  }

  /**
   * Report API error
   */
  private reportAPIError(url: string, duration: number, error: any): void {
    fetch('/api/monitoring/api-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        duration,
        error: error.message || String(error),
        timestamp: Date.now(),
      }),
    }).catch(() => {
      // Silently fail
    });
  }

  /**
   * Manually track custom metric
   */
  trackCustomMetric(name: string, value: number): void {
    fetch('/api/monitoring/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        value,
        url: window.location.href,
        timestamp: Date.now(),
      }),
    }).catch(() => {
      // Silently fail
    });
  }

  /**
   * Get current metrics
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }
}

/**
 * Performance thresholds (based on Google's recommendations)
 */
export const PERFORMANCE_THRESHOLDS = {
  LCP: {
    good: 2500, // ms
    needsImprovement: 4000,
  },
  FID: {
    good: 100, // ms
    needsImprovement: 300,
  },
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  FCP: {
    good: 1800, // ms
    needsImprovement: 3000,
  },
  TTFB: {
    good: 800, // ms
    needsImprovement: 1800,
  },
};

/**
 * Evaluate performance score
 */
export function getPerformanceScore(metrics: Partial<PerformanceMetrics>): {
  score: number;
  rating: 'good' | 'needs-improvement' | 'poor';
} {
  let score = 100;
  const penalties: number[] = [];

  // LCP penalty
  if (metrics.LCP) {
    if (metrics.LCP > PERFORMANCE_THRESHOLDS.LCP.needsImprovement) {
      penalties.push(25);
    } else if (metrics.LCP > PERFORMANCE_THRESHOLDS.LCP.good) {
      penalties.push(10);
    }
  }

  // FID penalty
  if (metrics.FID) {
    if (metrics.FID > PERFORMANCE_THRESHOLDS.FID.needsImprovement) {
      penalties.push(25);
    } else if (metrics.FID > PERFORMANCE_THRESHOLDS.FID.good) {
      penalties.push(10);
    }
  }

  // CLS penalty
  if (metrics.CLS) {
    if (metrics.CLS > PERFORMANCE_THRESHOLDS.CLS.needsImprovement) {
      penalties.push(25);
    } else if (metrics.CLS > PERFORMANCE_THRESHOLDS.CLS.good) {
      penalties.push(10);
    }
  }

  score -= penalties.reduce((a, b) => a + b, 0);

  let rating: 'good' | 'needs-improvement' | 'poor';
  if (score >= 90) rating = 'good';
  else if (score >= 50) rating = 'needs-improvement';
  else rating = 'poor';

  return { score, rating };
}

// Initialize monitoring automatically
if (typeof window !== 'undefined') {
  PerformanceMonitor.getInstance();
}

export default PerformanceMonitor;
