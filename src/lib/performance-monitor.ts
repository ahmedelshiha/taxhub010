/**
 * Performance monitoring utilities
 * Track and report performance metrics
 */

interface PerformanceMetrics {
    route: string
    ttfb: number // Time to First Byte
    fcp: number // First Contentful Paint
    lcp: number // Largest Contentful Paint
    fid: number // First Input Delay
    cls: number // Cumulative Layout Shift  
    timestamp: string
}

class PerformanceMonitor {
    private metrics: PerformanceMetrics[] = []

    constructor() {
        if (typeof window !== 'undefined') {
            this.initializeObservers()
        }
    }

    private initializeObservers() {
        // Observe Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries()
                    const lastEntry = entries[entries.length - 1] as any
                    this.recordMetric('lcp', lastEntry.renderTime || lastEntry.loadTime)
                })
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

                // Observe First Input Delay
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries()
                    entries.forEach((entry: any) => {
                        this.recordMetric('fid', entry.processingStart - entry.startTime)
                    })
                })
                fidObserver.observe({ entryTypes: ['first-input'] })

                // Observe Cumulative Layout Shift
                const clsObserver = new PerformanceObserver((list) => {
                    let clsValue = 0
                    list.getEntries().forEach((entry: any) => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value
                        }
                    })
                    this.recordMetric('cls', clsValue)
                })
                clsObserver.observe({ entryTypes: ['layout-shift'] })
            } catch (e) {
                console.warn('Performance observers not fully supported')
            }
        }

        // Capture page load metrics
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = window.performance.timing
                const navigation = window.performance.getEntriesByType('navigation')[0] as any

                const metrics: Partial<PerformanceMetrics> = {
                    route: window.location.pathname,
                    ttfb: perfData.responseStart - perfData.requestStart,
                    fcp: navigation?.['first-contentful-paint'] || 0,
                    timestamp: new Date().toISOString(),
                }

                this.captureMetrics(metrics)
            }, 0)
        })
    }

    private recordMetric(type: string, value: number) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Performance] ${type}:`, value.toFixed(2), 'ms')
        }
    }

    private captureMetrics(metrics: Partial<PerformanceMetrics>) {
        // Send to analytics/monitoring service
        this.sendToMonitoring(metrics)
    }

    private async sendToMonitoring(metrics: Partial<PerformanceMetrics>) {
        try {
            await fetch('/api/performance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metrics),
            })
        } catch (error) {
            // Silently fail
            console.error('Performance tracking failed:', error)
        }
    }

    /**
     * Measure component render time
     */
    measureComponentRender(componentName: string, startMark: string, endMark: string) {
        if ('performance' in window) {
            try {
                performance.measure(`${componentName}-render`, startMark, endMark)
                const measure = performance.getEntriesByName(`${componentName}-render`)[0]

                if (process.env.NODE_ENV === 'development') {
                    console.log(`[Performance] ${componentName} render:`, measure.duration.toFixed(2), 'ms')
                }

                return measure.duration
            } catch (e) {
                console.warn('Performance measurement failed:', e)
            }
        }
        return 0
    }

    /**
     * Mark performance points
     */
    mark(markName: string) {
        if ('performance' in window) {
            performance.mark(markName)
        }
    }

    /**
     * Get Core Web Vitals summary
     */
    getCoreWebVitals(): { lcp?: number; fid?: number; cls?: number } {
        return {
            lcp: this.metrics[0]?.lcp,
            fid: this.metrics[0]?.fid,
            cls: this.metrics[0]?.cls,
        }
    }
}

// Export singleton
export const performanceMonitor = new PerformanceMonitor()

/**
 * React hook for component performance tracking
 */
export function usePerformanceTracking(componentName: string) {
    if (typeof window !== 'undefined') {
        const startMark = `${componentName}-start`
        const endMark = `${componentName}-end`

        performanceMonitor.mark(startMark)

        return {
            complete: () => {
                performanceMonitor.mark(endMark)
                performanceMonitor.measureComponentRender(componentName, startMark, endMark)
            },
        }
    }

    return { complete: () => { } }
}
