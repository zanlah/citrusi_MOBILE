import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import axios from 'axios';
import { useSession } from '@/context/AuthProvider';

const FollowersPage = () => {
    const { session } = useSession();
    const [friends, setFriends] = useState([]);
    const { token, userId } = session;

    const fetchFriends = async () => {
    try {
        const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/users/friends?userId=${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log('Response:', response.data);
        if (response.data.error) {
            throw new Error(response.data.error);
        } else {
            setFriends(response.data.user2_email);
        }
    } catch (error) {
        console.error('Error fetching friends:', error);
        Alert.alert('Error', 'Failed to fetch friends');
    }
};


    useEffect(() => {
        console.log('fetching friends');
        fetchFriends();
    }, []);

  return (
    <View className='flex flex-1 p-5 pb-10 bg-gray-100'>
        <View className='w-full max-w-md'>
            <Text className='text-2xl font-bold mb-5'>Prijatelji</Text>
            <FlatList className=''
            data={friends}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
                <View className='w-full'>
                <Text className='text-lg p-3 bg-white mb-2 rounded-lg'>{item}</Text>
                </View>
            )}
            />
        </View>
    </View>
  );
};

export default FollowersPage;