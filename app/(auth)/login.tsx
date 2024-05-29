import { useState, useRef } from 'react';
import { Modal, Text, TextInput, View, Alert, Pressable, ActivityIndicator } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import {  router } from 'expo-router';
import { useSession } from "@/context/AuthProvider";
import axios from 'axios';


const API = 'http://52.143.190.38/api';
const API_lh = 'http://164.8.210.28:3000/api'; // fric test ip


const login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const cameraRef = useRef<any>(null);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraPermission, setCameraPermission] = useState(false);
    const { signIn } = useSession();
    const [loading, setLoading] = useState(false);

    // Handles login for user, redirects to faceID
    const handleLogin = async () => {
        try {
            await axios.post(`${API_lh}/users/login`, { email, password });
            await requestCameraPermission();
            setCameraOpen(true);  // Open the camera after login
        } catch (error) {
            console.error('Login failed:', error);
        }
    }

    const handleTakePicture = async () => {
        if (!cameraRef.current) return;
        setLoading(true);
        try {
            const photo = await cameraRef.current.takePictureAsync();

            // Ko povezemo API z eksternim API uporabimo to
            /*const response = await axios.post(`${API_lh}/users/sendImage`, {
                image: photo.uri,
            });*/

            const response = { status: 201 };

            if (response.status === 201) {
                setLoading(false);
                setCameraOpen(false);
                signIn();
                router.push('/');
            } else {
                console.error('Image upload failed with status:', response.status);
                Alert.alert('Error uploading image', 'An error occurred while uploading the image.');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'An error occurred while uploading the image.');
        } finally {
            setLoading(false);
        }
    };

    const requestCameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setCameraPermission(status === 'granted');

    };

    if (loading) {
        return <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#0000ff" /></View>;
    }

    return (
        <View className='flex flex-1 justify-center items-center '>
            <Text >Prijava</Text>
            <Pressable onPress={() => router.push('/register')}>
                <Text className="text-blue-500">Registracija?</Text>
            </Pressable>
            <View className="w-full px-2">
                <Text className="block text-sm font-medium leading-6 text-gray-900">
                    Email
                </Text>
                <TextInput
                    className="block w-full rounded-md px-2  py-1.5 text-gray-900 shadow-sm border-2 border-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:border-indigo-600 sm:text-sm sm:leading-6"

                    value={email}
                    onChangeText={setEmail}
                    autoCorrect={false}
                    autoCapitalize="none"
                />
            </View>
            <View className="w-full px-2">
                <Text className="block text-sm font-medium leading-6 text-gray-900">
                    Geslo
                </Text>
                <TextInput
                    className="block w-full rounded-md px-2  py-1.5 text-gray-900 shadow-sm border-2 border-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:border-indigo-600 sm:text-sm sm:leading-6"

                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                />
            </View>
            <Pressable className="px-4 py-2 mt-2 bg-black text-white dark:bg-black rounded-md" onPress={handleLogin}>
                <Text className="text-white text-lg">
                    Prijava
                </Text>
            </Pressable>

            {cameraOpen && cameraPermission && (
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={cameraOpen}
                    onRequestClose={() => setCameraOpen(false)}
                >
                    <CameraView
                        className='flex-1 w-full h-full'
                        facing={"front"}
                        ref={cameraRef}
                    >

                        <View className="mx-auto my-auto w-[80%] h-[80%] border-8 border-white rounded-full bg-transparent " />
                        <Pressable className="absolute bottom-8 w-full px-4" onPress={handleTakePicture}>
                            <Text className="text-white text-center bg-black py-2 rounded-md">Potrdi sliko</Text>
                        </Pressable>
                    </CameraView>
                </Modal>
            )}
        </View>
    );
};

export default login;