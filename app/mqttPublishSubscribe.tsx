import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, Pressable } from 'react-native';
import * as Paho from 'paho-mqtt';
import axios from 'axios';
import { useSession } from '../context/AuthProvider';


const MqttPublishSubscribe = ({ client, isConnected }: { client: Paho.Client, isConnected: boolean }) => {
  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState('');
  const { session } = useSession();
  const { id: userID, email, token } = session;

    useEffect(() => {
      if (client) {
        client.onMessageArrived = onMessageArrived;
      }
    }, [client]);

    useEffect(() => {
      if (isConnected) {
      fetchAndSubscribeFriends();
      }
    }, [isConnected]);


  const fetchAndSubscribeFriends = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/users/friends`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const friends = response.data;

      friends.forEach((friend: { email: any; }) => {
        const friendTopic = friend.email;
        client.subscribe(friendTopic, {
          onSuccess: () => {
            console.log(`Subscribed to friend's topic: ${friendTopic}`);
          },
          onFailure: (error) => {
            console.error('Subscription error:', error);
          },
        });
      });
    } catch (error) {
      console.error('Error fetching friends:', error);
      Alert.alert('Error', 'Failed to fetch friends');
    }
  };



  const subscribeToTopic = () => {
    if (client && topic) {
      client.subscribe(topic, {
        onSuccess: async () => {
          Alert.alert('Subscribed', `Subscribed to topic ${topic}`);
          try {
            // Add friend to the database
            await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/users/add-friend`, {
              userId: userID,
              friendEmail: topic
            }, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            console.log('Friend added to database');
          } catch (error) {
            console.error('Error adding friend to database:', error);
            Alert.alert('Error', 'Failed to add friend to database');
          }
        },
        onFailure: (error) => {
          console.error('Subscription error:', error);
          Alert.alert('Subscription error', error.errorMessage);
        },
      });
    } else {
      Alert.alert('Error', 'Please connect to the broker and enter a valid topic.');
    }
  };

  const publishMessage = () => {
    if (client) {
      const mqttMessage = new Paho.Message(message);
      mqttMessage.destinationName = email; // topic na katerega publishas je email al pa username
      client.send(mqttMessage);
      console.log('Message published');
    }
  };

  const onMessageArrived = (message: { payloadString: string | undefined; }) => {
    Alert.alert('New Message Received', message.payloadString);
  };

  return (
    <View className="flex-1 items-center p-5">
      {/* Section for Adding Friend */}
      <View className="w-full p-8 border border-gray-300 rounded-lg mb-10 bg-white shadow">
        <Text className="text-2xl font-bold mb-5">Dodaj prijatelja</Text>
        <TextInput
          className="w-full h-12 border border-gray-300 rounded-lg p-3 mb-5 text-lg"
          placeholder="Username"
          value={topic}
          onChangeText={setTopic}
        />
        <Pressable className="bg-green-600 py-2 rounded-lg mt-1" onPress={subscribeToTopic} disabled={!isConnected}>
          <Text className='text-white text-center text-lg'>Dodaj prijatelja</Text>
        </Pressable>
      </View>

      {/* Section for Sending Message */}
      <View className="w-full p-8 border border-gray-300 rounded-lg bg-white shadow">
        <Text className="text-2xl font-bold mb-5">Pošlji sporočilo</Text>
        <TextInput
          className="w-full h-12 border border-gray-300 rounded-lg p-3 mb-5 text-lg"
          placeholder="Sporočilo"
          value={message}
          onChangeText={setMessage}
        />
        <Pressable className="bg-green-600 py-2 rounded-lg mt-1" onPress={publishMessage} disabled={!isConnected}>
          <Text className='text-white text-center text-lg'>Pošlji</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default MqttPublishSubscribe;