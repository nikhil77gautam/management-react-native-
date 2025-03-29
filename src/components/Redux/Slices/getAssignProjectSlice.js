import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseUrl} from '../../utils/api';

// Async thunk to fetch assigned projects
export const fetchAssignedProjects = createAsyncThunk(
  'projects/fetchAssignedProjects',
  async (_, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('User authentication failed.');

      const response = await axios.get(`${baseUrl}/v1/get-assign-project`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.data.projects;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const getAssignProjectSlice = createSlice({
  name: 'assignedProjects',
  initialState: {
    projects: [],
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
        state.projects = action.payload;
      })
      .addCase(fetchAssignedProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default getAssignProjectSlice.reducer;
