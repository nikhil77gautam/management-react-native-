import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Switch,
  Image,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {fetchAllUsers} from '../Redux/Slices/allUserSlice';
import {baseUrl} from '../utils/api';
import axios from 'axios';

const UserScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {users, loading, error} = useSelector(state => state.allUsers);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleToggleActive = (userId, currentStatus) => {
    Alert.alert(
      'Confirm Status Change',
      `Are you sure you want to ${
        currentStatus === 'active' ? 'deactivate' : 'activate'
      } this user?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'OK', onPress: () => console.log('Change status API call here')},
      ],
    );
  };

  const handleDelete = async userId => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'OK',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');

              if (!token) {
                Alert.alert(
                  'Error',
                  'Authentication token is missing. Please log in again.',
                );
                return;
              }

              const response = await axios.delete(
                `${baseUrl}/v1/delete-user/${userId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                },
              );

              if (response.status === 200) {
                Alert.alert('Success', 'User deleted successfully.');
                dispatch(fetchAllUsers());
              } else {
                Alert.alert(
                  'Error',
                  response?.data?.message || 'Failed to delete user.',
                );
              }
            } catch (error) {
              console.log('Delete Error:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message ||
                  'Something went wrong. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  const toggleDropdown = userId => {
    setSelectedUserId(prevId => (prevId === userId ? null : userId));
  };

  const renderItem = ({item}) => (
    <View
      style={[styles.userItem, selectedUserId === item._id && {zIndex: 10}]}>
      <Image
        source={{
          uri:
            item.profileThumbnail > 0
              ? `${baseUrl}/uploads/profileThumbnail/${item.profileThumbnail}`
              : 'https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg?semt=ais_hybrid',
        }}
        style={styles.profileImage}
      />
      <Text style={styles.userName}>{item.name}</Text>
      <Switch
        value={item.status === 'active'}
        onValueChange={() => handleToggleActive(item._id, item.status)}
      />
      <TouchableOpacity onPress={() => toggleDropdown(item._id)}>
        <Text style={styles.icon}>⋮</Text>
      </TouchableOpacity>
      {selectedUserId === item._id && (
        <View style={styles.dropdownContainer}>
          <View style={styles.dropdown}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Edit User', {userId: item._id})
              }>
              <Text style={styles.dropdownItem}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item._id)}>
              <Text style={styles.dropdownItems}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('User Detail', {
                  userId: item._id,
                  profileThumbnail: item.profileThumbnail,
                  name: item.name,
                  phone: item.phone,
                  email: item.email,
                  emailVerified: item.emailVerified,
                  status: item.status,
                  createdAt: item.createdAt,
                })
              }>
              <Text style={styles.dropdownItem}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users List :</Text>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={styles.loadingIndicator}
        />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : users.length === 0 ? (
        <Text style={styles.noUsersText}>No users found</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => String(item._id)}
          renderItem={renderItem}
          contentContainerStyle={{paddingBottom: 100}}
        />
      )}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddUser')}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 15, backgroundColor: '#f9f9f9'},
  title: {fontSize: 24, fontWeight: '600', marginBottom: 15},
  loadingIndicator: {marginTop: 20},
  errorText: {fontSize: 16, color: 'red', textAlign: 'center', marginTop: 20},
  noUsersText: {fontSize: 18, textAlign: 'center', color: 'gray'},
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 10,
    elevation: 10,
    zIndex: 1,
  },
  profileImage: {width: 50, height: 50, borderRadius: 25, marginRight: 15},
  userName: {fontSize: 18, flex: 1},
  icon: {fontSize: 30, marginLeft: 10, color: '#000'},
  dropdownContainer: {
    position: 'absolute',
    top: 50,
    right: 10,
    zIndex: 1000,
    elevation: 10,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    width: 100,
    top: 10,
  },
  dropdownItem: {padding: 5, fontSize: 16, color: '#333'},
  dropdownItems: {padding: 5, fontSize: 16, color: 'red'},
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#000',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
  addButtonText: {fontSize: 30, color: '#fff'},
});

export default UserScreen;
