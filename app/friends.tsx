import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import axios from 'axios';

const FollowersPage = () => {
    const [followers, setFollowers] = useState([]);

    /*
    const fetchUserSubscriptions = async () => {
    try {
      const { data, error } = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}`);
      if (error) {
        console.error('Error fetching user subscriptions:', error);
        Alert.alert('Error', 'Failed to fetch user subscriptions');
      } else {
        const userSubscriptions = data?.subs || [];
        setFollowers(userSubscriptions);
      }
    } catch (err) {
      console.error('Error fetching user subscriptions:', err);
      Alert.alert('Error', 'Failed to fetch user subscriptions');
    }
  };
  
  useEffect(() => {
    fetchUserSubscriptions();
  }, []);
  */

  return (
    <View className='flex flex-1 p-5 pb-10 bg-gray-100'>
        <View className='w-full max-w-md'>
            <Text className='text-2xl font-bold mb-5'>Prijatelji</Text>
            <FlatList className=''
            data={followers}
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