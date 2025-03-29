import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchProjectsByUserId,
  clearProjects,
} from '../Redux/Slices/userProjectByUserIdSlice';
import {baseUrl} from '../utils/api';

const UserProjectScreen = ({route}) => {
  const {userId} = route.params;
  const dispatch = useDispatch();
  const {
    data: projects,
    loading,
    error,
  } = useSelector(state => state.userProjects);

  useEffect(() => {
    dispatch(fetchProjectsByUserId(userId));

    return () => {
      dispatch(clearProjects());
    };
  }, [dispatch, userId]);

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#007bff" style={styles.loading} />
    );
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  if (!projects || projects.length === 0) {
    return <Text style={styles.noProjectsText}>No projects found.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Projects for User:</Text>
      <FlatList
        data={projects}
        keyExtractor={item => String(item._id)}
        renderItem={({item, index}) => (
          <View style={styles.projectItem}>
            <Text style={styles.serialNumber}>{index + 1}.</Text>

            <View style={styles.projectDetails}>
              <Text style={styles.projectName}>
                {item.projectId?.name || 'Unnamed Project'}
              </Text>
              <Text style={styles.projectDescription}>
                {item.projectId?.description || 'No description available.'}
              </Text>
              <Text style={styles.projectStatus}>Status: {item.status}</Text>
              <Text style={styles.projectDate}>
                Start Date:{' '}
                {item.projectId?.startDate
                  ? new Date(item.projectId.startDate).toLocaleDateString()
                  : 'N/A'}
              </Text>
              <Text style={styles.projectDate}>
                End Date:{' '}
                {item.projectId?.endDate
                  ? new Date(item.projectId.endDate).toLocaleDateString()
                  : 'N/A'}
              </Text>
              <Text style={styles.projectDate}>
                Created At: {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>

            {item?.projectId?.projectThumbnail?.length > 0 && (
              <View style={styles.thumbnailBox}>
                {item.projectId.projectThumbnail.map((thumbnail, idx) => (
                  <Image
                    key={idx}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
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
  },
  serialNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  projectDetails: {
    marginBottom: 10,
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
    flexWrap: 'wrap',
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  projectThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
});

export default UserProjectScreen;
