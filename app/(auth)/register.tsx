import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const handleRegister = () => {
        // Implement registration logic
        console.log('Register pressed');
        // Navigate to LoginPage or directly to ProfilePage

    };

    return (
        <View>
            <Text>Register</Text>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput placeholder="Username" value={username} onChangeText={setUsername} />
            <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <Button title="Register" onPress={handleRegister} />
        </View>
    );
};

export default RegisterPage;
