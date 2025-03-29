import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseUrl} from '../../utils/api';

// Async thunk for fetching all users
export const fetchAllUsers = createAsyncThunk(
  'users/fetchAllUsers',
  async (_, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found. Please login again.');

      const response = await axios.get(`${baseUrl}/v1/get-all-user`, {
        headers: {Authorization: `Bearer ${token}`},
      });

      return response.data.users; // Return users data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch users');
    }
  },
);

// Redux slice
const allUsersSlice = createSlice({
  name: 'allUsers',
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {}, // No manual reducers needed as we use async thunk
  extraReducers: builder => {
    builder
      .addCase(fetchAllUsers.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default allUsersSlice.reducer;
