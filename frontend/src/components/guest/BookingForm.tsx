import { useForm } from '@mantine/form';
import {
  TextInput,
  Textarea,
  Button,
  Stack,
  Group,
  Title,
  Text,
  Card,
  Badge,
  Alert,
} from '@mantine/core';
import { IconArrowLeft, IconUser, IconMail, IconPhone, IconNotes, IconClock, IconCalendar, IconAlertCircle } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useCreateBooking } from '../../hooks/useApi';
import type { EventType, TimeSlot, GuestInfo } from '../../types';

interface BookingFormProps {
  eventType: EventType;
  selectedSlot: TimeSlot;
  onBack: () => void;
  onSuccess: (bookingId: string) => void;
}

export const BookingForm = ({ eventType, selectedSlot, onBack, onSuccess }: BookingFormProps) => {
  const createBooking = useCreateBooking();

  const form = useForm<GuestInfo>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      notes: '',
    },
    validate: {
      name: (value) => (value.length < 1 ? 'Введите имя' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Введите корректный email'),
      phone: (value) => {
        if (!value) return null;
        return /^[\d\s\-\+\(\)]{10,}$/.test(value) ? null : 'Введите корректный номер телефона';
      },
    },
  });

  const handleSubmit = async (values: GuestInfo) => {
    try {
      const booking = await createBooking.mutateAsync({
        eventTypeId: eventType.id,
        startTime: selectedSlot.startTime,
        guest: values,
      });
      onSuccess(booking.id);
    } catch (error) {
      // Ошибка обрабатывается в форме
    }
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('D MMMM YYYY, HH:mm');
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} ч`;
    return `${hours} ч ${remainingMinutes} мин`;
  };

  // Обработка ошибки конфликта времени
  const isTimeConflict = createBooking.error && 
    (createBooking.error as any)?.response?.data?.code === 'TIME_CONFLICT';
  
  const isSlotNotAvailable = createBooking.error && 
    (createBooking.error as any)?.response?.data?.code === 'SLOT_NOT_AVAILABLE';

  return (
    <Card withBorder shadow="md" padding="xl">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <Group justify="space-between">
            <Button variant="light" onClick={onBack} leftSection={<IconArrowLeft size={18} />}>
              Назад
            </Button>
          </Group>

          <div>
            <Title order={3} mb="xs">Подтверждение записи</Title>
            <Text c="dimmed" size="sm">
              Введите ваши данные для завершения бронирования
            </Text>
          </div>

          <Card withBorder bg="gray.0">
            <Stack gap="xs">
              <Text fw={700}>{eventType.name}</Text>
              <Group gap="xs">
                <Badge color="blue" leftSection={<IconCalendar size={14} />}>
                  {formatDateTime(selectedSlot.startTime)}
                </Badge>
                <Badge color="teal" leftSection={<IconClock size={14} />}>
                  {formatDuration(eventType.durationMinutes)}
                </Badge>
              </Group>
            </Stack>
          </Card>

          {isTimeConflict && (
            <Alert color="red" icon={<IconAlertCircle size={18} />}>
              Выбранное время уже занято. Пожалуйста, выберите другой слот.
            </Alert>
          )}

          {isSlotNotAvailable && (
            <Alert color="orange" icon={<IconAlertCircle size={18} />}>
              Этот слот недоступен или вне окна бронирования. Пожалуйста, выберите другой.
            </Alert>
          )}

          {createBooking.error && !isTimeConflict && !isSlotNotAvailable && (
            <Alert color="red" icon={<IconAlertCircle size={18} />}>
              Произошла ошибка при создании бронирования. Попробуйте позже.
            </Alert>
          )}

          <TextInput
            label="Ваше имя"
            placeholder="Иван Иванов"
            required
            leftSection={<IconUser size={18} />}
            {...form.getInputProps('name')}
          />

          <TextInput
            label="Email"
            placeholder="ivan@example.com"
            required
            leftSection={<IconMail size={18} />}
            {...form.getInputProps('email')}
          />

          <TextInput
            label="Телефон"
            placeholder="+7 (999) 123-45-67"
            leftSection={<IconPhone size={18} />}
            {...form.getInputProps('phone')}
          />

          <Textarea
            label="Дополнительные заметки"
            placeholder="Любая дополнительная информация..."
            rows={3}
            leftSection={<IconNotes size={18} />}
            {...form.getInputProps('notes')}
          />

          <Button 
            type="submit" 
            size="lg" 
            loading={createBooking.isPending}
            fullWidth
          >
            Подтвердить запись
          </Button>
        </Stack>
      </form>
    </Card>
  );
};
