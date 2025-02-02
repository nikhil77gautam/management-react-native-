import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {baseUrl} from '../utils/api';

const ViewProjectScreen = () => {
  const route = useRoute();
  const {projectId} = route.params;
  const [project, setProject] = useState(null);
  const [assignProject, setAssignProject] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No token found. Please login again.');
          return;
        }
        const response = await axios.get(
          `${baseUrl}/v1/get-project/${projectId}`,
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );
        setProject(response.data.project);
      } catch (error) {
        Alert.alert('Error', 'Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjectDetails();
  }, [projectId]);

  useEffect(() => {
    const fetchAssignProjectDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No token found. Please login again.');
          return;
        }
        const response = await axios.get(
          `${baseUrl}/v1/get-assign-projectid/${projectId}`,
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );
        setAssignProject(response.data.projects);
      } catch (error) {
        Alert.alert('Error', 'Failed to load assigned projects.');
      }
    };
    fetchAssignProjectDetails();
  }, [projectId]);

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
    );
  }

  if (!project) {
    return <Text style={styles.errorText}>Project not found.</Text>;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <ScrollView horizontal style={styles.thumbnailContainer}>
          {project.projectThumbnail?.length > 0 ? (
            project.projectThumbnail.map((img, index) => (
              <Image
                key={index}
                source={{uri: `${baseUrl}/uploads/projectThumbnail/${img}`}}
                style={styles.thumbnail}
              />
            ))
          ) : (
            <Image
              source={{uri: 'https://via.placeholder.com/150'}}
              style={styles.thumbnail}
            />
          )}
        </ScrollView>

        <Text style={styles.heading}>{project.name || 'No Title'}</Text>
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.value}>
            {project.description || 'No description available'}
          </Text>
          <Text style={styles.label}>Start Date:</Text>
          <Text style={styles.value}>
            {new Date(project.startDate).toLocaleDateString() || 'N/A'}
          </Text>
          <Text style={styles.label}>End Date:</Text>
          <Text style={styles.value}>
            {new Date(project.endDate).toLocaleDateString() || 'N/A'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>View Assigned Users</Text>
        </TouchableOpacity>

        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Work Reports:</Text>
          {assignProject.length > 0 && assignProject[0].works?.length > 0 ? (
            assignProject[0].works.map((work, index) => (
              <View key={index} style={styles.workReportContainer}>
                <Text style={styles.label}>Report {index + 1}:</Text>
                <Text style={styles.value}>
                  Name: {work?.userId?.name || ''}
                </Text>
                <Text style={styles.value}>
                  Description: {work?.description || 'No description'}
                </Text>
                <Text style={styles.value}>
                  Date:{' '}
                  {new Date(work?.createdAt).toLocaleDateString() ||
                    'N/A' ||
                    ''}
                </Text>

                {work?.workThumbnail?.length > 0 ? (
                  work?.workThumbnail.map((img, imgIndex) => (
                    <Image
                      key={imgIndex}
                      source={{uri: `${baseUrl}/uploads/workThumbnail/${img}`}}
                      style={styles.workImage}
                      onError={e =>
                        console.log('Image Load Error:', e.nativeEvent.error)
                      }
                    />
                  ))
                ) : (
                  <Text style={styles.noImageText}>No Image Available</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noUsersText}>No work reports available.</Text>
          )}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assigned Users</Text>
            <FlatList
              data={assignProject.length > 0 ? assignProject[0].userId : []}
              keyExtractor={item => item._id}
              renderItem={({item}) => (
                <View style={styles.userItem}>
                  <Image
                    source={{
                      uri: item.profileThumbnail
                        ? `${baseUrl}/uploads/profileThumbnail/${item.profileThumbnail}`
                        : 'https://via.placeholder.com/100',
                    }}
                    style={styles.profileImage}
                  />
                  <Text style={styles.userName}>{item.name}</Text>
                </View>
              )}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f9f9f9'},
  scrollView: {padding: 20},
  thumbnailContainer: {flexDirection: 'row', marginBottom: 15},
  thumbnail: {width: 120, height: 120, marginRight: 10, borderRadius: 8},
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  workReportContainer: {
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  workImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginVertical: 5,
  },
  noImageText: {
    fontSize: 14,
    color: '#777',
  },

  label: {fontWeight: 'bold', fontSize: 16, marginTop: 5},
  value: {fontSize: 15, color: '#333'},
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {color: '#fff', fontSize: 16},
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  userItem: {flexDirection: 'row', alignItems: 'center', marginVertical: 5},
  profileImage: {width: 50, height: 50, borderRadius: 25, marginRight: 10},
  userName: {fontSize: 16},
});

export default ViewProjectScreen;
