import { test, expect } from '@playwright/test';

/**
 * Test Scenario 2: Admin Event Type Management
 * 
 * This test covers the admin workflow for managing event types:
 * 1. Navigate to admin login page
 * 2. Log in as admin
 * 3. Navigate to event types management tab
 * 4. Create a new event type
 * 5. Verify the new event type appears in the list
 * 6. Delete the created event type
 * 7. Verify the event type is removed from the list
 */
test('admin can create and delete event types', async ({ page }) => {
  // Step 1: Navigate to the home page
  await page.goto('/');
  
  // Verify we're on the home page
  await expect(page.getByTestId('event-types-list-page')).toBeVisible();
  
  // Step 2: Click on admin panel button
  await page.getByTestId('admin-panel-button').click();
  
  // Verify we're on the admin login page
  await expect(page.getByTestId('admin-login-page')).toBeVisible();
  await expect(page.getByTestId('admin-login-title')).toContainText('Вход в админ-панель');
  
  // Step 3: Log in as admin
  await page.getByTestId('login-button').click();
  
  // Verify we're on the admin page
  await expect(page.getByTestId('admin-page')).toBeVisible();
  await expect(page.getByTestId('admin-page-title')).toContainText('Админ-панель');
  
  // Step 4: Navigate to event types management tab
  await page.getByTestId('event-types-tab').click();
  
  // Verify the event types manager is visible
  await expect(page.getByTestId('event-types-manager')).toBeVisible();
  
  // Count existing event types before creating a new one
  const existingRows = page.locator('[data-testid^="event-type-row-"]');
  const existingCount = await existingRows.count();
  
  // Step 5: Click on create event type button
  await page.getByTestId('create-event-type-button').click();
  
  // Verify the modal is open
  await expect(page.getByTestId('event-type-modal')).toBeVisible();
  
  // Fill in the event type form
  const testEventName = `Тестовый тип события ${Date.now()}`;
  const testEventDescription = 'Описание тестового типа события, созданного через Playwright';
  const testDuration = '45';
  
  await page.getByTestId('event-type-name-input').fill(testEventName);
  await page.getByTestId('event-type-description-input').fill(testEventDescription);
  await page.getByTestId('event-type-duration-input').fill(testDuration);
  
  // Step 6: Submit the form to create the event type
  await page.getByTestId('submit-button').click();
  
  // Wait for the modal to close and the table to update
  await expect(page.getByTestId('event-type-modal')).not.toBeVisible();
  
  // Verify the new event type appears in the list
  await expect(page.getByTestId('event-types-table')).toBeVisible();
  const newRow = page.getByText(testEventName);
  await expect(newRow).toBeVisible();
  
  // Verify the event type count increased by 1
  const updatedRows = page.locator('[data-testid^="event-type-row-"]');
  await expect(updatedRows).toHaveCount(existingCount + 1);
  
  // Find the newly created event type row
  const eventTypeRow = page.locator('tr', { has: page.getByText(testEventName) });
  
  // Get the event type ID from the data-testid attribute
  const rowTestId = await eventTypeRow.getAttribute('data-testid');
  expect(rowTestId).toBeTruthy();
  const eventTypeId = rowTestId!.replace('event-type-row-', '');
  
  // Step 7: Delete the created event type
  await page.getByTestId(`delete-event-type-${eventTypeId}`).click();
  
  // Verify the delete confirmation modal is visible
  await expect(page.getByTestId('delete-confirm-modal')).toBeVisible();
  await expect(page.getByTestId('delete-confirm-message')).toContainText('Вы уверены, что хотите удалить этот тип события?');
  
  // Confirm the deletion
  await page.getByTestId('confirm-delete-button').click();
  
  // Wait for the modal to close
  await expect(page.getByTestId('delete-confirm-modal')).not.toBeVisible();
  
  // Step 8: Verify the event type is removed from the list
  await expect(page.getByText(testEventName)).not.toBeVisible();
  
  // Verify the count is back to original
  const finalRows = page.locator('[data-testid^="event-type-row-"]');
  await expect(finalRows).toHaveCount(existingCount);
});

test('admin can cancel event type deletion', async ({ page }) => {
  // Navigate to admin page
  await page.goto('/');
  await page.getByTestId('admin-panel-button').click();
  await page.getByTestId('login-button').click();
  
  // Navigate to event types tab
  await page.getByTestId('event-types-tab').click();
  
  // Get the first event type id
  const firstRow = page.locator('[data-testid^="event-type-row-"]').first();
  const rowTestId = await firstRow.getAttribute('data-testid');
  const eventTypeId = rowTestId!.replace('event-type-row-', '');
  
  // Click delete button
  await page.getByTestId(`delete-event-type-${eventTypeId}`).click();
  
  // Verify modal is visible
  await expect(page.getByTestId('delete-confirm-modal')).toBeVisible();
  
  // Click cancel
  await page.getByTestId('cancel-delete-button').click();
  
  // Verify modal is closed and event type still exists
  await expect(page.getByTestId('delete-confirm-modal')).not.toBeVisible();
  await expect(firstRow).toBeVisible();
});

test('admin can navigate between tabs', async ({ page }) => {
  // Navigate to admin page
  await page.goto('/');
  await page.getByTestId('admin-panel-button').click();
  await page.getByTestId('login-button').click();
  
  // Start on meetings tab (default)
  await expect(page.getByTestId('admin-page')).toBeVisible();
  
  // Navigate to event types tab
  await page.getByTestId('event-types-tab').click();
  await expect(page.getByTestId('event-types-manager')).toBeVisible();
  
  // Navigate back to meetings tab
  await page.getByTestId('meetings-tab').click();
  // Meetings list component doesn't have data-testid, so we check admin page is still visible
  await expect(page.getByTestId('admin-page')).toBeVisible();
});

test('admin can log out', async ({ page }) => {
  // Navigate to admin page
  await page.goto('/');
  await page.getByTestId('admin-panel-button').click();
  await page.getByTestId('login-button').click();
  
  // Verify admin page is visible
  await expect(page.getByTestId('admin-page')).toBeVisible();
  
  // Click logout
  await page.getByTestId('logout-button').click();
  
  // Verify we're back on home page
  await expect(page.getByTestId('event-types-list-page')).toBeVisible();
});
