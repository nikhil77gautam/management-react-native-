import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import axios from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import {fetchUserDetails} from '../Redux/Slices/userDetailsSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'react-native-image-picker';
import {baseUrl} from '../utils/api';
import CircleCamera from '../../Image/circle.png';
import EditPen from '../../Image/pen.png';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const {userDetail, loading, error} = useSelector(state => state.userDetail);
  const [isEditing, setIsEditing] = useState({name: false, phone: false});
  const [updatedName, setUpdatedName] = useState('');
  const [updatedPhone, setUpdatedPhone] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    dispatch(fetchUserDetails());
  }, [dispatch]);

  useEffect(() => {
    if (userDetail) {
      setUpdatedName(userDetail.name);
      setUpdatedPhone(userDetail.phone);
    }
  }, [userDetail]);

  const updateUserPhone = async value => {
    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in again.');

      const response = await axios.put(
        `${baseUrl}/v1/update-phone`,
        {phone: value},
        {headers: {Authorization: `Bearer ${token}`}},
      );

      if (response.data.success) {
        Alert.alert('Success', 'Phone number updated successfully.');
        dispatch(fetchUserDetails());
      } else {
        throw new Error('Failed to update phone number.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Unable to update phone number.');
    }
    setUpdating(false);
    setIsEditing(prev => ({...prev, phone: false}));
  };

  const updateUserName = async value => {
    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in again.');

      const response = await axios.put(
        `${baseUrl}/v1/update-name`,
        {name: value},
        {headers: {Authorization: `Bearer ${token}`}},
      );

      if (response.data.success) {
        Alert.alert('Success', 'Name updated successfully.');
        dispatch(fetchUserDetails());
      } else {
        throw new Error('Failed to update name.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Unable to update name.');
    }
    setUpdating(false);
    setIsEditing(prev => ({...prev, name: false}));
  };

  const updateProfileThumbnail = async imageUri => {
    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in again.');

      const formData = new FormData();
      formData.append('profileThumbnail', {
        uri: imageUri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      });

      const response = await axios.put(
        `${baseUrl}/v1/update-thumbnail/:profileThumbnail`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.data.success) {
        Alert.alert('Success', 'Profile picture updated successfully.');
        dispatch(fetchUserDetails());
      } else {
        throw new Error('Failed to update profile picture.');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Unable to update profile picture.',
      );
    }
    setUpdating(false);
  };

  const pickImage = async () => {
    ImagePicker.launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', 'Image selection failed.');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        updateProfileThumbnail(response.assets[0].uri);
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userDetail ? (
        <View style={styles.profileCard}>
          <TouchableOpacity
            onPress={pickImage}
            disabled={updating}
            style={styles.imageContainer}>
            {/* Profile Image */}
            <Image
              source={{
                uri: userDetail.profileThumbnail
                  ? `${baseUrl}/uploads/profileThumbnail/${userDetail.profileThumbnail}`
                  : 'https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg?semt=ais_hybrid',
              }}
              style={styles.profileImage}
              onError={e =>
                console.log('Error loading image:', e.nativeEvent.error)
              }
            />

            {/* Edit Icon Positioned Over Profile Image */}
            <Image source={CircleCamera} style={styles.cameraIcon} />
          </TouchableOpacity>

          {/* Editable Name */}
          {isEditing.name ? (
            <TextInput
              style={styles.input}
              value={updatedName}
              onChangeText={setUpdatedName}
              onBlur={() => updateUserName(updatedName)}
            />
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditing(prev => ({...prev, name: true}))}>
              <Text style={styles.name}>
                {userDetail.name}{' '}
                <Image source={EditPen} style={styles.editIcon} />
              </Text>
            </TouchableOpacity>
          )}

          {/* Editable Phone */}
          {isEditing.phone ? (
            <TextInput
              style={styles.input}
              value={updatedPhone}
              onChangeText={setUpdatedPhone}
              onBlur={() => updateUserPhone(updatedPhone)}
              keyboardType="phone-pad"
            />
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditing(prev => ({...prev, phone: true}))}>
              <Text style={styles.detailsText}>
                Phone : {userDetail.phone}{' '}
                <Image source={EditPen} style={styles.editIcon} />
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.detailsText}>Role : {userDetail.role}</Text>
          <Text style={styles.detailsText}>
            Account Created :{' '}
            {new Date(userDetail.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.detailsText}>
            Last Updated : {new Date(userDetail.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      ) : (
        <Text>No profile data available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  profileCard: {
    width: '100%',
    maxWidth: 400,
    height: '70%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },

  imageContainer: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: 65,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#ddd',
  },

  editIcon: {
    position: 'absolute',
    bottom: 2,
    right: 5,
    backgroundColor: '#007bff',
    width: 20,
    height: 20,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 5,
    right: 24,
    fontSize: 22,
    color: '#007bff',
    padding: 6,
    borderRadius: 20,
    textAlign: 'center',
    width: 30,
    height: 30,
    overflow: 'hidden',
  },
  name: {fontSize: 26, fontWeight: 'bold', color: '#333'},
  detailsText: {fontSize: 16, color: '#333', fontWeight: 'semiBold'},
  input: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    width: '100%',
  },
});

export default ProfileScreen;
