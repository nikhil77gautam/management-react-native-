import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {baseUrl} from '../utils/api';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [role, setRole] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('userRole');
        setRole(storedRole);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    const fetchProjectStats = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        const response = await axios.get(`${baseUrl}/v1/get-assign-project`, {
          headers: {Authorization: `Bearer ${token}`},
        });

        const projects = response.data.projects || [];

        setPendingCount(
          projects.filter(e => e.status === 'pending').length || 0,
        );
        setCompletedCount(
          projects.filter(e => e.status === 'completed').length || 0,
        );
        setTotalProjects(projects.length || 0);
      } catch (error) {
        console.error('Error fetching project stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
    fetchProjectStats();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Dashboard</Text>

      <View style={styles.mainSection}>
        (
        <View style={styles.row}>
          {role === 'admin' && (
            <TouchableOpacity
              style={styles.box}
              onPress={() => navigation.navigate('User')}>
              <Text style={styles.emoji}>🤵</Text>
              <Text style={styles.label}>Users</Text>
            </TouchableOpacity>
          )}

          {role === 'admin' && (
            <TouchableOpacity
              style={styles.box}
              onPress={() => navigation.navigate('AllProjects')}>
              <Text style={styles.emoji}>👨🏻‍💻</Text>
              <Text style={styles.label}>Projects</Text>
            </TouchableOpacity>
          )}
          {role === 'user' && (
            <TouchableOpacity
              style={styles.box}
              onPress={() => navigation.navigate('AssignProjects')}>
              <Text style={styles.emoji}>👨🏻‍💻</Text>
              <Text style={styles.label}>Assign Projects</Text>
            </TouchableOpacity>
          )}
        </View>
        )
        {/* {role === 'admin' && (
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.box}
              onPress={() => navigation.navigate('WorkHistory')}>
              <Text style={styles.emoji}>📜</Text>
              <Text style={styles.label}>Work History</Text>
            </TouchableOpacity>
          </View>
        )} */}
        <Text style={styles.subHeading}>Status Overview</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <View style={styles.row}>
            <TouchableOpacity style={styles.statusBoxYellow}>
              <Text style={styles.statusEmoji}>⌛</Text>
              <Text style={styles.statusText}>Pending</Text>
              <Text style={styles.statusCount}>{pendingCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statusBoxGreen}>
              <Text style={styles.statusEmoji}>✅</Text>
              <Text style={styles.statusText}>Completed</Text>
              <Text style={styles.statusCount}>{completedCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statusBoxBlue}>
              <Text style={styles.statusEmoji}>📊</Text>
              <Text style={styles.statusText}>Total</Text>
              <Text style={styles.statusCount}>{totalProjects}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  subHeading: {
    fontSize: 22,
    fontWeight: '600',
    color: '#444',
    marginVertical: 15,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 30,
    borderRadius: 15,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 5,
    elevation: 5,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  statusBoxYellow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffcc00',
    paddingVertical: 25,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  statusBoxGreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 25,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  statusBoxBlue: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 25,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  statusEmoji: {
    fontSize: 35,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  statusCount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
});

export default HomeScreen;
