import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import {baseUrl} from '../utils/api';

const AddUserScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  // Function to handle image selection
  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 1,
    };

    launchImageLibrary(options, response => {
      console.log(response); // Debug log for response

      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (response.errorMessage) {
        console.error('Image picker error:', response.errorMessage);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];

        // Debug log for selected image
        console.log('Selected image:', selectedImage);

        // Ensure the selected image has all necessary fields before setting state
        if (selectedImage.uri && selectedImage.fileName && selectedImage.type) {
          setProfileImage(selectedImage);
        } else {
          console.error('Image data is missing necessary fields');
          Alert.alert(
            'Error',
            'The selected image does not have the correct data.',
          );
        }
      } else {
        console.error('No assets found in the image picker response');
        Alert.alert('Error', 'No image selected');
      }
    });
  };

  // Function to handle user registration
  const handleAddUser = async () => {
    if (!name || !phone || !email || !password || !profileImage) {
      Alert.alert('Error', 'All fields are required, including profile image.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');

      // Create FormData object
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('profileThumbnail', {
        uri: profileImage.uri,
        name: profileImage.fileName || 'profile.jpg',
        type: profileImage.type,
      });

      // Post to the backend
      const response = await axios.post(
        `${baseUrl}/v1/user-register/:profileThumbnail`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      Alert.alert(
        'Success',
        'User added successfully. Please verify user email before logging in.',
      );

      // Navigate back to the user list
      navigation.goBack();
    } catch (error) {
      console.error('Error adding user:', error.response?.data || error);
      Alert.alert('Error', 'Failed to add user');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New User :</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Profile Image Preview */}
      {profileImage && (
        <Image source={{uri: profileImage.uri}} style={styles.imagePreview} />
      )}

      {/* Select Profile Image Button */}
      <TouchableOpacity style={styles.uploadButton} onPress={selectImage}>
        <Text style={styles.uploadButtonText}>
          {profileImage ? 'Change Image' : 'Upload Profile Image'}
        </Text>
      </TouchableOpacity>

      {/* Add User Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
        <Text style={styles.addButtonText}>Add User</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#f9f9f9'},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadButtonText: {color: '#fff', fontSize: 16},
  addButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
});

export default AddUserScreen;
