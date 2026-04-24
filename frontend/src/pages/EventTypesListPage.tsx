import { Container, Title, SimpleGrid, Center, Loader, Text, Button, Group } from '@mantine/core';
import { IconShield, IconCalendar } from '@tabler/icons-react';
import { EventTypeCard } from '../components/guest/EventTypeCard';
import { useEventTypes } from '../hooks/useApi';
import type { EventType } from '../types';

interface EventTypesListPageProps {
  onBookEvent: (eventType: EventType) => void;
  onGoToAdmin: () => void;
}

export const EventTypesListPage = ({ onBookEvent, onGoToAdmin }: EventTypesListPageProps) => {
  const { data: eventTypes, isLoading, error } = useEventTypes();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Text c="red" size="lg">
          Ошибка загрузки данных. Пожалуйста, попробуйте позже.
        </Text>
      </Center>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1} mb="xs">
            <IconCalendar size={40} style={{ verticalAlign: 'middle', marginRight: 10 }} />
            Запись на встречу
          </Title>
          <Text c="dimmed" size="lg">
            Выберите тип встречи для бронирования
          </Text>
        </div>
        <Button 
          variant="light" 
          color="gray" 
          onClick={onGoToAdmin}
          leftSection={<IconShield size={18} />}
        >
          Админ-панель
        </Button>
      </Group>

      {eventTypes && eventTypes.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {eventTypes.map((eventType) => (
            <EventTypeCard 
              key={eventType.id} 
              eventType={eventType} 
              onBook={onBookEvent}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Center py="xl">
          <Text size="lg" c="dimmed">
            Нет доступных типов встреч
          </Text>
        </Center>
      )}
    </Container>
  );
};
