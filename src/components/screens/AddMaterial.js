import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {fetchMaterials, removeMaterial} from '../Redux/Slices/materialSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseUrl} from '../utils/api';

const AddMaterial = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchMaterials());
  }, [dispatch]);

  const handleAddMaterial = async () => {
    if (!name || !description) {
      return Alert.alert('Error', 'Please fill in both fields.');
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token)
        return Alert.alert('Error', 'No token found. Please login again.');

      const response = await axios.post(
        `${baseUrl}/v1/add-material`,
        {name, description},
        {headers: {Authorization: `Bearer ${token}`}},
      );

      if (response.data.success) {
        Alert.alert('Success', 'Material added successfully!');
        dispatch(fetchMaterials());
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to add material.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add material.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Material</Text>

      <TextInput
        style={styles.input}
        placeholder="Material Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddMaterial}>
        {loading ? (
          <Text style={styles.addButtonText}>Adding...</Text>
        ) : (
          <Text style={styles.addButtonText}>Add Material</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: 'black',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    color: '#fff',
  
  },
});

export default AddMaterial;
