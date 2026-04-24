/**
 * Тесты API Calendar Booking
 * 
 * Запуск:
 *   npm run test:api
 * 
 * Требует запущенный сервер на localhost:3001
 */

const BASE_URL = 'http://localhost:3001';

// Утилита для запросов
async function request(path: string, options?: RequestInit) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}

// Тесты
async function runTests() {
  console.log('🧪 Testing Calendar Booking API\n');
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  // Test 1: Health check
  console.log('Test 1: Health check');
  try {
    const { status, data } = await request('/health');
    if (status === 200 && data?.status === 'ok') {
      console.log('  ✅ PASSED\n');
      testsPassed++;
    } else {
      console.log('  ❌ FAILED\n');
      testsFailed++;
    }
  } catch (e) {
    console.log('  ❌ ERROR:', e, '\n');
    testsFailed++;
  }
  
  // Test 2: Get event types
  console.log('Test 2: Get event types');
  try {
    const { status, data } = await request('/event-types');
    if (status === 200 && Array.isArray(data) && data.length > 0) {
      console.log(`  ✅ PASSED - Found ${data.length} event types\n`);
      testsPassed++;
    } else {
      console.log('  ❌ FAILED\n');
      testsFailed++;
    }
  } catch (e) {
    console.log('  ❌ ERROR:', e, '\n');
    testsFailed++;
  }
  
  // Test 3: Get specific event type
  console.log('Test 3: Get specific event type');
  try {
    const { status, data } = await request('/event-types/1');
    if (status === 200 && data?.id === '1') {
      console.log(`  ✅ PASSED - Found: ${data.name}\n`);
      testsPassed++;
    } else {
      console.log('  ❌ FAILED\n');
      testsFailed++;
    }
  } catch (e) {
    console.log('  ❌ ERROR:', e, '\n');
    testsFailed++;
  }
  
  // Test 4: Get available slots
  console.log('Test 4: Get available slots');
  try {
    const { status, data } = await request('/event-types/1/available-slots');
    if (status === 200 && data?.slots && Array.isArray(data.slots)) {
      console.log(`  ✅ PASSED - Found ${data.slots.length} slots\n`);
      testsPassed++;
    } else {
      console.log('  ❌ FAILED\n');
      testsFailed++;
    }
  } catch (e) {
    console.log('  ❌ ERROR:', e, '\n');
    testsFailed++;
  }
  
  // Test 5: Create booking
  console.log('Test 5: Create booking');
  let bookingId: string;
  try {
    // Получаем доступный слот
    const slotsRes = await request('/event-types/1/available-slots');
    const availableSlot = slotsRes.data?.slots?.find((s: any) => s.isAvailable);
    
    if (!availableSlot) {
      console.log('  ❌ FAILED - No available slots\n');
      testsFailed++;
    } else {
      const { status, data } = await request('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          eventTypeId: '1',
          startTime: availableSlot.startTime,
          guest: {
            name: 'Test User',
            email: 'test@example.com',
            phone: '+1234567890',
          },
        }),
      });
      
      if (status === 201 && data?.id) {
        bookingId = data.id;
        console.log(`  ✅ PASSED - Created booking: ${data.id}\n`);
        testsPassed++;
      } else {
        console.log('  ❌ FAILED\n');
        testsFailed++;
      }
    }
  } catch (e) {
    console.log('  ❌ ERROR:', e, '\n');
    testsFailed++;
  }
  
  // Test 6: Try to book same slot (conflict)
  console.log('Test 6: Detect booking conflict');
  try {
    const slotsRes = await request('/event-types/1/available-slots');
    const availableSlot = slotsRes.data?.slots?.find((s: any) => s.isAvailable);
    
    if (availableSlot) {
      // Сначала создаем бронирование
      await request('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          eventTypeId: '1',
          startTime: availableSlot.startTime,
          guest: {
            name: 'First User',
            email: 'first@example.com',
          },
        }),
      });
      
      // Пытаемся забронировать тот же слот
      const { status, data } = await request('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          eventTypeId: '1',
          startTime: availableSlot.startTime,
          guest: {
            name: 'Second User',
            email: 'second@example.com',
          },
        }),
      });
      
      if (status === 409 && data?.code === 'TIME_CONFLICT') {
        console.log('  ✅ PASSED - Conflict detected correctly\n');
        testsPassed++;
      } else {
        console.log('  ❌ FAILED - Expected 409, got', status, '\n');
        testsFailed++;
      }
    } else {
      console.log('  ❌ SKIPPED - No available slots\n');
    }
  } catch (e) {
    console.log('  ❌ ERROR:', e, '\n');
    testsFailed++;
  }
  
  // Test 7: Get upcoming meetings (admin)
  console.log('Test 7: Get upcoming meetings (admin)');
  try {
    const { status, data } = await request('/admin/meetings/upcoming');
    if (status === 200 && data?.meetings && typeof data?.total === 'number') {
      console.log(`  ✅ PASSED - Found ${data.total} upcoming meetings\n`);
      testsPassed++;
    } else {
      console.log('  ❌ FAILED\n');
      testsFailed++;
    }
  } catch (e) {
    console.log('  ❌ ERROR:', e, '\n');
    testsFailed++;
  }
  
  // Test 8: Create event type (admin)
  console.log('Test 8: Create event type (admin)');
  try {
    const { status, data } = await request('/admin/event-types', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Meeting',
        description: 'Test description',
        durationMinutes: 45,
      }),
    });
    
    if (status === 201 && data?.id && data?.name === 'Test Meeting') {
      console.log(`  ✅ PASSED - Created event type: ${data.id}\n`);
      testsPassed++;
    } else {
      console.log('  ❌ FAILED\n');
      testsFailed++;
    }
  } catch (e) {
    console.log('  ❌ ERROR:', e, '\n');
    testsFailed++;
  }
  
  // Summary
  console.log('─'.repeat(50));
  console.log(`\n📊 Results: ${testsPassed} passed, ${testsFailed} failed`);
  
  if (testsFailed === 0) {
    console.log('🎉 All tests passed!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed\n');
    process.exit(1);
  }
}

runTests();
