import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';
import {baseUrl} from '../utils/api'; // Make sure this import is correctly set up

const ForgotPasswordScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${baseUrl}/v1/otp-send`, {email});

      if (response.status === 200) {
        Alert.alert(
          'Success',
          response.data.message || 'OTP sent to your email.',
        );
        // Navigate to OTP verification screen
        navigation.navigate('OtpVerification');
      } else {
        // Handle other successful statuses but not 200 (if needed)
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } catch (error) {
      if (error.response) {
        // Server responded with an error (status code outside 2xx)
        Alert.alert(
          'Error',
          error.response.data.message || 'Failed to send OTP.',
        );
      } else if (error.request) {
        // No response from server
        Alert.alert('Error', 'Server did not respond. Please try again.');
      } else {
        // Something else went wrong
        Alert.alert('Error', `Something went wrong: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={[styles.button, loading && {backgroundColor: '#ccc'}]}
        onPress={handleSendOTP}
        disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Sending...' : 'Send OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

export default ForgotPasswordScreen;
