import React, {useEffect, useState} from 'react';
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
import {useDispatch, useSelector} from 'react-redux';
import {fetchAssignedProjects} from '../Redux/Slices/assignProjectSlice';
import {getWorkByProjectId} from '../Redux/Slices/getWorkByProjectIdSlice';
import {getProjectDetailsByProjectId} from '../Redux/Slices/getProjectDetailByProjectIdSlice';
import {launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseUrl} from '../utils/api';
import UploadImage from '../../Image/image.png';

const AllProjects = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Access Redux state
  const {assignProject, loading, error} = useSelector(
    state => state.assignProject,
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(null);

  // Fetch assigned projects from Redux store
  useEffect(() => {
    dispatch(fetchAssignedProjects());
    dispatch(getWorkByProjectId(projectId));
    dispatch(getProjectDetailsByProjectId(projectId));
  }, [dispatch]);

  const openAddModal = id => {
    setModalVisible(true);
    setProjectId(id);
  };

  const handleAddWork = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

      if (!description.trim()) {
        Alert.alert('Error', 'Description cannot be empty');
        return;
      }

      if (selectedFiles.length === 0) {
        Alert.alert('Error', 'Please select files');
        return;
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('description', description);
      formData.append('workId', projectId);

      selectedFiles.forEach(file => {
        formData.append('workThumbnail', {
          uri: file.uri,
          type: file.type,
          name: file.fileName,
        });
      });

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
      console.log(response);
      if (response.status === 200) {
        Alert.alert('Success', 'Work added successfully');
        setModalVisible(false);
        setDescription('');
        setSelectedFiles([]);
        dispatch(getWorkByProjectId(projectId));
        dispatch(getProjectDetailsByProjectId(projectId));
      } else {
        Alert.alert('Error', response.data.message || 'Failed to add work');
      }
    } catch (error) {
      console.log('Error adding work:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      // Always clear the form after attempt (success or failure)
      setDescription('');
      setSelectedFiles([]);
    }
  };
  // Handle Image Upload
  const handleImageUpload = () => {
    launchImageLibrary(
      {mediaType: 'photo', selectionLimit: 0, quality: 0.5},
      response => {
        if (!response.didCancel && !response.errorCode) {
          setSelectedFiles(response.assets);
        }
      },
    );
  };

  const toggleDropdown = projectId => {
    setDropdownVisible(dropdownVisible === projectId ? null : projectId);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : assignProject.length > 0 ? (
        <FlatList
          data={assignProject}
          keyExtractor={item => item?._id?.toString()}
          renderItem={({item}) => (
            <View style={styles.projectCard}>
              <View style={styles.projectContent}>
                <Text style={styles.projectInfo}>
                  🖥️ Name : {item?.projectId?.name}
                </Text>
                <Text style={styles.projectInfo}>
                  📝 Description : {item?.projectId?.description}
                </Text>
                <Text
                  style={[
                    styles.statusText,
                    item.status === 'pending'
                      ? styles.pendingStatus
                      : styles.completedStatus,
                  ]}>
                  <Text style={styles.Status}>Status:</Text> {item.status}
                </Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.addButtonInsideCard}
                  onPress={() => openAddModal(item?._id)}>
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>

                <View style={{position: 'relative'}}>
                  <TouchableOpacity onPress={() => toggleDropdown(item._id)}>
                    <Text style={styles.threeDotButton}>⋮</Text>
                  </TouchableOpacity>

                  {dropdownVisible === item._id && (
                    <View
                      style={[
                        styles.dropdownMenu,
                        {position: 'absolute', top: 25, left: 0},
                      ]}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('Work History', {
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
            </View>
          )}
        />
      ) : (
        <Text style={styles.noProjects}>No assigned projects found.</Text>
      )}

      {/* Modal for adding work */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalView}>
          <View style={styles.modalContent}>
            {/* Cancel Button at the Top Right Corner */}
            <TouchableOpacity
              style={styles.cancelButtonTopRight}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalText}>Add Work</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Description"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <View style={styles.statusUploadContainer}>
              <TouchableOpacity
                onPress={handleImageUpload}
                style={styles.uploadButton}>
                <Image source={UploadImage} style={styles.statusUploadImage} />
                <Text style={styles.statusUploadText}>Upload Image</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.selectedFiles}>
              {selectedFiles.map((file, index) => (
                <Image
                  key={index}
                  source={{uri: file.uri}}
                  style={styles.fileImage}
                />
              ))}
            </View>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.buttonWrapper, styles.addButton]}
                onPress={handleAddWork}>
                <Text style={styles.buttonText}>Add Work</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8f9fa', padding: 20},
  projectCard: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectContent: {flex: 1},
  threeDotButton: {fontSize: 30, color: 'black'},
  projectInfo: {fontSize: 14, color: '#555', marginBottom: 5},
  statusText: {fontSize: 16, fontWeight: 'bold', marginTop: 10},
  Status: {fontSize: 16, fontWeight: 'semiBold', marginTop: 10, color: 'black'},
  pendingStatus: {color: 'red'},
  completedStatus: {color: 'green'},
  cardActions: {flexDirection: 'row', alignItems: 'center'},
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
  addButtonText: {color: '#fff', fontSize: 20, fontWeight: 'bold', top: -4},
  noProjects: {textAlign: 'center', marginTop: 20, fontSize: 16, color: '#888'},
  viewButton: {
    borderRadius: 20,
    width: 50,
    height: 60,
    backgroundColor: 'white',
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    right: 40,
    top: 5,
  },
  viewButtonText: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'transparent',
    height: 'auto',
  },
  statusUploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    width: 200,
    height: 60,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  statusUploadImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 10,
  },
  statusUploadText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  selectedFiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  fileImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  buttonWrapper: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  addButton: {
    backgroundColor: 'black',
  },
  cancelButtonTopRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'transparent',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },

  cancelButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#dc3545',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default AllProjects;
