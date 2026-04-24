import { 
  Container, 
  Card, 
  Title, 
  Text, 
  Button, 
  Stack, 
  Group,
  Badge,
  Center,
  Loader,
  Alert,
  Divider,
  Box,
} from '@mantine/core';
import { 
  IconCheck, 
  IconCalendar, 
  IconClock, 
  IconUser, 
  IconMail, 
  IconPhone, 
  IconNotes,
  IconHome,
  IconAlertCircle,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useBooking } from '../hooks/useApi';

interface BookingConfirmationPageProps {
  bookingId: string | null;
  onGoHome: () => void;
}

export const BookingConfirmationPage = ({ bookingId, onGoHome }: BookingConfirmationPageProps) => {
  const { data: booking, isLoading, error } = useBooking(bookingId || '');

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

  if (isLoading) {
    return (
      <Container size="sm" py="xl">
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (error || !booking) {
    return (
      <Container size="sm" py="xl">
        <Alert color="red" icon={<IconAlertCircle size={18} />} mb="lg">
          Ошибка загрузки информации о бронировании
        </Alert>
        <Button onClick={onGoHome} leftSection={<IconHome size={18} />}>
          На главную
        </Button>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Card withBorder shadow="md" padding="xl">
        <Stack gap="lg">
          <Center>
            <Box
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: '#40c057',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconCheck size={40} color="white" />
            </Box>
          </Center>

          <div style={{ textAlign: 'center' }}>
            <Title order={2} mb="xs">Запись подтверждена!</Title>
            <Text c="dimmed">
              Мы отправили подтверждение на {booking.guest.email}
            </Text>
          </div>

          <Divider />

          <div>
            <Text fw={700} size="lg" mb="xs">
              {booking.eventType.name}
            </Text>
            <Group gap="xs" justify="center">
              <Badge size="lg" color="blue" leftSection={<IconCalendar size={16} />}>
                {formatDateTime(booking.startTime)}
              </Badge>
              <Badge size="lg" color="teal" leftSection={<IconClock size={16} />}>
                {formatDuration(booking.eventType.durationMinutes)}
              </Badge>
            </Group>
          </div>

          <Divider />

          <Stack gap="sm">
            <Text fw={600}>Данные для связи:</Text>
            
            <Group gap="xs">
              <IconUser size={18} />
              <Text>{booking.guest.name}</Text>
            </Group>
            
            <Group gap="xs">
              <IconMail size={18} />
              <Text>{booking.guest.email}</Text>
            </Group>
            
            {booking.guest.phone && (
              <Group gap="xs">
                <IconPhone size={18} />
                <Text>{booking.guest.phone}</Text>
              </Group>
            )}
            
            {booking.guest.notes && (
              <>
                <Group gap="xs" align="flex-start">
                  <IconNotes size={18} />
                  <Text>{booking.guest.notes}</Text>
                </Group>
              </>
            )}
          </Stack>

          <Button 
            onClick={onGoHome} 
            size="lg" 
            leftSection={<IconHome size={20} />}
            fullWidth
          >
            На главную
          </Button>
        </Stack>
      </Card>
    </Container>
  );
};
