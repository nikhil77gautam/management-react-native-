import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseUrl} from '../../utils/api';

// Async thunk to fetch materials
export const fetchMaterials = createAsyncThunk(
  'materials/fetchMaterials',
  async (_, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found. Please login again.');

      const response = await axios.get(`${baseUrl}/v1/get-material`, {
        headers: {Authorization: `Bearer ${token}`},
      });

      return response.data.materials; // Assuming API returns { materials: [...] }
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to fetch materials',
      );
    }
  },
);

const materialSlice = createSlice({
  name: 'materials',
  initialState: {
    materials: [],
    loading: false,
    error: null,
  },
  reducers: {
    removeMaterial: (state, action) => {
      state.materials = state.materials.filter(
        mat => mat._id !== action.payload,
      );
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchMaterials.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = action.payload;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {removeMaterial} = materialSlice.actions;
export default materialSlice.reducer;
