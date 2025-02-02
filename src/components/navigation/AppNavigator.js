import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import ProfileThumbnail from '../screens/ProfileThumbnail';

// Screens
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OtpVerificationScreen from '../screens/OTPScreen';
import HomeScreen from '../screens/HomeScreen';
import UserScreen from '../screens/UserScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddUserScreen from '../screens/AddUserScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import EditUserScreen from '../screens/EditUserScreen';
import UserDetailScreen from '../screens/UserDetailScreen';
import AllProjectsScreen from '../screens/AllProjectScreen';
import EditProjectScreen from '../screens/EditProjectScreen';
import ViewProjectScreen from '../screens/ViewProjectScreen';
import AddProjectScreen from '../screens/AddProjectScreen';
import AssignProjectScreen from '../screens/AssignProjectScreen';
import UserProjectScreen from '../screens/UserProjectScreen';
import UserAssignProjectScreen from '../screens/UserAssignProjectScreen';
import WorkHistory from '../screens/WorkHistoryScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={({route}) => ({
        headerRight: () =>
          [
            'Home',
            'User',
            'Profile',
            'AddUser',
            'ResetPassword',
            'EditUser',
            'UserDetail',
            'AllProjects',
            'EditProject',
            'ViewProject',
            'AddProject',
            'AssignProject',
            'UserProjects',
            'AllAssignProjects',
            'WorkHistory',
          ].includes(route.name) ? (
            <ProfileThumbnail />
          ) : null,
        headerStyle: {backgroundColor: '#f5f5f5'},
      })}>
      {/* Authentication Screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />

      {/* Main Admin Screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="User" component={UserScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AddUser" component={AddUserScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="EditUser" component={EditUserScreen} />
      <Stack.Screen name="UserDetail" component={UserDetailScreen} />
      <Stack.Screen name="AllProjects" component={AllProjectsScreen} />
      <Stack.Screen name="EditProject" component={EditProjectScreen} />
      <Stack.Screen name="ViewProject" component={ViewProjectScreen} />
      <Stack.Screen name="AddProject" component={AddProjectScreen} />
      <Stack.Screen name="AssignProject" component={AssignProjectScreen} />
      <Stack.Screen name="UserProjects" component={UserProjectScreen} />

      {/* Users Screen */}
      <Stack.Screen name="AssignProjects" component={UserAssignProjectScreen} />
      <Stack.Screen name="WorkHistory" component={WorkHistory} />
    </Stack.Navigator>
  );
}
