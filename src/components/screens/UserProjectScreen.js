import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import axios from 'axios';
import { baseUrl } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserProjectScreen = ({ route }) => {
  const { userId } = route.params;
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No token found. Please login again.');
          return;
        }

        const response = await axios.get(
          `${baseUrl}/v1/get-user-project/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error('Error fetching projects:', error.response?.data || error);
        Alert.alert('Error', 'Failed to fetch projects.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Projects for User:</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loading} />
      ) : projects.length === 0 ? (
        <Text style={styles.noProjectsText}>No projects found.</Text>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={item => String(item._id)}
          renderItem={({ item, index }) => (
            <View style={styles.projectItem}>
              {/* Display Serial Number */}
              <Text style={styles.serialNumber}>{index + 1}.</Text>

              <View style={styles.projectDetails}>
                {/* Project Name */}
                <Text style={styles.projectName}>{item.projectId.name}</Text>

                {/* Project Description */}
                <Text style={styles.projectDescription}>
                  {item.projectId.description}
                </Text>

                {/* Display Project Status */}
                <Text style={styles.projectStatus}>
                  Status: {item.status}
                </Text>

                {/* Display Project Start Date */}
                <Text style={styles.projectDate}>
                  Start Date: {new Date(item.projectId.startDate).toLocaleDateString()}
                </Text>

                {/* Display Project End Date */}
                <Text style={styles.projectDate}>
                  End Date: {new Date(item.projectId.endDate).toLocaleDateString()}
                </Text>

                {/* Display Project Created At */}
                <Text style={styles.projectDate}>
                  Created At: {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>

              {/* Multiple Project Thumbnails */}
              {item?.projectId?.projectThumbnail && item?.projectId?.projectThumbnail?.length > 0 && (
                <View style={styles.thumbnailBox}>
                  {item?.projectId?.projectThumbnail?.map((thumbnail, index) => (
                    <Image
                      key={index}
                      source={{
                        uri: `${baseUrl}/uploads/projectThumbnail/${thumbnail}`,
                      }}
                      style={styles.projectThumbnail}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
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
    fontWeight: '600',
    marginBottom: 15,
  },
  loading: {
    marginTop: 20,
  },
  noProjectsText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
  projectItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    flexDirection: 'column',
  },
  serialNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  projectDetails: {
    marginBottom: 15, // Add space before the thumbnail box
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  projectDescription: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  projectStatus: {
    fontSize: 14,
    color: 'green',
    marginTop: 5,
  },
  projectDate: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
  thumbnailBox: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allows thumbnails to wrap onto the next line
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9', // Light background for the box
  },
  projectThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8, // Rounded corners for the thumbnail
    marginRight: 10, // Space between images
    marginBottom: 10, // Space between rows of images
  },
});

export default UserProjectScreen;
