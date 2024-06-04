import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import * as Paho from 'paho-mqtt';
import { error } from 'console';

const MqttPage = () => {
  const [client, setClient] = useState<Paho.Client | null>(null);
  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    connectToMqtt();
  }, []); // Prazen dependency da se poveže samo 1x
  
  const connectToMqtt = () => {
    const mqttClient = new Paho.Client('test.mosquitto.org', 8080, 'clientID');

    mqttClient.connect({
      onSuccess: () => {
        console.log('Connected to MQTT broker');
        setClient(mqttClient);
        setIsConnected(true);
      },
      onFailure: (error) => {
        console.error('Connection error: ', error);
      },
    });
  };

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
      const mqttMessage = new Paho.Message(message + ' gre na pohod');
      mqttMessage.destinationName = 'testni';
      client.send(mqttMessage);
      console.log('Message published');
    }
  };

  const onMessageArrived = (message: Paho.Message) => {
    Alert.alert('New Message Received', message.payloadString);
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>MQTT Publish & Subscribe</Text>
      <TextInput
        style={{ width: '100%', height: 50, borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, marginBottom: 10 }}
        placeholder="Topic"
        value={topic}
        onChangeText={setTopic}
      />
      <Button title="Subscribe" onPress={subscribeToTopic} disabled={!isConnected} />
      <TextInput
        style={{ width: '100%', height: 50, borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, marginBottom: 10 }}
        placeholder="Message"
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Publish" onPress={publishMessage} disabled={!isConnected} />
    </View>
  );
};

export default MqttPage;
