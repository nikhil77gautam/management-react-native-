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
import {useDispatch, useSelector} from 'react-redux';
import {fetchUsers} from '../Redux/Slices/userSlice';
import CheckBox from '@react-native-community/checkbox';

const AssignProjectScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {projectId} = route.params;

  const dispatch = useDispatch();
  const {users, loading, error} = useSelector(state => state.users);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [description, setDescription] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const toggleSelection = userId => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Assign Users to Projects</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter project description"
        value={description}
        onChangeText={setDescription}
        multiline={true}
        numberOfLines={4}
      />

      {/* Show selected users */}
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

      {/* Open User Selection Modal */}
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
            {loading ? (
              <Text>Loading users...</Text>
            ) : error ? (
              <Text style={{color: 'red'}}>{error}</Text>
            ) : (
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
            )}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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
    paddingBottom: 38,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    height: 70,
  },
  dropdownButton: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 20,
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
    borderRadius: 20,
    width: '80%',
  },
  modalHeading: {fontSize: 20, fontWeight: 'bold', marginBottom: 10},
  userItem: {flexDirection: 'row', alignItems: 'center', padding: 10},
  userName: {fontSize: 16, marginLeft: 10},
  closeModalButton: {
    backgroundColor: 'black',
    padding: 10,
    marginTop: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  closeModalButtonText: {color: '#fff', fontSize: 16},
  selectedUsersContainer: {marginBottom: 10},
  selectedUser: {fontSize: 16, color: '#333', marginVertical: 2},
  placeholderText: {fontSize: 16, color: 'black', textAlign: 'center'},
});

export default AssignProjectScreen;
