import React, { useState, useEffect } from 'react';
import * as Paho from 'paho-mqtt';
import MqttPublishSubscribe from '@/components/mqttPublishSubscribe';

const MqttPage = () => {
  const [client, setClient] = useState<Paho.Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    connectToMqtt();
  }, []); // Runs only once on component mount

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

  return (
    <MqttPublishSubscribe client={client} isConnected={isConnected} />
  );
};

export default MqttPage;