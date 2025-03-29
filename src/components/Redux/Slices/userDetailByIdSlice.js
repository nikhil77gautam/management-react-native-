import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseUrl} from '../../utils/api';

// Async Thunk to Fetch User Details by ID
export const fetchUserDetailById = createAsyncThunk(
  'userDetailById/fetchUserDetailById',
  async (userId, {rejectWithValue}) => {
    console.log(userId);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found. Please login again.');

      const response = await axios.get(`${baseUrl}/v1/get-user/${userId}`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to fetch user details.',
      );
    }
  },
);

const userDetailByIdSlice = createSlice({
  name: 'userDetailById',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUserDetailById: state => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUserDetailById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetailById.fulfilled, (state, action) => {
        state.loading = false;
        state.userDetailById = action.payload.user;
      })
      .addCase(fetchUserDetailById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {clearUserDetailById} = userDetailByIdSlice.actions;
export default userDetailByIdSlice.reducer;
