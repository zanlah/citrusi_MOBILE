import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, Pressable } from 'react-native';
import * as Paho from 'paho-mqtt';

const MqttPublishSubscribe = ({ client, isConnected }: { client: Paho.Client | null, isConnected: boolean }) => {
  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState('');

  const subscribeToTopic = () => {
    if (client && topic) {
      client.subscribe(topic, {
        onSuccess: () => {
          console.log(`Subscribed to topic ${topic}`);
          Alert.alert('Subscribed', `Subscribed to topic ${topic}`);
        },
        onFailure: (error) => {
          console.error('Subscription error:', error);
          Alert.alert('Subscription error', error.errorMessage);
        },
      });
      client.onMessageArrived = onMessageArrived;
    } else {
      Alert.alert('Error', 'Please connect to the broker and enter a valid topic.');
    }
  };

  const publishMessage = () => {
    if (client) {
      const mqttMessage = new Paho.Message(message);
      mqttMessage.destinationName = 'testni';
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
        <Pressable className="bg-green-600 py-2 rounded-lg mt-1" onPress={subscribeToTopic}>
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
        <Pressable className="bg-green-600 py-2 rounded-lg mt-1" onPress={publishMessage}>
          <Text className='text-white text-center text-lg'>Pošlji</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default MqttPublishSubscribe;