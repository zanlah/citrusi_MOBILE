import { useState, useRef, useEffect } from 'react';
import { Modal, Text, TextInput, View, Alert, Pressable, ActivityIndicator, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, CameraView } from 'expo-camera';
import axios from 'axios';
import { Audio } from 'expo-av';

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
    const [recording, setRecording] = useState(false);
    const router = useRouter();

    const [sound, setSound] = useState<Audio.Sound | null>(null);

    useEffect(() => {
        loadSound();
        return sound ? () => {
            sound.unloadAsync();
        } : undefined;
    }, []);

    const loadSound = async () => {
        const { sound } = await Audio.Sound.createAsync(
            require('../../assets/sounds/gunshot.mp3')
        );
        setSound(sound);
    };


    const handleRegisterPress = async () => {
        try {
            const { status } = await Camera.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Error', 'Camera permission is required to continue');
                return;
            }

            setRecordingStep(0);
            setCameraPermission(true);
            setCameraOpen(true);
            Alert.alert(
                'Snemanje obraza',
                'Poglejte v levo. Za vsak poziv pritisnite gumb "Začni snemanje".',
                [
                    { text: "OK", onPress: () => console.log("Alert closed") }
                ]
            );
        } catch (error) {
            console.log('register button press error:', error);
        }
    };


    const handleRegister = async (newUris: any[]) => {

        const formData = new FormData();
        formData.append('email', email);
        formData.append('username', username);
        formData.append('password', password);

        newUris.forEach(async (uri, index) => {
            //@ts-ignore
            formData.append('video', {
                uri: uri,
                type: "video/mp4",
                name: `video${index}.mp4`
            })

        });

        try {

            const axiosResponse = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/users/register`,
                formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (axiosResponse.status === 201 || axiosResponse.status === 200) {

                console.log('Register successful');
            } else {


                console.error('Register failed with status:', axiosResponse.status);
            }
        } catch (error: any) {
            Alert.alert('Napaka', 'Nastala je napaka pri pošiljanju videa.');
            if (error.response) {

                console.error('Register failed with response:', error.response.data);
            } else if (error.request) {

                console.error('Register failed with request:', error.request);
            } else {

                console.error('Register failed with message:', error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    const handleNextStep = () => {
        setRecordingStep((prevStep) => prevStep + 1);
        let alertMessage = '';
        switch (recordingStep) {
            default:
            case 0:
                alertMessage = 'Poglejte v desno.';
                break;
            case 1:
                alertMessage = 'Poglejte proti stropu.';
                break;
            case 2:
                alertMessage = 'Poglejte v tla.';
                break;



            //Alert.alert('Napaka', 'Nastala je napaka pri pošiljanju videa.');

        }
        Alert.alert('Snemanje obraza', alertMessage);
    };

    const handleTakeVideo = async () => {
        if (!cameraRef.current) {
            console.error('CameraRef ni definiran');
            return;
        }

        setRecording(true);
        try {

            const options = {
                maxDuration: 2,
                MaxFileSize: 3 * 1024 * 1024,
                mute: true,
            };

            const video = await cameraRef.current.recordAsync(options);
            let newUris = [...videoUris, video.uri];

            setVideoUris(newUris);

            if (sound) {
                await sound.replayAsync();
            }

            setLoading(false);
            setRecording(false);
            if (newUris && newUris.length == 3) {
                setLoading(true);
                await handleRegister(newUris).then(() => {
                    setLoading(false);
                    setCameraOpen(false);
                });
                setRecordingStep(0);

            } else {
                handleNextStep();
            }

        } catch (error) {
            console.error('Napaka pri snemanju videa:', error);
            Alert.alert('Napaka', 'Nastala je napaka pri snemanju.');
        } finally {
            setLoading(false);
        }
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

                        <View className={`mx-auto my-auto w-[80%] h-[80%] border-8  rounded-full bg-transparent ${recording ? 'border-red-500' : 'border-white'}`} />
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