import React, {useState, useEffect} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'react-native-image-picker';
import {baseUrl} from '../utils/api';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState({
    name: false,
    phone: false,
  });
  const [updatedName, setUpdatedName] = useState('');
  const [updatedPhone, setUpdatedPhone] = useState('');

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No token found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${baseUrl}/v1/user-detail`, {
        headers: {Authorization: `Bearer ${token}`},
      });

      if (response?.data?.user) {
        setProfileData(response.data.user);
        setUpdatedName(response.data.user.name);
        setUpdatedPhone(response.data.user.phone);
      } else {
        Alert.alert('Error', 'Profile data is incomplete or invalid.');
      }
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch profile. Please try again.');
      setLoading(false);
    }
  };

  const updateUserPhone = async value => {
    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No token found. Please log in again.');
        setUpdating(false);
        return;
      }
      const response = await axios.put(
        `${baseUrl}/v1/update-phone`,
        {phone: value},
        {headers: {Authorization: `Bearer ${token}`}},
      );
      if (response.data.success) {
        setProfileData(prev => ({...prev, phone: value}));
        Alert.alert('Success', 'Phone number updated successfully.');
      } else {
        Alert.alert('Error', 'Failed to update phone number.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to update phone number.');
    }
    setUpdating(false);
    setIsEditing(prev => ({...prev, phone: false}));
  };

  const updateUserName = async value => {
    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No token found. Please log in again.');
        setUpdating(false);
        return;
      }
      const response = await axios.put(
        `${baseUrl}/v1/update-name`,
        {name: value},
        {headers: {Authorization: `Bearer ${token}`}},
      );
      if (response.data.success) {
        setProfileData(prev => ({...prev, name: value}));
        Alert.alert('Success', 'Name updated successfully.');
      } else {
        Alert.alert('Error', 'Failed to update name.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to update name.');
    }
    setUpdating(false);
    setIsEditing(prev => ({...prev, name: false}));
  };

  const updateProfileThumbnail = async imageUri => {
    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No token found. Please log in again.');
        setUpdating(false);
        return;
      }

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
        setProfileData(prev => ({
          ...prev,
          profileThumbnail: response.data.thumbnailPath,
        }));
        Alert.alert('Success', 'Profile picture updated successfully.');
      } else {
        Alert.alert('Error', 'Failed to update profile picture.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to update profile picture.');
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

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {profileData ? (
        <View style={styles.profileCard}>
          <TouchableOpacity
            onPress={pickImage}
            disabled={updating}
            style={styles.imageContainer}>
            <Image
              source={{
                uri: profileData.profileThumbnail
                  ? `${baseUrl}/uploads/profileThumbnail/${profileData.profileThumbnail}`
                  : 'https://static.vecteezy.com/system/resources/previews/021/548/095/non_2x/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg',
              }}
              style={styles.profileImage}
            />
            <Icon name="edit" size={24} color="white" style={styles.editIcon} />
          </TouchableOpacity>

          {/* Editable Name */}
          {isEditing.name ? (
            <View style={styles.editField}>
              <TextInput
                style={styles.input}
                value={updatedName}
                onChangeText={setUpdatedName}
                onBlur={() => updateUserName(updatedName)}
              />
              <TouchableOpacity
                onPress={() => setIsEditing(prev => ({...prev, name: false}))}>
                <Icon
                  name="close"
                  size={24}
                  color="#ff0000"
                  style={styles.cancelIcon}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditing(prev => ({...prev, name: true}))}>
              <View style={styles.field}>
                <Text style={styles.name}>{profileData.name}</Text>
                <Icon name="edit" size={20} color="#007bff" />
              </View>
            </TouchableOpacity>
          )}

          {/* Editable Phone */}
          {isEditing.phone ? (
            <View style={styles.editField}>
              <TextInput
                style={styles.input}
                value={updatedPhone}
                onChangeText={setUpdatedPhone}
                onBlur={() => updateUserPhone(updatedPhone)}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                onPress={() => setIsEditing(prev => ({...prev, phone: false}))}>
                <Icon
                  name="close"
                  size={24}
                  color="#ff0000"
                  style={styles.cancelIcon}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditing(prev => ({...prev, phone: true}))}>
              <View style={styles.field}>
                <Text style={styles.detailsText}>
                  Phone: {profileData.phone}
                </Text>
                <Icon name="edit" size={20} color="#007bff" />
              </View>
            </TouchableOpacity>
          )}

          <Text style={styles.detailsText}>Role: {profileData.role}</Text>
          <Text style={styles.detailsText}>
            Account Created:{' '}
            {new Date(profileData.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.detailsText}>
            Last Updated: {new Date(profileData.updatedAt).toLocaleDateString()}
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
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#007bff',
  },
  editIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#007bff',
    borderRadius: 12,
    padding: 4,
  },
  name: {fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 10},
  email: {fontSize: 18, color: '#666', marginBottom: 20},
  detailsText: {fontSize: 16, color: '#333', marginBottom: 10},
  input: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    width: '100%',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editField: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  cancelIcon: {
    marginLeft: 10,
  },
});

export default ProfileScreen;
