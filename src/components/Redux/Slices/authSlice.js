import {createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userRole: null,
  },
  reducers: {
    setUserRole: (state, action) => {
      state.userRole = action.payload;
    },
  },
});

export const {setUserRole} = authSlice.actions;
export default authSlice.reducer;
