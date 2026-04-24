import { test, expect } from '@playwright/test';

/**
 * Test Scenario 1: Guest Booking Flow
 * 
 * This test covers the main user journey for a guest booking a meeting:
 * 1. Open the home page with event types list
 * 2. Select an event type to book
 * 3. Choose an available date and time slot
 * 4. Fill in guest information (name, email, phone)
 * 5. Submit the booking form
 * 6. Verify the booking confirmation page
 */
test('guest can successfully book a meeting', async ({ page }) => {
  // Step 1: Navigate to the home page
  await page.goto('/');
  
  // Verify we're on the event types list page
  await expect(page.getByTestId('event-types-list-page')).toBeVisible();
  await expect(page.getByTestId('page-title')).toContainText('Запись на встречу');
  
  // Verify event types are loaded
  await expect(page.getByTestId('event-types-grid')).toBeVisible();
  const eventCards = page.getByTestId(/event-type-card-/);
  await expect(eventCards.first()).toBeVisible();
  
  // Get the first event type name for later verification
  const firstEventCard = page.getByTestId(/event-type-card-/).first();
  const eventName = await firstEventCard.getByTestId('event-type-name').textContent();
  
  // Step 2: Click on "Book" button for the first event type
  await firstEventCard.getByTestId('book-button').click();
  
  // Verify we're on the time slot selection page
  await expect(page.getByTestId('time-slot-selector')).toBeVisible();
  await expect(page.getByTestId('event-type-title')).toContainText(eventName!);
  
  // Step 3: Select a date (today or the next available working day)
  // The date picker should already have today selected by default
  await expect(page.getByTestId('date-picker')).toBeVisible();
  
  // Wait for available slots to load
  await expect(page.getByTestId('available-slots-title')).toBeVisible();
  
  // If no slots available for today, try tomorrow (skip weekends)
  let timeSlots = page.getByTestId(/time-slot-/);
  let slotsCount = await timeSlots.count();
  
  if (slotsCount === 0) {
    // Click on the next available date in the date picker
    // We'll try the next 3 days to find available slots
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('date-picker').click();
      // Click on tomorrow's date (we need to find a working day)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + i + 1);
      
      // Skip weekends
      const dayOfWeek = tomorrow.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      
      // Click on the date in the calendar (Mantine DatePicker uses button elements)
      const dayButton = page.locator(`button:has-text("${tomorrow.getDate()}")`).first();
      if (await dayButton.isVisible().catch(() => false)) {
        await dayButton.click();
        await page.waitForTimeout(500); // Wait for slots to reload
        
        timeSlots = page.getByTestId(/time-slot-/);
        slotsCount = await timeSlots.count();
        
        if (slotsCount > 0) break;
      }
    }
  }
  
  // Verify we have available time slots
  expect(slotsCount).toBeGreaterThan(0);
  
  // Select the first available time slot
  const firstTimeSlot = timeSlots.first();
  const selectedTime = await firstTimeSlot.textContent();
  await firstTimeSlot.click();
  
  // Step 4: Verify we're on the booking form page
  await expect(page.getByTestId('booking-form')).toBeVisible();
  await expect(page.getByTestId('form-title')).toContainText('Подтверждение записи');
  
  // Verify the booking summary shows correct event details
  await expect(page.getByTestId('summary-event-name')).toContainText(eventName!);
  
  // Fill in the guest information form
  await page.getByTestId('name-input').fill('Иван Тестовый');
  await page.getByTestId('email-input').fill('test@example.com');
  await page.getByTestId('phone-input').fill('+7 (999) 123-45-67');
  await page.getByTestId('notes-input').fill('Тестовая запись через Playwright');
  
  // Step 5: Submit the booking form
  await page.getByTestId('submit-booking-button').click();
  
  // Step 6: Verify the booking confirmation page
  await expect(page.getByTestId('booking-confirmation-page')).toBeVisible();
  await expect(page.getByTestId('confirmation-title')).toContainText('Запись подтверждена!');
  
  // Verify the confirmed event details
  await expect(page.getByTestId('confirmed-event-name')).toContainText(eventName!);
  
  // Verify guest information is displayed correctly
  await expect(page.getByTestId('guest-info')).toBeVisible();
  await expect(page.getByTestId('guest-name')).toContainText('Иван Тестовый');
  await expect(page.getByTestId('guest-email')).toContainText('test@example.com');
  await expect(page.getByTestId('guest-phone')).toContainText('+7 (999) 123-45-67');
  
  // Step 7: Navigate back to home page
  await page.getByTestId('go-home-button').click();
  
  // Verify we're back on the home page
  await expect(page.getByTestId('event-types-list-page')).toBeVisible();
});

test('guest can navigate back from booking flow', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');
  
  // Select first event type
  const firstEventCard = page.getByTestId(/event-type-card-/).first();
  await firstEventCard.getByTestId('book-button').click();
  
  // Verify we're on the time slot selector
  await expect(page.getByTestId('time-slot-selector')).toBeVisible();
  
  // Click back button
  await page.getByTestId('back-button').first().click();
  
  // Verify we're back on the home page
  await expect(page.getByTestId('event-types-list-page')).toBeVisible();
});
