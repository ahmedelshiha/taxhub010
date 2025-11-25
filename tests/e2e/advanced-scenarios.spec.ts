/**
 * Additional E2E Test Scenarios
 * Extended test coverage for edge cases and complex workflows
 */

import { test, expect } from '@playwright/test'

test.describe('Advanced Task Workflows', () => {
    test('should handle task with attachments', async ({ page }) => {
        await page.goto('/portal/tasks')
        await page.click('[data-testid="create-task-button"]')

        // Fill task details
        await page.fill('[data-testid="task-title-input"]', 'Task with Attachments')
        await page.fill('[data-testid="task-description-input"]', 'Testing file uploads')

        // Upload file
        const fileInput = page.locator('input[type="file"]')
        await fileInput.setInputFiles({
            name: 'test-document.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('PDF content'),
        })

        // Submit
        await page.click('[data-testid="task-submit-button"]')
        await expect(page.locator('text=Task created successfully')).toBeVisible()
    })

    test('should edit existing task', async ({ page }) => {
        await page.goto('/portal/tasks')

        // Click on first task
        await page.click('[data-testid="task-item"]:first-child')

        // Click edit button
        await page.click('[data-testid="edit-task-button"]')

        // Modify title
        await page.fill('[data-testid="task-title-input"]', 'Updated Task Title')

        // Save
        await page.click('[data-testid="save-task-button"]')

        await expect(page.locator('text=Task updated successfully')).toBeVisible()
        await expect(page.locator('text=Updated Task Title')).toBeVisible()
    })

    test('should delete task with confirmation', async ({ page }) => {
        await page.goto('/portal/tasks')
        await page.click('[data-testid="task-item"]:first-child')

        // Click delete
        await page.click('[data-testid="delete-task-button"]')

        // Confirm deletion
        await page.click('[data-testid="confirm-delete-button"]')

        await expect(page.locator('text=Task deleted successfully')).toBeVisible()
    })
})

test.describe('Recurring Booking Scenarios', () => {
    test('should create recurring weekly booking', async ({ page }) => {
        await page.goto('/portal/bookings')
        await page.click('[data-testid="create-booking-button"]')

        // Fill booking details
        await page.fill('[data-testid="booking-title-input"]', 'Weekly Consultation')
        await page.selectOption('[data-testid="booking-service-select"]', 'consultation')
        await page.fill('[data-testid="booking-date-input"]', '2025-12-01')
        await page.fill('[data-testid="booking-time-input"]', '10:00')

        // Enable recurring
        await page.click('[data-testid="recurring-checkbox"]')
        await page.selectOption('[data-testid="recurrence-pattern"]', 'weekly')
        await page.fill('[data-testid="recurrence-count"]', '4')

        // Submit
        await page.click('[data-testid="booking-submit-button"]')

        await expect(page.locator('text=4 bookings created successfully')).toBeVisible()
    })
})

test.describe('Search and Filter', () => {
    test('should search tasks by keyword', async ({ page }) => {
        await page.goto('/portal/dashboard')

        // Open global search (Cmd+K)
        await page.keyboard.press('Meta+K')

        // Type search query
        await page.fill('[data-testid="global-search-input"]', 'urgent')

        // Wait for results
        await page.waitForSelector('[data-testid="search-result"]')

        // Check results contain keyword
        const results = await page.locator('[data-testid="search-result"]').allTextContents()
        expect(results.some(r => r.toLowerCase().includes('urgent'))).toBeTruthy()
    })

    test('should filter tasks by priority', async ({ page }) => {
        await page.goto('/portal/tasks')

        // Select high priority filter
        await page.click('[data-testid="priority-filter"]')
        await page.click('[data-testid="filter-high-priority"]')

        // Wait for filtered results
        await page.waitForSelector('[data-testid="task-item"]')

        // Verify all visible tasks are high priority
        const priorities = await page.locator('[data-testid="task-priority"]').allTextContents()
        expect(priorities.every(p => p === 'High')).toBeTruthy()
    })
})

test.describe('Multi-user Collaboration', () => {
    test('should show real-time notification updates', async ({ page, context }) => {
        // Open two pages simulating different users
        const page2 = await context.newPage()

        await page.goto('/portal/dashboard')
        await page2.goto('/portal/dashboard')

        // User 2 creates a task assigned to User 1
        await page2.click('[data-testid="create-task-button"]')
        await page2.fill('[data-testid="task-title-input"]', 'Collaboration Test')
        await page2.selectOption('[data-testid="assign-to-select"]', 'user1')
        await page2.click('[data-testid="task-submit-button"]')

        // Wait and check if User 1 receives notification
        await page.waitForTimeout(2000) // Wait for SWR refresh
        await page.reload()

        const notificationBadge = page.locator('[data-testid="notification-badge"]')
        await expect(notificationBadge).toBeVisible()
    })
})

test.describe('Performance and Load Testing', () => {
    test('should handle large data sets', async ({ page }) => {
        await page.goto('/portal/tasks')

        // Measure time to load
        const startTime = Date.now()
        await page.waitForSelector('[data-testid="task-item"]')
        const loadTime = Date.now() - startTime

        // Should load within 2 seconds
        expect(loadTime).toBeLessThan(2000)

        // Count loaded items
        const itemCount = await page.locator('[data-testid="task-item"]').count()
        expect(itemCount).toBeGreaterThan(0)
    })

    test('should lazy load images', async ({ page }) => {
        await page.goto('/portal/documents')

        // Scroll to bottom
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

        // Wait for lazy loaded images
        await page.waitForLoadState('networkidle')

        // Check that images were loaded
        const images = await page.locator('img[data-lazy="true"]').count()
        expect(images).toBeGreaterThan(0)
    })
})

test.describe('Offline Functionality', () => {
    test('should show offline indicator', async ({ page, context }) => {
        await page.goto('/portal/dashboard')

        // Simulate offline
        await context.setOffline(true)

        // Try to create task
        await page.click('[data-testid="create-task-button"]')
        await page.fill('[data-testid="task-title-input"]', 'Offline Test')
        await page.click('[data-testid="task-submit-button"]')

        // Should show offline error
        await expect(page.locator('text=Connection error')).toBeVisible()

        // Restore connection
        await context.setOffline(false)
    })
})
