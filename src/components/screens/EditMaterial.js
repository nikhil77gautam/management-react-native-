import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {baseUrl} from '../utils/api';
import {fetchMaterials} from '../Redux/Slices/materialSlice';
import {useDispatch, useSelector} from 'react-redux';

const EditMaterial = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const route = useRoute();
  const {materialId} = route.params;
  const [materialData, setMaterialData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (materialId) {
      fetchMaterialData(materialId);
    } else {
      Alert.alert('Error', 'Invalid material ID.');
      navigation.goBack();
    }
  }, [materialId]);

  const fetchMaterialData = async materialId => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token)
        return Alert.alert('Error', 'No token found. Please login again.');

      const response = await axios.get(
        `${baseUrl}/v1/get-material/${materialId}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      if (response.status === 200 && response?.data?.material) {
        setMaterialData({
          name: response?.data?.material?.name || '',
          description: response?.data?.material?.description || '',
        });
      } else {
        throw new Error('Material data not found.');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to fetch material data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Retrieve token FIRST before using it
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Error', 'Authentication token is missing.');
        setIsSubmitting(false);
        return;
      }

      const response = await axios.put(
        `${baseUrl}/v1/update-material/${materialId}`,
        {
          name: materialData.name,
          description: materialData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Material updated successfully.');
        dispatch(fetchMaterials());
        navigation.goBack();
      } else {
        throw new Error('Failed to update material.');
      }
    } catch (error) {
      console.log('Error Response:', error?.response?.data || error);

      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to update material.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#007bff"
        style={styles.loadingIndicator}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Material</Text>

      <TextInput
        style={styles.input}
        placeholder="Material Name"
        value={materialData.name}
        onChangeText={text => setMaterialData(prev => ({...prev, name: text}))}
      />

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={materialData.description}
        onChangeText={text =>
          setMaterialData(prev => ({...prev, description: text}))
        }
        multiline
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSubmit}
        disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#f9f9f9'},
  title: {fontSize: 24, fontWeight: '600', marginBottom: 15},
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 20,
  },
  saveButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  saveButtonText: {fontSize: 18, color: '#fff'},
  loadingIndicator: {marginTop: 20},
});

export default EditMaterial;
