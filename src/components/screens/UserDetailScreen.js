import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchUserDetailById,
  clearUserDetailById,
} from '../Redux/Slices/userDetailByIdSlice';
import {baseUrl} from '../utils/api';

const UserDetailScreen = ({route}) => {
  const {userId} = route.params;
  const dispatch = useDispatch();
  const userDetails = useSelector(state => state.userDetailById.userDetailById);

  useEffect(() => {
    dispatch(fetchUserDetailById(userId));

    return () => {
      dispatch(clearUserDetailById());
    };
  }, [dispatch, userId]);

  useEffect(() => {
    console.log('User Details:', userDetails); // Debugging log
  }, [userDetails]);



  if (!userDetails) {
    return <Text style={styles.errorText}>No user details found.</Text>;
  }

  const {profileThumbnail, name, phone, email, status, createdAt} = userDetails;

  // Construct the image URL
  const imageUrl = profileThumbnail
    ? `${baseUrl}/uploads/profileThumbnail/${profileThumbnail}`
    : 'https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg?semt=ais_hybrid';

  console.log('Image URL:', imageUrl); // Debugging log

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{uri: imageUrl}}
          style={styles.profileImage}
          onError={e =>
            console.log('Image failed to load:', e.nativeEvent.error)
          }
          onLoad={() => console.log('Image loaded successfully')}
        />
        <Text style={styles.profileName}>{name}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>
          Phone: <Text style={styles.detailValue}>{phone}</Text>
        </Text>
        <Text style={styles.detailText}>
          Email: <Text style={styles.detailValue}>{email}</Text>
        </Text>
        <Text style={styles.detailText}>
          Status:{' '}
          <Text
            style={[
              styles.detailValue,
              status ? styles.active : styles.inactive,
            ]}>
            {status ? ' Active' : ' Inactive'}
          </Text>
        </Text>
        <Text style={styles.detailText}>
          Created At:{' '}
          <Text style={styles.detailValue}>
            {new Date(createdAt).toLocaleDateString()}
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f4f6f9',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  detailText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 15,
  },
  detailValue: {
    fontWeight: '600',
    color: '#000',
  },

  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
  active: {
    color: 'green',
  },
  inactive: {
    color: 'red',
  },
});

export default UserDetailScreen;
