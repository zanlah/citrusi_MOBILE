import { useState, useRef, useEffect } from 'react';
import { Modal, Text, TextInput, View, Alert, Pressable, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, CameraView } from 'expo-camera';
import axios from 'axios';
import { useSession } from "@/context/AuthProvider";
import { KeyboardAvoidingView, Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

const login = () => {
    const { query } = useLocalSearchParams<{ query?: string }>();
    const cameraRef = useRef<any>(null);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraPermission, setCameraPermission] = useState(false);

    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [photo, setPhoto] = useState<any>(null);
    const { session, isLoading } = useSession();
    const { id } = session;

    useEffect(() => {
        let isActive = true;
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            if (isActive) {
                setCameraPermission(status === 'granted');
                setCameraOpen(status === 'granted');
            }
        })();
        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        const uploadImage = async () => {
            if (photo) {
                setLoading(true);
                const formData = new FormData();
                formData.append('userId', session.id);

                //@ts-ignore
                formData.append('image', {
                    uri: photo.uri,
                    type: "image/jpeg",
                    name: "photo.jpg"
                })

                try {
                    const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/users/confirm2fa`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    if (response.status === 200 || response.status === 201) {
                        console.log('Login success:', response.data);
                    } else {
                        Alert.alert('Napaka', `2Fa ni uspel. status: ${response.status}`);
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    Alert.alert('Error', 'An error occurred during login');
                } finally {
                    router.push('/');
                    setLoading(false);
                }
            }
        };

        uploadImage();
    }, [photo]);

    const handleTakePicture = async () => {
        if (cameraRef.current) {
            const photoData = await cameraRef.current.takePictureAsync();
            setPhoto(photoData);
        }
    };


    const requestCameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setCameraPermission(status === 'granted');

    };

    if (loading) {
        return <View className="flex-1 items-center justify-center dark:bg-black bg-white"><ActivityIndicator size="large" className="dark:text-white text-indigo-600" /></View>;
    }

    if (!session) {
        // On web, static rendering will stop here as the user is not authenticated
        // in the headless Node process that the pages are rendered in.
        return <Redirect href="/" />;
    }
    return (
        <View className='h-full w-full flex-1'>

            {cameraOpen && cameraPermission && (

                <CameraView
                    className='flex-1 w-full h-full'
                    facing={"front"}
                    ref={cameraRef}
                >

                    <View className="mx-auto my-auto w-[80%] h-[55%] border-8 border-white rounded-full bg-transparent " />
                    <Pressable className=" bottom-8 mx-auto w-[80%] bg-black  text-white rounded-2xl py-3" onPress={handleTakePicture}>
                        <Text className="text-white text-center py-2 font-bold">Potrdi sliko</Text>
                    </Pressable>
                </CameraView>

            )}
        </View>

    );
};

export default login;