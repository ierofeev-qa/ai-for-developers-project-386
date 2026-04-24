import { Card, Text, Button, Badge, Group, Stack } from '@mantine/core';
import { IconClock, IconArrowRight } from '@tabler/icons-react';
import type { EventType } from '../../types';

interface EventTypeCardProps {
  eventType: EventType;
  onBook: (eventType: EventType) => void;
}

export const EventTypeCard = ({ eventType, onBook }: EventTypeCardProps) => {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} ч`;
    return `${hours} ч ${remainingMinutes} мин`;
  };

  return (
    <Card withBorder h="100%">
      <Stack gap="md" h="100%" justify="space-between">
        <div>
          <Group justify="space-between" mb="xs">
            <Text fw={700} size="lg">
              {eventType.name}
            </Text>
            <Badge color="blue" variant="light" leftSection={<IconClock size={14} />}>
              {formatDuration(eventType.durationMinutes)}
            </Badge>
          </Group>
          
          {eventType.description && (
            <Text c="dimmed" size="sm" lineClamp={3}>
              {eventType.description}
            </Text>
          )}
        </div>

        <Button 
          onClick={() => onBook(eventType)} 
          fullWidth 
          rightSection={<IconArrowRight size={18} />}
          size="md"
        >
          Записаться
        </Button>
      </Stack>
    </Card>
  );
};
