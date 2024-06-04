import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import * as Paho from 'paho-mqtt';

const MqttPage = () => {
  const [client, setClient] = useState<Paho.Client | null>(null);
  const [message, setMessage] = useState('');

  const connectToMqtt = () => {
    const mqttClient = new Paho.Client('test.mosquitto.org', 8080, 'clientID');

    mqttClient.connect({
      onSuccess: () => {
        console.log('Connected to MQTT broker');
        setClient(mqttClient);
      },
      onFailure: (error) => {
        console.error('Connection error: ', error);
      },
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>MQTT Publish</Text>
      <TextInput
        style={{ width: '100%', height: 50, borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, marginBottom: 10 }}
        placeholder="Message"
      />
      {/* No need for a connect button */}
      <Button title="Publish" />
    </View>
  );
};

export default MqttPage;