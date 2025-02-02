import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Button,
  Modal,
  Image,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseUrl} from '../utils/api';
import {launchImageLibrary} from 'react-native-image-picker';

const AllProjects = () => {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(null);



  useEffect(() => {
    const fetchAssignedProjects = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        const response = await axios.get(`${baseUrl}/v1/get-assign-project`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        setProjects(response?.data?.projects || []);
      } catch (error) {
        console.log('Error fetching assigned projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedProjects();
  }, []);

  const openAddModal = (id) => {
    setModalVisible(true);
    setProjectId(id)
  };

  const handleAddWork = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      // Ensure description is not empty
      if (!description.trim()) {
        console.error('Description cannot be empty');
        return;
      }

      console.log(description);
      console.log(projectId);

      // Form data
      const formData = new FormData();
      formData.append('description', description);
      formData.append('workId', projectId);

      // Ensure files are selected
      if (selectedFiles.length === 0) {
        console.error('Please select files');
        return;
      }

      // Append selected files to the form data
      selectedFiles.forEach(file => {
        formData.append('workThumbnail', {
          uri: file.uri,
          type: file.type,
          name: file.fileName,
        });
      });

    

      // API call to upload the work
      const response = await axios.post(
        `${baseUrl}/v1/add-work/:workThumbnail`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );



      // Handle success response
      if (response.status === 200) {
        Alert.alert('Work added successfully');
        setModalVisible(false);
        setDescription('');
        setSelectedFiles([]);
      } else {
        console.error('Failed to add work:', response.data.message);
      }
    } catch (error) {
      console.log('Error adding work:', error);
    }
  };
  // Function to select multiple images
  const pickImages = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 0,
        quality: 0.5,
      },
      response => {
        if (response.didCancel) {
          console.log('User canceled image picker');
        } else if (response.errorCode) {
          console.error('ImagePicker Error: ', response.errorMessage);
        } else {
          setSelectedFiles(response.assets);
        }
      },
    );
  };

  const toggleDropdown = projectId => {
    // Toggle dropdown visibility for the selected project
    setDropdownVisible(dropdownVisible === projectId ? null : projectId);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : projects.length > 0 ? (
        <FlatList
          data={projects}
          keyExtractor={item => item?._id?.toString()}
          renderItem={({item}) => (
            <View style={styles.projectCard}>
              <View style={styles.projectContent}>
                <Text style={styles.projectInfo}>👤 Name: {item?.projectId?.name}</Text>
                <Text style={styles.projectInfo}>
                  📝 Description: {item?.projectId?.description}
                </Text>
                <Text
                  style={[
                    styles.statusText,
                    item.status === 'pending'
                      ? styles.pendingStatus
                      : styles.completedStatus,
                  ]}>
                  Status: {item.status}
                </Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.addButtonInsideCard}
                  onPress={() => openAddModal(item?._id)}>
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>

                {/* Three dots button (Dropdown for View option) */}
                <TouchableOpacity onPress={() => toggleDropdown(item._id)}>
                  <Text style={styles.threeDotButton}>⋮</Text>
                </TouchableOpacity>

                {/* Dropdown Menu for View option */}
                {dropdownVisible === item._id && (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('WorkHistory', {
                          projectId: item._id,
                        })
                      }
                      style={styles.viewButton}>
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noProjects}>No assigned projects found.</Text>
      )}

      {/* Modal for adding work */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalView}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Add Work</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Description"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* Image picker button */}
            <Button title="Upload Images" onPress={pickImages} />

            {/* Display selected images */}
            <View style={styles?.selectedFiles}>
              {selectedFiles?.map((file, index) => (
                <View key={index} style={styles?.fileThumbnail}>
                  <Image source={{uri: file?.uri}} style={styles?.fileImage} />
                  <Text>{file?.fileName}</Text>
                </View>
              ))}
            </View>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.buttonWrapper, styles.addButton]}
                onPress={handleAddWork}>
                <Text style={styles.buttonText}>Add Work</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.buttonWrapper, styles.cancelButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  projectCard: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectContent: {
    flex: 1,
  },
  threeDotButton: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#007bff',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'semiBold',
    textAlign: 'center',
    lineHeight: 45,
  },
  projectInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  pendingStatus: {
    color: '#ffc107',
  },
  completedStatus: {
    color: '#28a745',
  },
  cardActions: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  addButtonInsideCard: {
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 50,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    top: -4,
  },
  noProjects: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },

  // Modal styles
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: 300,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  selectedFiles: {
    marginVertical: 10,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  fileThumbnail: {
    width: 80,
    height: 80,
    marginRight: 10,
    marginBottom: 10,
  },
  fileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  viewButton: {
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 5,
    top: 5,
  },
  viewButtonText: {
    color: '#fff',
  },

  dropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    width: 120,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  buttonWrapper: {
    width: '48%',
    height: 45,
    borderRadius: 8,
  },
  cancelButtonWrapper: {
    marginTop: 12,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
  },
});

export default AllProjects;
