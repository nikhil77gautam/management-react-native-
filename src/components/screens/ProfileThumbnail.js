import React, {useEffect, useState} from 'react';
import {
  Image,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {baseUrl} from '../utils/api';
import {useNavigation} from '@react-navigation/native';

const ProfileThumbnail = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (!storedToken) return;

        const response = await axios.get(`${baseUrl}/v1/profile-thumbnail`, {
          headers: {Authorization: `Bearer ${storedToken}`},
        });

        setProfileImage(response.data?.profileThumbnail);
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    };

    fetchProfileImage();
  }, []);

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const handleProfileNavigate = () => {
    navigation.navigate('Profile');
    setDropdownVisible(false);
  };

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      await axios.post(
        `${baseUrl}/v1/signout`,
        {},
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      await AsyncStorage.removeItem('token');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
    setDropdownVisible(false);
  };

  return (
    <View>
      <TouchableOpacity onPress={toggleDropdown}>
        <Image
          source={{
            uri: profileImage
              ? `${baseUrl}/uploads/profileThumbnail/${profileImage}`
              : 'https://via.placeholder.com/100',
          }}
          style={styles.profileImage}
        />
      </TouchableOpacity>

      {isDropdownVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity onPress={handleProfileNavigate}>
            <Text style={styles.dropdownItem}>Your Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.dropdownItem}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowOpacity: 0.2,
    padding: 10,
    width: 150,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
  },
  dropdownItem: {
    padding: 10,
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default ProfileThumbnail;
