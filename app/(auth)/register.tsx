import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, StyleSheet, Text, TextInput, View, Alert, Pressable, ActivityIndicator } from 'react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';  // Corrected imports
import { Redirect, Stack, router } from 'expo-router';
//import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { useSession } from "@/context/AuthProvider";
import axios from 'axios';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const handleRegister = () => {
        // Implement registration logic
        console.log('Register pressed');
        // Navigate to LoginPage or directly to ProfilePage

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

                    placeholder="Email"
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

                    placeholder="Username"
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

                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                />
            </View>

            <Pressable className="px-4 py-2 mt-2 bg-black text-white dark:bg-black rounded-md">
                <Text className="text-white text-lg"> Registracija </Text>
            </Pressable>

            <Button title="Open Camera" />
        </View>
    );
};

export default RegisterPage;
