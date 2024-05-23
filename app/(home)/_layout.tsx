
import { Slot, Stack } from 'expo-router';

import { useEffect } from 'react';
import 'react-native-reanimated';

import { SessionProvider } from '@/context/AuthProvider';

/*
export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "/login",
};*/
// Prevent the splash screen from auto-hiding before asset loading is complete.
//SplashScreen.preventAutoHideAsync();

export function RootLayout() {


    return (


        <SessionProvider>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            </Stack>

        </SessionProvider>


    );
}

