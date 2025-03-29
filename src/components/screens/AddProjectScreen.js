import React, {useState, useEffect} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseUrl} from '../utils/api';
import {launchImageLibrary} from 'react-native-image-picker';
import {Picker} from '@react-native-picker/picker';
import {fetchProjects} from '../Redux/Slices/projectsSlice';
import {useDispatch} from 'react-redux';
import UploadImage from '../../Image/image.png';

const AddProjectScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [thumbnails, setThumbnails] = useState([]);
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    fetchMaterials();
    dispatch(fetchProjects());
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
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
      setPdfFile(response.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!name || !startDate || !endDate || !description || !size) {
      return Alert.alert(
        'Validation Error',
        'Please fill all the required fields.',
      );
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token)
        return Alert.alert('Error', 'No token found. Please login again.');

      const formData = new FormData();
      formData.append('name', name);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('description', description);
      formData.append('size', size);
      if (selectedMaterial) formData.append('materialId', selectedMaterial._id);

      thumbnails.forEach((image, index) => {
        formData.append('projectThumbnail', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || `thumbnail${index}.jpg`,
        });
      });

      if (pdfFile) {
        formData.append('projectPdf', {
          uri: pdfFile.uri,
          type: 'image/jpeg',
          // type: 'application/pdf',
          name: pdfFile.fileName || 'document.pdf',
        });
      }

      const res = await axios.post(
        `${baseUrl}/v1/add-project/:projectThumbnail/:projectPdf`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (res.data.success) {
        Alert.alert('Success', 'Project added successfully!');
        dispatch(fetchProjects());
        navigation.navigate('All Projects');
      }
    } catch (error) {
      console.error('Project submission error:', error);
      Alert.alert(error.res.data.message);
    } finally {
      setLoading(false);
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
          selectedValue={selectedMaterial}
          onValueChange={setSelectedMaterial}
          style={styles.picker}>
          <Picker.Item label="-- Select Material --" value={null} />
          {materials.map(material => (
            <Picker.Item
              key={material._id}
              label={material.name}
              value={material}
            />
          ))}
        </Picker>

        <TouchableOpacity style={styles.pdfLabel} onPress={handlePdfPicker}>
          <Text style={styles.pdf}>Upload PDF</Text>

          {pdfFile && (
            <View style={styles.fileContainer}>
              <Image
                source={require('../../Image/pdf.png')}
                style={styles.pdfIcon}
              />
              <Text style={styles.fileName}>
                {pdfFile.fileName || 'PDF Selected'}
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
            {thumbnails.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{uri: image.uri}} style={styles.thumbnail} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveImage(index)}>
                  <Text style={styles.removeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {loading && <ActivityIndicator size="large" color="#007bff" />}
        <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
          <Text style={styles.buttonTextt}>Add Project</Text>
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
  addButton: {
    backgroundColor: 'black',
    padding: 10,
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

export default AddProjectScreen;
