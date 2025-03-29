import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseUrl} from '../../utils/api';

// Async thunk to fetch assigned users
export const getAssignProjectByProjectId = createAsyncThunk(
  'assignProjectByProjectId/getAssignProjectByProjectId',
  async (projectId, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found. Please login again.');

      const response = await axios.get(
        `${baseUrl}/v1/get-assign-projectid/${projectId}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      return response.data.projects; // Returns assigned users
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to fetch assigned users',
      );
    }
  },
);

// Redux slice for assigned users
const assignProjectByProjectIdSlice = createSlice({
  name: 'assignProjectByProjectId',
  initialState: {
    assignedUsers: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getAssignProjectByProjectId.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAssignProjectByProjectId.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedUsers = action.payload;
      })
      .addCase(getAssignProjectByProjectId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default assignProjectByProjectIdSlice.reducer;
