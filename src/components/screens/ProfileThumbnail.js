import React, {useEffect, useState} from 'react';
import {
  Image,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {fetchProfileThumbnail} from '../Redux/Slices/profileThumbnailSlice';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {baseUrl} from '../utils/api';
import ProfileImg from '../../Image/user.png';
import LogoutImg from '../../Image/logout.png';

const ProfileThumbnail = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {profileThumbnail, loading} = useSelector(
    state => state.profileThumbnail,
  );
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchProfileThumbnail());
  }, [dispatch]);

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
            uri:
              profileThumbnail > 0
                ? `${baseUrl}/uploads/profileThumbnail/${profileThumbnail}`
                : 'https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg?semt=ais_hybrid',
          }}
          style={styles.profileImage}
        />
      </TouchableOpacity>

      {isDropdownVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity onPress={handleProfileNavigate}>
            <View style={styles.dropdownProfileContainer}>
              <Text style={styles.dropdownProfile}>Profile</Text>
              <Image source={ProfileImg} style={styles.dropdownProfileImg} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <View style={styles.dropdownLogoutContainer}>
              <Text style={styles.dropdownLogout}>Logout</Text>
              <Image source={LogoutImg} style={styles.dropdownLogoutImg} />
            </View>
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
  dropdownProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  dropdownProfile: {
    fontSize: 16,
    color: 'green',
    fontWeight: '600',
    marginRight: 13,
  },

  dropdownProfileImg: {
    width: 20,
    height: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: '#f0f0f0',
  },
  dropdownLogoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  dropdownLogout: {
    fontSize: 16,
    color: 'red',
    fontWeight: '600',
    marginRight: 10,
  },

  dropdownLogoutImg: {
    width: 20,
    height: 20,
  },
});

export default ProfileThumbnail;
