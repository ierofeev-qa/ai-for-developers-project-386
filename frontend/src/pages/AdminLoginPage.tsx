import { Container, Card, Title, Text, Button, Stack, Center } from '@mantine/core';
import { IconShield, IconArrowLeft } from '@tabler/icons-react';

interface AdminLoginPageProps {
  onLogin: () => void;
  onBack: () => void;
}

export const AdminLoginPage = ({ onLogin, onBack }: AdminLoginPageProps) => {
  return (
    <Container size="sm" py="xl">
      <Button 
        variant="light" 
        onClick={onBack} 
        leftSection={<IconArrowLeft size={18} />}
        mb="xl"
      >
        Назад
      </Button>

      <Card withBorder shadow="md" padding="xl">
        <Center>
          <Stack gap="lg" align="center" style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: '#228be6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconShield size={40} color="white" />
            </div>

            <div>
              <Title order={2} mb="xs">Вход в админ-панель</Title>
              <Text c="dimmed" size="sm">
                В проекте нет системы авторизации. Владелец календаря — 
                один заранее заданный профиль.
              </Text>
            </div>

            <Button 
              size="lg" 
              onClick={onLogin}
              leftSection={<IconShield size={20} />}
            >
              Войти как владелец
            </Button>
          </Stack>
        </Center>
      </Card>
    </Container>
  );
};
