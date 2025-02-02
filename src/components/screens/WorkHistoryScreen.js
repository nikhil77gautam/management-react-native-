import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import {baseUrl} from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WorkHistory = ({route, navigation}) => {
  const {projectId} = route.params;
  const [workHistory, setWorkHistory] = useState([]);
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignProject, setAssignProject] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchWorkHistory = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        const workResponse = await axios.get(
          `${baseUrl}/v1/get-work/${projectId}`,
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );
        setWorkHistory(workResponse?.data?.works || []);
      } catch (error) {
        console.log('Error fetching work history:', error);
        alert('Error fetching data, please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchProjectDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        const projectResponse = await axios.get(
          `${baseUrl}/v1/get-project-details/${projectId}`,
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );
        console.log(projectResponse);
        setAssignProject(projectResponse?.data?.assignProject || null);
        setProjectDetails(projectResponse?.data?.project || null);
      } catch (error) {
        console.log('Error fetching project details:', error);
        alert('Error fetching project details, please try again later.');
      }
    };

    fetchWorkHistory();
    fetchProjectDetails();
  }, [projectId]);

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

      alert('Project marked as complete');
      setProjectDetails(prevState => ({
        ...prevState,
        status: 'completed',
      }));
    } catch (error) {
      console.log('Error completing project:', error);
    }
  };
  const openImageModal = imageUri => {
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          {projectDetails && (
            <View style={styles.projectCard}>
              <Text style={styles.projectTitle}>
                Project: {projectDetails.name}
              </Text>
              <Text style={styles.projectDescription}>
                Description: {projectDetails.description}
              </Text>
              <Text style={styles.projectDate}>
                Start Date:{' '}
                {new Date(projectDetails.startDate).toLocaleDateString()}
              </Text>
              <Text style={styles.projectDate}>
                End Date:{' '}
                {new Date(projectDetails.endDate).toLocaleDateString()}
              </Text>

              {/* Displaying project thumbnails */}
              {projectDetails.projectThumbnail?.length > 0 && (
                <ScrollView horizontal style={styles.thumbnailContainer}>
                  {projectDetails.projectThumbnail?.map((thumbnail, index) => (
                    <Image
                      key={index}
                      source={{
                        uri: `${baseUrl}/uploads/projectThumbnail/${thumbnail}`,
                      }}
                      style={styles.projectThumbnail}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          <Text style={styles.header}>Work History</Text>
          {workHistory.length > 0 ? (
            workHistory.map((work, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardDescription}>{work.description}</Text>
                  <Text style={styles.cardDate}>
                    {new Date(work.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                {work?.workThumbnail?.length > 0 &&
                  work?.workThumbnail?.map((thumbnail, idx) => (
                    <Image
                      key={idx}
                      source={{
                        uri: `${baseUrl}/uploads/workThumbnail/${thumbnail}`,
                      }}
                      style={styles.cardImage}
                    />
                  ))}
              </View>
            ))
          ) : (
            <Text style={styles.noHistory}>No work history found.</Text>
          )}

          {assignProject?.status === 'pending' && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleCompleteProject}>
              <Text style={styles.buttonText}>Complete Project</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  thumbnailContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  projectThumbnail: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
  projectCard: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007bff',
  },
  projectDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  projectStatus: {
    fontSize: 14,
    color: '#28a745',
  },
  card: {
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  cardDate: {
    fontSize: 12,
    color: '#777',
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  noHistory: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    marginVertical: 20,
  },
  completeButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

export default WorkHistory;
