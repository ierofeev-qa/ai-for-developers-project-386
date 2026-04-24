import { useState } from 'react';
import {
  Card,
  Text,
  Button,
  Stack,
  Group,
  Badge,
  Grid,
  Box,
  Center,
  Loader,
  Alert,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { IconClock, IconArrowLeft, IconAlertCircle, IconCalendar } from '@tabler/icons-react';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { useAvailableSlots } from '../../hooks/useApi';
import type { EventType, TimeSlot } from '../../types';

// Настройка локали dayjs
dayjs.locale('ru');

interface TimeSlotSelectorProps {
  eventType: EventType;
  onSelectSlot: (slot: TimeSlot) => void;
  onBack: () => void;
}

export const TimeSlotSelector = ({ eventType, onSelectSlot, onBack }: TimeSlotSelectorProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  const startDate = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : undefined;
  const { data, isLoading, error } = useAvailableSlots(eventType.id, startDate);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} ч`;
    return `${hours} ч ${remainingMinutes} мин`;
  };

  const formatTime = (dateString: string) => {
    return dayjs(dateString).format('HH:mm');
  };

  const getMinDate = () => new Date();
  const getMaxDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date;
  };

  // Группировка слотов по дате
  const slotsByDate = data?.slots.reduce((acc, slot) => {
    const date = dayjs(slot.startTime).format('YYYY-MM-DD');
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const currentDateSlots = selectedDate && slotsByDate 
    ? slotsByDate[dayjs(selectedDate).format('YYYY-MM-DD')] || []
    : [];

  const availableSlots = currentDateSlots.filter(slot => slot.isAvailable);

  return (
    <Card withBorder shadow="md" padding="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Button variant="light" onClick={onBack} leftSection={<IconArrowLeft size={18} />}>
            Назад
          </Button>
        </Group>

        <div>
          <Text fw={700} size="xl" mb="xs">
            {eventType.name}
          </Text>
          <Group gap="xs">
            <Badge color="blue" leftSection={<IconClock size={14} />}>
              {formatDuration(eventType.durationMinutes)}
            </Badge>
          </Group>
          {eventType.description && (
            <Text c="dimmed" size="sm" mt="xs">
              {eventType.description}
            </Text>
          )}
        </div>

        {error && (
          <Alert color="red" icon={<IconAlertCircle size={18} />}>
            Ошибка загрузки доступных слотов. Попробуйте позже.
          </Alert>
        )}

        <Grid>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Box>
              <Text fw={600} mb="sm">
                <IconCalendar size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Выберите дату
              </Text>
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                minDate={getMinDate()}
                maxDate={getMaxDate()}
                firstDayOfWeek={1}
                locale="ru"
                size="md"
              />
              <Text size="xs" c="dimmed" mt="xs">
                Доступно бронирование на ближайшие 14 дней
              </Text>
            </Box>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 7 }}>
            <Box>
              <Text fw={600} mb="sm">
                Доступное время на {selectedDate ? dayjs(selectedDate).format('D MMMM') : ''}
              </Text>
              
              {isLoading ? (
                <Center py="xl">
                  <Loader />
                </Center>
              ) : availableSlots.length > 0 ? (
                <Group gap="sm">
                  {availableSlots.map((slot, index) => (
                    <Button
                      key={index}
                      variant="light"
                      onClick={() => onSelectSlot(slot)}
                      size="sm"
                    >
                      {formatTime(slot.startTime)}
                    </Button>
                  ))}
                </Group>
              ) : (
                <Alert color="yellow" icon={<IconAlertCircle size={18} />}>
                  Нет доступных слотов на выбранную дату
                </Alert>
              )}
            </Box>
          </Grid.Col>
        </Grid>
      </Stack>
    </Card>
  );
};
