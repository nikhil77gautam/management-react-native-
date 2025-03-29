import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseUrl} from '../../utils/api';

// Async thunk to fetch work history
export const getWorkByProjectId = createAsyncThunk(
  'getWorkByProjectId/getWorkByProjectId',
  async (projectId, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found. Please login again.');

      const response = await axios.get(`${baseUrl}/v1/get-work/${projectId}`, {
        headers: {Authorization: `Bearer ${token}`},
      });

      return response.data.works || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to fetch work history',
      );
    }
  },
);

const getWorkByProjectIdSlice = createSlice({
  name: 'getWorkByProjectId',
  initialState: {
    workHistory: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getWorkByProjectId.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWorkByProjectId.fulfilled, (state, action) => {
        state.loading = false;
        state.workHistory = action.payload;
      })
      .addCase(getWorkByProjectId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default getWorkByProjectIdSlice.reducer;
