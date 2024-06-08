import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';

const FollowersPage = () => {
    const [followers, setFollowers] = useState(['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7']);

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