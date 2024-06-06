
import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { View, Text, FlatList, Alert, Pressable } from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';
const HomeScreen = () => {
  const [routes, setRoutes] = useState([]);

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

      setRoutes(sortedRoutes);
      console.log(response.data.routes);
    } catch (error) {
      Alert.alert('Failed to load routes');
    }
  };

  const startRoute = async (routeId: number) => {
    router.navigate('/route/' + routeId);

  };

  const formatTime = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };
  return (
    <>


      <View className="bg-gray-200  min-h-full pt-5 p-2">
        <FlatList
          data={routes}
          keyExtractor={(item: any) => item.id_route}
          renderItem={({ item }) => (
            <View className="p-3 flex bg-white mb-3 rounded-2xl">
              <Text className="text-lg">{item.name}</Text>
              <View className="flex justify-between flex-row">

                <Text>{item.distanceFromCurrentLocation / 1000} km</Text>
                <Text>{formatTime(item.duration)} </Text>
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