import { Container, Card, Title, Text, Button, Stack, Center } from '@mantine/core';
import { IconShield, IconArrowLeft } from '@tabler/icons-react';

interface AdminLoginPageProps {
  onLogin: () => void;
  onBack: () => void;
}

export const AdminLoginPage = ({ onLogin, onBack }: AdminLoginPageProps) => {
  return (
    <Container size="sm" py="xl" data-testid="admin-login-page">
      <Button 
        variant="light" 
        onClick={onBack} 
        leftSection={<IconArrowLeft size={18} />}
        mb="xl"
        data-testid="back-button"
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
              data-testid="admin-icon"
            >
              <IconShield size={40} color="white" />
            </div>

            <div>
              <Title order={2} mb="xs" data-testid="admin-login-title">Вход в админ-панель</Title>
              <Text c="dimmed" size="sm" data-testid="admin-login-description">
                В проекте нет системы авторизации. Владелец календаря — 
                один заранее заданный профиль.
              </Text>
            </div>

            <Button 
              size="lg" 
              onClick={onLogin}
              leftSection={<IconShield size={20} />}
              data-testid="login-button"
            >
              Войти как владелец
            </Button>
          </Stack>
        </Center>
      </Card>
    </Container>
  );
};
