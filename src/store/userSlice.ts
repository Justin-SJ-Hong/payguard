import { createSlice } from '@reduxjs/toolkit';

interface UserState {
  isLoggedIn: boolean;
  userName: string;
}

const initialState: UserState = {
  isLoggedIn: false,
  userName: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.userName = action.payload.userName;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userName = '';
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
