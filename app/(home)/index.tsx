
import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { View, Text, FlatList, Alert, Pressable, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';
const HomeScreen = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      fetchRoutes(location.coords.latitude, location.coords.longitude);
      Alert.alert('Location fetched', location.coords.latitude + ' ' + location.coords.longitude);
    })();
  }, []);

  const fetchRoutes = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get(`http://52.143.190.38/api/routes/in-proximity?latitude=${latitude}&longitude=${longitude}&radius=100000&details=false`);
      let sortedRoutes = response.data.routes.sort((a: any, b: any) => a.distanceFromCurrentLocation - b.distanceFromCurrentLocation);
      setLoading(false);
      setRoutes(sortedRoutes);
      console.log(response.data.routes);
    } catch (error) {
      Alert.alert('Failed to load routes');
    }
  };

  const startRoute = async (routeId: number) => {
    router.navigate('/route/' + routeId + '?inProximity=true');

  };

  const formatTime = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return <View className="flex-1 items-center justify-center dark:bg-black bg-white"><ActivityIndicator size="large" className="dark:text-white text-indigo-600" /></View>;
  }
  return (
    <>


      <View className="bg-gray-200 dark:bg-black  min-h-full pt-5 p-2">
        <FlatList
          data={routes}
          keyExtractor={(item: any) => item.id_route}
          renderItem={({ item }) => (
            <View className="p-3 flex bg-white text-black dark:text-white dark:bg-zinc-900 mb-3 rounded-2xl">
              <Text className="text-lg dark:text-white">{item.name}</Text>
              <View className="flex justify-between flex-row">

                <Text className="dark:text-white">{item.distanceFromCurrentLocation / 1000} km</Text>
                <Text className="dark:text-white">{formatTime(item.duration)} </Text>
              </View>
              {item.distanceFromCurrentLocation / 1000 < 10 &&
                <Pressable className="bg-green-600 py-2  rounded-lg mt-1" onPress={() => { startRoute(item.id_route) }} >
                  <Text className="text-white text-center  ">Začni pot!</Text>
                </Pressable>
              }
            </View>
          )}
        />
      </View>
    </>
  );
}


export default HomeScreen;