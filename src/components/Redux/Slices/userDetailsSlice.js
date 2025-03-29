import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {baseUrl} from '../../utils/api';

// Async Thunk to Fetch User Details
export const fetchUserDetails = createAsyncThunk(
  'userDetail/fetchUserDetails',
  async (_, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in again.');

      const response = await axios.get(`${baseUrl}/v1/user-detail`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user details');
    }
  },
);

const userDetailSlice = createSlice({
  name: 'userDetail',
  initialState: {
    userDetail: null,
    loading: false,
    error: null,
  },
  reducers: {
    logoutUser: state => {
      state.userDetail = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUserDetails.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.userDetail = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {logoutUser} = userDetailSlice.actions;
export default userDetailSlice.reducer;
