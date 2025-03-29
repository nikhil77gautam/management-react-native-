import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getProjectByProjectId} from '../Redux/Slices/editProjectScreenSlice';
import {useNavigation, useRoute} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  View,
  TextInput,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker';
import {baseUrl} from '../utils/api';
import UploadImage from '../../Image/image.png';

const EditProjectScreen = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {projectId} = route.params;

  const project = useSelector(state => state.project.project);

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [selectMaterial, setSelectMaterial] = useState('');

  const [size, setSize] = useState('');
  const [materials, setMaterials] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dispatch(getProjectByProjectId(projectId));
    fetchMaterials();
  }, [dispatch, projectId]);

  useEffect(() => {
    if (project && project._id === projectId) {
      setName(project.name || '');
      setStartDate(
        project.startDate ? moment(project.startDate).format('YYYY-MM-DD') : '',
      );
      setEndDate(
        project.endDate ? moment(project.endDate).format('YYYY-MM-DD') : '',
      );
      setDescription(project.description || '');
      setSelectMaterial(project.materialId._id || '');
      setSize(project.size || '');
      // setThumbnails(
      //   Array.isArray(project.projectThumbnail) ? project.projectThumbnail : [],
      // );
      setPdfFiles(project.projectPdf || '');
    }
  }, [project, projectId]);

  const fetchMaterials = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token)
        return Alert.alert('Error', 'No token found. Please login again.');

      const response = await axios.get(`${baseUrl}/v1/get-material`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      setMaterials(response.data.materials || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch materials.');
      console.error('Material fetch error:', error);
    }
  };

  const handleImagePicker = async () => {
    const options = {mediaType: 'photo', quality: 1, selectionLimit: 5};
    const response = await launchImageLibrary(options);

    if (response.assets) {
      setThumbnails(prev => [...prev, ...response.assets]);
    }
  };

  const handleRemoveImage = index => {
    setThumbnails(prev => prev.filter((_, i) => i !== index));
  };

  const handlePdfPicker = async () => {
    const options = {
      mediaType: 'mixed',
      // type: ['application/pdf'], // Only allows PDFs
    };
    const response = await launchImageLibrary(options);

    if (response.assets && response.assets.length > 0) {
      setPdfFiles(response.assets[0]);
    }
  };

  const handleUpdateProject = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'User authentication failed.');
        return;
      }
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('materialId', selectMaterial);
      formData.append('size', size);
      thumbnails.forEach((image, index) => {
        formData.append('projectThumbnail', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || `thumbnail${index}.jpg`,
        });
      });
      if (pdfFiles) {
        formData.append('projectPdf', {
          uri: pdfFiles.uri,
          type: 'image/jpeg',
          // type: 'application/pdf',
          name: pdfFiles.fileName || 'document.pdf',
        });
      }
      const res = await axios.put(
        `${baseUrl}/v1/update-project/:projectThumbnail/:projectPdf/${projectId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (res.data.success) {
        Alert.alert('Success', 'Project updated successfully.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error updating project:', error);
      Alert.alert('Error', 'Failed to update project.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScrollView style={styles.inputContainer}>
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
        <TextInput
          style={styles.input}
          placeholder="Size"
          value={size}
          onChangeText={setSize}
        />
        <Picker
          selectedValue={selectMaterial}
          onValueChange={setSelectMaterial}
          style={styles.picker}>
          <Picker.Item label="-- Select Material --" value={null} />
          {materials.map(material => (
            <Picker.Item
              key={material._id}
              label={material.name}
              value={material._id}
            />
          ))}
        </Picker>

        <TouchableOpacity style={styles.pdfLabel} onPress={handlePdfPicker}>
          <Text style={styles.pdf}>Upload PDF</Text>

          {pdfFiles && (
            <View style={styles.fileContainer}>
              <Image
                source={require('../../Image/pdf.png')}
                style={styles.pdfIcon}
              />
              <Text style={styles.fileName}>
                {pdfFiles.fileName || pdfFiles}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonn} onPress={handleImagePicker}>
          <View style={styles.statusUploadContainer}>
            <Image source={UploadImage} style={styles.statusUploadImage} />
            <Text style={styles.statusUploadText}>Upload Image</Text>
          </View>
        </TouchableOpacity>

        {thumbnails.length > 0 && (
          <ScrollView horizontal style={styles.thumbnailContainer}>
            {thumbnails.map((image, index) => {
              // Check if image is a full URI or just a filename
              const imageUri = image.uri
                ? image.uri
                : `${baseUrl}/uploads/projectThumbnail/${image}`;

              return (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{uri: imageUri}} style={styles.thumbnail} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveImage(index)}>
                    <Text style={styles.removeButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}

        {isLoading && <ActivityIndicator size="large" color="#007bff" />}
        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdateProject}>
          <Text style={styles.buttonTextt}>Update Project</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#f9f9f9'},
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonTextt: {color: '#fff', fontSize: 16},
  statusUploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  statusUploadImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginRight: 10,
  },
  statusUploadText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlignVertical: 'center',
    lineHeight: 30,
  },
  buttonn: {
    padding: 15,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  picker: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 10,
    paddingLeft: 10,
    fontSize: 16,
  },

  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  pdf: {
    color: 'blue',
    fontSize: 18,
  },

  pdfLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    justifyContent: 'space-between',
    borderRadius: 20,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
  },

  pdfIcon: {
    width: 24,
    height: 24,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },

  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 20,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default EditProjectScreen;
