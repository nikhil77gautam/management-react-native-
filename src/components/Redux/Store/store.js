import {configureStore} from '@reduxjs/toolkit';
import projectsReducer from '../Slices/projectsSlice';
import userReducer from '../Slices/userSlice';
import getAssignProjectReducer from '../Slices/getAssignProjectSlice';
import authReducer from '../Slices/authSlice';
import projectReducer from '../Slices/editProjectScreenSlice';
import materialReducer from '../Slices/materialSlice';
import userDetailReducer from '../Slices/userDetailsSlice';
import profileThumbnailReducer from '../Slices/profileThumbnailSlice';
import assignProjectReducer from '../Slices/assignProjectSlice';
import userDetailByIdReducer from '../Slices/userDetailByIdSlice';
import userProjectsReducer from '../Slices/userProjectByUserIdSlice';
import allUsersReducer from '../Slices/allUserSlice';
import projectByProjectIdReducer from '../Slices/projectBYprojectIdSlice';
import assignProjectByProjectIdReducer from '../Slices/assignProjectByProjectIdSlice';
import getWorkByProjectIdReducer from '../Slices/getWorkByProjectIdSlice';
import getProjectDetailsByProjectIdReducer from '../Slices/getProjectDetailByProjectIdSlice';

const store = configureStore({
  reducer: {
    projects: projectsReducer,
    users: userReducer,
    assignedProjects: getAssignProjectReducer,
    auth: authReducer,
    project: projectReducer,
    materials: materialReducer,
    userDetail: userDetailReducer,
    profileThumbnail: profileThumbnailReducer,
    assignProject: assignProjectReducer,
    userDetailById: userDetailByIdReducer,
    userProjects: userProjectsReducer,
    allUsers: allUsersReducer,
    projectByProjectId: projectByProjectIdReducer,
    assignProjectByProjectId: assignProjectByProjectIdReducer,
    getWorkByProjectId: getWorkByProjectIdReducer,
    getProjectDetailsByProjectId: getProjectDetailsByProjectIdReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable SerializableStateInvariantMiddleware
      immutableCheck: false, // Disable ImmutableStateInvariantMiddleware
    }),
});

export default store;
