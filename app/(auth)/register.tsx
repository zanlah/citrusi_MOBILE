import { useState, useRef } from 'react';
import { Modal, Text, TextInput, View, Alert, Pressable, ActivityIndicator, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, CameraView } from 'expo-camera';
import axios from 'axios';

const API = 'http://52.143.190.38/api';
const API_lh = 'http://52.143.190.38/api'; // fric test ip


const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const cameraRef = useRef<any>(null);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraPermission, setCameraPermission] = useState(false);
    const [loading, setLoading] = useState(false);
    const [recordingStep, setRecordingStep] = useState(0);
    const scaleValue = useRef(new Animated.Value(1)).current;
    const [videoUris, setVideoUris] = useState<string[]>([]);

    const router = useRouter();

    const handleRegisterPress = async () => {
        try {
            await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/users/register`, { email, username, password }).then((response) => {
                console.log(response);
                //signIn(email, password);
            }
            );
            await requestCameraPermission();
            setCameraOpen(true);
            setRecordingStep(0);
            Alert.alert('Snemanje obraza', 'Posnamite sprednji del obraza.');
            Alert.alert('Snemanje obraza', 'Za vsak poziv pritisnite gumb "Začni snemanje".');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };


    const handleRegister = async () => {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('username', username);
        formData.append('password', password);

        videoUris.forEach(async (uri, index) => {
            formData.append(`video${index}`, new File([uri], `video${index}.mp4`, { type: "video/mp4" }));
        });

        try {
            const axiosResponse = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/users/register`,
                formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (axiosResponse.status === 201 || axiosResponse.status === 200) {
                // Handle success scenario
                console.log('Register successful');
            } else {
                // Handle error scenario
                console.error('Register failed with status:', axiosResponse.status);
            }
        } catch (error: any) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Register failed with response:', error.response.data);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Register failed with request:', error.request);
            } else {
                // Something happened in setting up the request that triggered an error
                console.error('Register failed with message:', error.message);
            }
        }
    }

    const handleNextStep = () => {
        setRecordingStep((prevStep) => prevStep + 1);
        let alertMessage = '';
        switch (recordingStep) {
            case 0:
                alertMessage = 'Posnamite zgornji del obraza.';
                break;
            case 1:
                alertMessage = 'Posnamite levi del obraza.';
                break;
            case 2:
                alertMessage = 'Posnamite desni del obraza.';
                break;
            case 3:
                alertMessage = 'Posnamite spodnji del obraza.';
                break;
            case 4: {
                handleRegister();
            }
            default:
                try {
                    // Ko povezemo API z eksternim API uporabimo to
                    /*const response = await axios.post(`${API_lh}/users/sendVideo`, {
                        video: videoUris,
                    });*/

                    Alert.alert('Registracija uspešna!', 'Prijavite se za nadaljevanje.');

                    setCameraOpen(false);
                    router.push('/login');

                    return;
                } catch (error) {
                    console.error('Napaka pri pošiljanju videa na API:', error);
                    Alert.alert('Napaka', 'Nastala je napaka pri pošiljanju videa.');
                }
        }
        Alert.alert('Snemanje obraza', alertMessage);
    };

    const handleTakeVideo = async () => {
        if (!cameraRef.current) {
            console.error('CameraRef ni definiran');
            return;
        }

        try {
            const options = {
                maxDuration: 3,
                VideoQuality: ['480p']
            };

            const video = await cameraRef.current.recordAsync(options);

            setVideoUris((prevUris) => [...prevUris, video.uri]);

            setLoading(false);
            handleNextStep();

        } catch (error) {
            console.error('Napaka pri snemanju videa:', error);
            Alert.alert('Napaka', 'Nastala je napaka pri snemanju.');
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

    const animateButton = () => {
        Animated.sequence([
            Animated.timing(scaleValue, {
                toValue: 1.1,
                duration: 100,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
                toValue: 1,
                duration: 100,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ]).start(() => handleTakeVideo());
    };

    return (
        <View className='flex flex-1 justify-center items-center '>
            <Text> Registracija </Text>

            <Pressable onPress={() => router.push('/login')}>
                <Text className="text-blue-500"> Prijava? </Text>
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
                <Text className="block text-sm font-medium leading-6 text-gray-900"> Uporabnisko ime </Text>
                <TextInput
                    className="block w-full rounded-md px-2  py-1.5 text-gray-900 shadow-sm border-2 border-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:border-indigo-600 sm:text-sm sm:leading-6"

                    value={username}
                    onChangeText={setUsername}
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

            <Pressable className="px-4 py-2 mt-2 bg-black text-white dark:bg-black rounded-md" onPress={handleRegisterPress}>
                <Text className="text-white text-lg"> Registracija </Text>
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
                        facing={'front'}
                        ref={cameraRef}
                        mode={'video'}
                    >

                        <View className="mx-auto my-auto w-[80%] h-[80%] border-8 border-white rounded-full bg-transparent " />
                        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                            <Pressable className="absolute bottom-8 w-full px-4" onPress={animateButton}>
                                <Text className="text-white text-center bg-black py-2 rounded-md"> Začni snemanje </Text>
                            </Pressable>
                        </Animated.View>
                    </CameraView>
                </Modal>
            )}
        </View>
    );
};

export default RegisterPage;