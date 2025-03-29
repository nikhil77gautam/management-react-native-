import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Linking,
  FlatList,
  Alert,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getWorkByProjectId} from '../Redux/Slices/getWorkByProjectIdSlice';
import {getProjectDetailsByProjectId} from '../Redux/Slices/getProjectDetailByProjectIdSlice';
import {baseUrl} from '../utils/api';
import axios from 'axios';
import PDFImg from '../../Image/pdf.png';

const WorkHistory = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {projectId} = route.params;
  const dispatch = useDispatch();
  const [isCompleted, setIsCompleted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const {
    workHistory,
    loading: workLoading,
    error: workError,
  } = useSelector(state => state.getWorkByProjectId);

  const {
    projectDetails,
    assignProject,
    loading: projectLoading,
    error: projectError,
  } = useSelector(state => state.getProjectDetailsByProjectId);

  useEffect(() => {
    dispatch(getWorkByProjectId(projectId));
    dispatch(getProjectDetailsByProjectId(projectId));
  }, [dispatch, projectId]);

  // Toggle Dropdown Visibility
  const toggleDropdown = itemId => {
    setDropdownVisible(dropdownVisible === itemId ? null : itemId);
  };
  // Complete Project Update status
  const handleCompleteProject = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      await axios.put(
        `${baseUrl}/v1/update-work-status/${projectId}`,
        {status: 'completed'},
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      setSuccessMessage('Project marked as complete');
      dispatch(getWorkByProjectId(projectId));
      dispatch(getProjectDetailsByProjectId(projectId));

      // Navigate to Assign Projects screen
      navigation.navigate('AssignProjects');
    } catch (error) {
      console.error(
        'Error completing project:',
        error.response?.data || error.message,
      );
    }
  };

  const handleEditWork = work => {
    navigation.navigate('Edit Work-History', {
      workDetails: work,
      assignProjectId: projectId,
    });
  };

  const confirmDelete = workId => {
    Alert.alert(
      'Are you sure?',
      'Do you really want to delete this work?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          onPress: () => handleDelete(workId),
          style: 'destructive',
        },
      ],
      {cancelable: true},
    );
  };

  const handleDelete = async workId => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      if (!projectId) {
        console.error('No assignProjectId found');
        return;
      }

      const response = await axios.delete(`${baseUrl}/v1/delete-work`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: {
          assignProjectId: projectId,
          workId,
        },
      });

      if (response?.data?.success) {
        console.log('Work deleted successfully');
        dispatch(getWorkByProjectId(projectId));
      } else {
        console.error('Error deleting work:', response?.data?.message);
      }
    } catch (error) {
      console.error(
        'Error deleting work:',
        error.response?.data || error.message,
      );
    }
  };

  const openImageModal = imageUri => {
    if (!imageUri) {
      console.error('Invalid image URI');
      return;
    }
    setSelectedImage(imageUri);
    setModalVisible(true);
  };
  if (workLoading || projectLoading) {
    return (
      <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
    );
  }

  return (
    <FlatList
      data={workHistory} // Work history data
      keyExtractor={(item, index) => item.id?.toString() || index.toString()} // Ensure unique keys
      ListHeaderComponent={() => (
        <>
          {/* Display Errors */}
          {workError && (
            <Text style={styles.errorText}>Error loading work history.</Text>
          )}
          {projectError && (
            <Text style={styles.errorText}>Error loading project details.</Text>
          )}

          {/* Project Details */}
          {projectDetails && (
            <View style={styles.projectCard}>
              <Text style={styles.projectTitle}>
                {projectDetails.project?.name}
              </Text>
              <View style={styles.row}>
                <Text style={styles.label}>Description :</Text>
                <Text style={styles.projectDescription}>
                  {projectDetails.project?.description}
                </Text>
              </View>
              {projectDetails.project?.materialId && (
                <Text style={styles.projectMaterial}>
                  <Text style={styles.label}>Material ID :</Text>{' '}
                  {projectDetails.project?.materialId}
                </Text>
              )}
              {projectDetails.project?.size && (
                <Text style={styles.projectSize}>
                  <Text style={styles.label}>Size :</Text>{' '}
                  {projectDetails.project?.size}
                </Text>
              )}
              <Text style={styles.projectDate}>
                <Text style={styles.label}>Start Date :</Text>{' '}
                {new Date(
                  projectDetails?.project?.startDate,
                ).toLocaleDateString()}
              </Text>
              <Text style={styles.projectDate}>
                <Text style={styles.label}>End Date :</Text>{' '}
                {new Date(
                  projectDetails?.project?.endDate,
                ).toLocaleDateString()}
              </Text>

              <View style={styles.pdfContainer}>
                <Text style={styles.label}>Project PDFs:</Text>
                {assignProject?.projectId?.projectPdf ? (
                  <TouchableOpacity
                    style={styles.pdfLinkContainer}
                    onPress={() => {
                      const pdfUrl = `${baseUrl}/uploads/projectPdf/${assignProject?.projectId?.projectPdf}`;
                      Linking.openURL(pdfUrl).catch(err =>
                        console.error('Failed to open PDF', err),
                      );
                    }}>
                    <Text style={styles.pdfLink}>Download PDF</Text>
                    <Image source={PDFImg} style={styles.pdfIcon} />
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.value}>No PDF available</Text>
                )}
              </View>

              <Text style={styles.labels}>Project Thumbnail :</Text>

              {assignProject?.projectId?.projectThumbnail?.length > 0 ? (
                <FlatList
                  data={assignProject.projectId.projectThumbnail}
                  horizontal
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item}) => (
                    <Image
                      source={{
                        uri: `${baseUrl}/uploads/projectThumbnail/${item}`,
                      }}
                      style={styles.projectThumbnail}
                    />
                  )}
                />
              ) : (
                <Text style={styles.noHistory}>No Thumbnails Available</Text>
              )}

              {isCompleted && (
                <Text style={styles.completedText}>Project Completed</Text>
              )}
            </View>
          )}

          {/* WORK HISTORY */}
          <Text style={styles.header}>Work History :</Text>
        </>
      )}
      renderItem={({item}) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Description :</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date :</Text>
            <Text style={styles.cardDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          {/* Three-dot button */}
          <View style={styles.threeDotContainer}>
            <TouchableOpacity onPress={() => toggleDropdown(item._id)}>
              <Text style={styles.threeDotButton}>⋮</Text>
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {dropdownVisible === item._id && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleEditWork(item)}>
                  <Text style={styles.dropdownText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => confirmDelete(item._id)}
                  style={styles.dropdownItem}>
                  <Text style={styles.dropdownTextRed}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {item.workThumbnail?.length > 0 && (
            <View style={styles.thumbnailContainer}>
              {item.workThumbnail.map((thumbnail, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() =>
                    openImageModal(
                      `${baseUrl}/uploads/workThumbnail/${thumbnail}`,
                    )
                  }>
                  <Image
                    source={{
                      uri: `${baseUrl}/uploads/workThumbnail/${thumbnail}`,
                    }}
                    style={styles.cardImage}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
      ListFooterComponent={() =>
        !isCompleted && assignProject?.status === 'pending' ? (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteProject}>
            <Text style={styles.buttonText}>Complete Project</Text>
          </TouchableOpacity>
        ) : null
      }
    />
  );
};
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  projectMaterial: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  pdfButton: {
    backgroundColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  pdfButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  projectSize: {
    fontSize: 16,
    color: '#333',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
    textAlign: 'center',
  },
  completedText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
    textAlign: 'center',
  },
  projectDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  projectDate: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  projectThumbnail: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  cardDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  cardDate: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  noHistory: {
    fontSize: 20,
    textAlign: 'center',
    color: '#888',
    marginVertical: 20,
  },
  pdfContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  pdfLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfLink: {
    color: 'blue',
    textDecorationLine: 'underline',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },
  pdfIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  value: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
  labels: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
    top: 10,
  },
  completeButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  threeDotContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  threeDotButton: {
    fontSize: 24,
    fontWeight: 'semiBold',
    color: '#333',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 35,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownTextRed: {
    fontSize: 16,
    color: 'red',
  },
});

export default WorkHistory;
