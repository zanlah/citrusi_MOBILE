import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import proj4 from 'proj4';
import axios from 'axios';
import { router } from 'expo-router';
import { useSession } from '../../context/AuthProvider';
type Position = {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
};

const fromProjection = 'EPSG:3857';
const toProjection = 'EPSG:4326';

export default function MapScreen() {
    const [position, setPosition] = useState<Position>({ latitude: 46.1512, longitude: 14.9955, latitudeDelta: 1.5, longitudeDelta: 1.5 });
    const [routes, setRoutes] = useState([]);
    const { session } = useSession();
    if (session && session.email) {
        console.log("Email:", session.email);
    } else {
        console.log("No session data available or email is missing.");
    }
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setPosition({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });
        })();
    }, []);

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/routes/list`);
                const convertedRoutes = response.data.data.map((route: any) => ({
                    ...route,
                    coordinates: route.coordinates.map((coord: any) => {
                        const [longitude, latitude] = proj4(fromProjection, toProjection, [coord[0], coord[1]]);
                        return { latitude, longitude };
                    })
                }));
                setRoutes(convertedRoutes);
            } catch (err) {
                console.error('Failed to fetch routes', err);
                Alert.alert('Error', 'Failed to fetch routes');
            }
        };
        fetchRoutes();
    }, []);

    const handlePolylinePress = (routeId: any) => {
        router.navigate('/route/' + routeId + '?inProximity=true');
    };


    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 46.1512,
                    longitude: 14.9955,
                    latitudeDelta: 1.5,
                    longitudeDelta: 1.5,
                }}
                minZoomLevel={7}
            >
                {routes.map((route: any, index) => (
                    <Polyline
                        key={index}
                        coordinates={route.coordinates}
                        strokeColor="#000"
                        strokeWidth={6}
                        onPress={() => handlePolylinePress(route.id_route)}
                    />
                ))}
                {position && (
                    <Marker
                        coordinate={position}
                        title="Current Location"
                        description="You are here"
                    />
                )}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
});
