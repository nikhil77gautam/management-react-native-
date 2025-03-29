import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {baseUrl} from '../../utils/api';

// Async Thunk to Fetch Profile Thumbnail
export const fetchProfileThumbnail = createAsyncThunk(
  'profileThumbnail/fetchProfileThumbnail',
  async (_, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in again.');

      const response = await axios.get(`${baseUrl}/v1/profile-thumbnail`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.data.profileThumbnail;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to fetch profile thumbnail',
      );
    }
  },
);

const profileThumbnailSlice = createSlice({
  name: 'profileThumbnail',
  initialState: {
    profileThumbnail: null,
    loading: false,
    error: null,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProfileThumbnail.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileThumbnail.fulfilled, (state, action) => {
        state.loading = false;
        state.profileThumbnail = action.payload;
      })
      .addCase(fetchProfileThumbnail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default profileThumbnailSlice.reducer;
