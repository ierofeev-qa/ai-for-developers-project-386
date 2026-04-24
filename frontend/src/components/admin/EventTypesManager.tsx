import { useState } from 'react';
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
} from '@mantine/core';
import { IconEdit, IconTrash, IconPlus, IconClock, IconAlertCircle } from '@tabler/icons-react';
import { useEventTypes, useDeleteEventType } from '../../hooks/useApi';
import { EventTypeModal } from './EventTypeModal';
import type { EventType } from '../../types';

interface EventTypesManagerProps {
  onBack: () => void;
}

export const EventTypesManager = ({ onBack }: EventTypesManagerProps) => {
  const { data: eventTypes, isLoading, error } = useEventTypes();
  const deleteEventType = useDeleteEventType();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEventType, setEditingEventType] = useState<EventType | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} ч`;
    return `${hours} ч ${remainingMinutes} мин`;
  };

  const handleEdit = (eventType: EventType) => {
    setEditingEventType(eventType);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingEventType(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingEventType(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      await deleteEventType.mutateAsync(deletingId);
      setDeleteConfirmOpen(false);
      setDeletingId(null);
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
        Ошибка загрузки типов событий
      </Alert>
    );
  }

  const rows = eventTypes?.map((eventType) => (
    <Table.Tr key={eventType.id}>
      <Table.Td>
        <Text fw={500}>{eventType.name}</Text>
      </Table.Td>
      <Table.Td>
        <Text c="dimmed" size="sm" lineClamp={2}>
          {eventType.description || '-'}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge leftSection={<IconClock size={14} />}>
          {formatDuration(eventType.durationMinutes)}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon 
            variant="light" 
            color="blue" 
            onClick={() => handleEdit(eventType)}
          >
            <IconEdit size={18} />
          </ActionIcon>
          <ActionIcon 
            variant="light" 
            color="red" 
            onClick={() => handleDeleteClick(eventType.id)}
            loading={deleteEventType.isPending && deletingId === eventType.id}
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
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
          <Button 
            onClick={handleCreate} 
            leftSection={<IconPlus size={18} />}
          >
            Создать тип события
          </Button>
        </Group>

        {eventTypes && eventTypes.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Название</Table.Th>
                <Table.Th>Описание</Table.Th>
                <Table.Th>Длительность</Table.Th>
                <Table.Th>Действия</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        ) : (
          <Center py="xl">
            <Text c="dimmed">Нет созданных типов событий</Text>
          </Center>
        )}
      </Card>

      <EventTypeModal
        opened={modalOpen}
        onClose={handleCloseModal}
        eventType={editingEventType}
      />

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Подтверждение удаления"
        centered
      >
        <Stack>
          <Text>
            Вы уверены, что хотите удалить этот тип события? 
            Это действие нельзя отменить.
          </Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setDeleteConfirmOpen(false)}>
              Отмена
            </Button>
            <Button 
              color="red" 
              onClick={handleConfirmDelete}
              loading={deleteEventType.isPending}
            >
              Удалить
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
