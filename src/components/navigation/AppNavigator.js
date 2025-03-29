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
import MaterialScreen from '../screens/MaterialScreen';
import AddMaterial from '../screens/AddMaterial';
import EditMaterial from '../screens/EditMaterial';
import EditWorkHistory from '../screens/EditWorkHistoryScreen';

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
            'Edit Work-History',
            'Material',
            'AddMaterial',
            'EditMaterial',
          ].includes(route.name) ? (
            <ProfileThumbnail />
          ) : null,
        headerStyle: {backgroundColor: '#f5f5f5'},
      })}>
      {/* Authentication Screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Forgot Password" component={ForgotPasswordScreen} />
      <Stack.Screen name="Otp Verification" component={OtpVerificationScreen} />

      {/* Main Admin Screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="User" component={UserScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AddUser" component={AddUserScreen} />
      <Stack.Screen name="Reset Password" component={ResetPasswordScreen} />
      <Stack.Screen name="Edit User" component={EditUserScreen} />
      <Stack.Screen name="User Detail" component={UserDetailScreen} />
      <Stack.Screen name="All Projects" component={AllProjectsScreen} />
      <Stack.Screen name="Edit Project" component={EditProjectScreen} />
      <Stack.Screen name="View Project" component={ViewProjectScreen} />
      <Stack.Screen name="Add Project" component={AddProjectScreen} />
      <Stack.Screen name="Assign Project" component={AssignProjectScreen} />
      <Stack.Screen name="User Projects" component={UserProjectScreen} />
      <Stack.Screen name="Material" component={MaterialScreen} />
      <Stack.Screen name="Add Material" component={AddMaterial} />
      <Stack.Screen name="Edit Material" component={EditMaterial} />

      {/* Users Screen */}
      <Stack.Screen
        name="Assign Projects"
        component={UserAssignProjectScreen}
      />
      <Stack.Screen name="Work History" component={WorkHistory} />
      <Stack.Screen name="Edit Work-History" component={EditWorkHistory} />
    </Stack.Navigator>
  );
}
