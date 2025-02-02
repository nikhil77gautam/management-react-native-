import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import moment from 'moment'; // Import Moment.js
import { launchImageLibrary } from 'react-native-image-picker';
import { baseUrl } from '../utils/api';

const EditProjectScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { projectId } = route.params;

  // States for project details
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [thumbnails, setThumbnails] = useState([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch project details when the screen is loaded
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'User authentication failed.');
          return;
        }

        const response = await axios.get(`${baseUrl}/v1/get-project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const project = response?.data?.project;
        setName(project?.name || '');
        setStartDate(project?.startDate ? moment(project.startDate).format('YYYY-MM-DD') : '');
        setEndDate(project?.endDate ? moment(project.endDate).format('YYYY-MM-DD') : '');
        setThumbnails(Array.isArray(project?.thumbnails) ? project.thumbnails : []);
        setDescription(project?.description || '');
      } catch (error) {
        console.error('Error fetching project details:', error);
        Alert.alert('Error', 'Failed to fetch project details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  // Function to handle selecting multiple images
  const handleAddThumbnails = () => {
    launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 10 },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorMessage) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets) {
          const selectedImages = response.assets.map((asset) => asset.uri);
          setThumbnails((prev) => [...prev, ...selectedImages]); // Append new images
        }
      }
    );
  };

  // Function to remove a selected thumbnail
  const handleRemoveThumbnail = (index) => {
    setThumbnails((prev) => prev.filter((_, i) => i !== index));
  };

  // Update project function
  const handleUpdateProject = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'User authentication failed.');
        return;
      }

      const formattedStartDate = moment(startDate, 'YYYY-MM-DD', true).isValid()
        ? moment(startDate).format('YYYY-MM-DD')
        : moment().format('YYYY-MM-DD'); // Fallback to today's date if invalid

      const formattedEndDate = moment(endDate, 'YYYY-MM-DD', true).isValid()
        ? moment(endDate).format('YYYY-MM-DD')
        : moment().format('YYYY-MM-DD');

      // Create FormData object
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('startDate', formattedStartDate);
      formData.append('endDate', formattedEndDate);

      // Append all thumbnails
      thumbnails.forEach((thumbnailUri, index) => {
        const fileExtension = thumbnailUri.split('.').pop(); 
        formData.append('projectThumbnail', {
          uri: thumbnailUri,
          name: `thumbnail_${index + 1}.${fileExtension}`,
          type: `image/${fileExtension}`,
        });
      });

      await axios.put(`${baseUrl}/v1/update-project/${projectId}/projectThumbnail`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Project updated successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating project:', error);
      Alert.alert('Error', 'Failed to update project.');
    }
  };

  if (loading) {
    return <Text style={styles.loadingText}>Loading project details...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Edit Project</Text>

      {/* Project Name */}
      <TextInput
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholder="Project Name"
      />

      {/* Start Date */}
      <TextInput
        value={startDate}
        onChangeText={setStartDate}
        style={styles.input}
        placeholder="Start Date (YYYY-MM-DD)"
      />

      {/* End Date */}
      <TextInput
        value={endDate}
        onChangeText={setEndDate}
        style={styles.input}
        placeholder="End Date (YYYY-MM-DD)"
      />

      {/* Thumbnails Section */}
      <Text style={styles.label}>Thumbnails</Text>
      <TouchableOpacity onPress={handleAddThumbnails} style={styles.uploadButton}>
        <Text style={styles.uploadButtonText}>+ Upload Thumbnails</Text>
      </TouchableOpacity>

      {/* Display selected images */}
      <View style={styles.thumbnailContainer}>
        {thumbnails.map((thumbnail, index) => (
          <View key={index} style={styles.thumbnailWrapper}>
            <Image source={{ uri: thumbnail }} style={styles.thumbnailImage} />
            <TouchableOpacity onPress={() => handleRemoveThumbnail(index)} style={styles.removeButton}>
              <Text style={styles.removeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        style={styles.descriptionInput}
        placeholder="Enter project description"
        multiline
      />

      {/* Save Button */}
      <TouchableOpacity onPress={handleUpdateProject} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionInput: {
    height: 120,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  thumbnailContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  thumbnailWrapper: {
    margin: 5,
    position: 'relative',
  },
  thumbnailImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 5,
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
    borderRadius: 50,
    padding: 5,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EditProjectScreen;
