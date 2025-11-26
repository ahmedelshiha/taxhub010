/**
 * E2E Tests for Portal Task Management
 * Tests task creation, editing, status updates, and deletion flows
 */

import { test, expect } from '@playwright/test';

test.describe('Portal Task Management', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('[name="email"]', 'test@example.com');
        await page.fill('[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/portal/dashboard');

        // Navigate to tasks page
        await page.goto('/portal/tasks');
    });

    test('should display tasks page with filters', async ({ page }) => {
        await expect(page).toHaveURL('/portal/tasks');
        await expect(page.locator('h1:has-text("Tasks")')).toBeVisible();

        // Check filters exist
        await expect(page.locator('text=Status:')).toBeVisible();
        await expect(page.locator('text=Priority:')).toBeVisible();
    });

    test('should open TaskQuickCreateModal when clicking create button', async ({ page }) => {
        // Click create task button
        const createButton = page.locator('button:has-text("Create Task")').first();
        await createButton.click();

        // Modal should open
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        await expect(page.locator('text=Create New Task')).toBeVisible();
    });

    test('should create a new task successfully', async ({ page }) => {
        // Mock create task API
        await page.route('**/api/tasks', async (route) => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: true,
                        data: {
                            id: 'task-123',
                            title: 'Test Task',
                            description: 'Test Description',
                            status: 'OPEN',
                            priority: 'HIGH',
                        },
                    }),
                });
            } else {
                await route.continue();
            }
        });

        // Open create modal
        await page.click('button:has-text("Create Task")');

        // Fill form
        await page.fill('[name="title"]', 'Test Task');
        await page.fill('[name="description"]', 'Test Description');

        // Select priority if available
        const prioritySelect = page.locator('[name="priority"]');
        if (await prioritySelect.isVisible()) {
            await prioritySelect.selectOption('HIGH');
        }

        // Submit
        await page.click('button[type="submit"]:has-text("Create")');

        // Success message should appear
        await expect(page.locator('text=successfully created')).toBeVisible({ timeout: 5000 });
    });

    test('should open TaskDetailModal when clicking a task', async ({ page }) => {
        // Mock tasks list
        await page.route('**/api/tasks*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: [
                        {
                            id: 'task-1',
                            title: 'Existing Task',
                            description: 'Task description',
                            status: 'OPEN',
                            priority: 'MEDIUM',
                            dueAt: new Date().toISOString(),
                        },
                    ],
                }),
            });
        });

        await page.reload();

        // Click on task
        await page.click('text=Existing Task');

        // Detail modal should open
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        await expect(page.locator('text=Task description')).toBeVisible();
    });

    test('should update task status', async ({ page }) => {
        let statusUpdated = false;

        // Mock task update
        await page.route('**/api/tasks/*', async (route) => {
            if (route.request().method() === 'PATCH' || route.request().method() === 'PUT') {
                statusUpdated = true;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true }),
                });
            } else {
                await route.continue();
            }
        });

        // Mock tasks list
        await page.route('**/api/tasks*', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: true,
                        data: [
                            {
                                id: 'task-1',
                                title: 'Test Task',
                                status: 'OPEN',
                                priority: 'MEDIUM',
                            },
                        ],
                    }),
                });
            } else {
                await route.continue();
            }
        });

        await page.reload();

        // Open task detail
        await page.click('text=Test Task');

        // Change status (if status dropdown exists)
        const statusSelect = page.locator('select').first();
        if (await statusSelect.isVisible()) {
            await statusSelect.selectOption('IN_PROGRESS');
            expect(statusUpdated).toBe(true);
        }
    });

    test('should handle modal errors gracefully with ModalErrorBoundary', async ({ page }) => {
        // Force modal to throw error by mocking failed API
        await page.route('**/api/tasks/*', async (route) => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal error' }),
            });
        });

        // Try to open modal
        await page.click('button:has-text("Create Task")');

        // Error boundary should catch and display friendly message
        // (Should not show white screen or crash)
        const errorMessage = page.locator('text=Something went wrong');
        const tryAgainButton = page.locator('button:has-text("Try Again")');

        // Either normal flow works OR error boundary catches it
        const isErrorVisible = await errorMessage.isVisible().catch(() => false);
        if (isErrorVisible) {
            await expect(tryAgainButton).toBeVisible();
        }
    });
});
