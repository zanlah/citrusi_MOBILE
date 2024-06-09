
import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { View, Text, FlatList, Alert, Pressable, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { router } from 'expo-router';

type RouteDetails = {
    id: string;
    name: string;
    duration: string;
    distance: string;
    cumulativeElevationGain: string;
    abstractDescription: string;
    difficulty: string | null;
    hasSafetyGear: boolean;
    hutClosed: boolean;
}


const RouteDetails = () => {
    const { id, inProximity } = useLocalSearchParams<{ id: string; inProximity?: string }>();
    let inProximityBool = inProximity === 'true';

    const [route, setRoute] = useState<RouteDetails | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchRoute = async () => {
            try {
                const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/routes/get-route?id=${id}`)
                setRoute(response.data);
                console.log(response.data)
                setLoading(false);
            } catch (err) {
                Alert.alert('Failed to load route');
            }
        };

        if (id) {
            fetchRoute();
        }
    }, [id]);

    const formatTime = (minutes: any) => {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
        }
        return `${minutes}m`;
    };

    const startRoute = async () => {
        router.navigate('/route/start/' + id);
    };

    if (loading) {
        return <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#0000ff" /></View>;
    }
    return (
        <>
            <View className="bg-gray-200  min-h-full pt-5 p-2">

                {route &&
                    <>
                        <Text className="text-2xl font-bold">{(route.name)}</Text>
                        <Text className="text-lg mt-1 text-gray-600">Opis: {(route.abstractDescription)}</Text>

                        <View className="mt-4">
                            <Text className="text-lg">Čas: <Text className="font-bold">{(formatTime(route.duration))}</Text></Text>
                            <Text className="text-lg">Dolžina: <Text className="font-bold">{(route.distance)}</Text></Text>
                            <Text className="text-lg">Višinska razlika: <Text className="font-bold">{(route.cumulativeElevationGain)}</Text></Text>
                            <Text className="text-lg">Težavnost: <Text className="font-bold">{(route.difficulty || "neznana")}</Text></Text>
                            <Text className="text-lg">Plezalna oprema: <Text className="font-bold">{(route.hasSafetyGear || "ni potrebna")}</Text></Text>
                            <Text className="text-lg">Koča zaprta: <Text className="font-bold">{(route.hutClosed || "Ne")}</Text></Text>
                        </View>
                    </>
                }
                {inProximityBool &&
                    <Pressable className="px-4 py-4 mt-5 justify-center items-center bg-green-600 text-white  rounded-md" onPress={startRoute} >
                        <Text className="text-white text-xl font-bold"> začni </Text>
                    </Pressable>
                }
            </View >
        </>
    );
}


export default RouteDetails;