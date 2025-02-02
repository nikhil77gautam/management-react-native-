import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {baseUrl} from '../utils/api';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${baseUrl}/v1/login`, {
        email: trimmedEmail,
        password: trimmedPassword,
      });

      console.log('API Response:', response.data); // Debugging

      if (response.status === 200) {
        const {token, name, role} = response.data;

        console.log(token); // Logging the token for debugging
        // Store token, name, and role securely
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('userName', name);
        await AsyncStorage.setItem('userRole', role);

        Alert.alert('Success', 'Login successful!');
        navigation.navigate('Home');
      }
    } catch (error) {
      console.log('Login Error:', error.response || error);

      if (error.response) {
        Alert.alert(
          'Error',
          error.response.data.message || 'Invalid credentials.',
        );
      } else {
        Alert.alert(
          'Error',
          'Unable to connect to the server. Please try again.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && {backgroundColor: '#ccc'}]}
        onPress={handleLogin}
        disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.secondaryButtonText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
