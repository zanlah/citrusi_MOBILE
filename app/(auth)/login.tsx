import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, StyleSheet, Text, TextInput, View, Alert, Pressable, ActivityIndicator } from 'react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';  // Corrected imports
import { Redirect, Stack } from 'expo-router';
import { router } from 'expo-router';
//import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { useSession } from "@/context/AuthProvider";


const login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [cameraOpen, setCameraOpen] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [loading, setLoading] = useState(false);
    const { session, isLoading } = useSession();
    // const device = useCameraDevice('front')
    const sessionContext = useSession();
    const [facing, setFacing] = useState("front");  // Corrected CameraType usage
    const { signIn } = useSession();
    const cameraRef = useRef<any>(null);  // Add type annotation to cameraRef
    // Update type annotation to Camera
    const login = async () => {
        console.log("click")

        if (!cameraRef.current) return;
        //() => sessionContext.signIn()
        const photo = await cameraRef.current?.takePictureAsync();
        console.log(photo);
        /* router.push('/');
         signIn();
         // Navigate after signing in. You may want to tweak this to ensure sign-in is
         // successful before navigating.
         if (session) {  // This check might need to be adjusted based on your auth logic
             router.push('/');
         }*/
    }

    const handleTakePicture = async () => {
        if (!cameraRef.current) return;
        setLoading(true);
        const photo = await cameraRef.current.takePictureAsync();

        // Here you would send the photo to an API
        const formData = new FormData();
        formData.append('photo', photo.uri, 'photo.jpg');

        try {
            const response = await fetch('API', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const responseData = await response.json();
            console.log('Upload successful', responseData);
            // Handle response data here
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setLoading(false);
            setCameraOpen(false);
        }
    };
    /*useEffect(() => {
        if (session) {  // This will check if session exists and then navigate
            router.replace('/');
        }
    }, [session]);*/
    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View >
                <Text>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    const toggleCameraFacing = () => {
        setFacing((current: any) => (current === "front" ? "back" : "front"));
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

                    placeholder="Email"
                    value={username}
                    onChangeText={setUsername}
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

                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                />
            </View>
            <Pressable className="px-4 py-2 mt-2 bg-black text-white dark:bg-black rounded-md" onPress={login}>
                <Text className="text-white text-lg">
                    Prijava
                </Text>
            </Pressable>

            <Button title={cameraOpen ? "Close Camera" : "Open Camera"} onPress={() => setCameraOpen(!cameraOpen)} />
            { /*@ts-ignore*/}

            {cameraOpen && (
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
                    {/* <Camera
                        style={StyleSheet.absoluteFill}
                        ref={cameraRef}
                        device={device!}
                        isActive={true}
        />*/}
                </Modal>
            )}
        </View>
    );
};


export default login;
