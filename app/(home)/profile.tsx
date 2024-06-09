
import React from 'react'
import { View, Text, Button, Image, ScrollView, Pressable } from 'react-native'
import { Entypo } from '@expo/vector-icons';
import { useSession } from '../../context/AuthProvider'; // Adjust the path as necessary
import { userInfo } from 'os';
import { router } from 'expo-router';
import { Redirect } from 'expo-router';

const Profile = () => {
    const { session, signOut } = useSession();
    const { profileImage, name, email } = session;
    const selectNewProfileImage = () => {
        router.navigate('/profileImage');
    }
    const viewFriends = () => {
        router.navigate('/friends');
    }
    const sendMqttMessage = () => {
        router.navigate('/message');
    }

    if (!session) {
        // On web, static rendering will stop here as the user is not authenticated
        // in the headless Node process that the pages are rendered in.
        return <Redirect href="/" />;
    }
    return (
        <><ScrollView className="bg-gray-100 dark:bg-black min-h-full pt-5 px-3 pb-10">
            <Text className="text-md text-gray-600">Profil</Text>
            <Pressable className="p-2 bg-white dark:bg-zinc-900 rounded-2xl flex justify-center items-center mt-1" onPress={selectNewProfileImage}>
                <Image className="rounded-full aspect-square w-full h-40 bg-contain" src={`${process.env.EXPO_PUBLIC_API_URL}/uploads/profileImages/${profileImage}`} />
                <Text className="text-lg mt-2 dark:text-white">{name || email}</Text>
            </Pressable>
            <View className="mt-5 ">
                <Text className="text-md text-gray-600">Družabno</Text>
                <View className="rounded-2xl bg-white dark:bg-zinc-900 mt-1">
                    <View className="p-2 mt-1 flex justify-between  flex-row ">
                        <Text className="text-lg text-gray-600  dark:text-white flex-auto">Dodaj prijatelja</Text>
                        <Entypo name="chevron-right" size={24} color="rgb(156 163 175)" />
                    </View>
                    <View className="border-t-[1px] border-gray-200 dark:border-zinc-600 mx-2 " />
                    <View className="p-2 mt-1 flex justify-between flex-row">

                        <Text className="text-lg text-gray-600 dark:text-white ">Izzovi prijatelja</Text>
                        <Entypo name="chevron-right" size={24} color="rgb(156 163 175)" />
                    </View>
                    <View className="border-t-[1px] border-gray-200 dark:border-zinc-600 mx-2 " />
                
                    <Pressable onPress={sendMqttMessage}>
                    <View className="p-2 mt-1 flex justify-between flex-row">
                        <Text className="text-lg text-gray-600 ">Pošlji sporočilo</Text>
                        <Entypo name="chevron-right" size={24} color="rgb(156 163 175)" />
                    </View>
                    </Pressable>

                    <View className="border-t-[1px] border-gray-200 dark:border-zinc-600 mx-2 " />

                    <Pressable onPress={viewFriends}>
                    <View className="p-2 mt-1 flex justify-between flex-row">                    
                        <Text className="text-lg text-gray-600 dark:text-white ">Seznam prijateljev</Text>
                        <Entypo name="chevron-right" size={24} color="rgb(156 163 175)" />
                    </View>
                </Pressable>
            </View>
        </View>
        <View className="mt-5 ">
                <Text className="text-md text-gray-600">Nastavitve</Text>

                <View className="rounded-2xl  bg-white  dark:bg-zinc-900 mt-1">
                    <View className="p-2 mt-1 flex justify-between  flex-row ">
                        <Text className="text-lg text-gray-600 dark:text-white flex-auto">Spletna stran</Text>
                        <Entypo name="chevron-right" size={24} color="rgb(156 163 175)" />
                    </View>
                    <View className="border-t-[1px] border-gray-200 dark:border-zinc-600 mx-2 " />
                    <View className="p-2 mt-1 flex justify-between flex-row">

                        <Text className="text-lg text-gray-600  dark:text-white ">Politika zasebnosti</Text>
                        <Entypo name="chevron-right" size={24} color="rgb(156 163 175)" />
                    </View>
                </View>
            </View><View className="mt-5 mb-10">

                <Pressable className="p-2 mt-1 dark:bg-zinc-900 bg-gray-200 rounded-2xl flex justify-center items-center " onPress={signOut}>
                    <Text className="text-lg text-red-500 ">Odjavi se</Text>
                </Pressable>
            </View>
        </ScrollView></>
    );
};

export default profile;