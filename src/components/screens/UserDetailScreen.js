import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Image, Alert, ScrollView} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseUrl} from '../utils/api';
import {Ionicons} from 'react-native-vector-icons';

const UserDetailScreen = ({route}) => {
  const {userId} = route.params;
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        if (!token) {
          Alert.alert('Error', 'No token found. Please login again.');
          return;
        }

        const response = await axios.get(`${baseUrl}/v1/get-user/${userId}`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        console.log(response);
        setUserDetails(response.data.user);
      } catch (error) {
        console.error(
          'Error fetching user details:',
          error.response?.data || error,
        );
        Alert.alert('Error', 'Failed to fetch user details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  if (loading) {
    return <Text style={styles.loadingText}>Loading user details...</Text>;
  }

  if (!userDetails) {
    return <Text style={styles.errorText}>No user details found.</Text>;
  }

  const {
    profileThumbnail,
    name,
    phone,
    email,
    emailVerify,
status,
    createdAt,
  } = userDetails;
  console.log(userDetails);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: profileThumbnail
              ? `${baseUrl}/uploads/profileThumbnail/${profileThumbnail}`
              : 'https://via.placeholder.com/120x120/cccccc/000000?text=No+Image',
          }}
          style={styles.profileImage}
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
          Email Verified:{' '}
          <Text
            style={[
              styles.detailValue,
              emailVerify ? styles.verified : styles.notVerified,
            ]}>
         
            {emailVerify ? "true" :"false"}
          </Text>
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
    // elevation: 5,
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
    color: '#007bff',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
  verified: {
    color: 'green',
  },
  notVerified: {
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
