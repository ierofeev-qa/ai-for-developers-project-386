import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ReactNode } from 'react';

// Импорт стилей Mantine
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

const theme = createTheme({
  primaryColor: 'blue',
  primaryShade: 6,
  fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  components: {
    Button: {
      defaultProps: {
        size: 'md',
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        padding: 'lg',
        radius: 'md',
      },
    },
  },
});

interface MantineThemeProviderProps {
  children: ReactNode;
}

export const MantineThemeProvider = ({ children }: MantineThemeProviderProps) => {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
};
