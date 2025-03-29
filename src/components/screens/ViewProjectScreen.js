import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  Linking,
  Pressable,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import {getProjectByProjectId} from '../Redux/Slices/projectBYprojectIdSlice';
import {getAssignProjectByProjectId} from '../Redux/Slices/assignProjectByProjectIdSlice';
import { baseUrl } from '../utils/api';

const ViewProjectScreen = () => {
  const route = useRoute();
  const {projectId} = route.params;
  const dispatch = useDispatch();

  const {project, loading: projectLoading} = useSelector(
    state => state.projectByProjectId,
  );
  const {
    assignedUsers,
    loading: assignedLoading,
    error: assignedError,
  } = useSelector(state => state.assignProjectByProjectId);

  const [modalVisible, setModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    dispatch(getProjectByProjectId(projectId));
    dispatch(getAssignProjectByProjectId(projectId));
  }, [dispatch, projectId]);

  if (projectLoading) {
    return (
      <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
    );
  }

  if (!project) {
    return <Text style={styles.errorText}>Project not found.</Text>;
  }

  const handleDownloadPDF = pdfUrl => {
    Linking.openURL(pdfUrl);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.card}>
          <Text style={styles.heading}>{project.name || 'No Title'}</Text>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.value}>
            {project.description || 'No description available'}
          </Text>
          <Text style={styles.label}>Start Date:</Text>
          <Text style={styles.value}>
            {project.startDate
              ? moment(project.startDate).format('YYYY-MM-DD')
              : 'No start date available'}
          </Text>
          <Text style={styles.label}>End Date:</Text>
          <Text style={styles.value}>
            {project.endDate
              ? moment(project.endDate).format('YYYY-MM-DD')
              : 'No end date available'}
          </Text>
          {/* Project Images */}
          <Text style={styles.label}>Project Images:</Text>
          {project.projectThumbnail && project.projectThumbnail.length > 0 ? (
            <ScrollView horizontal style={styles.imageContainer}>
              {project.projectThumbnail.map((projectThumbnail, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedImage(projectThumbnail);
                    setImageModalVisible(true);
                  }}>
                  <Image
                    source={{uri: projectThumbnail}}
                    style={styles.projectImage}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.value}>No images available</Text>
          )}
          {/* Project PDFs */}
          <Text style={styles.label}>Project PDFs:</Text>
       

          {project.projectPdf ? (
           <TouchableOpacity
           onPress={() => {
             const pdfUrl = `${baseUrl}/uploads/projectPdf/${project.projectPdf}`;
             Linking.openURL(pdfUrl).catch(err => console.error("Failed to open PDF", err));
           }}>
           <Text style={styles.pdfLink}>Download PDF</Text>
         </TouchableOpacity>
          ) : (
            <Text style={styles.value}>No PDF available</Text>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>View Assigned Users</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assigned Users</Text>
            {assignedLoading ? (
              <ActivityIndicator size="large" color="#007BFF" />
            ) : assignedError ? (
              <Text style={styles.errorText}>{assignedError}</Text>
            ) : (
              <FlatList
                data={assignedUsers.length > 0 ? assignedUsers[0].userId : []}
                keyExtractor={item => item._id}
                renderItem={({item}) => (
                  <View style={styles.userItem}>
                    <Text style={styles.userName}>{item.name}</Text>
                  </View>
                )}
              />
            )}
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
  container: {flex: 1, backgroundColor: '#f4f4f4', padding: 15},
  scrollView: {paddingBottom: 20},
  card: {backgroundColor: '#fff', padding: 20, borderRadius: 10},
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  label: {fontWeight: 'bold', fontSize: 16, marginTop: 10},
  value: {fontSize: 15},
  button: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  projectImage: {width: 100, height: 100, marginRight: 10, borderRadius: 5},
  pdfLink: {color: 'blue', marginTop: 5},
  imageModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  fullScreenImage: {width: '90%', height: '80%'},
});

export default ViewProjectScreen;
