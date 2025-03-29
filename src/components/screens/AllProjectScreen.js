import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {fetchProjects, removeProject} from '../Redux/Slices/projectsSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {baseUrl} from '../utils/api';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const AllProjectsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {projects, loading, error} = useSelector(state => state.projects);
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    maxHeight: 150,
  });
  const buttonRefs = useRef({});

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleView = projectId => {
    navigation.navigate('View Project', {projectId});
    setDropdownVisible(null);
  };

  const handleEdit = projectId => {
    navigation.navigate('Edit Project', {projectId});
    setDropdownVisible(null);
  };

  const handleDelete = projectId => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this project?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(`${baseUrl}/v1/delete-project/${projectId}`, {
                headers: {Authorization: `Bearer ${token}`},
              });
              Alert.alert('Success', 'Project deleted successfully.');
              dispatch(removeProject(projectId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete project.');
            }
          },
        },
      ],
    );
    setDropdownVisible(null);
  };

  const handleAssignTo = projectId => {
    navigation.navigate('Assign Project', {projectId});
    setDropdownVisible(null);
  };

  const toggleDropdown = id => {
    if (dropdownVisible === id) {
      setDropdownVisible(null);
    } else {
      setDropdownVisible(id);
      buttonRefs.current[id]?.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({
          top: pageY + height - 80,
          left: pageX - 90,
        });
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => setDropdownVisible(null)}>
      <View style={{flex: 1}}>
        <Text style={styles.heading}>All Projects :</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <FlatList
            data={projects}
            keyExtractor={item => item?._id?.toString()}
            renderItem={({item}) => (
              <View style={styles.projectCard}>
                <Text style={styles.projectName}>{item.name}</Text>
                <TouchableOpacity
                  ref={ref => (buttonRefs.current[item._id] = ref)}
                  onPress={() => toggleDropdown(item._id)}
                  style={styles.dropdownButtonContainer}>
                  <Text style={styles.dropdownButton}>⋮</Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={{paddingBottom: 100}}
            showsVerticalScrollIndicator={false}
          />
        )}

        {dropdownVisible && (
          <View
            style={[
              styles.dropdown,
              {top: dropdownPosition.top, left: dropdownPosition.left},
            ]}>
            <TouchableOpacity onPress={() => handleView(dropdownVisible)}>
              <Text style={styles.dropdownItem}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEdit(dropdownVisible)}>
              <Text style={styles.dropdownItem}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(dropdownVisible)}>
              <Text style={[styles.dropdownItem, styles.deleteOption]}>
                Delete
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleAssignTo(dropdownVisible)}>
              <Text style={styles.dropdownItem}>Assign To</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Add Project')}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  projectCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 5,
    elevation: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dropdownButton:{
    fontSize: 30,
  },
  dropdownItem: {
    padding: 5,
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
  },
  deleteOption: {
    color: 'red',
    fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: 'white',
    padding: 10,
    elevation: 10,
    borderRadius: 10,
    marginRight: 25,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'black',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AllProjectsScreen;
