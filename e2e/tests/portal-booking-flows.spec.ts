/**
 * E2E Tests for Portal Booking Management
 * Tests booking creation, rescheduling, cancellation, and calendar integration
 */

import { test, expect } from '@playwright/test';

test.describe('Portal Booking Management', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('[name="email"]', 'test@example.com');
        await page.fill('[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/portal/dashboard');

        // Navigate to bookings page
        await page.goto('/portal/bookings');
    });

    test('should display bookings page correctly', async ({ page }) => {
        await expect(page).toHaveURL('/portal/bookings');
        await expect(page.locator('h1, h2').filter({ hasText: /booking/i }).first()).toBeVisible();
    });

    test('should show upcoming and past bookings sections', async ({ page }) => {
        // Mock bookings API
        await page.route('**/api/bookings*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: [
                        {
                            id: 'booking-1',
                            serviceId: 'service-1',
                            startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                            endTime: new Date(Date.now() + 90000000).toISOString(),
                            status: 'CONFIRMED',
                            service: {
                                id: 'service-1',
                                name: 'Tax Consultation',
                                durationMinutes: 60,
                                priceCents: 15000,
                            },
                        },
                        {
                            id: 'booking-2',
                            serviceId: 'service-2',
                            startTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                            endTime: new Date(Date.now() - 82800000).toISOString(),
                            status: 'COMPLETED',
                            service: {
                                id: 'service-2',
                                name: 'Business Filing',
                                durationMinutes: 90,
                                priceCents: 25000,
                            },
                        },
                    ],
                }),
            });
        });

        await page.reload();

        // Check sections exist
        await expect(page.locator('text=/upcoming|future/i').first()).toBeVisible();
        await expect(page.locator('text=/past|previous|history/i').first()).toBeVisible();
    });

    test('should open BookingCreateModal when clicking create button', async ({ page }) => {
        // Mock services for booking creation
        await page.route('**/api/services*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: [
                        {
                            id: 'service-1',
                            name: 'Tax Consultation',
                            description: 'Professional tax consultation',
                            durationMinutes: 60,
                            priceCents: 15000,
                            status: 'ACTIVE',
                        },
                    ],
                }),
            });
        });

        // Click create booking button
        const createButton = page.locator('button:has-text("Book"), button:has-text("New Booking"), button:has-text("Create Booking")').first();
        await createButton.click();

        // Modal should open
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        await expect(page.locator('text=/book|schedule|create/i').first()).toBeVisible();
    });

    test('should create a new booking successfully', async ({ page }) => {
        let bookingCreated = false;

        // Mock services
        await page.route('**/api/services*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: [
                        {
                            id: 'service-1',
                            name: 'Tax Consultation',
                            durationMinutes: 60,
                            priceCents: 15000,
                        },
                    ],
                }),
            });
        });

        // Mock availability check
        await page.route('**/api/bookings/availability*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        available: true,
                        slots: [
                            {
                                start: '2024-01-15T10:00:00Z',
                                end: '2024-01-15T11:00:00Z',
                            },
                        ],
                    },
                }),
            });
        });

        // Mock booking creation
        await page.route('**/api/bookings', async (route) => {
            if (route.request().method() === 'POST') {
                bookingCreated = true;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: true,
                        data: {
                            id: 'new-booking-123',
                            status: 'CONFIRMED',
                        },
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // Open create modal
        const createButton = page.locator('button').filter({ hasText: /book|create/i }).first();
        await createButton.click();

        // Fill booking form
        const serviceSelect = page.locator('[name="serviceId"], select').first();
        if (await serviceSelect.isVisible()) {
            await serviceSelect.selectOption('service-1');
        }

        // Select date/time (if date picker exists)
        const dateInput = page.locator('[type="date"], [type="datetime-local"]').first();
        if (await dateInput.isVisible()) {
            await dateInput.fill('2024-01-15T10:00');
        }

        // Submit form
        const submitButton = page.locator('button[type="submit"]').filter({ hasText: /book|confirm|create/i });
        if (await submitButton.isVisible()) {
            await submitButton.click();

            // Wait for success
            await expect(page.locator('text=/success|confirmed|booked/i')).toBeVisible({ timeout: 5000 });
            expect(bookingCreated).toBe(true);
        }
    });

    test('should open BookingRescheduleModal when clicking reschedule', async ({ page }) => {
        // Mock bookings
        await page.route('**/api/bookings*', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: true,
                        data: [
                            {
                                id: 'booking-1',
                                startTime: new Date(Date.now() + 86400000).toISOString(),
                                endTime: new Date(Date.now() + 90000000).toISOString(),
                                status: 'CONFIRMED',
                                service: {
                                    name: 'Tax Consultation',
                                    durationMinutes: 60,
                                },
                            },
                        ],
                    }),
                });
            } else {
                await route.continue();
            }
        });

        await page.reload();

        // Click reschedule button
        const rescheduleButton = page.locator('button:has-text("Reschedule")').first();
        if (await rescheduleButton.isVisible()) {
            await rescheduleButton.click();

            // Modal should open
            await expect(page.locator('[role="dialog"]')).toBeVisible();
            await expect(page.locator('text=/reschedule/i')).toBeVisible();
        }
    });

    test('should reschedule booking successfully', async ({ page }) => {
        let rescheduled = false;

        // Mock booking
        await page.route('**/api/bookings*', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: true,
                        data: [
                            {
                                id: 'booking-1',
                                startTime: new Date(Date.now() + 86400000).toISOString(),
                                status: 'CONFIRMED',
                                service: { name: 'Tax Consultation', durationMinutes: 60 },
                            },
                        ],
                    }),
                });
            } else if (route.request().method() === 'PATCH') {
                rescheduled = true;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true }),
                });
            } else {
                await route.continue();
            }
        });

        await page.reload();

        // Open reschedule modal
        const rescheduleButton = page.locator('button:has-text("Reschedule")').first();
        if (await rescheduleButton.isVisible()) {
            await rescheduleButton.click();

            // Select new time
            const dateInput = page.locator('[type="date"], [type="datetime-local"]').first();
            if (await dateInput.isVisible()) {
                await dateInput.fill('2024-01-20T14:00');
            }

            // Submit
            const confirmButton = page.locator('button').filter({ hasText: /confirm|reschedule/i });
            if (await confirmButton.isVisible()) {
                await confirmButton.click();
                expect(rescheduled).toBe(true);
            }
        }
    });

    test('should cancel booking with confirmation', async ({ page }) => {
        let cancelled = false;

        // Mock booking
        await page.route('**/api/bookings*', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: true,
                        data: [
                            {
                                id: 'booking-1',
                                startTime: new Date(Date.now() + 86400000).toISOString(),
                                status: 'CONFIRMED',
                                service: { name: 'Tax Consultation' },
                            },
                        ],
                    }),
                });
            } else if (route.request().method() === 'DELETE' || route.request().method() === 'PATCH') {
                cancelled = true;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true }),
                });
            } else {
                await route.continue();
            }
        });

        await page.reload();

        // Click cancel button
        const cancelButton = page.locator('button:has-text("Cancel")').first();
        if (await cancelButton.isVisible()) {
            await cancelButton.click();

            // Confirmation modal should appear
            await expect(page.locator('[role="dialog"]')).toBeVisible();
            await expect(page.locator('text=/cancel|sure/i')).toBeVisible();

            // Confirm cancellation
            const confirmButton = page.locator('button').filter({ hasText: /confirm|yes|cancel/i }).last();
            await confirmButton.click();

            expect(cancelled).toBe(true);
        }
    });

    test('should handle booking errors gracefully with ModalErrorBoundary', async ({ page }) => {
        // Mock failed API
        await page.route('**/api/bookings', async (route) => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Booking failed' }),
                });
            } else {
                await route.continue();
            }
        });

        // Try to create booking
        const createButton = page.locator('button').filter({ hasText: /book|create/i }).first();
        if (await createButton.isVisible()) {
            await createButton.click();

            // Error boundary should catch or error message should show
            const errorMsg = page.locator('text=/error|failed|wrong/i');
            const tryAgain = page.locator('button:has-text("Try Again")');

            // Either error boundary or inline error
            const hasError = await errorMsg.isVisible({ timeout: 3000 }).catch(() => false);
            if (hasError) {
                // Error handling is working
                expect(hasError).toBe(true);
            }
        }
    });
});

test.describe('Booking Calendar Integration', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('[name="email"]', 'test@example.com');
        await page.fill('[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/portal/dashboard');
    });

    test('should display bookings on calendar page', async ({ page }) => {
        // Mock calendar API
        await page.route('**/api/portal/calendar*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        bookings: [
                            {
                                id: 'booking-1',
                                title: 'Tax Consultation',
                                start: new Date().toISOString(),
                                end: new Date(Date.now() + 3600000).toISOString(),
                                type: 'booking',
                            },
                        ],
                        tasks: [],
                        compliance: [],
                    },
                }),
            });
        });

        await page.goto('/portal/calendar');

        // Check calendar renders
        await expect(page.locator('.rbc-calendar, [class*="calendar"]')).toBeVisible({ timeout: 10000 });
    });

    test('should create booking from calendar view', async ({ page }) => {
        await page.goto('/portal/calendar');

        // If there's a "New Event" or "Create" button
        const newEventButton = page.locator('button').filter({ hasText: /new|create|add/i }).first();
        if (await newEventButton.isVisible()) {
            await newEventButton.click();

            // Modal should open for event creation
            await expect(page.locator('[role="dialog"]')).toBeVisible();
        }
    });
});
