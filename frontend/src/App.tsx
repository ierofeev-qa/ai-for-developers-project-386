import { useState } from 'react';
import {
  EventTypesListPage,
  BookingPage,
  BookingConfirmationPage,
  AdminPage,
  AdminLoginPage,
} from './pages';
import type { EventType } from './types';

// Типы страниц приложения
type Page = 
  | 'home' 
  | 'booking' 
  | 'confirmation' 
  | 'admin-login' 
  | 'admin';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [selectedEventTypeId, setSelectedEventTypeId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Навигация
  const goHome = () => {
    setCurrentPage('home');
    setSelectedEventType(null);
    setSelectedEventTypeId(null);
  };

  const goToBooking = (eventType: EventType) => {
    setSelectedEventType(eventType);
    setCurrentPage('booking');
  };

  const goToConfirmation = (id: string) => {
    setBookingId(id);
    setCurrentPage('confirmation');
  };

  const goToAdminLogin = () => {
    setCurrentPage('admin-login');
  };

  const goToAdmin = () => {
    setCurrentPage('admin');
  };

  // Рендер текущей страницы
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <EventTypesListPage
            onBookEvent={goToBooking}
            onGoToAdmin={goToAdminLogin}
          />
        );

      case 'booking':
        return (
          <BookingPage
            eventType={selectedEventType}
            eventTypeId={selectedEventTypeId}
            onBack={goHome}
            onSuccess={goToConfirmation}
          />
        );

      case 'confirmation':
        return (
          <BookingConfirmationPage
            bookingId={bookingId}
            onGoHome={goHome}
          />
        );

      case 'admin-login':
        return (
          <AdminLoginPage
            onLogin={goToAdmin}
            onBack={goHome}
          />
        );

      case 'admin':
        return (
          <AdminPage
            onLogout={goHome}
          />
        );

      default:
        return (
          <EventTypesListPage
            onBookEvent={goToBooking}
            onGoToAdmin={goToAdminLogin}
          />
        );
    }
  };

  return (
    <div className="app">
      {renderPage()}
    </div>
  );
}

export default App;
