import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseUrl} from '../../utils/api';

// Async thunk to fetch project details
export const getProjectByProjectId = createAsyncThunk(
  'project/getProjectByProjectId',
  async (projectId, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('User authentication failed.');

      const response = await axios.get(
        `${baseUrl}/v1/get-project/${projectId}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const projectSlice = createSlice({
  name: 'project',
  initialState: {
    project: null,
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

        state.project = action.payload.project;
      })
      .addCase(getProjectByProjectId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default projectSlice.reducer;
