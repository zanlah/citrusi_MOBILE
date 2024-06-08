import React from 'react'
import { View, Text, Button, Image, ScrollView, Pressable } from 'react-native'
import { Entypo } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Redirect } from 'expo-router';
const profile = () => {

    const viewFriends = () => {
        router.navigate('/friends');
    }

    const sendMqttMessage = () => {
        router.navigate('/message');
    }

    return (

        <ScrollView className="bg-gray-100 min-h-full pt-5 px-3 pb-10">
            <Text className="text-md text-gray-600">Profil</Text>
            <View className="p-2 bg-white rounded-2xl flex justify-center items-center mt-1">
                <Image className="rounded-full aspect-square w-full h-40 bg-contain" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSLU5_eUUGBfxfxRd4IquPiEwLbt4E_6RYMw&s" />
                <Text className="text-lg mt-2">Žan Lah</Text>
            </View>

            <View>


            </View>
            <View className="mt-5 ">
                <Text className="text-md text-gray-600">Družabno</Text>
                <View className="rounded-2xl bg-white mt-1">
                    <View className="border-t-[1px] border-gray-200 mx-2 " />
                    <Pressable onPress={sendMqttMessage}>
                    <View className="p-2 mt-1 flex justify-between flex-row">
                        <Text className="text-lg text-gray-600 ">Pošlji sporočilo</Text>
                        <Entypo name="chevron-right" size={24} color="rgb(156 163 175)" />
                    </View>
                    </Pressable>

                    <View className="border-t-[1px] border-gray-200 mx-2 " />
                    <Pressable onPress={viewFriends}>
                    <View className="p-2 mt-1 flex justify-between flex-row">
                        <Text className="text-lg text-gray-600 ">Prijatelji</Text>
                        <Entypo name="chevron-right" size={24} color="rgb(156 163 175)" />
                    </View>
                    </Pressable>
                </View>
            </View>
            <View className="mt-5 ">
                <Text className="text-md text-gray-600">Nastavitve</Text>
                <View className="rounded-2xl bg-white mt-1">
                    <View className="p-2 mt-1 flex justify-between  flex-row ">
                        <Text className="text-lg text-gray-600 flex-auto">Spletna stran</Text>
                        <Entypo name="chevron-right" size={24} color="rgb(156 163 175)" />
                    </View>
                    <View className="border-t-[1px] border-gray-200 mx-2 " />
                    <View className="p-2 mt-1 flex justify-between flex-row">
                        <Text className="text-lg text-gray-600 ">Politika zasebnosti</Text>
                        <Entypo name="chevron-right" size={24} color="rgb(156 163 175)" />
                    </View>
                </View>
            </View>
            <View className="mt-5 mb-5">

                <View className="p-2 mt-1 bg-gray-200 rounded-2xl flex justify-center items-center ">
                    <Text className="text-lg text-red-500 ">Odjavi se</Text>
                </View>
            </View>
        </ScrollView >
    )
}

export default profile