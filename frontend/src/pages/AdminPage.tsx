import { useState } from 'react';
import { Container, Title, Tabs, Button, Group, Text } from '@mantine/core';
import { IconCalendarEvent, IconList, IconLogout, IconShield } from '@tabler/icons-react';
import { UpcomingMeetingsList } from '../components/admin/UpcomingMeetingsList';
import { EventTypesManager } from '../components/admin/EventTypesManager';

interface AdminPageProps {
  onLogout: () => void;
}

type AdminTab = 'meetings' | 'event-types';

export const AdminPage = ({ onLogout }: AdminPageProps) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('meetings');

  const handleGoToMeetings = () => setActiveTab('meetings');
  const handleGoToEventTypes = () => setActiveTab('event-types');

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1} mb="xs">
            <IconShield size={32} style={{ verticalAlign: 'middle', marginRight: 10 }} />
            Админ-панель
          </Title>
          <Text c="dimmed">Управление встречами и типами событий</Text>
        </div>
        <Button 
          variant="light" 
          color="gray" 
          onClick={onLogout}
          leftSection={<IconLogout size={18} />}
        >
          Выход
        </Button>
      </Group>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value as AdminTab)}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="meetings" leftSection={<IconCalendarEvent size={18} />}>
            Предстоящие встречи
          </Tabs.Tab>
          <Tabs.Tab value="event-types" leftSection={<IconList size={18} />}>
            Типы событий
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="meetings">
          <UpcomingMeetingsList onBack={handleGoToMeetings} />
        </Tabs.Panel>

        <Tabs.Panel value="event-types">
          <EventTypesManager onBack={handleGoToEventTypes} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};
