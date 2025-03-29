import React, {useState, useEffect} from 'react';
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
import {useDispatch, useSelector} from 'react-redux';
import {fetchUserDetailById} from '../Redux/Slices/userDetailByIdSlice';
import {fetchAllUsers} from '../Redux/Slices/allUserSlice';

const EditUserScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const {userId} = route.params;
  const {userDetailById: EditData, loading} = useSelector(
    state => state.userDetailById,
  );

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Fetch user details when component mounts
  useEffect(() => {
    dispatch(fetchAllUsers());
    dispatch(fetchUserDetailById(userId));
  }, [dispatch, userId]);

  // Debugging: Check EditData
  useEffect(() => {
    console.log('EditData:', EditData);
    if (EditData) {
      setName(EditData.name || '');
      setPhone(EditData.phone ? String(EditData.phone) : '');
    }
  }, [EditData]);

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

      if (!token) {
        Alert.alert('Error', 'Authentication token is missing.');
        return;
      }

      await axios.put(
        `${baseUrl}/v1/update-user/${userId}`,
        {name, phone},
        {headers: {Authorization: `Bearer ${token}`}},
      );

      Alert.alert('Success', 'User updated successfully!');
      dispatch(fetchUserDetailById(userId));
      dispatch(fetchAllUsers());
      navigation.goBack();
    } catch (error) {
      console.log(
        'Error updating user:',
        error?.response?.data?.message || error,
      );
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
    color: '#000',
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
    backgroundColor: '#000',
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
