import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Dimensions,
  Switch,
  Image,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseUrl} from '../utils/api';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const {width} = Dimensions.get('window');

const UserScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No token found. Please login again.');
          return;
        }

        const response = await axios.get(`${baseUrl}/v1/get-all-user`, {
          headers: {Authorization: `Bearer ${token}`},
        });

        setUsers(response?.data?.users || []);
      } catch (error) {
        console.error('Error fetching users:', error.response?.data || error);
        Alert.alert('Error', 'Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleToggleActive = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'deactive' : 'active';

    // Show confirmation dialog before making the change
    Alert.alert(
      'Confirm Status Change',
      `Are you sure you want to ${newStatus} this user?`,
      [
        {
          text: 'Cancel',
          onPress: () => {
            // No action on cancel
            console.log('Status change canceled');
          },
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.put(
                `${baseUrl}/v1/update-user-status/${userId}`,
                {status: newStatus},
                {headers: {Authorization: `Bearer ${token}`}},
              );

              setUsers(prevUsers =>
                prevUsers.map(user =>
                  user._id === userId ? {...user, status: newStatus} : user,
                ),
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to update user status.');
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  const handleDelete = async userId => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${baseUrl}/v1/delete-user/${userId}`, {
        headers: {Authorization: `Bearer ${token}`},
      });

      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      Alert.alert('Success', 'User deleted successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete user.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => {}}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Users List:</Text>
          </View>

          {loading ? (
            <Text style={styles.loadingText}>Loading users...</Text>
          ) : users.length === 0 ? (
            <Text style={styles.noUsersText}>No users found</Text>
          ) : (
            <FlatList
              data={users}
              keyExtractor={item => String(item._id)}
              renderItem={({item}) => (
                <View style={styles.userItem}>
                  <Image
                    source={{
                      uri: item.profileThumbnail
                        ? `${baseUrl}/uploads/profileThumbnail/${item.profileThumbnail}`
                        : 'https://static.vecteezy.com/system/resources/previews/021/548/095/non_2x/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg',
                    }}
                    style={styles.profileImage}
                  />
                  <Text style={styles.userName}>{item.name}</Text>

                  <Switch
                    value={item.status === 'active'}
                    onValueChange={() =>
                      handleToggleActive(item._id, item.status)
                    }
                  />

                  {/* Action Icons */}
                  <View style={styles.iconContainer}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('EditUser', {
                          userId: item._id,
                          name: item.name,
                          phone: item.phone,
                        })
                      }>
                      <Text style={styles.icon}>✏️</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleDelete(item._id)}>
                      <Text style={styles.icon}>🗑</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('UserDetail', {
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
                      <Text style={styles.icon}>👁️</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('UserProjects', {
                          userId: item._id,
                        })
                      }>
                      <Text style={styles.icon}>📋</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddUser')}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 15, backgroundColor: '#f9f9f9'},
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    alignItems: 'center',
    backgroundColor: '#007bff',
    borderRadius: 8,
    marginBottom: 15,
  },
  title: {fontSize: 24, color: '#fff', fontWeight: '600'},
  loadingText: {fontSize: 18, textAlign: 'center', marginTop: 20},
  noUsersText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    elevation: 3,
    zIndex: 1,
  },
  profileImage: {width: 50, height: 50, borderRadius: 25, marginRight: 15},
  userName: {fontSize: 18, color: '#333', flex: 1},
  iconContainer: {flexDirection: 'row', justifyContent: 'flex-end'},
  icon: {fontSize: 20, marginLeft: 10, color: '#007bff'},
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {fontSize: 30, color: '#fff'},
});

export default UserScreen;
