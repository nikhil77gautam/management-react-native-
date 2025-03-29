import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {fetchMaterials, removeMaterial} from '../Redux/Slices/materialSlice';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseUrl} from '../utils/api';

const MaterialScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {materials, loading} = useSelector(state => state.materials);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);

  useEffect(() => {
    dispatch(fetchMaterials());
  }, [dispatch]);

  const handleDelete = async materialId => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this material?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'OK',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(
                `${baseUrl}/v1/delete-material/${materialId}`,
                {
                  headers: {Authorization: `Bearer ${token}`},
                },
              );

              dispatch(removeMaterial(materialId));
              Alert.alert('Success', 'Material deleted successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete material.');
            }
          },
        },
      ],
    );
  };

  const toggleDropdown = materialId => {
    setSelectedMaterialId(prevId =>
      prevId === materialId ? null : materialId,
    );
  };

  const renderItem = ({item}) => (
    <View
      style={[
        styles.materialItem,
        selectedMaterialId === item._id && {zIndex: 10},
      ]}>
      <Text style={styles.materialName}>{item.name}</Text>

      <TouchableOpacity onPress={() => toggleDropdown(item._id)}>
        <Text style={styles.icon}>⋮</Text>
      </TouchableOpacity>

      {selectedMaterialId === item._id && (
        <View style={styles.dropdownContainer}>
          <View style={styles.dropdown}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Edit Material', {materialId: item._id})
              }>
              <Text style={styles.dropdownItem}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item._id)}>
              <Text style={styles.dropdownItemm}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Materials List :</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={styles.loadingIndicator}
        />
      ) : materials.length === 0 ? (
        <Text style={styles.noMaterialsText}>No materials found</Text>
      ) : (
        <FlatList
          data={materials}
          keyExtractor={item => String(item._id)}
          renderItem={renderItem}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('Add Material')}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 15, backgroundColor: '#f9f9f9'},
  title: {fontSize: 24, fontWeight: '600', marginBottom: 15},
  loadingIndicator: {marginTop: 20},
  noMaterialsText: {fontSize: 18, textAlign: 'center', color: 'gray'},
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 20,
    // elevation: 3,
    zIndex: 1,
  },
  materialName: {fontSize: 18, flex: 1},
  icon: {fontSize: 30, marginLeft: 10, color: '#000'},
  dropdownContainer: {
    position: 'absolute',
    top: 50,
    right: 10,
    zIndex: 1000,
    elevation: 20,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    elevation: 10,
    width: 100,
  },
  dropdownItem: {padding: 10, fontSize: 16, color: '#333'},
  dropdownItemm: {padding: 10, fontSize: 16, color: 'red'},
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#000',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
  addButtonText: {fontSize: 30, color: '#fff'},
});

export default MaterialScreen;
