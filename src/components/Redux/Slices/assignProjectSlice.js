// src/redux/slices/assignProjectSlice.js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseUrl} from '../../utils/api';

export const fetchAssignedProjects = createAsyncThunk(
  'assignProject/fetchAssignedProjects',
  async (_, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.get(`${baseUrl}/v1/get-assign-project`, {
        headers: {Authorization: `Bearer ${token}`},
      });

      return response.data.projects || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch assigned projects',
      );
    }
  },
);

const assignProjectSlice = createSlice({
  name: 'assignProject',
  initialState: {
    assignProject: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchAssignedProjects.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignedProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.assignProject = action.payload;
      })
      .addCase(fetchAssignedProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default assignProjectSlice.reducer;
