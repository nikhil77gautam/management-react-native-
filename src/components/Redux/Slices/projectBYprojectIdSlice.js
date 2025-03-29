import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseUrl} from '../../utils/api';

// Async thunk to fetch project details
export const getProjectByProjectId = createAsyncThunk(
  'projectByProjectId/getProjectByProjectId',
  async (projectId, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found. Please login again.');

      const response = await axios.get(
        `${baseUrl}/v1/get-project/${projectId}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      return response.data.project;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch project');
    }
  },
);

// Redux slice for project
const projectByProjectIdSlice = createSlice({
  name: 'projectByProjectId',
  initialState: {
    project: {projectPdf: []},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getProjectByProjectId.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjectByProjectId.fulfilled, (state, action) => {
        state.loading = false;
        state.project = action.payload;
      })
      .addCase(getProjectByProjectId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default projectByProjectIdSlice.reducer;
