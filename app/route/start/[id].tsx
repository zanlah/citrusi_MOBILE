
import React, { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { View, Text, FlatList, Alert, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import proj4 from 'proj4';

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
    // Add other route properties as needed
}

const fromProjection = 'EPSG:3857';
const toProjection = 'EPSG:4326';

const RouteDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [route, setRoute] = useState<RouteDetails | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [timer, setTimer] = useState(0);
    const mapRef = useRef(null);
    const [timerOn, setTimerOn] = useState(false);
    const [location, setLocation] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<any>(null);
    const [path, setPath] = useState([]);

    const convertCoordinates = (coords: number[]) => {
        const converted = proj4(fromProjection, toProjection, coords);
        return converted;
    };


    useEffect(() => {
        const fetchRoute = async () => {
            try {
                const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/routes/get-route?id=${id}`)
                setRoute(response.data);
                console.log(response.data)
                const convertedPath = response.data.coordinates.map((coord: any) => {
                    // Assuming 'coord' is [longitude, latitude] in EPSG:3857
                    const [longitude, latitude] = proj4('EPSG:3857', 'EPSG:4326', [coord[0], coord[1]]);
                    return { latitude, longitude };
                });

                setPath(convertedPath);
                setLoading(false);
            } catch (err) {
                Alert.alert('Failed to load route');
            }
        };

        if (id) {
            fetchRoute();
        }
    }, [id]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            Location.watchPositionAsync({ accuracy: Location.Accuracy.High, timeInterval: 3000 }, (loc) => {
                setLocation(loc.coords);
            });
        })();
    }, []);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
    };

    useEffect(() => {
        let interval: any = null;
        if (timerOn) {
            interval = setInterval(() => {
                setTimer(prevTime => prevTime + 1);
            }, 1000);
        } else if (!timerOn) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timerOn]);

    const toggleTimer = () => {

        setTimerOn(!timerOn);
    };

    const startRoute = async () => {
        if (timerOn) {
            Alert.alert(
                "Potrdi končanje",
                "Ste končali pot in želite shraniti rezultat?",
                [
                    {
                        text: "Prekliči",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel"
                    },
                    {
                        text: "Da, končaj pot",
                        onPress: () => {
                            handleEndRoute();
                        }
                    }
                ]
            );
        }
        moveToCurrentLocationWithHeading()
        toggleTimer();

    }

    const handleEndRoute = async () => {
        // Confirm that the timer is actually on
        if (timerOn) {
            try {
                const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/routes/end-route`, {
                    routeId: id, // Assuming `id` is the ID of the route
                    duration: timer // `timer` stores the total seconds elapsed
                });
                if (response.status === 200) {
                    Alert.alert("Success", "Route ended and time saved successfully.");
                } else {
                    Alert.alert("Error", "Failed to end route.");
                }
            } catch (error) {
                console.error("Failed to send data", error);
                Alert.alert("Error", "Failed to end route: " /*+ error.message*/);
            }
            setTimerOn(false);
            setTimer(0); // Reset timer to zero
        }
    }

    const getBearing = (lat1: any, lon1: any, lat2: any, lon2: any) => {
        const rad = Math.PI / 180;
        const lat1Rad = lat1 * rad;
        const lat2Rad = lat2 * rad;
        const deltaLonRad = (lon2 - lon1) * rad;

        const y = Math.sin(deltaLonRad) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLonRad);

        return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    };
    const moveToCurrentLocationWithHeading = () => {
        if (mapRef.current && location && path.length > 0) {
            const heading = getBearing(location.latitude, location.longitude, path[0].latitude, path[0].longitude);
            (mapRef.current as any).animateCamera({
                center: location,
                pitch: 60,
                tilt: 60,
                heading: heading,
                altitude: 4000,
                zoom: 5
            });
        }
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
                        <Text className="text-4xl  mt-5 font-bold text-center">{formatTime(timer)}</Text>
                    </>
                }
                <Pressable onPress={startRoute} className={`px-4 py-4 mt-5 items-center ${timerOn ? 'bg-red-500' : 'bg-green-500'} rounded-lg`}>
                    <Text className="text-white text-xl font-bold">{timerOn ? 'Stop' : 'Start'}</Text>
                </Pressable>

                {location && (
                    <MapView
                        ref={mapRef}
                        className="w-full mt-2 h-[300]"
                        initialRegion={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                    >
                        <Marker
                            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                            title="Your Location"
                        />
                        <Polyline
                            coordinates={path}
                            strokeColor="#000"
                            strokeColors={['#7F0000']}
                            strokeWidth={6}
                        />
                    </MapView>
                )}
            </View >
        </>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'gray',
        paddingTop: 20,
        padding: 8
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold'
    },
    subtitle: {
        fontSize: 18,
        marginTop: 8,
        color: 'gray'
    },
    map: {
        width: '100%',
        height: 300
    }
});

export default RouteDetails;