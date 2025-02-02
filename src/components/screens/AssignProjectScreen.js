import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';
import {baseUrl} from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from '@react-native-community/checkbox';

const AssignProjectScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {projectId} = route.params;

  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch users from API
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

        if (response.data && response.data.users) {
          setUsers(response.data.users);
        } else {
          Alert.alert('Error', 'Invalid user data received.');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        Alert.alert('Error', 'Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Toggle selection of users (Updated to prevent crashes)
  const toggleSelection = userId => {
    setSelectedUsers(prevSelected => {
      if (!userId) return prevSelected; // Ensure valid userId

      const isSelected = prevSelected.includes(userId);
      return isSelected
        ? prevSelected.filter(id => id !== userId)
        : [...prevSelected, userId];
    });
  };

  // Assign selected users to the project
  const handleAssign = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one user to assign.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a project description.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No token found. Please login again.');
        return;
      }

      const response = await axios.post(
        `${baseUrl}/v1/assign-project`,
        {projectId, userId: selectedUsers, description},
        {headers: {Authorization: `Bearer ${token}`}},
      );

      if (response.status === 201) {
        Alert.alert('Success', 'Project assigned successfully.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error assigning project:', error);
      Alert.alert('Error', 'Failed to assign project.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Assign Users to Project</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter project description"
        value={description}
        onChangeText={setDescription}
        multiline={true}
        numberOfLines={4}
      />

      {/* Selected Users Display */}
      <View style={styles.selectedUsersContainer}>
        {selectedUsers.length > 0 ? (
          selectedUsers.map(userId => {
            const user = users.find(u => u._id === userId);
            return user ? (
              <Text key={userId} style={styles.selectedUser}>
                {user.name}
              </Text>
            ) : null;
          })
        ) : (
          <Text style={styles.placeholderText}>No users selected</Text>
        )}
      </View>

      {/* Open Dropdown Button */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.dropdownButtonText}>Select Users</Text>
      </TouchableOpacity>

      {/* User Selection Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Select Users</Text>
            <ScrollView>
              <FlatList
                data={users}
                keyExtractor={user => user._id}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.userItem}
                    onPress={() => toggleSelection(item._id)}>
                    <CheckBox value={selectedUsers.includes(item._id)} />
                    <Text style={styles.userName}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </ScrollView>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Assign Button */}
      <TouchableOpacity style={styles.assignButton} onPress={handleAssign}>
        <Text style={styles.assignButtonText}>Assign</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5', padding: 15},
  heading: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
  },
  dropdownButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  dropdownButtonText: {color: '#fff', fontSize: 18, fontWeight: '600'},
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalHeading: {fontSize: 20, fontWeight: 'bold', marginBottom: 10},
  userItem: {flexDirection: 'row', alignItems: 'center', padding: 10},
  userName: {fontSize: 16, marginLeft: 10},
  closeModalButton: {
    backgroundColor: '#28a745',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeModalButtonText: {color: '#fff', fontSize: 16},
  assignButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  assignButtonText: {color: '#fff', fontSize: 18, fontWeight: '600'},
  selectedUsersContainer: {marginBottom: 10},
  selectedUser: {fontSize: 16, color: '#333', marginVertical: 2},
  placeholderText: {fontSize: 16, color: '#888'},
});

export default AssignProjectScreen;
