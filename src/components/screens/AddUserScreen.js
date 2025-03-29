import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import {baseUrl} from '../utils/api';
import {fetchAllUsers} from '../Redux/Slices/allUserSlice';
import {useDispatch, useSelector} from 'react-redux';

const AddUserScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Function to handle image selection
  const selectImage = async () => {
    try {
      const options = {
        mediaType: 'photo',
        quality: 1,
      };

      const response = await launchImageLibrary(options);

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
        setProfileImage(selectedImage);
      } else {
        Alert.alert('Error', 'No image selected');
      }
    } catch (error) {
      console.error('Image picker exception:', error);
      Alert.alert('Error', 'Something went wrong while picking an image.');
    }
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

      Alert.alert('Success', 'User added successfully.');
      dispatch(fetchAllUsers());
      navigation.goBack();
    } catch (error) {
      console.log('Error adding user:', error.response?.data?.message || error);
      Alert.alert(error.response?.data?.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New User</Text>

      {/* Profile Image Upload Circle */}
      <TouchableOpacity onPress={selectImage} style={styles.imageContainer}>
        <Image
          source={{
            uri: profileImage
              ? profileImage.uri
              : 'https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg?semt=ais_hybrid',
          }}
          style={styles.image}
        />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
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

      <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
        <Text style={styles.addButtonText}>Add User</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
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
    borderRadius: 20,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  imageContainer: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  uploadText: {
    color: '#666',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddUserScreen;
