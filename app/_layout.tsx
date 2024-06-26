import { Slot, Stack } from 'expo-router';
import { SessionProvider } from '@/context/AuthProvider';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';

import { DarkTheme, DefaultTheme, ThemeProvider, Theme } from '@react-navigation/native';

/*
export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "/login",
};*/
// Prevent the splash screen from auto-hiding before asset loading is complete.
//SplashScreen.preventAutoHideAsync();

export default function Root() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });



  // Set up the auth context and render our layout inside of it.
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SessionProvider>
        <Stack>
          <Stack.Screen name="(home)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
          <Stack.Screen name="route/start/[id]" options={{ headerShown: true, headerBackTitle: "nazaj", title: "pot", presentation: 'modal', }} />

          <Stack.Screen name="route/[id]" options={{ headerShown: true, headerBackTitle: "nazaj", title: "pot" }} />
          <Stack.Screen name="2fa" options={{ headerShown: true, headerBackTitle: "nazaj", title: "Potrdi identiteto", presentation: 'modal' }} />

          <Stack.Screen name="profileImage" options={{ headerShown: true, headerBackTitle: "nazaj", title: "spremeni sliko", presentation: 'modal' }} />
        </Stack>
        {/* <Slot /> */}
      </SessionProvider>
    </ThemeProvider >
  );
}
