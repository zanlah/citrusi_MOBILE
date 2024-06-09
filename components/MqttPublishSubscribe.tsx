import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import * as Paho from 'paho-mqtt';
import { useSession } from '@/context/AuthProvider';

const MqttPublishSubscribe = ({ client, isConnected }: { client: Paho.Client | null, isConnected: boolean }) => {
  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState('');
  const { session } = useSession();
  const { email } = session;

  const subscribeToTopic = () => {
    if (client && topic) {
      client.subscribe(topic, {
        onSuccess: () => {
          console.log(`Subscribed to ${topic}`);
          Alert.alert('Uspešno', `Sledite ${topic}`);
        },
        onFailure: (error) => {
          console.error('Napaka:', error);
          Alert.alert('Napaka', error.errorMessage);
        },
      });
      client.onMessageArrived = onMessageArrived;
    } else {
      Alert.alert('Napaka', 'Izberite ustrezen profil');
    }
  };

  const publishMessage = () => {
    if (client) {
      const mqttMessage = new Paho.Message(message);
      mqttMessage.destinationName = email;
      client.send(mqttMessage);
      console.log('Message published');
    }
  };

  const onMessageArrived = (message: { payloadString: string | undefined; }) => {
    Alert.alert('New Message Received', message.payloadString);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Sledi prijatelju</Text>
      <TextInput
        style={{ width: '100%', height: 50, borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, marginBottom: 10 }}
        placeholder="Topic"
        value={topic}
        onChangeText={setTopic}
      />
      <Button title="Sledi" onPress={subscribeToTopic} disabled={!isConnected} />

      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 20 }}>Pošlji sporočilo</Text>
      <TextInput
        style={{ width: '100%', height: 50, borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, marginBottom: 10 }}
        placeholder="Message"
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Pošlji" onPress={publishMessage} disabled={!isConnected} />
    </View>
  );
};

export default MqttPublishSubscribe;