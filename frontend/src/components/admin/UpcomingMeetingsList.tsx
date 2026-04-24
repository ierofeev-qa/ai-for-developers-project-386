import {
  Card,
  Table,
  Button,
  Group,
  Text,
  Badge,
  ActionIcon,
  Center,
  Loader,
  Alert,
  Modal,
  Stack,
  Select,
} from '@mantine/core';
import { IconX, IconCalendar, IconClock, IconMail, IconUser, IconPhone, IconAlertCircle } from '@tabler/icons-react';
import { useState } from 'react';
import dayjs from 'dayjs';
import { useUpcomingMeetings, useCancelBooking } from '../../hooks/useApi';
import type { UpcomingMeeting } from '../../types';

interface UpcomingMeetingsListProps {
  onBack: () => void;
}

export const UpcomingMeetingsList = ({ onBack }: UpcomingMeetingsListProps) => {
  const { data, isLoading, error } = useUpcomingMeetings();
  const cancelBooking = useCancelBooking();
  
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingMeeting, setCancellingMeeting] = useState<UpcomingMeeting | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('D MMM YYYY, HH:mm');
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} ч`;
    return `${hours} ч ${remainingMinutes} мин`;
  };

  const handleCancelClick = (meeting: UpcomingMeeting) => {
    setCancellingMeeting(meeting);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (cancellingMeeting) {
      await cancelBooking.mutateAsync(cancellingMeeting.id);
      setCancelModalOpen(false);
      setCancellingMeeting(null);
    }
  };

  // Фильтрация встреч
  const filteredMeetings = data?.meetings.filter(meeting => {
    if (!statusFilter) return true;
    return meeting.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge color="green">Подтверждено</Badge>;
      case 'cancelled':
        return <Badge color="red">Отменено</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" icon={<IconAlertCircle size={18} />}>
        Ошибка загрузки встреч
      </Alert>
    );
  }

  const rows = filteredMeetings?.map((meeting) => (
    <Table.Tr key={meeting.id}>
      <Table.Td>
        <Group gap="xs">
          <IconCalendar size={16} />
          <Text>{formatDateTime(meeting.startTime)}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge leftSection={<IconClock size={14} />}>
          {formatDuration(meeting.eventType.durationMinutes)}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text fw={500}>{meeting.eventType.name}</Text>
      </Table.Td>
      <Table.Td>
        <Stack gap={4}>
          <Group gap="xs">
            <IconUser size={14} />
            <Text size="sm">{meeting.guest.name}</Text>
          </Group>
          <Group gap="xs">
            <IconMail size={14} />
            <Text size="sm" c="dimmed">{meeting.guest.email}</Text>
          </Group>
          {meeting.guest.phone && (
            <Group gap="xs">
              <IconPhone size={14} />
              <Text size="sm" c="dimmed">{meeting.guest.phone}</Text>
            </Group>
          )}
        </Stack>
      </Table.Td>
      <Table.Td>
        {getStatusBadge(meeting.status)}
      </Table.Td>
      <Table.Td>
        {meeting.status === 'confirmed' && (
          <ActionIcon 
            variant="light" 
            color="red" 
            onClick={() => handleCancelClick(meeting)}
            loading={cancelBooking.isPending && cancellingMeeting?.id === meeting.id}
          >
            <IconX size={18} />
          </ActionIcon>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Card withBorder>
        <Group justify="space-between" mb="lg">
          <Button variant="light" onClick={onBack}>
            Назад
          </Button>
          <Select
            placeholder="Фильтр по статусу"
            value={statusFilter}
            onChange={setStatusFilter}
            data={[
              { value: '', label: 'Все статусы' },
              { value: 'confirmed', label: 'Подтверждено' },
              { value: 'cancelled', label: 'Отменено' },
            ]}
            clearable
            style={{ width: 200 }}
          />
        </Group>

        <Text mb="md" size="sm" c="dimmed">
          Всего встреч: {filteredMeetings?.length || 0}
        </Text>

        {filteredMeetings && filteredMeetings.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Дата и время</Table.Th>
                <Table.Th>Длительность</Table.Th>
                <Table.Th>Тип встречи</Table.Th>
                <Table.Th>Гость</Table.Th>
                <Table.Th>Статус</Table.Th>
                <Table.Th>Действия</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        ) : (
          <Center py="xl">
            <Text c="dimmed">
              {statusFilter ? 'Нет встреч с выбранным статусом' : 'Нет предстоящих встреч'}
            </Text>
          </Center>
        )}
      </Card>

      <Modal
        opened={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Отмена встречи"
        centered
      >
        <Stack>
          <Text>
            Вы уверены, что хотите отменить встречу с {cancellingMeeting?.guest.name} 
            на {cancellingMeeting && formatDateTime(cancellingMeeting.startTime)}?
          </Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setCancelModalOpen(false)}>
              Нет, оставить
            </Button>
            <Button 
              color="red" 
              onClick={handleConfirmCancel}
              loading={cancelBooking.isPending}
            >
              Да, отменить
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
