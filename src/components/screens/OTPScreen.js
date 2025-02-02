import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import axios from 'axios';
import { baseUrl } from '../utils/api';

const OtpVerificationScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [otpcode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async () => {
    if (!email || !otpcode || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${baseUrl}/v1/forget-password`, {
        email,
        otpcode, 
        password,
      });

      if (response.data.success) {
        Alert.alert(
          'Success',
          response.data.message || 'OTP verified and password reset successfully.'
        );
        navigation.navigate('Login'); 
      } else {
        Alert.alert('Error', response.data.message || 'Invalid OTP or email.');
      }
    } catch (error) {
      if (error.response) {
        Alert.alert('Error', error.response.data.message || 'Invalid OTP or email.');
      } else {
        Alert.alert('Error', 'Unable to connect to the server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>OTP Verification</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otpcode}
            onChangeText={setOtpCode}
            keyboardType="numeric"
            maxLength={6}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter New Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.button, loading && { backgroundColor: '#ccc' }]}
            onPress={handleVerifyOtp}
            disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify OTP & Reset Password'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
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
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default OtpVerificationScreen;
