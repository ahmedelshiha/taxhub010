/**
 * E2E Test Suite for Key Workflows
 * Run with: npm run test:e2e
 */

import { test, expect } from '@playwright/test'

test.describe('Task Creation Flow', () => {
    test('should create a new task successfully', async ({ page }) => {
        // Navigate to dashboard
        await page.goto('/portal/dashboard')

        // Open task create modal
        await page.click('[data-testid="create-task-button"]')

        // Fill in task details
        await page.fill('[data-testid="task-title-input"]', 'E2E Test Task')
        await page.fill('[data-testid="task-description-input"]', 'This is a test task created via E2E')
        await page.selectOption('[data-testid="task-priority-select"]', 'high')
        await page.fill('[data-testid="task-due-date-input"]', '2025-12-31')

        // Submit form
        await page.click('[data-testid="task-submit-button"]')

        // Wait for success toast
        await expect(page.locator('text=Task created successfully')).toBeVisible()

        // Verify modal closed
        await expect(page.locator('[data-testid="task-create-modal"]')).not.toBeVisible()

        // Verify task appears in list
        await expect(page.locator('text=E2E Test Task')).toBeVisible()
    })

    test('should show validation errors for empty required fields', async ({ page }) => {
        await page.goto('/portal/dashboard')
        await page.click('[data-testid="create-task-button"]')

        // Try to submit without filling required fields
        await page.click('[data-testid="task-submit-button"]')

        // Check for validation errors
        await expect(page.locator('text=Title is required')).toBeVisible()
    })
})

test.describe('Booking Creation Flow', () => {
    test('should create a new booking successfully', async ({ page }) => {
        await page.goto('/portal/bookings')

        // Open booking create modal
        await page.click('[data-testid="create-booking-button"]')

        // Fill in booking details
        await page.fill('[data-testid="booking-title-input"]', 'E2E Test Booking')
        await page.selectOption('[data-testid="booking-service-select"]', 'tax-consultation')
        await page.fill('[data-testid="booking-date-input"]', '2025-12-15')
        await page.fill('[data-testid="booking-time-input"]', '14:00')

        // Submit
        await page.click('[data-testid="booking-submit-button"]')

        // Wait for success
        await expect(page.locator('text=Booking created successfully')).toBeVisible()
        await expect(page.locator('text=E2E Test Booking')).toBeVisible()
    })

    test('should detect time conflicts', async ({ page }) => {
        await page.goto('/portal/bookings')
        await page.click('[data-testid="create-booking-button"]')

        // Try to book a conflicting time
        await page.fill('[data-testid="booking-date-input"]', '2025-12-01')
        await page.fill('[data-testid="booking-time-input"]', '10:00')

        // Check for conflict warning
        await expect(page.locator('text=Time slot unavailable')).toBeVisible()
    })
})

test.describe('Approval Workflow', () => {
    test('should approve a request successfully', async ({ page }) => {
        await page.goto('/portal/approvals')

        // Click on first approval item
        await page.click('[data-testid="approval-item"]:first-child')

        // Open approval modal
        await expect(page.locator('[data-testid="approval-action-modal"]')).toBeVisible()

        // Click approve button
        await page.click('[data-testid="approve-button"]')

        // Confirm approval
        await page.click('[data-testid="confirm-approve-button"]')

        // Wait for success
        await expect(page.locator('text=Approval processed successfully')).toBeVisible()
    })

    test('should reject with comment', async ({ page }) => {
        await page.goto('/portal/approvals')
        await page.click('[data-testid="approval-item"]:first-child')

        // Click reject
        await page.click('[data-testid="reject-button"]')

        // Fill comment (required for rejection)
        await page.fill('[data-testid="rejection-comment-input"]', 'Not approved due to missing documentation')

        // Confirm rejection
        await page.click('[data-testid="confirm-reject-button"]')

        await expect(page.locator('text=Approval processed successfully')).toBeVisible()
    })
})

test.describe('Notification System', () => {
    test('should display unread notifications', async ({ page }) => {
        await page.goto('/portal/dashboard')

        // Check notification bell
        const notificationBell = page.locator('[data-testid="notification-bell"]')
        await expect(notificationBell).toBeVisible()

        // Check for unread badge
        const badge = page.locator('[data-testid="notification-badge"]')
        if (await badge.isVisible()) {
            await expect(badge).toHaveText(/\d+/)
        }
    })

    test('should mark notification as read', async ({ page }) => {
        await page.goto('/portal/dashboard')

        // Open notifications
        await page.click('[data-testid="notification-bell"]')

        // Click on first notification
        await page.click('[data-testid="notification-item"]:first-child [data-testid="mark-read-button"]')

        // Notification should be marked as read
        await expect(page.locator('text=Marked as read')).toBeVisible()
    })
})

test.describe('Message System', () => {
    test('should send a new message', async ({ page }) => {
        await page.goto('/portal/messages')

        // Open compose modal
        await page.click('[data-testid="compose-message-button"]')

        // Fill message details
        await page.selectOption('[ data-testid="message-recipient-select"]', 'support')
        await page.fill('[data-testid="message-subject-input"]', 'Test Message')
        await page.fill('[data-testid="message-body-input"]', 'This is a test message from E2E tests')

        // Send
        await page.click('[data-testid="send-message-button"]')

        await expect(page.locator('text=Message sent successfully')).toBeVisible()
    })
})
