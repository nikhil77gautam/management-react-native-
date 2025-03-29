import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {baseUrl} from '../utils/api';

const EditWorkHistory = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {workDetails, assignProjectId} = route.params;

  const [description, setDescription] = useState(workDetails.description || '');
  const [image, setImage] = useState(workDetails?.workThumbnail || []);

  console.log(`${baseUrl}/uploads/workThumbnail/${image}`);
  const handleUpdateWork = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      const formData = new FormData();
      formData.append('workId', workDetails?._id);
      formData.append('assignProjectId', assignProjectId);
      formData.append('description', description);

      if (Array.isArray(image)) {
        image.forEach((img, index) => {
          formData.append('workThumbnail', {
            uri: img.uri,
            type: img.type || 'image/jpeg',
            name: img.fileName || `workThumbnail${index}.jpg`,
          });
        });
      }

      const response = await axios.put(
        `${baseUrl}/v1/update-work/:workThumbnail`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      if (response.data.success) {
        Alert.alert('Success', 'Work updated successfully');
        navigation.navigate('Work History');
      }
    } catch (error) {
      console.log(error);
      Alert.alert(error.response.data.message || 'error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.buttonTextt}>Edit Work History</Text>
      <Text style={styles.label}>Description :</Text>

      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />

      <View>
        <Text style={styles.labell}>Work Thumbnail :</Text>
        {image.length > 0 ? (
          image.map((img, index) => (
            <Image
              key={index}
              source={{uri: `${baseUrl}/uploads/workThumbnail/${img}`}}
              style={styles.image}
            />
          ))
        ) : (
          <Text>No Image Available</Text>
        )}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleUpdateWork}>
        <Text style={styles.buttonText}>Update Work History</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#fff'},
  label: {fontSize: 16, fontWeight: 'semiBold', marginTop: 20, marginBottom: 5},
  labell: {fontSize: 16, fontWeight: 'bold', marginBottom: 5},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  buttonTextt: {
    color: 'black',
    textAlign: 'center',
    fontSize: 20,
    marginTop: 20,
    fontWeight: 'bold',
  },
});

export default EditWorkHistory;
