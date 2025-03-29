import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {fetchAssignedProjects} from '../Redux/Slices/getAssignProjectSlice';
import {setUserRole} from '../Redux/Slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Completed from '../../Image/approved.png';
import Pending from '../../Image/clock.png';
import Total from '../../Image/all.png';
import Project from '../../Image/worker.png';
import Users from '../../Image/multiple-users-silhouette.png';
import Material from '../../Image/membrane.png';
import Dashboard from '../../Image/dashboard.png';

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {projects, loading} = useSelector(state => state.assignedProjects);
  const role = useSelector(state => state.auth.userRole);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('userRole');
        if (storedRole) {
          dispatch(setUserRole(storedRole)); // Save role to Redux
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
    dispatch(fetchAssignedProjects());
  }, [dispatch]);

  const pendingCount = projects.filter(e => e.status === 'pending').length;
  const completedCount = projects.filter(e => e.status === 'completed').length;
  const totalProjects = projects.length;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {role === 'admin' ? (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.dashboardText}>Admin Dashboard</Text>
            <Image source={Dashboard} style={styles.dashboardImg} />
          </View>
        ) : (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.dashboardText}>User Dashboard</Text>
            <Image source={Dashboard} style={styles.dashboardImg} />
          </View>
        )}{' '}
      </Text>

      <View style={styles.mainSection}>
        <View style={styles.row}>
          {role === 'admin' && (
            <TouchableOpacity
              style={styles.box}
              onPress={() => navigation.navigate('User')}>
              <Image source={Users} style={styles.statusProject} />
              <Text style={styles.label}>Users</Text>
            </TouchableOpacity>
          )}
          {role === 'admin' && (
            <TouchableOpacity
              style={styles.box}
              onPress={() => navigation.navigate('All Projects')}>
              <Image source={Project} style={styles.statusProject} />
              <Text style={styles.label}>Projects</Text>
            </TouchableOpacity>
          )}
          {role === 'admin' && (
            <TouchableOpacity
              style={styles.box}
              onPress={() => navigation.navigate('Material')}>
              <Image source={Material} style={styles.statusProject} />
              <Text style={styles.label}>Material</Text>
            </TouchableOpacity>
          )}
          {role === 'user' && (
            <TouchableOpacity
              style={styles.box}
              onPress={() => navigation.navigate('Assign Projects')}>
              <Image source={Project} style={styles.statusProject} />
              <Text style={styles.label}>Assign Projects</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.subHeading}>Status Overview :</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <View style={styles.row}>
            <TouchableOpacity style={styles.statusBoxYellow}>
              <Image source={Pending} style={styles.statusPending} />
              <Text style={styles.statusText}>Pending</Text>
              <Text style={styles.statusCount}>{pendingCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statusBoxGreen}>
              <Image source={Completed} style={styles.statusComplete} />
              <Text style={styles.statusTextt}>Completed</Text>
              <Text style={styles.statusCount}>{completedCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statusBoxBlue}>
              <Image source={Total} style={styles.statusTotal} />
              <Text style={styles.statusTexttt}>Total</Text>
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
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingTop: 40,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
  },
  subHeading: {
    fontSize: 22,
    fontWeight: '600',
    color: '#444',
    marginVertical: 15,
    textAlign: 'center',
  },
  dashboardText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  dashboardImg: {
    width: 24,
    height: 24,
    marginLeft: 8,
    resizeMode: 'contain',
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
    backgroundColor: '#fff',
    paddingVertical: 30,
    borderRadius: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 5,
    elevation: 5,
  },
  statusProject: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 5,
    alignSelf: 'center',
  },
  label: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  statusBoxYellow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderRadius: 10,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 5,
    elevation: 5,
  },
  statusBoxGreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderRadius: 10,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 5,
    elevation: 5,
  },
  statusBoxBlue: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderRadius: 10,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 5,
    elevation: 5,
  },
  statusTotal: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 5,
    alignSelf: 'center',
  },
  statusComplete: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 5,
    alignSelf: 'center',
  },
  statusPending: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 5,
    alignSelf: 'center',
  },
  statusText: {
    fontSize: 18,
    color: 'red',
    fontWeight: 'bold',
  },
  statusTextt: {
    fontSize: 18,
    color: 'green',
    fontWeight: 'bold',
  },
  statusTexttt: {
    fontSize: 18,
    color: 'orange',
    fontWeight: 'bold',
  },
  statusCount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 5,
  },
});

export default HomeScreen;
