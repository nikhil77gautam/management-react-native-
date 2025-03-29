import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseUrl} from '../../utils/api';

// Async Thunk: Fetch User Projects by User ID
export const fetchProjectsByUserId = createAsyncThunk(
  'userProjects/fetchProjectsByUserId',
  async (userId, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found. Please login again.');

      const response = await axios.get(
        `${baseUrl}/v1/get-user-project/${userId}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      return response.data.projects || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to fetch projects.',
      );
    }
  },
);

// Redux Slice
const userProjectsSlice = createSlice({
  name: 'userProjects',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearProjects: state => {
      state.data = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProjectsByUserId.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectsByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProjectsByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {clearProjects} = userProjectsSlice.actions;
export default userProjectsSlice.reducer;
