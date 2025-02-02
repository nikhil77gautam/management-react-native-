import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {baseUrl} from '../utils/api';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SCREEN_HEIGHT = Dimensions.get('window').height; // Get screen height

const AllProjectsScreen = () => {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    maxHeight: 150,
  });
  const buttonRefs = useRef({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No token found. Please login again.');
          return;
        }

        const response = await axios.get(`${baseUrl}/v1/get-project`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        setProjects(response.data.projects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        Alert.alert('Error', 'Failed to fetch projects.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleView = projectId => {
    navigation.navigate('ViewProject', {projectId});
    setDropdownVisible(null);
  };

  const handleEdit = projectId => {
    navigation.navigate('EditProject', {projectId});
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
              setProjects(prevProjects =>
                prevProjects.filter(project => project._id !== projectId),
              );
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
    navigation.navigate('AssignProject', {projectId});
    setDropdownVisible(null);
  };

  const toggleDropdown = id => {
    if (dropdownVisible === id) {
      setDropdownVisible(null);
    } else {
      setDropdownVisible(id);
      buttonRefs.current[id]?.measure((fx, fy, width, height, px, py) => {
        const dropdownHeight = 200; // Estimated dropdown height
        const maxHeight = Math.min(dropdownHeight, SCREEN_HEIGHT - py - 20); // Prevent overflow

        setDropdownPosition({top: py - 25, left: px - 100, maxHeight});
      });
    }
  };

  const handleOutsidePress = () => {
    setDropdownVisible(null);
  };

  if (loading) {
    return <Text style={styles.loadingText}>Loading projects...</Text>;
  }

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        showsVerticalScrollIndicator={true}>
        <View style={styles.container}>
          <Text style={styles.heading}>All Projects</Text>
          <FlatList
            data={projects}
            keyExtractor={item => item?._id?.toString()}
            renderItem={({item}) => (
              <View style={styles.projectCard}>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>{item.name}</Text>
                </View>

                {/* Three-dot Menu Button */}
                <TouchableOpacity
                  ref={ref => (buttonRefs.current[item._id] = ref)}
                  onPress={() => toggleDropdown(item._id)}
                  style={styles.dropdownButtonContainer}>
                  <Text style={styles.dropdownButton}>⋮</Text>
                </TouchableOpacity>
              </View>
            )}
            ListFooterComponent={<View style={{height: 80}} />} // Adds extra space at the bottom
          />

          {/* Dropdown Menu Overlay */}
          {dropdownVisible && (
            <View
              style={[
                styles.dropdown,
                {top: dropdownPosition.top, left: dropdownPosition.left},
              ]}>
              <ScrollView style={{maxHeight: dropdownPosition.maxHeight}}>
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
                <TouchableOpacity
                  onPress={() => handleAssignTo(dropdownVisible)}>
                  <Text style={styles.dropdownItem}>Assign To</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          {/* Add Project Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddProject')}>
            <Icon name="add" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  projectCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  dropdownButtonContainer: {
    paddingHorizontal: 10,
  },
  dropdownButton: {
    fontSize: 22,
    color: '#888',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    width: 160,
    zIndex: 100,
    paddingVertical: 5,
  },
  dropdownItem: {
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  deleteOption: {
    color: '#FF5252',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#555',
    marginTop: 30,
  },
});

export default AllProjectsScreen;
