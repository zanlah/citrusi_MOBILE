import { Tabs } from 'expo-router';
import React, { useEffect, useCallback } from 'react';
import { SiReact } from '@icons-pack/react-simple-icons';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Redirect, Stack } from 'expo-router';
import { router } from 'expo-router';
import { useSession } from '@/context/AuthProvider';
import { Alert } from 'react-native';
import EventSource from 'react-native-event-source';
import { useState } from 'react';
import axios from 'axios';

export default function TabLayout() {
  const { session, isLoading } = useSession();
  const colorScheme = useColorScheme();

  useEffect(() => {
    console.log('Session:', session);

    if (session) {
      const deviceToken = 'TOKEN';
      const userId = session.id;
      registerDevice(deviceToken, userId);
    }
  }, [session]);


  const registerDevice = async (deviceToken: any, userId: any) => {
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/notifications/register`, {
        deviceToken,
        userId,
      });
      console.log('Registration response:', response.data);

      openSSEConnection(response.data.token)
    } catch (error) {
      console.error('Error registering device:', error);
    }
  };

  const openSSEConnection = async (token: string) => {
    console.log("making connection")
    const url = `${process.env.EXPO_PUBLIC_API_URL}/notifications/events?token=${token}`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener('message', (event) => {
      const data = JSON.parse(event.data as any);
      console.log('Received SSE data:', data);

      if (data.type === 'login request') {
        Alert.alert(
          'Prošnja za prijavo',
          'Prosim potrdite, da ste to res vi. če niste kliknite na gumb za preklic.',
          [{ text: 'OK', onPress: () => router.navigate("2fa") },
          { text: 'Prekliči', onPress: () => console.log('2fa preklican'), style: 'cancel' }
          ],

        );
      }
    });

    return () => eventSource.close();
  };

  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/login" />;
  }
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Domov',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: 'Zemljevid',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"

        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
