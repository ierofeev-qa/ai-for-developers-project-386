import { Container, Center, Loader, Alert, Button } from '@mantine/core';
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import { useState } from 'react';
import { TimeSlotSelector } from '../components/guest/TimeSlotSelector';
import { BookingForm } from '../components/guest/BookingForm';
import { useEventType } from '../hooks/useApi';
import type { EventType, TimeSlot } from '../types';

interface BookingPageProps {
  eventType: EventType | null;
  eventTypeId: string | null;
  onBack: () => void;
  onSuccess: (bookingId: string) => void;
}

export const BookingPage = ({ eventType, eventTypeId, onBack, onSuccess }: BookingPageProps) => {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  // Если передан только ID, загружаем данные
  const { data: loadedEventType, isLoading, error } = useEventType(eventTypeId || '');
  
  const currentEventType = eventType || loadedEventType;

  if (isLoading) {
    return (
      <Container size="sm" py="xl">
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (error || !currentEventType) {
    return (
      <Container size="sm" py="xl">
        <Alert color="red" icon={<IconAlertCircle size={18} />} mb="lg">
          Ошибка загрузки типа события
        </Alert>
        <Button onClick={onBack} leftSection={<IconArrowLeft size={18} />}>
          Вернуться к списку
        </Button>
      </Container>
    );
  }

  // Если слот не выбран - показываем выбор времени
  if (!selectedSlot) {
    return (
      <Container size="lg" py="xl">
        <TimeSlotSelector
          eventType={currentEventType}
          onSelectSlot={setSelectedSlot}
          onBack={onBack}
        />
      </Container>
    );
  }

  // Если слот выбран - показываем форму
  return (
    <Container size="sm" py="xl">
      <BookingForm
        eventType={currentEventType}
        selectedSlot={selectedSlot}
        onBack={() => setSelectedSlot(null)}
        onSuccess={onSuccess}
      />
    </Container>
  );
};
