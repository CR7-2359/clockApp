import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider as NavigationThemeProvider, DarkTheme } from '@react-navigation/native';
import { createTheme, ThemeProvider } from '@rneui/themed';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo } from 'react';
import 'react-native-reanimated';

import Colors from '@/constants/Colors';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const backgroundColor = '#000000';
  const navigationTheme = useMemo(
    () => ({
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        background: backgroundColor,
        card: backgroundColor,
        text: Colors.dark.text,
      },
    }),
    []
  );
  const theme = useMemo(
    () =>
      createTheme({
        mode: 'dark',
        darkColors: {
          primary: Colors.dark.tint,
          background: backgroundColor,
          white: Colors.dark.text,
          black: backgroundColor,
        },
      }),
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <NavigationThemeProvider value={navigationTheme}>
        <Stack screenOptions={{ contentStyle: { backgroundColor } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="timer" options={{ headerShown: false }} />
        </Stack>
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}
