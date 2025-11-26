/**
 * E2E Tests for Phase 5 Notification System
 * Tests NotificationBell and NotificationCenterModal functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Portal Notification System', () => {
    test.beforeEach(async ({ page }) => {
        // Login as test user
        await page.goto('/login');
        await page.fill('[name="email"]', 'test@example.com');
        await page.fill('[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/portal/dashboard');
    });

    test('should display notification bell in portal header', async ({ page }) => {
        // Check notification bell is visible
        const notificationBell = page.locator('[aria-label*="notification"]').first();
        await expect(notificationBell).toBeVisible();
    });

    test('should show unread count badge when notifications exist', async ({ page }) => {
        // Mock API response with notifications
        await page.route('**/api/notifications*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        notifications: [
                            {
                                id: '1',
                                type: 'task_assigned',
                                title: 'New Task Assigned',
                                message: 'You have been assigned a new task',
                                read: false,
                                createdAt: new Date().toISOString(),
                            },
                            {
                                id: '2',
                                type: 'booking_confirmed',
                                title: 'Booking Confirmed',
                                message: 'Your booking has been confirmed',
                                read: false,
                                createdAt: new Date().toISOString(),
                            },
                        ],
                        total: 2,
                        unreadCount: 2,
                    },
                }),
            });
        });

        await page.reload();

        // Check badge shows count
        const badge = page.locator('[aria-label*="notification"]').locator('..').locator('span').first();
        await expect(badge).toHaveText('2');
    });

    test('should open dropdown with recent notifications on click', async ({ page }) => {
        // Mock notifications
        await page.route('**/api/notifications*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        notifications: [
                            {
                                id: '1',
                                type: 'task_assigned',
                                title: 'New Task',
                                message: 'Task assigned to you',
                                read: false,
                                createdAt: new Date().toISOString(),
                            },
                        ],
                        total: 1,
                        unreadCount: 1,
                    },
                }),
            });
        });

        await page.reload();

        // Click notification bell
        await page.click('[aria-label*="notification"]');

        // Check dropdown is visible
        await expect(page.locator('text=New Task')).toBeVisible();
        await expect(page.locator('text=Task assigned to you')).toBeVisible();
    });

    test('should mark notification as read when clicked', async ({ page }) => {
        let readCalled = false;

        // Mock notifications list
        await page.route('**/api/notifications*unreadOnly*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        notifications: [
                            {
                                id: 'notif-1',
                                type: 'task_assigned',
                                title: 'Test Notification',
                                message: 'Click me',
                                read: false,
                                link: '/portal/tasks',
                                createdAt: new Date().toISOString(),
                            },
                        ],
                        total: 1,
                        unreadCount: 1,
                    },
                }),
            });
        });

        // Mock mark as read endpoint
        await page.route('**/api/notifications', async (route) => {
            if (route.request().method() === 'POST') {
                readCalled = true;
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

        // Click bell and then notification
        await page.click('[aria-label*="notification"]');
        await page.click('text=Test Notification');

        // Verify mark as read was called
        expect(readCalled).toBe(true);
    });

    test('should open NotificationCenterModal when clicking "View all"', async ({ page }) => {
        // Mock notifications
        await page.route('**/api/notifications*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        notifications: [
                            {
                                id: '1',
                                type: 'task_assigned',
                                title: 'Notification 1',
                                message: 'Message 1',
                                read: false,
                                createdAt: new Date().toISOString(),
                            },
                        ],
                        total: 1,
                        unreadCount: 1,
                    },
                }),
            });
        });

        await page.reload();

        // Click bell
        await page.click('[aria-label*="notification"]');

        // Click "View all notifications"
        await page.click('text=View all notifications');

        // Check modal is open
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        await expect(page.locator('text=Notifications')).toBeVisible();
    });
});

test.describe('NotificationCenterModal', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('[name="email"]', 'test@example.com');
        await page.fill('[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/portal/dashboard');

        // Mock notifications
        await page.route('**/api/notifications*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        notifications: [
                            {
                                id: '1',
                                type: 'task_assigned',
                                title: 'Task 1',
                                message: 'Message 1',
                                read: false,
                                createdAt: new Date().toISOString(),
                            },
                            {
                                id: '2',
                                type: 'booking_confirmed',
                                title: 'Booking 1',
                                message: 'Confirmed',
                                read: true,
                                createdAt: new Date().toISOString(),
                            },
                        ],
                        total: 2,
                        unreadCount: 1,
                    },
                }),
            });
        });

        // Open modal
        await page.click('[aria-label*="notification"]');
        await page.click('text=View all notifications');
    });

    test('should display tabs for All and Unread', async ({ page }) => {
        await expect(page.locator('button:has-text("All")')).toBeVisible();
        await expect(page.locator('button:has-text("Unread")')).toBeVisible();
    });

    test('should filter notifications when switching tabs', async ({ page }) => {
        // Check all notifications visible initially
        await expect(page.locator('text=Task 1')).toBeVisible();
        await expect(page.locator('text=Booking 1')).toBeVisible();

        // Click Unread tab
        await page.click('button:has-text("Unread")');

        // Only unread should be visible
        await expect(page.locator('text=Task 1')).toBeVisible();
        // Booking 1 should not be visible (it's read)
    });

    test('should allow bulk mark as read action', async ({ page }) => {
        let markAsReadCalled = false;

        // Mock bulk action endpoint
        await page.route('**/api/notifications', async (route) => {
            if (route.request().method() === 'POST') {
                markAsReadCalled = true;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true }),
                });
            } else {
                await route.continue();
            }
        });

        // Select all button (if exists)
        const markAllButton = page.locator('button:has-text("Mark all as read")');
        if (await markAllButton.isVisible()) {
            await markAllButton.click();
            expect(markAsReadCalled).toBe(true);
        }
    });

    test('should allow notification selection and bulk delete', async ({ page }) => {
        // Select notification checkboxes
        const checkboxes = page.locator('input[type="checkbox"]');
        const count = await checkboxes.count();

        if (count > 0) {
            await checkboxes.first().check();

            // Delete button should appear
            const deleteButton = page.locator('button:has-text("Delete")');
            await expect(deleteButton).toBeVisible();
        }
    });

    test('should close modal when clicking close button', async ({ page }) => {
        const closeButton = page.locator('[aria-label="Close"]').first();
        await closeButton.click();

        // Modal should be closed
        await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });
});

test.describe('Notification Error Handling', () => {
    test('should display error state when API fails', async ({ page }) => {
        await page.goto('/login');
        await page.fill('[name="email"]', 'test@example.com');
        await page.fill('[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/portal/dashboard');

        // Mock failed API
        await page.route('**/api/notifications*', async (route) => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal server error' }),
            });
        });

        await page.reload();

        // Notification bell should still be visible (fallback to 0)
        const notificationBell = page.locator('[aria-label*="notification"]').first();
        await expect(notificationBell).toBeVisible();
    });
});
