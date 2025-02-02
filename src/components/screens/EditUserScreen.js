import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseUrl} from '../utils/api';

const EditUserScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {userId, name: initialName, phone: initialPhone} = route.params;
 
  const [name, setName] = useState(initialName || '');
  const [phone, setPhone] = useState(initialPhone || '');

  const handleUpdateUser = async () => {
    if (!name || !phone) {
      Alert.alert('Error', 'Name and phone number cannot be empty.');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `${baseUrl}/v1/update-user/${userId}`,
        {name, phone},
        {headers: {Authorization: `Bearer ${token}`}},
      );

      Alert.alert('Success', 'User updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating user:', error.response?.data || error);
      Alert.alert('Error', 'Failed to update user.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit User</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter name"
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter phone number"
        keyboardType="numeric"
        maxLength={10}
      />

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdateUser}>
        <Text style={styles.updateButtonText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#007bff',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
  },
  updateButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});

export default EditUserScreen;
