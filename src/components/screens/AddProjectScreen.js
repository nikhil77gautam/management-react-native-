import React, {useState} from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import {baseUrl} from '../utils/api';
import {launchImageLibrary} from 'react-native-image-picker';

const AddProjectScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [thumbnail, setThumbnail] = useState([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImagePicker = () => {
    launchImageLibrary({mediaType: 'photo', multiple: true}, response => {
      if (response.didCancel) {
        console.log('User canceled image picker');
      } else if (response.errorMessage) {
        console.error('ImagePicker Error: ', response.errorMessage);
      } else {
        setThumbnail(response.assets);
      }
    });
  };

  const handleImageRemove = index => {
    const newThumbnailList = thumbnail.filter((_, idx) => idx !== index);
    setThumbnail(newThumbnailList);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Check if all fields are filled
      if (
        !name ||
        !startDate ||
        !endDate ||
        !thumbnail.length ||
        !description
      ) {
        throw new Error('All fields are required.');
      }

      // Validate start and end dates using moment.js
      const formattedStartDate = moment(startDate, 'YYYY-MM-DD', true);
      const formattedEndDate = moment(endDate, 'YYYY-MM-DD', true);

      if (!formattedStartDate.isValid() || !formattedEndDate.isValid()) {
        throw new Error("Please provide valid dates in 'YYYY-MM-DD' format.");
      }

      if (formattedStartDate.isAfter(formattedEndDate)) {
        throw new Error('Start date cannot be later than end date.');
      }

      // Prepare project data
      const projectData = {
        name,
        startDate: formattedStartDate.format('YYYY-MM-DD'),
        endDate: formattedEndDate.format('YYYY-MM-DD'),
        description,
      };

      // Get token from AsyncStorage for authentication
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please login again.');
      }

      // Prepare FormData to send images and data together
      const formData = new FormData();
      formData.append('name', projectData.name);
      formData.append('startDate', projectData.startDate);
      formData.append('endDate', projectData.endDate);
      formData.append('description', projectData.description);

      // Append images to FormData
      if (thumbnail && thumbnail.length > 0) {
        thumbnail.forEach((file, index) => {
          const fileExtension = file.uri.split('.').pop(); // Get the file extension
          const fileName = `thumbnail_${index + 1}.${fileExtension}`;

          formData.append('projectThumbnail', {
            uri: file.uri,
            type: file.type, // mime type
            name: fileName,
          });
        });
      }

      // API call to save project
      const response = await axios.post(
        `${baseUrl}/v1/add-project/:projectThumbnail`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      // Check if response is successful
      if (response.status !== 201) {
        throw new Error('Failed to add project. Please try again.');
      }

      // Show success message
      Alert.alert('Success', 'Project added successfully!');

      // Reset form fields
      setName('');
      setStartDate('');
      setEndDate('');
      setThumbnail([]);
      setDescription('');

      // Navigate to All Projects screen
      navigation.navigate('AllProjects');
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Project</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Project Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Start Date (YYYY-MM-DD)"
          value={startDate}
          onChangeText={setStartDate}
        />
        <TextInput
          style={styles.input}
          placeholder="End Date (YYYY-MM-DD)"
          value={endDate}
          onChangeText={setEndDate}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity
          style={styles.imagePickerButton}
          onPress={handleImagePicker}>
          <Text style={styles.buttonText}>
            {thumbnail.length
              ? `Change Thumbnails (${thumbnail.length} selected)`
              : 'Upload Thumbnails'}
          </Text>
        </TouchableOpacity>

        {thumbnail.length > 0 && (
          <View style={styles.thumbnailContainer}>
            {thumbnail.map((file, index) => (
              <View key={index} style={styles.thumbnail}>
                <Image source={{uri: file.uri}} style={styles.thumbnailImage} />
                <Text style={styles.thumbnailName}>
                  {file.fileName || `Image ${index + 1}`}
                </Text>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleImageRemove(index)}>
                  <Text style={styles.cancelButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Adding Project...' : 'Add Project'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  imagePickerButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#b0c4de',
  },
  thumbnailContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  thumbnail: {
    marginRight: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 5,
  },
  thumbnailName: {
    fontSize: 12,
    color: '#555',
  },
  cancelButton: {
    backgroundColor: 'red',
    borderRadius: 12,
    padding: 5,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AddProjectScreen;
