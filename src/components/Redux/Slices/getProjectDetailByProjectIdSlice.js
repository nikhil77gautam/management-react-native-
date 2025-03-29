import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseUrl} from '../../utils/api';

// Async thunk to fetch project details
export const getProjectDetailsByProjectId = createAsyncThunk(
  'getProjectDetailsByProjectId/getProjectDetailsByProjectId',
  async (projectId, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found. Please login again.');

      const response = await axios.get(
        `${baseUrl}/v1/get-project-details/${projectId}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      return {
        project: response?.data,
        assignProject: response.data.assignProject || null,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to fetch project details',
      );
    }
  },
);

const getProjectDetailsByProjectIdSlice = createSlice({
  name: 'getProjectDetailsByProjectId',
  initialState: {
    projectDetails: null,
    assignProject: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getProjectDetailsByProjectId.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjectDetailsByProjectId.fulfilled, (state, action) => {
        state.loading = false;
        state.projectDetails = action.payload.project;
        state.assignProject = action.payload.assignProject;
      })
      .addCase(getProjectDetailsByProjectId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default getProjectDetailsByProjectIdSlice.reducer;
