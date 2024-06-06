import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

type Position = {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
};
export default function MapScreen() {
    const [position, setPosition] = useState<Position>({ latitude: 46.1512, longitude: 14.9955, latitudeDelta: 1.5, longitudeDelta: 1.5 });

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
