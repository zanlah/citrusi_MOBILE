import { useState, useRef } from 'react';
import { Modal, Text, TextInput, View, Alert, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, CameraView } from 'expo-camera';
import axios from 'axios';
import { useSession } from "@/context/AuthProvider";


const login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const cameraRef = useRef<any>(null);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraPermission, setCameraPermission] = useState(false);
    const { signIn } = useSession();
    const [loading, setLoading] = useState(false);
    const router = useRouter();


    // Klik gumba "Potrdi sliko", za avtentikacijo uporabnika
    const handleUserLogin = async () => {
        if (!cameraRef.current) return;
        setLoading(true);
        try {
            const photo = await cameraRef.current.takePictureAsync();

            const formData = new FormData();
            formData.append("image", new File([photo.uri], "logo.png", { type: "image/png" }));
            formData.append('email', email);
            formData.append('password', password);

            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/users/loginMobile`,
                formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            // Preverimo odgovor
            if (response.status === 201) {
                setLoading(false);
                setCameraOpen(false);
                signIn(); // Prijavimo uporabnika
                router.push('/'); // Ga preusmerimo na zacetno stran
            } else {
                console.error('Login error with status:', response.status);
                Alert.alert('FaceID error', 'There was an error with your authentication.');
            }
        } catch (error) {
            console.error('Login failed: ', error);
        } finally {
            setLoading(false);
            setCameraOpen(false);
        }
    }

    // Klik gumba "Prijava", da odpre kamero za faceID
    const handleLoginButton = async () => {
        try {
            await requestCameraPermission();
            setCameraOpen(true);
        } catch (error) {
            console.error('Camera permission denied:', error);
        }
    }

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
                <Text className="block text-sm font-medium leading-6 text-gray-900"> Email </Text>
                <TextInput
                    className="block w-full rounded-md px-2  py-1.5 text-gray-900 shadow-sm border-2 border-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:border-indigo-600 sm:text-sm sm:leading-6"

                    value={email}
                    onChangeText={setEmail}
                    autoCorrect={false}
                    autoCapitalize="none"
                />
            </View>
            <View className="w-full px-2">
                <Text className="block text-sm font-medium leading-6 text-gray-900"> Geslo </Text>
                <TextInput
                    className="block w-full rounded-md px-2  py-1.5 text-gray-900 shadow-sm border-2 border-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:border-indigo-600 sm:text-sm sm:leading-6"

                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                />
            </View>
            <Pressable className="px-4 py-2 mt-2 bg-black text-white dark:bg-black rounded-md" onPress={handleLoginButton}>
                <Text className="text-white text-lg"> Prijava </Text>
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
                        <Pressable className="absolute bottom-8 w-full px-4" onPress={handleUserLogin}>
                            <Text className="text-white text-center bg-black py-2 rounded-md">Potrdi sliko</Text>
                        </Pressable>
                    </CameraView>
                </Modal>
            )}
        </View>
    );
};

export default login;