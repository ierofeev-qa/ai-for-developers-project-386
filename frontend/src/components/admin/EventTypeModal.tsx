import { useForm } from '@mantine/form';
import {
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Button,
  Stack,
  Group,
  Alert,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useCreateEventType, useUpdateEventType } from '../../hooks/useApi';
import type { EventType, CreateEventTypeRequest } from '../../types';

interface EventTypeModalProps {
  opened: boolean;
  onClose: () => void;
  eventType: EventType | null; // null = создание, иначе редактирование
}

export const EventTypeModal = ({ opened, onClose, eventType }: EventTypeModalProps) => {
  const isEditing = !!eventType;
  const createEventType = useCreateEventType();
  const updateEventType = useUpdateEventType();

  const form = useForm<CreateEventTypeRequest>({
    initialValues: {
      name: '',
      description: '',
      durationMinutes: 30,
    },
    validate: {
      name: (value) => (value.length < 1 ? 'Введите название' : value.length > 100 ? 'Название слишком длинное' : null),
      description: (value) => (value && value.length > 500 ? 'Описание слишком длинное' : null),
      durationMinutes: (value) => {
        if (!value || value < 1) return 'Минимум 1 минута';
        if (value > 480) return 'Максимум 480 минут (8 часов)';
        return null;
      },
    },
  });

  // Заполняем форму при редактировании
  useEffect(() => {
    if (eventType) {
      form.setValues({
        name: eventType.name,
        description: eventType.description || '',
        durationMinutes: eventType.durationMinutes,
      });
    } else {
      form.reset();
    }
  }, [eventType, opened]);

  const handleSubmit = async (values: CreateEventTypeRequest) => {
    try {
      if (isEditing && eventType) {
        await updateEventType.mutateAsync({
          id: eventType.id,
          data: {
            name: values.name,
            description: values.description,
            durationMinutes: values.durationMinutes,
          },
        });
      } else {
        await createEventType.mutateAsync(values);
      }
      onClose();
    } catch (error) {
      // Ошибка обрабатывается через состояние мутации
    }
  };

  const isPending = createEventType.isPending || updateEventType.isPending;
  const error = createEventType.error || updateEventType.error;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? 'Редактировать тип события' : 'Создать тип события'}
      size="md"
      data-testid="event-type-modal"
    >
      <form onSubmit={form.onSubmit(handleSubmit)} data-testid="event-type-form">
        <Stack gap="md">
          <TextInput
            label="Название"
            placeholder="Например: Консультация"
            required
            data-testid="event-type-name-input"
            {...form.getInputProps('name')}
          />

          <Textarea
            label="Описание"
            placeholder="Опишите, что включает в себя этот тип встречи..."
            rows={3}
            data-testid="event-type-description-input"
            {...form.getInputProps('description')}
          />

          <NumberInput
            label="Длительность (минуты)"
            placeholder="30"
            required
            min={1}
            max={480}
            data-testid="event-type-duration-input"
            {...form.getInputProps('durationMinutes')}
          />

          {error && (
            <Alert color="red" icon={<IconAlertCircle size={18} />} data-testid="form-error">
              Ошибка сохранения. Попробуйте позже.
            </Alert>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose} data-testid="cancel-button">
              Отмена
            </Button>
            <Button type="submit" loading={isPending} data-testid="submit-button">
              {isEditing ? 'Сохранить' : 'Создать'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
