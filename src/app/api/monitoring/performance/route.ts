/**
 * Performance Monitoring API Route
 * Receives and stores performance metrics from client
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Store performance metrics in database (optional)
        // For now, just log to console in development
        if (process.env.NODE_ENV === 'development') {
            // Log metrics in development if needed
        }

        // In production, you might want to:
        // 1. Store in database
        // 2. Send to analytics service (Google Analytics, Datadog, etc.)
        // 3. Alert if metrics exceed thresholds

        // Example: Store in database (uncomment if you have a PerformanceMetric model)
        /*
        await prisma.performanceMetric.create({
          data: {
            url: data.url,
            lcp: data.metrics.LCP,
            fid: data.metrics.FID,
            cls: data.metrics.CLS,
            fcp: data.metrics.FCP,
            ttfb: data.metrics.TTFB,
            pageLoadTime: data.metrics.pageLoadTime,
            userAgent: data.userAgent,
            timestamp: new Date(data.timestamp),
          },
        });
        */

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Performance monitoring error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process metrics' },
            { status: 500 }
        );
    }
}
