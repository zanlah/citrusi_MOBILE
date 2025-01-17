import { useState, useRef } from 'react';
import { Modal, Text, TextInput, View, Alert, Pressable, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, CameraView } from 'expo-camera';
import axios from 'axios';
import { useSession } from "@/context/AuthProvider";
import { KeyboardAvoidingView, Platform } from 'react-native';
import { Redirect } from 'expo-router';

const login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const cameraRef = useRef<any>(null);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraPermission, setCameraPermission] = useState(false);
    const { signIn } = useSession();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { session, isLoading } = useSession();

    // Klik gumba "Potrdi sliko", za avtentikacijo uporabnika
    const handleUserLogin = async () => {
        console.log(process.env.EXPO_PUBLIC_API_URL)
        if (!cameraRef.current) return;
        setLoading(true);
        try {
            const photo = await cameraRef.current.takePictureAsync();

            const formData = new FormData();
            console.log('photo', photo.uri)
            //@ts-ignore
            formData.append('image', {
                uri: photo.uri,
                type: "image/jpeg",
                name: "photo.jpg"
            })
            //formData.append("image", new File([photo.uri], "logo.jpg", { type: "image/jpg" }));
            //formData.append('image', photo);
            formData.append('email', email);
            formData.append('password', password);

            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/users/loginMobile`,
                formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            // Preverimo odgovorr
            if (response.status === 201 || response.status === 200) {
                setLoading(false);
                setCameraOpen(false);
                console.log('Login success:', response.data);

                signIn({
                    token: response.data.token,
                    user: response.data.user
                });

                router.push('/'); // Ga preusmerimo na zacetno stran
            } else {
                console.log('Login failed:', response.data);
                Alert.alert('Napaka', 'Prišlo je do napake v prijavi ' + response.status);
                Alert.alert('FaceID error', 'There was an error with your authentication.');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Napaka', 'Prišlo je do napake v prijavi');

        } finally {
            setLoading(false);
            setCameraOpen(false);
        }
    }

    // Klik gumba "Prijava", da odpre kamero za faceID
    const handleLoginButton = async () => {

        if (!email || !password) {
            Alert.alert('Napaka', 'Izpolnite vsa polja!');
            return;
        }

        try {
            await requestCameraPermission();
            setCameraOpen(true);
        } catch (error) {
            console.error('Camera permission denied:', error);
        }
    }

    const handleGuestButton = async () => {
        signIn({
            token: "1",
            user: {
                id: "1",
                email: "demo@demo.si"
            }
        });

        router.push('/');
    }

    const requestCameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setCameraPermission(status === 'granted');

    };

    if (loading || isLoading) {
        return <View className="flex-1 items-center justify-center dark:bg-black bg-white"><ActivityIndicator size="large" className="dark:text-white text-indigo-600" /></View>;
    }

    if (session) {
        // On web, static rendering will stop here as the user is not authenticated
        // in the headless Node process that the pages are rendered in.
        return <Redirect href="/" />;
    }
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}

        >
            <View className='flex flex-1 justify-center items-center bg-white dark:bg-black'>
                <Image
                    className="w-28 h-28"
                    src={`${process.env.EXPO_PUBLIC_API_URL}/uploads/image.png`}></Image>
                <View className="mt-2">
                    <Text className="text-2xl dark:text-white">Prijava</Text>
                </View>
                <Pressable onPress={() => router.push('/register')}>
                    <Text className="text-blue-500 ">Registracija?</Text>
                </Pressable>
                <View className="w-full px-3">
                    <Text className="block text-md font-medium leading-6 text-gray-900 dark:text-white"> Email </Text>
                    <TextInput
                        className="block w-full text-lg  px-2  py-1.5 text-gray-900 dark:text-white shadow-sm border-b-[1px] border-gray-300  focus:ring-2 focus:ring-inset focus:border-indigo-600 sm:text-sm sm:leading-6"
                        placeholder='Email'
                        placeholderTextColor="rgb(156 163 175)"
                        value={email}
                        onChangeText={setEmail}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                </View>
                <View className="w-full px-3 mt-3">
                    <Text className="block text-md font-medium leading-6 text-gray-900 dark:text-white"> Geslo </Text>
                    <TextInput
                        className="block w-full text-lg  px-2 py-1.5  text-gray-900 dark:text-white shadow-sm border-b-[1px] border-gray-300  focus:ring-2 focus:ring-inset focus:border-indigo-600 sm:text-sm sm:leading-6"
                        placeholder='Geslo'
                        placeholderTextColor="rgb(156 163 175)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                    />
                </View>
                <Pressable className="px-4 py-2 mt-5 bg-black text-white dark:bg-white dark:text-black rounded-md" onPress={handleLoginButton}>
                    <Text className="text-white dark:text-black text-lg"> Prijava </Text>
                </Pressable>

                <Pressable className="px-4 py-2 mt-5 bg-black text-white dark:bg-white dark:text-black rounded-md" onPress={handleGuestButton}>
                    <Text className="text-white dark:text-black text-lg"> Vstopi kot gost </Text>
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

                            <View className="mx-auto my-auto w-[80%] h-[55%] border-8 border-white rounded-full bg-transparent " />
                            <Pressable className=" bottom-8 mx-auto w-[80%] bg-black  text-white rounded-2xl py-3" onPress={handleUserLogin}>
                                <Text className="text-white text-center py-2 font-bold">Potrdi sliko</Text>
                            </Pressable>
                        </CameraView>
                    </Modal>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

export default login;