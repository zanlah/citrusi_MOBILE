import { useState, useRef, useEffect } from 'react';
import { Modal, Text, TextInput, View, Alert, Pressable, ActivityIndicator, Animated, Easing, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, CameraView } from 'expo-camera';
import axios from 'axios';
import { Audio } from 'expo-av';
import { KeyboardAvoidingView, Platform } from 'react-native';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
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
    const [currentOrder, setCurrentOrder] = useState("");
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    useEffect(() => {
        loadSound();
        return sound ? () => {
            sound.unloadAsync();
        } : undefined;
    }, []);

    const loadSound = async () => {
        const { sound } = await Audio.Sound.createAsync(
            require('../../assets/sounds/beep.mp3')
        );
        setSound(sound);
    };


    const handleRegisterPress = async () => {
        if (!username || !email || !name || !password) {
            Alert.alert('Napaka', 'Izpolnite vsa polja!');
            return;
        }
        try {
            const { status } = await Camera.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Error', 'Camera permission is required to continue');
                return;
            }

            setRecordingStep(0);
            setCameraPermission(true);
            setCameraOpen(true);
            setCurrentOrder('Poglejte v levo.');
            Alert.alert(
                'Snemanje obraza',
                'Poglejte v levo. Po vsakem pozivu pritisnite gumb "Začni snemanje".',
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
        formData.append('name', name);
        console.log('newUris', newUris);
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


                console.log('Register failed with status:', axiosResponse.status);
            }
        } catch (error: any) {
            Alert.alert('Napaka', 'Prišlo je do napake.');
            if (error.response) {

                console.log('Register failed with response:', error.response.data);
            } else if (error.request) {

                console.log('Register failed with request:', error.request);
            } else {

                console.log('Register failed with message:', error.message);
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
        setCurrentOrder(alertMessage);
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
            if (newUris && newUris.length == 4) {
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
        return <View className="flex-1 items-center justify-center dark:bg-black bg-white"><Text className="text-gray-600">Postopek lahko traja nekaj minut zato prosim počakajte.</Text><ActivityIndicator size="large" className="dark:text-white text-indigo-600" /></View>;
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
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}

        >
            <View className='flex flex-1 justify-center items-center  bg-white dark:bg-black'>
                <Image
                    className="w-28 h-28"
                    src={`${process.env.EXPO_PUBLIC_API_URL}/uploads/image.png`}></Image>
                <View className="mt-2">
                    <Text className="text-2xl dark:text-white">Registracija</Text>
                </View>

                <Pressable onPress={() => router.push('/login')}>
                    <Text className="text-blue-500"> Prijava? </Text>
                </Pressable>

                <View className="w-full px-3">
                    <Text className="block text-md font-medium leading-6 text-gray-900 dark:text-white"> Ime </Text>
                    <TextInput
                        className="block w-full text-lg  px-2 py-1.5 text-gray-900 dark:text-white shadow-sm border-b-[1px] border-gray-300  focus:ring-2 focus:ring-inset focus:border-indigo-600 sm:text-sm sm:leading-6"
                        value={name}
                        placeholder='Ime'
                        placeholderTextColor="rgb(156 163 175)"
                        onChangeText={setName}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                </View>

                <View className="w-full px-3 mt-3">
                    <Text className="block text-md font-medium leading-6 text-gray-900 dark:text-white"> Email </Text>
                    <TextInput
                        className="block w-full text-lg  px-2 py-1.5 text-gray-900 dark:text-white shadow-sm border-b-[1px] border-gray-300  focus:ring-2 focus:ring-inset focus:border-indigo-600 sm:text-sm sm:leading-6"
                        value={email}
                        placeholderTextColor="rgb(156 163 175)"
                        placeholder='Email'
                        onChangeText={setEmail}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                </View>

                <View className="w-full px-3 mt-3">
                    <Text className="block text-md font-medium leading-6 text-gray-900 dark:text-white"> Uporabniško ime </Text>
                    <TextInput
                        className="block w-full text-lg  px-2 py-1.5 text-gray-900 dark:text-white shadow-sm border-b-[1px] border-gray-300  focus:ring-2 focus:ring-inset focus:border-indigo-600 sm:text-sm sm:leading-6"
                        placeholderTextColor="rgb(156 163 175)"
                        placeholder='Uporabniško ime'
                        value={username}
                        onChangeText={setUsername}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                </View>

                <View className="w-full px-3 mt-3">
                    <Text className="block text-md font-medium leading-6 text-gray-900 dark:text-white"> Geslo </Text>
                    <TextInput
                        className="block w-full text-lg  px-2 py-1.5 text-gray-900 dark:text-white shadow-sm border-b-[1px] border-gray-300  focus:ring-2 focus:ring-inset focus:border-indigo-600 sm:text-sm sm:leading-6"
                        placeholder='Geslo'
                        placeholderTextColor="rgb(156 163 175)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                    />
                </View>

                <Pressable className="px-4 py-2 mt-5 bg-black text-white dark:bg-white dark:text-black rounded-md" onPress={handleRegisterPress}>
                    <Text className="text-lg text-white dark:text-black "> Registracija </Text>
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
                            <View className="bg-red-700 rounded-2xl top-16 mx-auto w-[80%] flex justify-center items-center">
                                <Text className="font-bold py-2 text-lg  ">{currentOrder}</Text>
                            </View>
                            <View className={`mx-auto my-auto w-[80%] h-[55%] border-8  rounded-full bg-transparent ${recording ? 'border-red-500' : 'border-white'}`} />
                            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>

                                <Pressable className=" bottom-8 mx-auto w-[80%] bg-black  text-white rounded-2xl py-3" onPress={animateButton}>
                                    <Text className="text-white text-center py-2 font-bold">Začni snemanje</Text>
                                </Pressable>
                            </Animated.View>
                        </CameraView>
                    </Modal>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

export default RegisterPage;